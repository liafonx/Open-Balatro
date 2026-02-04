---
description: Start sync with watch mode (run once at session start)
allowed-tools: Bash, Read
---

# Sync Mod to Game (Watch Mode)

Start the sync script in watch mode to automatically sync changes to the game's Mods folder.

## Usage

Run this once at the start of a development session. The script will watch for file changes and sync automatically.

## Steps

1. Check if `scripts/sync_to_mods.sh` exists
2. Run `./scripts/sync_to_mods.sh --watch` in background
3. Report that watch mode is active

If the script doesn't exist, suggest running /init-balatro-mod first.

## Note

With watch mode running, you don't need to manually sync after each change. The script monitors for file changes and syncs automatically.
