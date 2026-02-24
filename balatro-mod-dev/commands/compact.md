---
description: Evaluate whether to compact context based on current workflow phase
allowed-tools: Read, Bash
---

# Strategic Compact

Evaluate the current session state and recommend whether to `/compact` now or keep working.

## Step 1: Assess Current Phase

Determine which workflow phase the session is in:

| Phase | Indicators |
|-------|-----------|
| **Research** | Reading game source, SMODS, other mods via researcher agents |
| **Planning** | Plan mode active, designing implementation, listing files to change |
| **Implementing** | Writing/editing .lua files, creating modules |
| **Testing** | Running sync, checking Lovely logs, verifying behavior |
| **Debugging** | Analyzing errors, tracing function calls, fixing issues |

## Step 2: Apply Decision Guide

| Phase Transition | Compact? | Why |
|------------------|----------|-----|
| Research → Plan | **Yes** | Research context is bulky; plan distills it |
| Plan → Implement | **Yes** | Plan is in TodoWrite or file; free context for code |
| Implement → Test | **Maybe** | Keep if tests reference recent code changes |
| Debug → Next feature | **Yes** | Debug traces pollute context |
| Mid-implementation | **No** | Losing file paths, variable names, partial state is costly |
| After failed approach | **Yes** | Clear dead-end reasoning before trying new approach |
| After large agent returns | **Yes** | Agent summaries consumed context; reclaim it |

## Step 3: Check What Survives

| Persists After Compact | Lost After Compact |
|------------------------|-------------------|
| INIT.md / AGENT.md (reloaded by SessionStart hook) | Intermediate reasoning and analysis |
| TodoWrite task list | File contents previously read |
| `~/.claude/sessions/` (compaction marker appended by PreCompact hook) | Multi-step conversation context |
| Git state (commits, branches) | Tool call history and counts |
| Files on disk | Nuanced verbal preferences |
| `.claude/rules/` content | Sub-agent research that wasn't summarized |

## Step 4: Recommend

Present recommendation:

```
=== Compact Assessment ===

Phase: [current phase]
Tool calls: [count if available]
Context health: [good / getting heavy / stale]

Recommendation: [Compact now / Keep working / Compact after finishing current task]
Reason: [1 sentence]

Before compacting:
- [ ] Ensure TodoWrite reflects current progress
- [ ] Commit any in-progress changes (or stash)
- [ ] Session state is auto-saved to ~/.claude/sessions/ by SessionEnd hook
```

**Wait for user confirmation before running `/compact`.**
