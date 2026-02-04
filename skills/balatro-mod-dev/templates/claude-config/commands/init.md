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
- [ ] localization/en-us.lua
- [ ] **Claude config** (see below)

### For OWN Existing Repository
Evaluate and fix structure:
- [ ] Delete `References/` folder if exists (legacy symlink approach - no longer needed)
- [ ] **Move extra docs to `docs/`** - only keep these `.md`/`.txt` in root:
  - `README.md`, `README_zh.md`
  - `CHANGELOG.md`, `CHANGELOG_zh.md`
  - `AGENT.md`, `INIT.md`
  - `LICENSE`, `LICENSE.md`
  - Move ALL other `.md`/`.txt` files to `docs/`
- [ ] Check if manifest follows SMODS conventions
- [ ] Check if AGENT.md exists and is complete
- [ ] Check if INIT.md exists with correct rules
- [ ] **Check Claude config** (see below)
- [ ] Check if mod.config.json has `$version` field and uses v2.0.0 schema (with `paths` object)
- [ ] Check if scripts use Config Version 2.0.1 (zsh for macOS compat, reads from mod.config.json)
- [ ] Check if scripts/ folder exists and is executable
- [ ] Check if .gitignore includes agent folders
- [ ] List any structural issues to fix

**Script Version Check:**
Look for `# Config Version: 2.0.1` in scripts. If missing or older:
- Offer to update scripts to latest version from skill templates
- Keep any custom modifications (ask user)
- Note: Scripts now use `#!/bin/zsh` for macOS compatibility

### For FORK (Others' Repository)
Minimal additions only:
- [ ] AGENT.md (if missing - lightweight version documenting current structure)
- [ ] INIT.md (lightweight, fork-mode rules)
- [ ] mod.config.json (for local sync only)
- [ ] scripts/sync_to_mods.sh (local development)
- [ ] .gitignore additions (append agent folders if missing)
- Do NOT modify: manifest, main code structure

### Claude Agent Config (if running under Claude)

When init is called from Claude agent, set up Claude-specific config:

**Required files:**
```
.claude/
├── commands/           # Slash commands
│   ├── sync-mod.md
│   ├── bump-version.md
│   ├── release.md
│   ├── refactor.md
│   ├── debug.md
│   ├── draft-pr.md
│   ├── update-docs.md
│   └── update-skill.md
├── hooks/
│   └── hooks.json      # SessionStart, PreToolUse, PostToolUse
└── agents/             # Sub-agents for research
    ├── game-source-researcher.md
    ├── smods-api-researcher.md
    ├── mod-pattern-researcher.md
    └── lovely-patch-researcher.md
```

**Copy from skill templates:**
- Commands: `templates/claude-config/commands/*` → `.claude/commands/`
- Hooks: `templates/claude-config/hooks.json` → `.claude/hooks/hooks.json`
- Agents: `templates/agents/*` → `.claude/agents/`

**For existing repos, verify:**
- [ ] `.claude/commands/` exists with all commands
- [ ] `.claude/hooks/hooks.json` exists and has correct events
- [ ] `.claude/agents/` exists with research agents
- [ ] Commands are up-to-date (compare with skill templates)

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
