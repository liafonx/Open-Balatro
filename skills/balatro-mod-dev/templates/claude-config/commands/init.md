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

**ALL other `.md`/`.txt` files MUST go in `docs/`** (e.g., `docs/DESIGN.md`, `docs/knowledge-base.md`)

## Step 1: Detect Repository State

### Check 1: Is this an empty (brand new) repo?
```bash
# Count files (excluding .git)
find . -type f ! -path './.git/*' | wc -l
```
- If 0 files (or only README/LICENSE) → **new repo** (proceed to Step 2 with full skeleton)
- If has files → **existing repo** (proceed to ask user)

### Check 2: For existing repos, auto-detect own vs fork

Compare mod manifest author with git remote username:

```bash
# Get git remote username (lowercase)
git_user=$(git remote get-url origin 2>/dev/null | sed -E 's|.*[:/]([^/]+)/[^/]+\.git$|\1|' | tr '[:upper:]' '[:lower:]')

# Get mod author from manifest (first author if array, lowercase)
mod_author=$(jq -r '.author[0] // .author // ""' *.json 2>/dev/null | head -1 | tr '[:upper:]' '[:lower:]')

# Report
echo "Git user: $git_user"
echo "Mod author: $mod_author"
```

**Detection logic:**
- If `git_user == mod_author` → **own** (your mod, full standardization)
- If `git_user != mod_author` → **fork** (contributing, minimal changes)
- If git remote unavailable → ask user

**Note:** Detection is case-insensitive. Falls back to asking user if detection fails.

### Check 3: Determine Mod Type from Manifest
If manifest exists, check dependencies:
- Contains `"malverk"` → **texture pack**
- Has `"provides"` field or many API functions → **framework**
- Otherwise → **standard mod**

### Detection Results

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

Based on repo type, create specific plan.

### For ALL Existing Repos (OWN or FORK)

These steps apply to ANY non-empty repository:

**Cleanup:**
- [ ] Delete `References/` folder if exists (legacy symlink approach)
- [ ] Move extra `.md` files to `docs/` - only keep in root:
  - `README.md`, `README_zh.md`, `CHANGELOG.md`, `CHANGELOG_zh.md`
  - `AGENT.md`, `INIT.md`, `LICENSE.md`
  - Move ALL other `.md` files to `docs/`

**Dev files (add if missing):**
- [ ] AGENT.md
- [ ] INIT.md
- [ ] mod.config.json
- [ ] scripts/sync_to_mods.sh
- [ ] .gitignore with agent folders

**Claude config (add if missing):**
- [ ] `.claude/commands/*` from skill templates
- [ ] `.claude/hooks/hooks.json`
- [ ] `.claude/agents/*`

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
- [ ] Check mod.config.json uses v2.0.0 schema (with `paths` object)
- [ ] Check scripts use Config Version 2.0.1 (zsh, reads from mod.config.json)
- [ ] scripts/create_release.sh exists
- [ ] List structural issues to fix

**Script Version Check:**
Look for `# Config Version: 2.0.1` in scripts. If missing or older, offer to update.

### Additional for FORK Repository

Minimal changes - respect their structure:
- [ ] AGENT.md should be lightweight (document existing structure, not prescribe)
- [ ] INIT.md uses fork-mode rules
- [ ] Do NOT add: create_release.sh, Logger.lua, localization/
- [ ] Do NOT modify: manifest, main code structure

---

### Claude Agent Config

Copy from skill templates to `.claude/`:

| Source | Destination |
|--------|-------------|
| `templates/claude-config/commands/*` | `.claude/commands/` |
| `templates/claude-config/hooks.json` | `.claude/hooks/hooks.json` |
| `templates/agents/*` | `.claude/agents/` |

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

Claude config:
- [New setup / Update needed / Already configured]

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
    "manifest.json",
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
INIT.md
mod.config.json
docs/knowledge-base.md
```

## Step 5: Verify/Update AGENT.md

**Purpose of AGENT.md:** Enable seamless handover between agents. Another agent should be able to:
- Understand mod structure, functions, and dependencies quickly
- Know current development status and pending tasks
- Continue work without losing context

**After init, if AGENT.md exists, verify it contains:**
- [ ] Accurate mod metadata (name, id, version, prefix)
- [ ] Current file structure (list actual files, not template placeholders)
- [ ] Key functions and their purposes
- [ ] Dependencies (SMODS version, other mods)
- [ ] Current development status (stable, in-progress features, known issues)
- [ ] Any pending tasks or TODOs

**If AGENT.md is outdated or incomplete:**
1. Read current codebase to understand actual structure
2. Update AGENT.md to reflect reality
3. Add "Last updated: {date}" at the bottom

## Step 6: Summary

Report what was created/modified:
```
=== Init Complete ===

Created:
- [file list]

Modified:
- [file list]

AGENT.md status:
- [Created new / Updated existing / Already up-to-date]

Next steps:
- Run `./scripts/sync_to_mods.sh` to sync to game
```
