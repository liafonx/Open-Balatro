# Sub-Agent Delegation

## Commands vs Agents (CRITICAL)

Commands and agents are **different execution models**. Do NOT confuse them.

- **Commands** (`/balatro-mod-dev:familiar`, `/balatro-mod-dev:check`, etc.) → invoke via **Skill tool**. Runs in main context.
- **Agents** (`game-source-researcher`, `project-explorer`, etc.) → spawn via **Task tool**. Runs in isolated context, returns summary.

When user types a slash command, ALWAYS use the Skill tool. Never use `Task(subagent_type="balatro-mod-dev:command-name")` — commands are not agents.

### Commands with Agent Equivalents

Some commands overlap with agent capabilities. Use the right tool for the situation:

| User Action | Tool | Why |
|-------------|------|-----|
| User types `/familiar` | **Skill** | User wants full briefing in main context |
| Agent needs mod overview during workflow | **Task** → `project-explorer` | Save main context, get summary |
| User types `/refactor` | **Skill** | Command spawns code-reviewer internally |
| Agent needs code review | **Task** → `code-reviewer` | Isolated review with confidence scoring |

## Source Routing (CRITICAL)

Never use `Explore` or `general-purpose` when a purpose-built researcher exists — always use the specific agent:

| Source | Agent |
|--------|-------|
| **Mod project code** (UI, features, architecture, file search) | `balatro-mod-dev:project-explorer` |
| Game source (`Balatro_src/`) | `balatro-mod-dev:game-source-researcher` |
| SMODS source (`smods/src/`) | `balatro-mod-dev:smods-api-researcher` |
| Lovely patches (`smods/lovely/`, `lovely-injector/`) | `balatro-mod-dev:lovely-patch-researcher` |
| Installed mods (`Mods/`) | `balatro-mod-dev:mod-pattern-researcher` |
| Lovely logs/dumps (`Mods/lovely/log/`, `Mods/lovely/dump/`) | `balatro-mod-dev:debug-inspector` |

Using `Explore` or `general-purpose` for these paths is blocked automatically by the `enforce-task-model` hook.

## When to Delegate (spawn agent)
- Exploring mod project code (UI, features, architecture) — use project-explorer, sonnet
- Searching external sources (game source, SMODS, installed mods, lovely) — see routing table above
- Inspecting runtime state (logs, dump metadata, mod compatibility) — use debug-inspector, sonnet
- Writing code >20 lines or spanning multiple files
- Reviewing code for correctness (use code-reviewer, opus)
- Synthesizing multi-source research (use research-analyst, opus)
- Planning complex implementation (use strategic-planner, opus)
- Running one-off scripts (use script-runner, haiku)

## When to Act Directly (no agent)
- Small edits (<20 lines, single file)
- Presenting results to user
- Making simple decisions
- Reading project files for quick context

## Model Selection (ALWAYS specify)

**ALWAYS pass the `model` parameter on every Task call.** Without it, sub-agents inherit the parent model. If the main agent is Opus, an Explore agent without `model` runs as Opus — 20x the cost for exploration work.

| Subagent Type | Model | Use For |
|---------------|-------|---------|
| `balatro-mod-dev:project-explorer` | **sonnet** | Mod project code — architecture, UI, features, file exploration |
| `general-purpose` | **sonnet** | General tasks in mod project context |
| `Bash` | **haiku** | Simple command execution |
| `balatro-mod-dev:game-source-researcher` | **sonnet** | Game source functions, injection points |
| `balatro-mod-dev:smods-api-researcher` | **sonnet** | SMODS API patterns |
| `balatro-mod-dev:lovely-patch-researcher` | **sonnet** | Lovely patch syntax |
| `balatro-mod-dev:mod-pattern-researcher` | **sonnet** | Patterns from installed mods |
| `Explore` | **sonnet** | Quick targeted file searches only — when no researcher above matches |
| `balatro-mod-dev:code-writer` | **sonnet** | Multi-file code implementation |
| `balatro-mod-dev:script-runner` | **haiku** | One-off scripts, data extraction |
| `balatro-mod-dev:debug-inspector` | **sonnet** | Runtime log inspection, dump analysis, mod compatibility |
| `balatro-mod-dev:code-reviewer` | **opus** | Code review with confidence scoring |
| `balatro-mod-dev:research-analyst` | **opus** | Synthesize multi-source research |
| `balatro-mod-dev:strategic-planner` | **opus** | Complex implementation planning |

> **Do NOT spawn `Plan` sub-agents.** Plan directly in main context — the main agent already has plan mode. For implementation planning, use `balatro-mod-dev:strategic-planner` (opus). The `enforce-task-model.js` hook will block any `Plan` Task calls.

## Iterative Retrieval
- Evaluate every agent recap before accepting
- If insufficient: re-spawn with follow-up context (max 3 cycles)
- Always pass objective context (WHY), not just the query

## Context Forwarding (REQUIRED)
Every Task prompt must include:
1. What to find (the query)
2. Why it is needed (the objective)
3. What is already known (prior research, if any)
