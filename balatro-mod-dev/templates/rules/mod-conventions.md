# Balatro Mod Conventions

## File Placement
- Root only: README*.md, CHANGELOG*.md, AGENT.md, INIT.md, LICENSE
- Everything else: appropriate subdirectory (docs/, Utils/, localization/, assets/)

## SMODS Registration
- Always include `key`, `loc_txt`, `atlas` for visual objects
- Use mod prefix for all keys: `{prefix}_{name}`
- Register in main.lua or dedicated registration module

## Localization
- All user-visible strings MUST have localization keys
- Minimum: en-us.lua (required), zh_CN.lua (recommended)
- Never hardcode English strings in logic files

## Mobile Compatibility
- Touch vs click: check platform before input handling
- Resolution: test at multiple aspect ratios
- See the plugin's `patterns/mobile-compat.md` for details

## Protected Files
- AGENT.md, INIT.md, mod.config.json: confirm before modifying
- README*.md, CHANGELOG*.md: update via /balatro-mod-dev:update-docs, not directly
