# Sub-Agent System

Research and code-writing agents spawned via the built-in Task tool. The main agent (Opus) orchestrates; Sonnet/Haiku sub-agents execute and return structured recaps.

## Architecture

```
Main Agent (Opus) → Task tool (model: sonnet|haiku) → Sub-agents
     ↑                                                    │
     └──────────────── recap ─────────────────────────────┘
```

**Opus responsibilities:** Receive requests, decompose tasks, plan strategy, review results, synthesize research, make decisions, present to user.

**Sonnet responsibilities:** Search codebases, write code per plan, explore project architecture, return structured recaps.

**Haiku responsibilities:** Run temp scripts, execute simple commands.

## Agent Selection

| Need to find... | Agent | Model | Search boundary |
|-----------------|-------|-------|----------------|
| Game function implementation | `game-source-researcher` | sonnet | `Balatro_src/` only |
| SMODS API usage/hooks | `smods-api-researcher` | sonnet | `smods/` only |
| How other mods do X | `mod-pattern-researcher` | sonnet | `Mods/` folder only |
| Lovely patch syntax | `lovely-patch-researcher` | sonnet | lovely files only |
| Project architecture/exploration | `project-explorer` | sonnet | Current project only |
| Write code per plan | `code-writer` | sonnet | Current project only |
| Run temp script for data | `script-runner` | haiku | N/A (execution) |

**Total: 7 agents**

## Invocation

All sub-agents are spawned via the Task tool with model selection.

### Single Research Agent

```
Task(
  subagent_type="Explore",
  model="sonnet",
  prompt="[content from agent template]\n\n<task>\n[specific question]\n</task>"
)
```

### Parallel Research (Recommended for Multi-Source)

Spawn multiple Task calls in a single message:

```
Task(subagent_type="Explore", model="sonnet", prompt="[game source question]")
Task(subagent_type="Explore", model="sonnet", prompt="[SMODS question]")
Task(subagent_type="Explore", model="sonnet", prompt="[mod patterns question]")
```

### Code Writing

```
Task(
  subagent_type="general-purpose",
  model="sonnet",
  prompt="[code-writer template]\n\n<plan>\n[Opus's implementation plan]\n</plan>"
)
```

### Script Running

```
Task(
  subagent_type="Bash",
  model="haiku",
  prompt="Run this script and return the result: [script]"
)
```

### Sequential (When Result Depends on Previous)

Run single Task calls one at a time, forwarding context from previous recaps.

## Search Boundaries

**Each research agent has a FIXED search boundary.** This prevents duplicate searches wasting tokens.

### Git Worktree Awareness

When browsing or searching a codebase, **always skip git worktree directories**. Worktrees are separate checkouts of other branches — searching into them gives duplicate or wrong-branch results.

**Rules for all agents:**
- Skip any directory that is a git worktree (contains a `.git` file pointing elsewhere)
- When listing files or exploring structure, exclude worktree paths
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

## Source Paths

Agent search directories are configured in `mod.config.json > source_paths`:

```json
"source_paths": {
  "game_desktop": "~/Development/GitWorkspace/Balatro_src/desktop",
  "game_mobile": "~/Development/GitWorkspace/Balatro_src/ios_plus",
  "steamodded": "~/Development/GitWorkspace/smods/src",
  "lovely": "~/Development/GitWorkspace/smods/lovely",
  "mods": "~/Library/Application Support/Balatro/Mods"
}
```

The main agent reads these paths and includes them in the Task prompt when spawning researchers.

## Recap Protocol

**All sub-agents MUST end their output with a structured recap:**

```markdown
## Recap
- **Task:** [1-line summary of what was asked]
- **Result:** [key findings or changes made, 3-5 bullets]
- **Files:** [relevant file:line references]
- **Issues:** [problems or concerns, if any]
- **Needs Review:** [what Opus should verify or decide on]
```

This ensures the main agent processes ~20 lines instead of raw tool output.

## Output Constraint

ALL research agents must keep report under 100 lines. Focus on:
1. Direct answer to the question
2. Key code locations (file:line)
3. One code snippet (most relevant)

## Delegation Rules

**When to delegate (spawn sub-agent):**
- Searching external source directories (game source, SMODS, mods, lovely)
- Writing code that spans >20 lines or multiple files
- Exploring project architecture for the first time
- Running temp scripts for data

**When to act directly (Opus, no sub-agent):**
- Planning implementation strategy
- Reviewing code changes
- Synthesizing research from multiple sources
- Making architectural decisions
- Presenting results to user
- Small edits (<20 lines, single file)

## Workflow Pattern

### Standard (big changes — uses plan mode)

```
1. Opus receives user request
2. Opus spawns Sonnet researcher(s) via Task tool (parallel when possible)
3. Opus receives recaps, synthesizes findings
4. Opus enters plan mode (EnterPlanMode)
5. Opus explores codebase, designs implementation plan
6. Opus exits plan mode (ExitPlanMode) — user reviews
7. User approves the plan
8. Opus spawns Sonnet code-writer with the approved plan  ← CRITICAL
9. Opus receives code-writer recap
10. Opus reviews changes (inline, not sub-agent)
11. Opus presents results to user
```

**Step 8 is critical:** After plan mode approval, Opus MUST delegate to Sonnet code-writer. Opus does not implement the plan itself — its value is in planning and review, not execution. For large plans, split into multiple sequential code-writer calls.

### Simple (small changes — no plan mode)

```
1. Opus receives user request
2. Opus delegates directly to code-writer (or does it inline if <20 lines)
3. Opus reviews result
```

**For simple tasks** (typo fix, single-file edit): Opus can act directly or delegate to code-writer without research or plan mode.

## Shared Task Context (Optional)

For complex multi-agent tasks, use `.tmp/[taskname]/` as shared workspace:
1. Main agent creates `.tmp/[taskname]/task.md` as shared brief
2. Sub-agents can write artifacts there (research.md, etc.)
3. Clean up `.tmp/[taskname]/` after task is complete

This is optional — the default is to use direct Task tool returns (recaps).

## Agent Templates

Templates in `templates/agents/` define agent behavior. They contain:
- `<role>` — what the agent does
- `<search_boundary>` — where to search, where NOT to
- `<workflow>` — step-by-step process
- `<output_format>` — how to report findings (includes recap)
- `<constraints>` — what NOT to do

### Template Frontmatter

```markdown
---
name: agent-name
description: When to use this agent
model: sonnet|haiku
---
```

### Creating New Agent Templates

**Key Rules:**
- Sub-agents cannot interact with users
- Research agents and code-writer use `model: sonnet`
- Script-runner uses `model: haiku`
- Never use `model: opus` — the main agent IS Opus
- All boundaries MUST be inline (not referenced from external files)
- All agents MUST include the recap section in their output format
