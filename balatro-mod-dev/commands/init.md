---
description: Initialize Balatro mod development for current repo
allowed-tools: Read, Write, Edit, Bash
argument-hint: "[--force to skip detection]"
---

# Initialize Balatro Mod Development

You are setting up a Balatro mod development environment. **Auto-detect everything first, then confirm with user.**

## IMPORTANT: File Placement Rules

When creating `.md` or `.txt` files, only these belong in root:
- `README.md`, `README_zh.md`
- `CHANGELOG.md`, `CHANGELOG_zh.md`
- `AGENT.md`, `INIT.md`
- `LICENSE`, `LICENSE.md`

**ALL other `.md`/`.txt` files MUST go in `docs/`**

## Step 0: Git Worktree Detection

```bash
git worktree list 2>/dev/null
```

Record worktree paths. **Exclude them from ALL file detection below.**

## Step 1: Detect Repository State

### Check 1: Is this an empty (brand new) repo?
```bash
find . -type f ! -path './.git/*' | wc -l
```
- If 0 files (or only README/LICENSE) → **new repo**
- If has files → **existing repo**

### Check 2: For existing repos, auto-detect own vs fork

```bash
git_user=$(git remote get-url origin 2>/dev/null | sed -E 's|.*[:/]([^/]+)/[^/]+\.git$|\1|' | tr '[:upper:]' '[:lower:]')
mod_author=$(jq -r '.author[0] // .author // ""' *.json 2>/dev/null | head -1 | tr '[:upper:]' '[:lower:]')
echo "Git user: $git_user"
echo "Mod author: $mod_author"
```

**Detection logic:**
- `git_user == mod_author` → **own**
- `git_user != mod_author` → **fork**

### Check 3: Determine Mod Type from Manifest
- Contains `"malverk"` → **texture pack**
- Otherwise → **standard mod**

## Step 2: Generate Action Plan

### For ALL Existing Repos (OWN or FORK)

**Cleanup:**
- [ ] Delete `References/` folder if exists (legacy symlink approach)
- [ ] Move extra `.md` files to `docs/`

**Dev files (add if missing):**
- [ ] AGENT.md
- [ ] INIT.md
- [ ] mod.config.json
- [ ] scripts/sync_to_mods.sh
- [ ] .gitignore with agent folders

---

### Additional for NEW Repository

Full skeleton - create everything:
- [ ] {ModID}.json (manifest)
- [ ] main.lua (entry point)
- [ ] scripts/create_release.sh
- [ ] localization/en-us.lua
- [ ] Utils/Logger.lua

### Additional for OWN Repository

Full evaluation - check and fix:
- [ ] Verify manifest follows SMODS conventions
- [ ] Check mod.config.json uses current schema (v2.2.0+)
- [ ] Check scripts use Config Version 2.0.1
- [ ] scripts/create_release.sh exists
- [ ] Utils/Logger.lua exists and matches template pattern

### Additional for FORK Repository

Minimal changes - respect their structure:
- [ ] AGENT.md should be lightweight
- [ ] INIT.md uses fork-mode rules
- [ ] Do NOT add: create_release.sh, Logger.lua, localization/

---

## Step 3: Confirm with User

Present the plan:
```
=== Balatro Mod Init ===

Detected: [repo type] repository
Mod: [name] ([id]) - [mod type]
Version: [version]

Actions to perform:
1. [action 1]
2. [action 2]
...

Proceed? (y/n)
```

Wait for user confirmation before making any changes.

## Step 4: Execute Plan

After confirmation, create/update files:

### File Templates

**AGENT.md** (for new/own repos):
Use `${CLAUDE_PLUGIN_ROOT}/templates/agent-md-template.md`, fill with detected metadata.

**INIT.md** (varies by repo type):
- New/Own: Full template from `${CLAUDE_PLUGIN_ROOT}/templates/project-rules-template.md`
- Fork: Lightweight version

**mod.config.json** (FOLLOW THIS STRUCTURE EXACTLY):
```json
{
  "$schema": "https://json-schema.org/draft-07/schema",
  "$version": "2.2.0",
  "mod_name": "{ModID}",
  "mod_json": "{ModID}.json",
  "description": "",
  "paths": {
    "mods_dir": "~/Library/Application Support/Balatro/Mods",
    "logs_dir": "~/Library/Application Support/Balatro/Mods/lovely/log",
    "release_dir": "release"
  },
  "include_files": [
    "main.lua",
    "config.lua",
    "lovely.toml",
    "lovely/***",
    "{ModID}.json",
    "localization/***",
    "assets/***",
    "Utils/***",
    "README.md",
    "README_zh.md"
  ],
  "thunderstore_additions": [
    "manifest.json",
    "CHANGELOG.md",
    "icon.png"
  ],
  "sync": { "watch_enabled": true, "watch_debounce_ms": 500 },
  "release": { "formats": ["github", "thunderstore"] },
  "test_saves": [],
  "protected_files": [],
  "source_paths": {
    "game_desktop": "~/Development/GitWorkspace/Balatro_src/desktop",
    "game_mobile": "~/Development/GitWorkspace/Balatro_src/ios_plus",
    "steamodded": "~/Development/GitWorkspace/smods/src",
    "lovely": "~/Development/GitWorkspace/smods/lovely",
    "mods": "~/Library/Application Support/Balatro/Mods"
  }
}
```

**.gitignore** additions (verify ALL are present):
```
.agent/
.agents/
.claude/
.cursor/
INIT.md
AGENT.md
mod.config.json
docs/*
!docs/description.md
!docs/NEXUSMODS_DESCRIPTION.txt
.tmp/
release/
```

## Step 4b: Scaffold Rules (if missing)

Check if `.claude/rules/` contains Lua-specific rules. If missing, copy from plugin templates:

```bash
mkdir -p .claude/rules/

# Copy Lua-specific rules from plugin
if [ ! -f .claude/rules/lua-coding-style.md ]; then
  cp "${CLAUDE_PLUGIN_ROOT}/templates/rules/lua-coding-style.md" .claude/rules/
  echo "Scaffolded: lua-coding-style.md"
fi

if [ ! -f .claude/rules/mod-conventions.md ]; then
  cp "${CLAUDE_PLUGIN_ROOT}/templates/rules/mod-conventions.md" .claude/rules/
  echo "Scaffolded: mod-conventions.md"
fi

if [ ! -f .claude/rules/delegation.md ]; then
  cp "${CLAUDE_PLUGIN_ROOT}/templates/rules/delegation.md" .claude/rules/
  echo "Scaffolded: delegation.md"
fi

if [ ! -f .claude/rules/git-workflow.md ]; then
  cp "${CLAUDE_PLUGIN_ROOT}/templates/rules/git-workflow.md" .claude/rules/
  echo "Scaffolded: git-workflow.md"
fi
```

## Step 5: Verify/Update AGENT.md

**After init, if AGENT.md exists, verify it contains:**
- [ ] Accurate mod metadata (name, id, version, prefix)
- [ ] Current file structure (list actual files)
- [ ] Key functions and their purposes
- [ ] Dependencies (SMODS version, other mods)
- [ ] Current development status

## Step 6: Summary

Report what was created/modified:
```
=== Init Complete ===

Created:
- [file list]

Modified:
- [file list]

Rules scaffolded:
- [rule files copied to .claude/rules/]

AGENT.md status:
- [Created new / Updated existing / Already up-to-date]

Next steps:
- Run `./scripts/sync_to_mods.sh` to sync to game
```
