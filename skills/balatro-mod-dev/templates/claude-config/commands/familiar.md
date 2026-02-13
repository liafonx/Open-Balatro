---
description: Get familiar with the current mod — what it does, how it works, key concepts
allowed-tools: Read, Glob, Grep
---

# Get Familiar With This Mod

**Mandatory first reads — do these before anything else:**
1. Read `AGENT.md` (or `docs/AGENT.md`) — mod metadata, file structure, dependencies, dev status
2. Read `INIT.md` — project rules, constraints, repo type
3. Read `mod.config.json` — file lists, paths, backend config

## Step 0: Git Worktree Detection

```bash
git worktree list 2>/dev/null
```

Note any worktree directories and **exclude them** from all file exploration below. Worktrees are separate branch checkouts — not part of the current project state.

## Step 1: Mod Identity

From AGENT.md and manifests, report:
```
Mod:         [name]
ID:          [mod id from manifest]
Version:     [version]
Prefix:      [SMODS prefix]
Repo Type:   [new / own / fork]
Mod Type:    [standard / texture pack / framework]
```

## Step 2: What It Does

Summarize in 2-3 sentences what this mod does for the player. Read `main.lua` entry point and any `README.md` to understand the user-facing functionality.

## Step 3: File Structure

List all source files with one-line purpose each:
```
main.lua              — Entry point, mod registration, [key responsibility]
config.lua            — Config defaults, user settings
Core/SomeModule.lua   — [what this module handles]
Utils/Logger.lua      — Centralized logging
lovely.toml           — Lovely patches for [what]
localization/en-us.lua — English strings
```

Use `Glob` to find all `.lua`, `.toml`, and manifest `.json` files. Read each file's top comments and key functions to determine purpose.

## Step 4: Key Functions & Architecture

For each source file, identify:
- **Public API functions** (called from other files or hooked by SMODS)
- **SMODS registrations** (`SMODS.Joker`, `SMODS.Consumable`, etc.)
- **Lovely injection points** (from `lovely.toml`)
- **Module dependencies** (`require` chains between files)

Present as a dependency map:
```
main.lua
  → requires Core/SomeModule
  → requires Utils/Logger
  → registers SMODS.Joker { key = "my_joker", ... }

Core/SomeModule.lua
  → requires Utils/Logger
  → exports: function_a(), function_b()
  → hooked by: SMODS callback X
```

## Step 5: Key Concepts & Gotchas

From INIT.md, AGENT.md, and `docs/knowledge-base.md` (if exists), list:

1. **Mod-specific constraints** — things unique to this mod that could trip you up
2. **Known issues** — documented bugs or workarounds
3. **Protected files** — files that require user confirmation before editing
4. **Active development** — what's in progress, what's stable, what's planned

Also check `references/lua-gotchas.md` in the skill for general pitfalls relevant to this mod's patterns (FFI cdata if it touches numbers, local scoping if large single files, etc.).

## Step 6: Summary

Present everything as a single briefing:

```
=== Mod Briefing: [ModName] ===

Purpose: [2-3 sentences]

Architecture:
- [module] → [responsibility]
- [module] → [responsibility]

Key SMODS Objects: [list registered types]
Lovely Patches: [count] patches in [target files]

Gotchas:
- [mod-specific thing to watch out for]
- [another]

Dev Status: [from AGENT.md — stable / in-progress / etc.]

Ready to work on this mod.
```
