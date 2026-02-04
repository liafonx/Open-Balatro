# Mod Utility Scripts Guide

This guide documents the utility scripts used across Balatro mods.

## Overview

Each Balatro mod should have these scripts in its `scripts/` folder:

| Script | Purpose | Usage |
|--------|---------|-------|
| `sync_to_mods.sh` | Sync mod files to game's Mods folder | `./scripts/sync_to_mods.sh [--watch]` |
| `create_release.sh` | Create release packages for distribution | `./scripts/create_release.sh [version]` |
| `filter_logs.sh` | Filter Lovely logs for debugging | `./scripts/filter_logs.sh [pattern]` |

## Configuration: mod.config.json

Scripts read configuration from `mod.config.json` at the mod root:

```json
{
  "mod_name": "SaveRewinder",
  "mod_json": "SaveRewinder.json",
  "include_files": [
    "main.lua",
    "config.lua",
    "lovely.toml",
    "SaveRewinder.json",
    "Core/***",
    "UI/***",
    "Utils/***",
    "localization/***",
    "assets/***"
  ],
  "thunderstore_additions": [
    "README.md",
    "CHANGELOG.md",
    "icon.png",
    "manifest.json"
  ],
  "exclude_from_release": [
    "References/",
    "scripts/",
    "docs/"
  ]
}
```

### Key Fields

| Field | Purpose | Example |
|-------|---------|---------|
| `mod_name` | Display name (used for folder name) | `"SaveRewinder"` |
| `mod_json` | Mod manifest filename | `"SaveRewinder.json"` |
| `include_files` | Files/folders to sync and release | `["main.lua", "Core/***"]` |
| `thunderstore_additions` | Extra files for Thunderstore only | `["README.md", "icon.png"]` |
| `exclude_from_release` | Files to never include in release | `["scripts/", "docs/"]` |
| `test_saves` | Directory with test .jkr files (optional) | `"jkrs/"` |

### Glob Patterns

- `***` = Include directory and all contents recursively
- `*` = Match any files in current level only
- Exact filenames = Match specific file

---

## sync_to_mods.sh

Syncs mod files to the game's Mods directory.

### Usage

```bash
# One-time sync
./scripts/sync_to_mods.sh

# Watch mode (auto-sync on file changes)
./scripts/sync_to_mods.sh --watch

# Custom Mods path
./scripts/sync_to_mods.sh /custom/path/to/Mods
```

### Behavior

1. Reads `mod_name` and `include_files` from `mod.config.json`
2. Creates target directory if needed
3. Uses rsync to copy only specified files
4. In watch mode, uses fswatch to auto-sync on changes

### Requirements

- `rsync` (included with macOS)
- `fswatch` (for watch mode, install via `brew install fswatch`)
- `jq` (for JSON parsing, install via `brew install jq`)

---

## create_release.sh

Creates release packages for GitHub and Thunderstore.

### Usage

```bash
# Use version from mod.json
./scripts/create_release.sh

# Override version
./scripts/create_release.sh 1.4.7
```

### Output

Creates files in `release/` directory:

```
release/
├── SaveRewinder-1.4.7.zip           # GitHub release
└── SaveRewinder-1.4.7-thunderstore.zip  # Thunderstore package
```

### Behavior

1. Reads config from `mod.config.json`
2. Gets version from mod manifest (or command line)
3. Creates clean temp directory
4. Copies `include_files` to temp
5. Creates GitHub zip (mod files only)
6. Adds `thunderstore_additions` for Thunderstore zip
7. Cleans up temp directory

---

## filter_logs.sh

Filters Lovely logs for debugging.

### Usage

```bash
# Filter for mod name
./scripts/filter_logs.sh SaveRewinder

# Filter for error level
./scripts/filter_logs.sh "ERROR\|WARN"

# Follow log in real-time
./scripts/filter_logs.sh -f SaveRewinder
```

### Log Locations

- Lovely logs: `~/Library/Application Support/Balatro/Mods/lovely/log/`
- Log files: `lovely.log`, `lovely.log.1`, etc.

---

## When Agent Should Suggest Scripts

### After Creating Source Files

When agent creates a new `.lua`, `.toml`, or asset file:

1. Check if it's a mod source file
2. If mod has `mod.config.json`, suggest adding to `include_files`
3. Remind: "Run `./scripts/sync_to_mods.sh` to sync changes"

### After Deleting Source Files

When agent deletes a file:

1. Check if file was in `include_files`
2. If yes, suggest removing from config
3. Remind about syncing

### Before Release

When user mentions release, version, or distribution:

1. Suggest running `./scripts/create_release.sh [version]`
2. Remind to update version in manifest and CHANGELOG

### During Debugging

When troubleshooting issues:

1. Suggest checking Lovely logs: `./scripts/filter_logs.sh ModName`
2. If test saves exist: mention `jkrs/` folder

---

## Setting Up Scripts for a New Mod

1. Copy templates from skill folder:
   ```bash
   cp /path/to/skill/scripts/sync_to_mods.template.sh ./scripts/sync_to_mods.sh
   cp /path/to/skill/scripts/create_release.template.sh ./scripts/create_release.sh
   chmod +x ./scripts/*.sh
   ```

2. Create `mod.config.json` from template

3. Test sync:
   ```bash
   ./scripts/sync_to_mods.sh
   ```

4. Verify files appear in:
   `~/Library/Application Support/Balatro/Mods/YourModName/`

---

## Troubleshooting

### "jq: command not found"

Install jq: `brew install jq`

### "fswatch: command not found"

Install fswatch: `brew install fswatch`

### Files not syncing

1. Check `include_files` in `mod.config.json`
2. Verify paths are relative to mod root
3. Check target directory exists and is writable

### Wrong files in release

1. Check `exclude_from_release` in `mod.config.json`
2. Verify Thunderstore additions are correct
