# Sub-Agent Delegation

## When to Delegate (spawn agent)
- Searching external sources (game source, SMODS, installed mods, lovely)
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

## Model Selection
- sonnet: research, code writing, exploration (most tasks)
- opus: code review, synthesis, strategic planning (deep reasoning)
- haiku: script execution, simple data extraction

## Iterative Retrieval
- Evaluate every agent recap before accepting
- If insufficient: re-spawn with follow-up context (max 3 cycles)
- Always pass objective context (WHY), not just the query

## Context Forwarding (REQUIRED)
Every Task prompt must include:
1. What to find (the query)
2. Why it is needed (the objective)
3. What is already known (prior research, if any)
