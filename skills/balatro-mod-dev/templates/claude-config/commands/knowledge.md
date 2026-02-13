---
description: Review session work, surface new discoveries, and capture knowledge in the right place
allowed-tools: Read, Grep, Glob, Bash, Edit
---

# Capture Knowledge

Review what was done this session, surface discoveries about Steamodded/game source, and evaluate where each finding belongs.

## Step 0: Git Worktree Detection

```bash
git worktree list 2>/dev/null
```

Exclude worktree directories from all file scans below.

## Step 1: Gather Session Context

**Review recent work:**

```bash
# What changed this session
git diff HEAD --stat
git diff HEAD
git log --oneline -10
```

**Read project state:**
- Read `AGENT.md` (root only — if found in `docs/`, flag as misplaced) for current documented state
- Read `docs/knowledge-base.md` if it exists
- Read `INIT.md` for repo type and constraints
- Scan any `.tmp/*/` artifacts from sub-agent work this session

**Identify what was worked on:**
- What features were added or modified?
- What bugs were fixed?
- What was researched (game source, SMODS API, mod patterns)?
- What failed or took multiple attempts?

## Step 2: Surface Discoveries

For each area, check if anything new was learned:

### Steamodded / SMODS
- New API patterns discovered during this session?
- Hooks or callbacks that behave differently than expected?
- Version-specific behavior worth noting?
- Undocumented features or gotchas?

### Game Source
- New function implementations found?
- Game state variables that matter for this mod?
- Injection points discovered?
- Platform differences (desktop vs mobile)?

### Lua / LuaJIT
- New pitfalls encountered? (Check against `references/lua-gotchas.md`)
- Performance patterns discovered?

### Mod Patterns
- Useful patterns seen in other mods?
- Anti-patterns to avoid?

## Step 3: Classify Each Finding

For **every** discovery, evaluate:

| Question | If yes → | If no → |
|----------|----------|---------|
| Is this specific to THIS mod's architecture, state, or behavior? | **Project scope** → AGENT.md | Continue ↓ |
| Is this about a general SMODS/Lovely/Lua pattern any mod could use? | **General knowledge** → skill files | Continue ↓ |
| Is it a debugging insight or failed approach for THIS mod? | **Project scope** → knowledge-base.md | Continue ↓ |
| Is it a debugging insight applicable to any mod? | **General knowledge** → `references/lua-gotchas.md` or patterns/ | Skip |

### Classification Examples

**Project scope** (→ AGENT.md):
- "This mod stores state in `G.GAME.my_mod.counter` — must persist across saves"
- "The `calculate` callback for our joker must return `nil` on non-scoring hands, not `false`"
- "Our lovely patch targets `card.lua` line 342 — fragile if game updates"
- "Module X depends on Module Y being loaded first"

**General knowledge** (→ skill patterns/references):
- "SMODS.Joker's `calculate` receives `context.cardarea` which is undocumented"
- "`G.FUNCS` callbacks don't fire on mobile for custom buttons without `lang` param"
- "FFI cdata comparisons silently fail — always use `tonumber()` first"

## Step 4: Present Findings

Report all discoveries organized by classification:

```
## Knowledge Review

### Session Summary
[2-3 sentences: what was worked on, what was accomplished]

### Project-Scope Discoveries (→ AGENT.md)

1. **[Finding title]**
   - What: [concise description]
   - Where: [file:line or component]
   - Why it matters: [impact on future development]
   - AGENT.md section: [which section to update — §3 Core Behavior / §5 Constraints / §6 Lessons / etc.]

2. ...

### General Discoveries (→ skill knowledge)

1. **[Finding title]**
   - What: [concise description]
   - Target file: [which skill file — patterns/smods-api.md, references/lua-gotchas.md, etc.]

2. ...

### No-Action Items
[Things reviewed but already documented or not worth capturing]
```

## Step 5: Apply Updates

### For project-scope findings → Update AGENT.md

**Ask before updating:** "I found {N} project-specific discoveries to add to AGENT.md. Proceed?"

If approved, update the appropriate sections:
- §3 Core Behavior — new state variables, function behavior, hooks
- §5 Constraints & Gotchas — new rules, platform notes, known issues
- §6 Lessons Learned — failed approaches, key insights
- §7 Development — new testing scenarios, debug tips
- §8 Recent Changes — version/change log
- §9 Open Tasks — unfinished work discovered

**Keep updates concise.** Add 1-3 lines per finding, not paragraphs.

### For general findings → Report only

General knowledge updates go through `/update-skill`, not this command.
List them in the output so the user can decide whether to run `/update-skill` separately.

### For debugging insights → Update knowledge-base.md

If a bug took 3+ attempts to fix this session, add it to `docs/knowledge-base.md` following the template format (symptoms, root cause, fix, lessons learned).

## Step 6: Summary

```
## Knowledge Captured

### AGENT.md Updates
- [§section]: [what was added] ✅
- [§section]: [what was added] ✅

### Skill Updates Suggested (run /update-skill)
- [target file]: [finding summary]

### Knowledge Base Updates
- [issue title]: added to docs/knowledge-base.md ✅

### Nothing to capture
[If session was routine with no new discoveries, say so]
```
