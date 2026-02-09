---
description: Check if project config, scripts, hooks, commands, and docs are up-to-date
allowed-tools: Read, Bash, Glob, Grep
---

# Update Check (Health Audit)

Audit this mod repo for outdated scripts, hooks, commands, rules, and incomplete mod.config.json.
**Report findings first, then ask user which items to fix.**

## Step 1: Script Version Check

Read `scripts/sync_to_mods.sh` and `scripts/create_release.sh`:
- Look for `# Config Version:` line
- Current template version is **2.0.1**
- Flag if version is missing or older
- Check scripts read from `mod.config.json` (not hardcoded `BASE_FILES`)

## Step 2: mod.config.json Validation

Read `mod.config.json` and check:

1. **Schema version:** `$version` should be `"2.0.0"` or `"2.1.0"`
2. **Paths object:** Verify `paths` object exists with `mods_dir`, `logs_dir`, `release_dir`
3. **File coverage:** Scan actual mod files and compare against `include_files`:
   - Look for `*.lua`, `*.toml`, `*.json` (mod manifests), `localization/`, `assets/`, `Utils/`, `lovely/`
   - Flag files/folders that exist but aren't in `include_files`
4. **Thunderstore manifest:** Verify `manifest.json` is in `thunderstore_additions`
5. **No duplicates:** Check no files appear in both `include_files` and `thunderstore_additions`

## Step 3: Hooks & Commands Check

Compare project config against skill templates:

1. **Commands:** List files in `.claude/commands/` and compare against skill `templates/claude-config/commands/`
   - Flag missing commands
   - Note any extra project-specific commands (these are fine)
2. **Hooks:** Read `.claude/hooks/hooks.json` and verify these hooks exist:
   - `SessionStart` (matcher: `*`)
   - `PreToolUse` (matcher: `Write|Edit|Replace`) — protected file check
   - `PreToolUse` (matcher: `Task`) — sub-agent bypass prevention
   - `PostToolUse` (matcher: `Write`) — new file suggestion
   - `Stop` (matcher: `*`) — completion check
   - Flag any missing hooks

## Step 4: Rules & Docs Check

1. **INIT.md:** Verify exists and contains all critical rules (Rules 1-10)
   - Specifically check for Rule 9 (Sub-Agent Invocation)
   - Specifically check for Rule 10 (Plan Before Big Changes)
2. **AGENT.md:** Verify exists and contains:
   - Mod metadata (name, id, version, prefix)
   - File structure section
   - Development status section
3. **File placement:** Check no stray `.md` files in root besides:
   - `README.md`, `README_zh.md`, `CHANGELOG.md`, `CHANGELOG_zh.md`
   - `AGENT.md`, `INIT.md`, `LICENSE.md`

## Step 5: Logging Check (own repos only)

Skip this step for fork repos (where temp `pcall(print, ...)` is expected).

1. **Logger.lua exists?** Check for `Utils/Logger.lua`
   - If missing: flag as "Logger utility not installed"
   - If present: read it and check it matches the template pattern (has `M.create`, `M.log`, `should_log`)

2. **Scan for ad-hoc logging** in all `.lua` files:
   - `print(` — bare print calls (not inside Logger.lua itself)
   - `pcall(print,` — protected print calls used as permanent logging (not temp debug)
   - Direct string concatenation with prefix patterns like `"[ModName]"` or `"[Debug]"`
   - Custom debug functions that duplicate Logger behavior

3. **Check Logger adoption** — for each `.lua` file (excluding Logger.lua):
   - Does it `require("Utils.Logger")` or use a `Logger.create()` call?
   - If it has logging calls but doesn't use Logger → flag for migration

4. **Report per-file:**
   ```
   Logging audit:
   - Utils/Logger.lua: [installed / missing / outdated]
   - main.lua: Uses Logger ✅
   - Core/SaveManager.lua: 3x bare print(), no Logger require → migrate
   - UI/Menu.lua: 2x pcall(print, "[Debug]...") → migrate to Logger.create("Menu")
   ```

5. **Migration guidance** (when user opts to fix):
   - Add `local Logger = require("Utils.Logger")` at top
   - Add `local log = Logger.create("ModuleName")` after require
   - Replace `print("[Prefix] msg")` → `log("info", "msg")`
   - Replace `pcall(print, "[Debug] msg")` → `log("debug", "msg")`
   - Replace error-level prints → `log("error", "msg")`
   - Preserve the semantic level: error prints → `"error"`, debug prints → `"debug"`, general → `"info"`

## Step 6: Generate Report

Present findings grouped by status:

```
=== Mod Health Check ===

✅ Up-to-date:
- [items that passed]

⚠️ Needs attention:
- [items that need updating, with details]

❌ Missing:
- [items that are missing entirely]

Would you like me to fix any of these? (list numbers or "all")
```

Wait for user response before making any changes.
