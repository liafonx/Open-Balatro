# Sub-Agent System

Research agents for gathering information while main agent handles code development.
Invocation routed through `codeagent` via `run_subagent.sh` adapter (both Claude and Codex).

## Responsibility Split

| This skill (balatro-mod-dev) decides | Codeagent handles |
|--------------------------------------|-------------------|
| When to create subagents | CLI invocation + backend routing |
| What task to give them | Model selection + API config |
| How many, in what order | HEREDOC formatting |
| Backend **hints** (via mod.config.json) | Fallback on backend failure |
| Success/failure criteria | Hook enforcement |
| What to do with the output | |

## Ownership Boundary

| Concern | Owned by | Config location |
|---------|----------|----------------|
| Task → backend hint | balatro-mod-dev | `mod.config.json > agent_backends` |
| Backend API endpoint/key + API/CLI mode | codeagent | `~/.codeagent/models.json > backends.* (base_url, api_key, use_api)` |
| Model selection + params | codeagent | `~/.codeagent/models.json` |
| Agent presets | codeagent | `~/.codeagent/models.json > agents.*` |
| Source paths (workdirs) | balatro-mod-dev | `mod.config.json > source_paths` |

**This skill provides backend hints. Codeagent owns invocation policy and model resolution.**

## Backend Configuration

Backends are **configurable per-mod** via `mod.config.json`. Resolution order:

```
1. mod.config.json > agent_backends.overrides.{agent-name}  (per-agent override)
2. mod.config.json > agent_backends.research|execution       (category default)
3. Agent template frontmatter > backend:                     (hardcoded fallback)
```

### Config in mod.config.json

```json
"agent_backends": {
  "research": "claude",
  "execution": "codex",
  "overrides": {}
}
```

- `research` — default backend for all research agents (game-source, smods-api, mod-pattern, lovely-patch)
- `execution` — default backend for execution agents (script-runner)
- `overrides` — per-agent override, string or object:

```json
"overrides": {
  "script-runner": "claude",
  "game-source-researcher": {
    "backend": "codex",
    "workdir": "/custom/path/to/game/src"
  }
}
```

### Source Paths (also configurable)

Agent workdirs resolve from `mod.config.json > source_paths`:

```json
"source_paths": {
  "game_desktop": "~/Development/GitWorkspace/Balatro_src/desktop",
  "game_mobile": "~/Development/GitWorkspace/Balatro_src/ios_plus",
  "steamodded": "~/Development/GitWorkspace/smods/src",
  "lovely": "~/Development/GitWorkspace/smods/lovely",
  "mods": "~/Library/Application Support/Balatro/Mods"
}
```

Users on different machines or OS can set their own paths here.

### Resolving Backend for an Agent

`scripts/run_subagent.sh` handles resolution automatically:

1. Reads `mod.config.json` (if present in project root)
2. Checks `agent_backends.overrides.{agent-name}` → use if set
3. Else checks `agent_backends.research` (for research agents) or `agent_backends.execution` (for script-runner)
4. Else falls back to agent template's `backend:` field
5. For workdir: checks `source_paths` via template's `source_path_key:` → else template's `workdir:`
6. Expands `~` to `$HOME` (required — shell expansion doesn't occur in HEREDOC metadata)
7. Routes through `~/.claude/skills/codeagent/scripts/route_subagent.sh`

**Note:** These are backend *hints*. Codeagent may override based on `~/.codeagent/models.json` (agents/backends) with `~/.codeagent/config.yaml` as global fallback.

### Source Path → Agent Mapping

| Agent | source_paths key | Template default workdir |
|-------|-----------------|-------------------------|
| `game-source-researcher` | `game_desktop` | `~/Development/GitWorkspace/Balatro_src/desktop` |
| `smods-api-researcher` | `steamodded` | `~/Development/GitWorkspace/smods/src` |
| `mod-pattern-researcher` | `mods` | `~/Library/Application Support/Balatro/Mods` |
| `lovely-patch-researcher` | `lovely` | `~/Development/GitWorkspace/smods/lovely` |
| `project-explorer` | — | project root (current mod) |
| `script-runner` | — | project root |

## Agent Selection

| Need to find... | Agent | Default Backend | Default Workdir |
|-----------------|-------|---------|---------|
| Game function implementation | `game-source-researcher` | `claude` | `source_paths.game_desktop` |
| SMODS API usage/hooks | `smods-api-researcher` | `claude` | `source_paths.steamodded` |
| How other mods do X | `mod-pattern-researcher` | `claude` | `source_paths.mods` |
| Lovely patch syntax | `lovely-patch-researcher` | `claude` | `source_paths.lovely` |
| **Project architecture/exploration** | `project-explorer` | **`codex`** | **project root** |
| Run temp script for data | `script-runner` | `codex` | project root |

## Invocation

All sub-agent calls go through the adapter script, which resolves config and routes through codeagent:

```
scripts/run_subagent.sh  →  reads mod.config.json  →  ~/.claude/skills/codeagent/scripts/route_subagent.sh
```

### Single Research Agent

```bash
./scripts/run_subagent.sh game-source-researcher <<'EOF'
<task content from agent template>

<task>
[specific question from main agent]
</task>
EOF
```

Bash tool timeout: `7200000` (2 hours). Never run in background.
The adapter resolves backend + workdir from config automatically.

### Parallel Research (Recommended for Multi-Source)

When researching across DIFFERENT sources, use `--parallel` to spawn all at once.
**IMPORTANT:** Use `$HOME` (not `~`) in workdir — shell expansion doesn't occur in HEREDOC metadata.

```bash
./scripts/run_subagent.sh --parallel --full-output <<'EOF'
---TASK---
id: game_source
backend: claude
workdir: $HOME/Development/GitWorkspace/Balatro_src/desktop
---CONTENT---
<role>Balatro game source researcher</role>
<search_boundary>Only $HOME/Development/GitWorkspace/Balatro_src/</search_boundary>
[specific question]
Keep report under 100 lines.

---TASK---
id: smods_api
backend: claude
workdir: $HOME/Development/GitWorkspace/smods/src
---CONTENT---
<role>SMODS API researcher</role>
<search_boundary>Only $HOME/Development/GitWorkspace/smods/</search_boundary>
[specific question]
Keep report under 100 lines.

---TASK---
id: mod_patterns
backend: claude
workdir: $HOME/Library/Application Support/Balatro/Mods
---CONTENT---
<role>Mod pattern researcher</role>
<search_boundary>Only $HOME/Library/Application Support/Balatro/Mods/</search_boundary>
[specific question]
Keep report under 100 lines.
EOF
```

Note: The adapter auto-expands `~` → `$HOME` in workdir lines, but prefer `$HOME` explicitly.
Use `--full-output` when you need to parse results for follow-up tasks.

### Sequential (When Result Depends on Previous)

Run single agents one at a time, forwarding context:

```bash
# Step 1: Find game function
./scripts/run_subagent.sh game-source-researcher <<'EOF'
Find evaluate_poker_hand implementation. Return file:line and code.
EOF

# Step 2: Find how to hook it (using step 1 result)
./scripts/run_subagent.sh smods-api-researcher <<'EOF'
## Context from game source research
[paste step 1 output]

## Task
Find SMODS hook for hand evaluation based on above.
EOF
```

### Script Runner

For temp scripts that get data (not as permanent solution):

```bash
./scripts/run_subagent.sh script-runner <<'EOF'
Run this script and return the result:
python3 -c "from PIL import Image; img = Image.open('assets/1x/card.png'); print(f'{img.width}x{img.height}')"

Return format:
RESULT: [output]
STATUS: success|error
NOTES: [context]
EOF
```

## Search Boundaries

**Each research agent has a FIXED search boundary.** This prevents duplicate searches wasting tokens.

| Agent | Searches IN | Does NOT search |
|-------|-------------|-----------------|
| `game-source-researcher` | `~/Development/GitWorkspace/Balatro_src/` | smods, Mods, lovely |
| `smods-api-researcher` | `~/Development/GitWorkspace/smods/` | game source, Mods |
| `mod-pattern-researcher` | `~/Library/Application Support/Balatro/Mods/` | game source, smods |
| `lovely-patch-researcher` | `~/Development/GitWorkspace/smods/lovely/` + Mod `lovely.toml` files | game source, mod Lua |

**If a sub-agent needs to expand beyond its boundary:**
1. Stop and report what was found
2. Suggest which OTHER agent should search the expanded area
3. Do NOT expand search without main agent approval

## Output Constraint

ALL research agents must keep report under 100 lines. Focus on:
1. Direct answer to the question
2. Key code locations (file:line)
3. One code snippet (most relevant)

## Workflow Pattern

```
Main Agent: Receive user request
    ↓
run_subagent.sh --parallel: Research game source + SMODS + mods
    ↓
Main Agent: Review research, write code
    ↓
run_subagent.sh script-runner: (if needed) Run temp script, return data
    ↓
Main Agent: Complete implementation, test, user feedback
```

## Agent Templates

Templates in `templates/agents/` serve as **task content** for HEREDOC passed to `run_subagent.sh`. They contain:
- `<role>` — what the agent does
- `<search_boundary>` — where to search, where NOT to
- `<workflow>` — step-by-step process
- `<output_format>` — how to report findings
- `<constraints>` — what NOT to do

All boundaries and constraints are inline so they work when pasted into HEREDOC.

### Creating New Agent Templates

```markdown
---
name: agent-name
description: When to use this agent
backend: claude|codex
workdir: /default/search/path
---

<role>What this agent does</role>
<search_boundary>Where to search, where NOT to search</search_boundary>
<workflow>Step-by-step process</workflow>
<output_format>How to report findings</output_format>
<constraints>What NOT to do, keep report under 100 lines</constraints>
```

**Key Rules:**
- Sub-agents cannot interact with users
- Research agents default to `claude`, execution agents default to `codex`
- Backends are **hints** overridable via `mod.config.json > agent_backends`
- Codeagent owns final invocation policy (`~/.codeagent/config.yaml`, `~/.codeagent/models.json`)
- All boundaries MUST be inline (not referenced from external files)
- Use `$HOME` (not `~`) in parallel task workdir/search_boundary values
