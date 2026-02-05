# Sub-Agent System

Research agents for gathering information while main agent handles code development.

## Agent Selection

| Need to find... | Use agent | Search boundary |
|-----------------|-----------|----------------|
| Game function implementation | `game-source-researcher` | `Balatro_src/` only |
| SMODS API usage/hooks | `smods-api-researcher` | `smods/` only |
| How other mods do X | `mod-pattern-researcher` | `Mods/` folder only |
| Lovely patch syntax | `lovely-patch-researcher` | lovely files only |
| Run temp script for data | `script-runner` | N/A (execution) |

## Parallel vs Sequential

- **Parallel:** When researching DIFFERENT sources (game + SMODS + mods) - spawn multiple agents at once
- **Sequential:** When second query depends on first result

## Search Boundaries (IMPORTANT)

**Each research agent has a FIXED search boundary.** This prevents duplicate searches wasting tokens.

| Agent | Searches IN | Does NOT search |
|-------|-------------|-----------------|
| `game-source-researcher` | `~/Development/GitWorkspace/Balatro_src/` | smods, Mods, lovely |
| `smods-api-researcher` | `~/Development/GitWorkspace/smods/src/` | game source, Mods |
| `mod-pattern-researcher` | `~/Library/Application Support/Balatro/Mods/` | game source, smods |
| `lovely-patch-researcher` | `~/Development/GitWorkspace/smods/lovely/` | game source, Mods |

**If a sub-agent needs to expand beyond its boundary:**
1. Stop and report what was found
2. Suggest which OTHER agent should search the expanded area
3. Do NOT expand search without main agent approval

## Script Runner

When main agent needs to run a temporary script to get data (not as the solution, just to extract/process info):

**Use cases:**
- Image processing with PIL
- Data extraction from files
- Quick calculations
- Format conversions

**Pattern:**
```
Main Agent: I need to extract image dimensions
    ↓
Script Runner Sub-Agent: Run `python3 -c "from PIL import Image; ..."`, return result
    ↓
Main Agent: Use result to continue with actual solution
```

## Workflow Pattern

```
Main Agent: Receive user request
    ↓
Sub-Agent: Research game source / SMODS API / mod patterns
    ↓
Main Agent: Review research, write code
    ↓
Script Runner: (if needed) Run temp script, return data
    ↓
Main Agent: Complete implementation, test, user feedback
```

## Output Constraint

ALL research agents must keep report under 100 lines. Focus on:
1. Direct answer to the question
2. Key code locations (file:line)
3. One code snippet (most relevant)

## Platform-Specific Setup

| Platform | Agent Location | Invocation |
|----------|----------------|------------|
| Claude | `.claude/agents/` | Automatic via description |
| Codex | Use Task tool | `Task("Research...", agent_prompt)` |

## Creating New Sub-Agents

Agent template structure:

```markdown
---
name: agent-name
description: When to use this agent (triggers automatic selection)
tools: Read, Grep, Glob, Bash
model: sonnet
---

<role>What this agent does</role>
<search_boundary>Where to search, where NOT to search</search_boundary>
<workflow>Step-by-step process</workflow>
<output_format>How to report findings</output_format>
<constraints>What NOT to do</constraints>
```

**Key Rules:**
- Sub-agents cannot interact with users (no AskUserQuestion)
- Use `tools:` to restrict access (Read, Grep, Glob for research; no Write/Edit)
- Sub-agents return a final report to main agent
- Use XML tags for structure, not markdown headings
