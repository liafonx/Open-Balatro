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
- [ ] Check if manifest follows SMODS conventions
- [ ] Check if AGENT.md exists and is complete
- [ ] Check if INIT.md exists with correct rules
- [ ] Check if mod.config.json has correct file lists
- [ ] Check if scripts/ folder exists and is executable
- [ ] Check if .gitignore includes agent folders
- [ ] List any structural issues to fix

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

**mod.config.json**:
```json
{
  "mod_name": "{detected or asked}",
  "mod_json": "{ModID}.json",
  "include_files": [auto-detect from existing files],
  "exclude_from_release": ["References/", "scripts/", "docs/", ".git/", ".gitignore", "AGENT.md", "INIT.md"]
}
```

**scripts/** (always create if missing):
- Copy from templates, make executable

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

Next steps:
- Run `./scripts/sync_to_mods.sh` to sync to game
- Review AGENT.md and update with mod-specific details
```
