---
description: Initialize Balatro mod development for current repo
allowed-tools: Read, Write, Edit, Bash
argument-hint: "[--force to skip detection]"
---

# Initialize Balatro Mod Development

You are setting up a Balatro mod development environment. **Auto-detect everything first, then confirm with user.**

## Step 1: Auto-Detect Repository Type

Check these indicators to determine repo type:

### Check 1: Git Remote Origin
```bash
git remote get-url origin 2>/dev/null
```
- If contains `liafonx/` → **own repo** (user's mod)
- If contains other username → **fork** (contributing to others)
- If no remote → **new repo**

### Check 2: Existing Files
Scan for:
- `*.json` files with `"id"`, `"prefix"`, `"dependencies"` fields → SMODS manifest
- `main.lua`, `*.lua` files → mod code
- `AGENT.md`, `INIT.md`, `mod.config.json` → already initialized
- `lovely.toml` or `lovely/*.toml` → uses Lovely patches
- `assets/1x/`, `assets/2x/` → texture pack

### Check 3: Determine Mod Type from Manifest
If manifest exists, check dependencies:
- Contains `"malverk"` → **texture pack**
- Has `"provides"` field or many API functions → **framework**
- Otherwise → **standard mod**

### Auto-Detection Results

Report findings:
```
Repository Type: [new | own | fork]
Mod Type: [standard | texture | framework] (if detectable)
Detected Metadata:
  - ID: {from manifest}
  - Name: {from manifest}
  - Prefix: {from manifest}
  - Version: {from manifest}
Existing Dev Files: [list AGENT.md, INIT.md, mod.config.json, scripts/, .claude/ if present]
Missing Dev Files: [list what needs to be created]
```

## Step 2: Generate Action Plan

Based on repo type, create specific plan:

### For NEW Repository
Create full skeleton:
- [ ] {ModID}.json (manifest)
- [ ] main.lua (entry point)
- [ ] AGENT.md (mod documentation)
- [ ] INIT.md (project rules)
- [ ] mod.config.json (file lists)
- [ ] .gitignore
- [ ] scripts/sync_to_mods.sh
- [ ] scripts/create_release.sh
- [ ] .claude/hooks/hooks.json (optional)
- [ ] localization/en-us.lua

### For OWN Existing Repository
Evaluate and fix structure:
- [ ] Delete `References/` folder if exists (legacy symlink approach - no longer needed)
- [ ] Move unorganized docs (*.md, *.txt in root) to `docs/` folder
- [ ] Check if manifest follows SMODS conventions
- [ ] Check if AGENT.md exists and is complete
- [ ] Check if INIT.md exists with correct rules
- [ ] Check if mod.config.json has `$version` field and uses v2.0.0 schema (with `paths` object)
- [ ] Check if scripts use Config Version 2.0.0 (read from mod.config.json `paths` and `sync`/`release` settings)
- [ ] Check if scripts/ folder exists and is executable
- [ ] Check if .gitignore includes agent folders
- [ ] List any structural issues to fix

**Script Version Check:**
Look for `# Config Version: 2.0.0` in scripts. If missing or older:
- Offer to update scripts to latest version from skill templates
- Keep any custom modifications (ask user)

### For FORK (Others' Repository)
Minimal additions only:
- [ ] AGENT.md (if missing - lightweight version documenting current structure)
- [ ] INIT.md (lightweight, fork-mode rules)
- [ ] mod.config.json (for local sync only)
- [ ] scripts/sync_to_mods.sh (local development)
- [ ] .gitignore additions (append agent folders if missing)
- Do NOT modify: manifest, main code structure

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
Use `agent-md-template.md`, fill with detected metadata.

**INIT.md** (varies by repo type):
- New/Own: Full template from `project-rules-template.md`
- Fork: Lightweight version:
  ```markdown
  # {ModName} - Fork Development
  
  Contributing to upstream repository.
  
  ## Rules
  - Follow existing code style
  - Minimal changes only
  - Do not restructure files
  - Use temporary logging (remove before PR)
  
  ## Dev Workflow
  - `./scripts/sync_to_mods.sh` to test locally
  ```

**mod.config.json** (FOLLOW THIS STRUCTURE EXACTLY):
```json
{
  "$version": "2.0.0",
  "mod_name": "{ModID}",
  "mod_json": "{ModID}.json",
  "paths": {
    "mods_dir": "~/Library/Application Support/Balatro/Mods",
    "logs_dir": "~/Library/Application Support/Balatro/Mods/lovely/log",
    "release_dir": "release"
  },
  "include_files": [
    "main.lua",
    "lovely.toml",
    "{ModID}.json",
    "manifest.json",
    "README.md",
    "README_zh.md",
    "localization/***",
    "assets/***",
    "Utils/***"
  ],
  "thunderstore_additions": [
    "CHANGELOG.md",
    "icon.png"
  ],
  "sync": { "watch_enabled": true },
  "release": { "formats": ["github", "thunderstore"] }
}
```

**CRITICAL: include_files vs thunderstore_additions**

| List | Purpose | Files |
|------|---------|-------|
| `include_files` | Sync to game + GitHub release | All mod code, manifests, README(_zh).md |
| `thunderstore_additions` | Thunderstore-only extras | CHANGELOG.md, icon.png |

**DO NOT include in either list:**
- `CHANGELOG_zh.md` (not needed)
- Duplicate files in both lists

**README files go in include_files**, NOT thunderstore_additions.

**Merging include_files from existing scripts:**
If existing scripts have `BASE_FILES` array:
1. Extract files from `BASE_FILES=( ... )` in old scripts
2. Merge with template defaults (no duplicates)
3. Add to `include_files` in new mod.config.json

Example old script pattern to extract:
```bash
BASE_FILES=(
    "main.lua"
    "*.lua"
    "localization/***"
)
```

**scripts/** (always create/update if outdated):
- Copy from skill templates
- Make executable
- Old scripts with hardcoded BASE_FILES → new scripts read from mod.config.json

**.gitignore** additions:
```
.agent/
.agents/
.claude/
.codex/
.cursor/
```

## Step 5: Summary

Report what was created/modified:
```
=== Init Complete ===

Created:
- [file list]

Modified:
- [file list]

Migrated from old scripts:
- [list any BASE_FILES merged into mod.config.json]

Next steps:
- Run `./scripts/sync_to_mods.sh` to sync to game
- Review AGENT.md and update with mod-specific details
```
