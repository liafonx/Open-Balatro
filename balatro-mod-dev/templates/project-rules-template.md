# {ModName} - Project Rules (INIT.md)

## Quick Reference

- **Mod Name:** {ModName}
- **Repo Type:** `new` / `fork`
- **Rules:** See `.claude/rules/` for Lua coding style, mod conventions, and delegation

---

## Repo Type Rules

### If `new` (own repo):
- Full ownership — use dedicated Logger, localization (en-us + zh_CN)
- Logging: `Utils/Logger.lua` with module-specific loggers

### If `fork` (contributing to others' repo):
- Minimal changes — follow existing patterns
- Logging: temp `pcall(print, "[Debug] ...")` only, remove before PR
- Don't add new documentation files

---

## Critical Rules

### Rule 1: Protected Files

**NEVER modify without explicit user confirmation:**
- `AGENT.md`, `INIT.md`, `mod.config.json`
- `README.md`, `README_zh.md`, `CHANGELOG.md`, `CHANGELOG_zh.md`
- `docs/*`, `{ModName}.json`, `manifest.json`

If changes are needed, **STOP and ask:**
> "I'd like to update `{file}` to {reason}. Do you want me to proceed?"

### Rule 2: File Change Protocol

**After creating a source file (.lua, .toml, directory):**
1. Check if mod has `mod.config.json`
2. Ask: "Should I add `{file}` to `include_files` for sync/release?"

**After deleting a source file:**
1. Check if file was in `mod.config.json` → `include_files`
2. Ask: "Should I remove `{file}` from `include_files`?"

### Rule 3: Script Reminders

- Assume `./scripts/sync_to_mods.sh --watch` is running. No need to remind about syncing.
- Before release: "Use `./scripts/create_release.sh [version]` to create packages."

### Rule 4: Mobile Compatibility

When modifying UI code (UIBox, draw functions, input handling):
1. Check `patterns/mobile-compat.md` in the plugin
2. Verify both desktop and mobile patterns for click/hover
3. Consider `lang` parameter for text nodes

### Rule 5: Always Use Logging

**Own repos:** Use `Utils/Logger.lua` — `local log = Logger.create("ModuleName")` — levels: `error`, `warning`, `info`, `debug`

**Forks:** Use temp `pcall(print, "[Debug] checkpoint: " .. tostring(var))` — remove before committing

### Rule 6: Issue Documentation

**When fixing an issue fails 3+ times:**
1. Document in `docs/knowledge-base.md`
2. Include: symptoms, attempts, root cause analysis
3. Update when resolved with lessons learned

### Rule 7: Plan Before Big Refactors

**What counts as "big" (requires plan mode):**
- Renaming or moving 3+ files
- Changing module boundaries or require chains
- Adding/removing a system (logging, config, UI framework)

Small changes (typo fix, single-file edits) — just do them directly.

---

## Mod-Specific Constraints

- [3-5 bullets: gotchas, things to avoid, key behaviors specific to this mod]