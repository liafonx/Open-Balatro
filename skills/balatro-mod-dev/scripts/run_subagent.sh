#!/bin/zsh
# run_subagent.sh - Adapter for balatro-mod-dev → codeagent routing
# Reads mod.config.json to resolve backend + workdir, then routes through codeagent.
#
# Usage:
#   Single:   ./run_subagent.sh <agent-name> [-- extra args]
#   Parallel: ./run_subagent.sh --parallel [--full-output]
#   Stdin:    Task content is always read from stdin (HEREDOC)
#
# Resolution order (single mode):
#   1. mod.config.json > agent_backends.overrides.{agent-name}
#   2. mod.config.json > agent_backends.{research|execution}
#   3. Agent template frontmatter defaults
#
# Examples:
#   ./run_subagent.sh game-source-researcher <<'EOF'
#   Find evaluate_poker_hand implementation. Return file:line and code.
#   EOF
#
#   ./run_subagent.sh --parallel --full-output <<'EOF'
#   ---TASK---
#   id: game_source
#   ...
#   EOF

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SKILL_DIR="$(dirname "$SCRIPT_DIR")"
ROUTE_SCRIPT="$HOME/.claude/skills/codeagent/scripts/route_subagent.sh"
CONFIG_FILE="mod.config.json"

# --- Helpers ---

resolve_home() {
  echo "${1/#\~/$HOME}"
}

# Read a JSON key using python3 (available on macOS)
json_get() {
  local file="$1" path="$2" default="${3:-}"
  python3 -c "
import json, sys
try:
    with open('$file') as f: data = json.load(f)
    keys = '$path'.split('.')
    val = data
    for k in keys:
        val = val[k]
    if isinstance(val, dict):
        import json as j; print(j.dumps(val))
    else:
        print(val)
except (KeyError, TypeError, FileNotFoundError):
    print('$default')
" 2>/dev/null
}

# --- Agent metadata from template frontmatter ---

get_template_field() {
  local agent_name="$1" field="$2" default="${3:-}"
  local template="$SKILL_DIR/templates/agents/${agent_name}.md"
  if [[ -f "$template" ]]; then
    local val
    val=$(sed -n '/^---$/,/^---$/{ /^'"$field"':/{ s/^'"$field"': *//; p; } }' "$template")
    if [[ -n "$val" ]]; then
      echo "$val"
      return
    fi
  fi
  echo "$default"
}

is_research_agent() {
  local name="$1"
  case "$name" in
    game-source-researcher|smods-api-researcher|mod-pattern-researcher|lovely-patch-researcher)
      return 0 ;;
    *)
      return 1 ;;
  esac
}

# --- Resolve backend + workdir for a named agent ---

resolve_agent_config() {
  local agent_name="$1"
  local backend="" workdir=""

  # Layer 1: per-agent override from mod.config.json
  if [[ -f "$CONFIG_FILE" ]]; then
    local override
    override=$(json_get "$CONFIG_FILE" "agent_backends.overrides.$agent_name" "")
    if [[ -n "$override" && "$override" != "" ]]; then
      # Check if override is a JSON object (starts with {)
      if [[ "$override" == "{"* ]]; then
        backend=$(echo "$override" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('backend',''))" 2>/dev/null)
        workdir=$(echo "$override" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('workdir',''))" 2>/dev/null)
      else
        backend="$override"
      fi
    fi

    # Layer 2: category default from mod.config.json
    if [[ -z "$backend" ]]; then
      if is_research_agent "$agent_name"; then
        backend=$(json_get "$CONFIG_FILE" "agent_backends.research" "")
      else
        backend=$(json_get "$CONFIG_FILE" "agent_backends.execution" "")
      fi
    fi

    # Resolve workdir from source_paths if not set by override
    if [[ -z "$workdir" ]]; then
      local path_key
      path_key=$(get_template_field "$agent_name" "source_path_key" "")
      if [[ -n "$path_key" ]]; then
        workdir=$(json_get "$CONFIG_FILE" "source_paths.$path_key" "")
      fi
    fi
  fi

  # Layer 3: agent template defaults
  if [[ -z "$backend" ]]; then
    backend=$(get_template_field "$agent_name" "backend" "claude")
  fi
  if [[ -z "$workdir" ]]; then
    workdir=$(get_template_field "$agent_name" "workdir" ".")
  fi

  # Expand ~ to $HOME (critical for paths passed to route_subagent.sh)
  workdir=$(resolve_home "$workdir")

  echo "$backend"
  echo "$workdir"
}

# --- Main ---

# Parallel mode: pass through directly to route script
if [[ "${1:-}" == "--parallel" ]]; then
  shift
  # Read stdin, expand ~ to $HOME in workdir metadata lines
  task_content=$(cat | sed -e "s|workdir: ~/|workdir: $HOME/|g" -e "s|working_dir: ~/|working_dir: $HOME/|g")
  echo "$task_content" | exec "$ROUTE_SCRIPT" -- --parallel "$@"
  exit $?
fi

# Single mode: first arg is agent name
AGENT_NAME="${1:?Usage: run_subagent.sh <agent-name> [-- extra args]}"
shift

# Skip past -- separator if present
if [[ "${1:-}" == "--" ]]; then
  shift
fi

# Resolve config
config_output=$(resolve_agent_config "$AGENT_NAME")
BACKEND=$(echo "$config_output" | head -1)
WORKDIR=$(echo "$config_output" | tail -1)

# Route through codeagent
exec "$ROUTE_SCRIPT" -- --backend "$BACKEND" - "$WORKDIR" "$@"
