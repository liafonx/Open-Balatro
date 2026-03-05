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

**Load session state (if available):**
```bash
# Session memory auto-saved by SessionEnd hook to ~/.claude/sessions/
ls -t ~/.claude/sessions/*-session.tmp 2>/dev/null | head -1 | xargs cat 2>/dev/null && echo "Session state loaded" || echo "No session state found"
```

**Review recent work:**

```bash
# What changed this session
git diff HEAD --stat
git diff HEAD
git log --oneline -10
```

**Read project state:**
- Read `AGENT.md` (root only) for current documented state
- Read `docs/knowledge-base.md` if it exists
- Read `INIT.md` for repo type and constraints

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
| Is this about a general SMODS/Lovely/Lua pattern any mod could use? | **General knowledge** → plugin files | Continue ↓ |
| Is it a debugging insight or failed approach for THIS mod? | **Project scope** → knowledge-base.md | Continue ↓ |
| Is it a debugging insight applicable to any mod? | **General knowledge** → `references/lua-gotchas.md` or patterns/ | Skip |

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
   - AGENT.md section: [which section to update]

### General Discoveries (→ plugin knowledge)

1. **[Finding title]**
   - What: [concise description]
   - Target file: [which plugin file — patterns/smods-api.md, references/lua-gotchas.md, etc.]

### No-Action Items
[Things reviewed but already documented or not worth capturing]
```

## Step 5: Apply Updates

### For project-scope findings → Update AGENT.md

**Ask before updating:** "I found {N} project-specific discoveries to add to AGENT.md. Proceed?"

If approved, update the appropriate sections:
- **Core Behavior** — new state variables, function behavior, hooks
- **Constraints & Gotchas** — new rules, platform notes, known issues
- **Lessons Learned** — failed approaches, key insights
- **Development** — new testing scenarios, debug tips

**Keep updates concise.** Add 1-3 lines per finding, not paragraphs.

### For general findings → Report only

General knowledge updates go through `/balatro-mod-dev:update-plugin`, not this command.
List them in the output so the user can decide whether to run it separately.

### For debugging insights → Update knowledge-base.md

If a bug took 3+ attempts to fix this session, add it to `docs/knowledge-base.md`.

## Step 6: Summary

```
## Knowledge Captured

### AGENT.md Updates
- [§section]: [what was added] ✅

### Plugin Updates Suggested (run /balatro-mod-dev:update-plugin)
- [target file]: [finding summary]

### Knowledge Base Updates
- [issue title]: added to docs/knowledge-base.md ✅

### Nothing to capture
[If session was routine with no new discoveries, say so]
```
