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
  "reasoning": "opus",
  "overrides": {}
}
```

- `research` — default backend for all research agents (game-source, smods-api, mod-pattern, lovely-patch)
- `execution` — default backend for execution agents (script-runner)
- `reasoning` — default backend for reasoning agents (strategic-planner, code-reviewer, research-analyst)
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
| `strategic-planner` | — | project root |
| `code-reviewer` | — | project root |
| `research-analyst` | — | project root |

## Agent Selection

| Need to find... | Agent | Default Backend | Default Workdir |
|-----------------|-------|---------|---------|
| Game function implementation | `game-source-researcher` | `claude` | `source_paths.game_desktop` |
| SMODS API usage/hooks | `smods-api-researcher` | `claude` | `source_paths.steamodded` |
| How other mods do X | `mod-pattern-researcher` | `claude` | `source_paths.mods` |
| Lovely patch syntax | `lovely-patch-researcher` | `claude` | `source_paths.lovely` |
| **Project architecture/exploration** | `project-explorer` | **`codex`** | **project root** |
| Run temp script for data | `script-runner` | `codex` | project root |
| **Plan implementation strategy** | `strategic-planner` | **`opus`** | **project root** |
| **Review code for correctness** | `code-reviewer` | **`opus`** | **project root** |
| **Synthesize research findings** | `research-analyst` | **`opus`** | **project root** |

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

### Git Worktree Awareness

When browsing or searching a codebase, **always skip git worktree directories**. Worktrees are separate checkouts of other branches — searching into them gives duplicate or wrong-branch results.

```bash
# Detect worktrees in project root
git worktree list 2>/dev/null
```

**Rules for all agents:**
- Skip any directory that is a git worktree (contains a `.git` file pointing elsewhere)
- When listing files or exploring structure, exclude worktree paths
- If unsure whether a directory is a worktree, check: `[ -f <dir>/.git ] && echo "worktree"`
- The main project is the worktree you're currently in — only search within it

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

## Shared Task Context

When the main agent invokes multiple sub-agents for a task, it **must** first create a shared task brief as the single source of truth. All task artifacts live under `.tmp/[taskname]/`.

### Task Brief (main agent only)

**Create:** `.tmp/[taskname]/task.md` before spawning any sub-agents.

Contents (concise + accurate):
- **User requirements** — must-haves
- **Goal + success criteria** — what "done" looks like
- **Scope / boundaries** — do / don't
- **Constraints + assumptions** — known limits
- **Key context** — definitions, focus areas, references

Only the main agent may edit `task.md`. Sub-agents read it for context.

### Phase Handoff Notes (sub-agents)

Each sub-agent writes a Markdown artifact in `.tmp/[taskname]/`, concise and actionable:

| Agent role | Artifact file | Contents |
|------------|---------------|----------|
| Researcher / Explorer | `research.md` / `exploration.md` | Key findings + evidence/refs, unknowns, follow-ups. Keep short; avoid speculation. |
| Analyst | `analysis.md` | Synthesized conclusions + rationale. Decisions, tradeoffs, risks, key numbers. Comprehensive but not verbose; review-ready. |
| Planner | `plan.md` | Executable + justified plan (see structure below). |
| Reviewer | `review.md` | Review verdict, issues found, recommendations. |

### Plan Artifact Structure (`plan.md`)

The planner's artifact must include:

1. **Problem statement** — what is needed / broken
2. **Root cause / constraints** — why it happens or what drives the need
3. **Solution approach** — how the plan addresses the root cause (cause → fix mapping)
4. **Execution steps** — concrete step-by-step actions the executor can follow
5. **Verification** — how to validate success (tests/checks/acceptance criteria)
6. **Traceability** — reference earlier `.md` files when helpful

**If the task is a new feature**, also include an **Approach justification**:
- Why this is the best approach vs alternatives
- Minimal code changes / minimal surface area
- No redundant logic; maximize reuse of existing code/components
- No conflict with existing architecture or conventions
- No performance bottlenecks (call out hotspots and how you avoid them)

### Invocation with Shared Context

```bash
# Step 0: Main agent creates the task brief
mkdir -p .tmp/add-hand-scoring
cat > .tmp/add-hand-scoring/task.md <<'BRIEF'
## Goal
Add custom hand scoring for Flush Five.
## Requirements
- Hook into evaluate_poker_hand
- Support mobile + desktop
## Scope
- DO: Add scoring logic, localization
- DON'T: Change UI layout
## Context
- See SMODS.Hand for API
BRIEF

# Step 1: Research (agents read task.md, write research.md)
./scripts/run_subagent.sh game-source-researcher <<'EOF'
Read `.tmp/add-hand-scoring/task.md` for context.
Find evaluate_poker_hand implementation and scoring hooks.
Write findings to `.tmp/add-hand-scoring/research.md`.
EOF

# Step 2: Analyze (reads task.md + research.md, writes analysis.md)
./scripts/run_subagent.sh research-analyst <<'EOF'
Read `.tmp/add-hand-scoring/task.md` and `.tmp/add-hand-scoring/research.md`.
Synthesize findings and recommend the best approach.
Write analysis to `.tmp/add-hand-scoring/analysis.md`.
EOF

# Step 3: Plan (reads all prior artifacts, writes plan.md)
./scripts/run_subagent.sh strategic-planner <<'EOF'
Read all files in `.tmp/add-hand-scoring/`.
Create an implementation plan.
Write plan to `.tmp/add-hand-scoring/plan.md`.
EOF
```

**For parallel research**, each researcher writes its own section. The analyst then reads all of them:

```bash
# Parallel research (each writes to .tmp/[taskname]/)
./scripts/run_subagent.sh --parallel --full-output <<'EOF'
---TASK---
id: game_source
backend: claude
workdir: $HOME/Development/GitWorkspace/Balatro_src/desktop
---CONTENT---
Read `.tmp/add-hand-scoring/task.md` for context.
[specific question]
Write findings to `.tmp/add-hand-scoring/research-game.md`.

---TASK---
id: smods_api
backend: claude
workdir: $HOME/Development/GitWorkspace/smods/src
---CONTENT---
Read `.tmp/add-hand-scoring/task.md` for context.
[specific question]
Write findings to `.tmp/add-hand-scoring/research-smods.md`.
EOF
```

### Cleanup

The main agent should clean up `.tmp/[taskname]/` after the task is complete:
```bash
rm -rf .tmp/[taskname]
```

`.tmp/` is git-ignored by default (see gitignore template).

## Workflow Pattern

```
Main Agent: Receive user request
    ↓
run_subagent.sh --parallel: Research game source + SMODS + mods
    ↓
run_subagent.sh research-analyst: (if multi-source) Synthesize findings
    ↓
run_subagent.sh strategic-planner: (if complex) Plan implementation
    ↓
Main Agent: Implement code based on plan
    ↓
run_subagent.sh code-reviewer: (if significant) Review changes
    ↓
run_subagent.sh script-runner: (if needed) Run temp script, return data
    ↓
Main Agent: Address review feedback, test, user feedback
```

**When to use reasoning agents:**
- `strategic-planner` — before implementing new features, refactoring, or structural changes
- `code-reviewer` — after writing code or before merging significant changes
- `research-analyst` — when research spans 2+ sources and needs synthesis

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
- **Model restriction:** Opus is allowed **only** for reasoning sub-agents (strategic-planner, code-reviewer, research-analyst). Research agents use Sonnet; execution agents use Haiku.
- **Hookify enforcement:** Model and routing rules enforced by `hookify.no-opus-subagents.local.md` (blocks Opus for non-reasoning agents) and `hookify.subagent-routing.local.md` (requires run_subagent.sh). Requires hookify plugin on-site.
