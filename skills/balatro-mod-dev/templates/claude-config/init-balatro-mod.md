---
description: Initialize Balatro mod development for current repo
allowed-tools: Read, Write, Edit, Bash
argument-hint: [mod-type: standard|texture|framework]
---

# Initialize Balatro Mod Development

You are setting up a Balatro mod development environment in the current repository.

## Step 1: Determine Mod Type

Ask the user if not provided via argument:
- **standard** - Regular mod (gameplay, UI, mechanics)
- **texture** - Texture pack (uses Malverk)
- **framework** - Framework/library mod (provides API for other mods)

The mod type is: $ARGUMENTS (if empty, ask the user)

## Step 2: Gather Information

Ask the user for:
1. **Mod Name** (display name, e.g., "Save Rewinder")
2. **Mod ID** (internal id, e.g., "SaveRewinder" - no spaces)
3. **Prefix** (short prefix for SMODS, e.g., "sr" or "owcf")
4. **Brief description** (one sentence)
5. **Dependencies** (default: "Steamodded>=1.0.0~BETA-1221a", or add "malverk" for texture packs)

## Step 3: Create Base Files

Based on the mod type, create the following files:

### For All Mod Types:

1. **AGENT.md** - Use the appropriate template from the balatro-mod-dev skill:
   - Standard/Framework: `agent-md-template.md`
   - Texture Pack: `agent-texture-pack-template.md`
   Fill in the mod-specific details.

2. **INIT.md** - Copy from `project-rules-template.md` and customize with:
   - Mod name and location
   - Protected files list
   - Script reminders

3. **.gitignore** - Copy from `gitignore-template`

4. **mod.config.json** - Create from template with:
   ```json
   {
     "mod_name": "{ModID}",
     "mod_json": "{ModID}.json",
     "include_files": ["main.lua", "config.lua", "lovely.toml", "{ModID}.json", "localization/***", "assets/***"],
     "thunderstore_additions": ["README.md", "CHANGELOG.md", "icon.png", "manifest.json"],
     "exclude_from_release": ["References/", "scripts/", "docs/", ".git/", ".gitignore", "AGENT.md"]
   }
   ```

5. **scripts/** folder with:
   - `sync_to_mods.sh` - Copy from `sync_to_mods.template.sh`
   - `create_release.sh` - Copy from `create_release.template.sh`
   Make scripts executable.

6. **AI Agent Config** (optional):
   - **Claude**: Create `.claude/hooks/hooks.json` from `templates/claude-config/hooks.json`
   - **Codex**: Optionally create `AGENTS.md` that references INIT.md and AGENT.md

> **Note:** Both Claude and Codex use the same file structure: `INIT.md` for rules, `AGENT.md` for repo docs.

### For Standard Mods (if files don't exist):

7. **{ModID}.json** - SMODS manifest:
   ```json
   {
     "id": "{ModID}",
     "name": "{ModName}",
     "version": "0.1.0",
     "description": ["{Description}"],
     "prefix": "{Prefix}",
     "author": ["Your Name"],
     "main_file": "main.lua",
     "dependencies": ["{Dependencies}"]
   }
   ```

8. **main.lua** - Basic entry point:
   ```lua
   {MOD_GLOBAL} = {}
   {MOD_GLOBAL}.mod = SMODS.current_mod
   {MOD_GLOBAL}.config = SMODS.current_mod.config
   ```

9. **localization/en-us.lua** - Basic localization structure

### For Texture Packs (if files don't exist):

7. **{mod_id}.json** - Manifest with malverk dependency
8. **{mod_id}.lua** - AltTexture/TexturePack definitions
9. **assets/1x/** and **assets/2x/** folders
10. **localization/en-us.lua** with Malverk UI keys

## Step 4: Confirm Setup

List all created files and remind the user:
- Run `./scripts/sync_to_mods.sh` to sync to game
- The balatro-mod-dev skill provides shared patterns and references
