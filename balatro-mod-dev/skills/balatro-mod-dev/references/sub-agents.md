# Sub-Agent System

Research, code-writing, and specialist agents spawned via the built-in Task tool. The main agent (Sonnet) orchestrates; sub-agents execute and return structured recaps.

## Architecture

```
Main Agent (Sonnet)  →  Sonnet sub-agents (research, code writing)
                     →  Opus sub-agents (code review, synthesis, planning)
                     →  Haiku sub-agents (scripts)
         ↑                    ↓
         └──────── recap ─────┘
```

**Main agent responsibilities:** Receive requests, decompose tasks, evaluate recaps, make decisions, present to user, small edits (<20 lines).

**Sonnet responsibilities:** Search codebases, write code per plan, explore project architecture.

**Opus responsibilities:** Code review, research synthesis, strategic planning (deep reasoning tasks).

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
| Review code for correctness | `code-reviewer` | opus | Current project only |
| Synthesize multi-source research | `research-analyst` | opus | Current project only |
| Plan complex implementation | `strategic-planner` | opus | Current project only |

**Total: 10 agents**

## Invocation

All sub-agents are spawned via the Task tool with **explicit model selection**.

```
Task(
  subagent_type="Explore",
  model="sonnet",          # ← sonnet for research/code, haiku for scripts, opus for deep reasoning
  prompt="[content from agent template]\n\n<objective>\n[WHY this is needed]\n</objective>\n\n<task>\n[specific question]\n</task>\n\n<prior_findings>\n[what is already known, if any]\n</prior_findings>"
)
```

### Context Forwarding (REQUIRED on every Task prompt)

Every Task prompt must include:
1. **What to find** — the specific query
2. **Why it's needed** — the objective (e.g., "to decide between X and Y")
3. **What's already known** — prior research, if any

```
Task(subagent_type="Explore", model="sonnet", prompt="[agent template]\n\n<objective>We need to know how G.GAME.blind is set in order to decide where to inject our timer reset.</objective>\n\n<task>Find where G.GAME.blind is assigned in the game source.</task>")
```

### Parallel Research (Recommended for Multi-Source)

Spawn multiple Task calls in a single message when researching different sources:

```
Task(subagent_type="Explore", model="sonnet", prompt="[game source question]")
Task(subagent_type="Explore", model="sonnet", prompt="[SMODS question]")
Task(subagent_type="Explore", model="sonnet", prompt="[mod patterns question]")
```

### Deep Reasoning (Opus)

```
Task(subagent_type="general-purpose", model="opus", prompt="[code-reviewer/research-analyst/strategic-planner template + task]")
```

### Code Writing (Sonnet)

```
Task(subagent_type="general-purpose", model="sonnet", prompt="[code-writer template]\n\n<plan>\n[approved plan]\n</plan>")
```

### Script Running (Haiku)

```
Task(subagent_type="Bash", model="haiku", prompt="Run this script and return the result: [script]")
```

## Iterative Retrieval Protocol (max 3 cycles)

**Problem:** One-shot research is often insufficient.

**Process:**

1. Main agent spawns researcher with OBJECTIVE CONTEXT (why, not just what)
2. Main agent evaluates recap — is it sufficient?
3. If insufficient: spawn SAME agent again with follow-up:
   ```
   "Previous findings: [recap]. Still need: [specific gap]."
   ```
4. Max 3 cycles per agent per question. If still insufficient, note gap and move on.

**Evaluate every recap before accepting.** A recap that doesn't answer the actual question is insufficient — spawn again with the gap made explicit.

## 5-Phase Workflow (complex changes)

```
Phase 1: RESEARCH
  → Spawn researcher(s) in parallel
  → Use iterative retrieval if first pass insufficient
  → Output: structured recaps

Phase 2: SYNTHESIZE (if multi-source)
  → Spawn research-analyst (opus) with all recaps
  → Output: single analysis with recommendation + confidence

Phase 3: PLAN
  → Spawn strategic-planner (opus) with analysis
  → OR use plan mode directly for smaller tasks
  → Output: step-by-step plan
  → USER GATE: present plan, wait for approval

Phase 4: IMPLEMENT
  → Spawn code-writer (sonnet) with approved plan
  → For large plans: split into sequential code-writer calls
  → Output: code changes + recap

Phase 5: REVIEW
  → Spawn code-reviewer (opus) with changes
  → Only issues with confidence ≥80 reported
  → If CRITICAL issues: loop back to Phase 4
  → Output: APPROVE / CONCERNS / REQUEST CHANGES
```

**Simple changes (small, clear scope):** Skip to Phase 4 directly. If <20 lines, do it inline.

## Verification Loop (Post-Implementation Review)

After `code-writer` completes implementation, automatically invoke `code-reviewer` (opus) to verify the changes:

```
Phase 4: IMPLEMENT
  → code-writer produces changes + recap

Phase 5: REVIEW (automatic)
  → Spawn code-reviewer with the code-writer's recap and changed files
  → code-reviewer returns: APPROVE / CONCERNS / REQUEST CHANGES
  → If REQUEST CHANGES: loop back to Phase 4 with specific issues
  → Max 2 review loops before presenting to user
```

**When to auto-invoke:**
- After any code-writer call that modifies >3 files or >50 lines
- After `/refactor` identifies and applies changes
- When implementing complex features (multi-file, new SMODS objects)

**When to skip:**
- Small edits (<20 lines, single file) done inline by main agent
- Script-runner output (no code to review)
- Documentation-only changes

The verification loop prevents common issues from reaching the user: nil-unsafe patterns, missing localization, SMODS API misuse, and mobile compatibility gaps.

## Search Boundaries

**Each research agent has a FIXED search boundary.** This prevents duplicate searches wasting tokens.

### Git Worktree Awareness

When browsing or searching a codebase, **always skip git worktree directories**. Worktrees are separate checkouts of other branches — searching into them gives duplicate or wrong-branch results.

**Rules for all agents:**
- Skip any directory that is a git worktree (contains a `.git` file pointing elsewhere)
- When listing files or exploring structure, exclude worktree paths

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
- **Needs Review:** [what the main agent should verify or decide on]
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
- Reviewing code for correctness (code-reviewer, opus)
- Synthesizing multi-source research (research-analyst, opus)
- Planning complex implementation (strategic-planner, opus)

**When to act directly (no sub-agent):**
- Small edits (<20 lines, single file)
- Presenting results to user
- Making simple decisions
- Reading project files for quick context

## Agent Templates

Plugin-bundled agents define agent behavior. They contain:
- `<role>` — what the agent does
- `<search_boundary>` — where to search, where NOT to
- `<workflow>` — step-by-step process (step 0: read objective context)
- `<output_format>` — how to report findings (includes recap)
- `<constraints>` — what NOT to do

### Frontmatter

```markdown
---
name: agent-name
description: "When to use this agent.
<example>
Context: [when this fires]
user: '[user message]'
assistant: 'I will invoke the agent-name agent.'
<commentary>Triggers on [condition].</commentary>
</example>"
model: sonnet|haiku|opus
color: yellow|green|blue|cyan|red
tools: Glob, Grep, Read  # explicit tool whitelist
---
```

### Tool Whitelists

| Agent | Tools |
|-------|-------|
| game-source-researcher | `Glob, Grep, Read` |
| smods-api-researcher | `Glob, Grep, Read` |
| mod-pattern-researcher | `Glob, Grep, Read` |
| lovely-patch-researcher | `Glob, Grep, Read` |
| project-explorer | `Glob, Grep, Read, Bash` |
| code-writer | `Read, Write, Edit, Glob, Grep, Bash` |
| script-runner | `Bash, Read, Write` |
| code-reviewer | `Read, Glob, Grep` |
| research-analyst | `Read, Glob, Grep` |
| strategic-planner | `Read, Glob, Grep` |

Research agents and reviewers are **read-only**. Only code-writer and script-runner can modify files.
