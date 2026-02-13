---
description: Check if project config, scripts, hooks, commands, file placement, gitignore, and docs are up-to-date
allowed-tools: Read, Bash, Glob, Grep, Edit
---

# Update Check (Health Audit)

Audit this mod repo for outdated scripts, hooks, commands, rules, file/dir structure, gitignore, and incomplete mod.config.json.
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

## Step 3: Commands, Hooks & Agents Check

### 3a. Commands

List files in `.claude/commands/` and verify **every** skill command is installed:

```bash
ls .claude/commands/ 2>/dev/null
```

**Required commands** (from skill `templates/claude-config/commands/`):

| Command file | Installed? |
|-------------|------------|
| `familiar.md` | ☐ |
| `init.md` | ☐ |
| `sync-mod.md` | ☐ |
| `bump-version.md` | ☐ |
| `release.md` | ☐ |
| `fix-sprites.md` | ☐ |
| `refactor.md` | ☐ |
| `debug.md` | ☐ |
| `draft-pr.md` | ☐ |
| `update.md` | ☐ |
| `update-docs.md` | ☐ |
| `update-skill.md` | ☐ |
| `knowledge.md` | ☐ |

Flag any missing. Extra project-specific commands are fine — just note them.

**If commands are missing**, offer to copy from skill templates:
```bash
# Example: copy missing command
cp ~/.claude/skills/balatro-mod-dev/templates/claude-config/commands/knowledge.md .claude/commands/
```

### 3b. Hooks

Read `.claude/hooks/hooks.json` and verify these hooks exist:
- `SessionStart` (matcher: `*`)
- `PreToolUse` (matcher: `Write|Edit|Replace`) — protected file check
- `PreToolUse` (matcher: `Task`) — sub-agent bypass prevention
- `PostToolUse` (matcher: `Write`) — new file suggestion
- `Stop` (matcher: `*`) — completion check

Flag any missing hooks.

### 3c. Hookify Rules

Check hookify rules are installed:

```bash
ls .claude/hookify.*.local.md 2>/dev/null
```

| Rule file | Installed? |
|-----------|------------|
| `hookify.no-opus-subagents.local.md` | ☐ |
| `hookify.subagent-routing.local.md` | ☐ |

### 3d. Agent Templates

Check agent templates are installed:

```bash
ls .claude/agents/ 2>/dev/null
```

**Required agents** (from skill `templates/agents/`):

| Agent template | Installed? |
|---------------|------------|
| `game-source-researcher.md` | ☐ |
| `smods-api-researcher.md` | ☐ |
| `mod-pattern-researcher.md` | ☐ |
| `lovely-patch-researcher.md` | ☐ |
| `project-explorer.md` | ☐ |
| `script-runner.md` | ☐ |
| `strategic-planner.md` | ☐ |
| `code-reviewer.md` | ☐ |
| `research-analyst.md` | ☐ |

Flag any missing. If agents are missing, offer to copy from skill templates.

## Step 4: File & Directory Structure Check

### 4a. Git Worktree Detection

Check for git worktrees first — they must be excluded from all file/directory checks below.

```bash
git worktree list 2>/dev/null
```

- Note any worktree directories so they are **skipped** in subsequent checks
- Worktrees are separate branch checkouts — not part of the current project state
- If file searches below return results from a worktree path, ignore them

### 4b. INIT.md and AGENT.md Placement

Both must be at the **project root** and **git-ignored**:

```bash
# Verify placement
ls -la INIT.md AGENT.md 2>/dev/null
# Verify NOT in docs/
ls -la docs/INIT.md docs/AGENT.md 2>/dev/null
```

- [ ] `INIT.md` exists at root (not in `docs/`)
- [ ] `AGENT.md` exists at root (not in `docs/`)
- [ ] If `docs/AGENT.md` or `docs/INIT.md` exists → flag as misplaced, offer to move to root

### 4c. Root .md File Placement

Only these `.md` files belong in root:
- `README.md`, `README_zh.md`, `CHANGELOG.md`, `CHANGELOG_zh.md`
- `AGENT.md`, `INIT.md`, `LICENSE.md`

```bash
# Find stray .md files in root
ls *.md 2>/dev/null
```

Flag any other `.md` files in root → should be in `docs/`.

### 4d. .gitignore Validation

Read `.gitignore` and verify these entries exist:

| Entry | Section | Purpose |
|-------|---------|---------|
| `INIT.md` | AI Agent Files | Dev-only, not shipped |
| `AGENT.md` | AI Agent Files | Dev-only, not shipped |
| `mod.config.json` | AI Agent Files | Dev-only config |
| `docs/` | AI Agent Files | Dev-only docs (knowledge-base, etc.) |
| `.tmp/` | Temporary Files | Sub-agent task artifacts |
| `.claude/` | Development Tools | Claude config |
| `.codex/` | Development Tools | Codex config |
| `.agents/` | Development Tools | Agent config |
| `release/` | Build/Release | Build output |

Flag any missing entries.

### 4e. Directory Structure

Verify expected directories exist (for own/new repos):

- [ ] `scripts/` — utility scripts (sync, release, run_subagent)
- [ ] `localization/` — if mod has user-facing strings
- [ ] `docs/` — if mod has knowledge-base or dev docs
- [ ] `.claude/commands/` — Claude commands
- [ ] `.claude/hooks/` — Claude hooks

### 4f. Rules & Docs Content

1. **INIT.md:** Verify contains all critical rules (Rules 1-10)
   - Specifically check for Rule 9 (Sub-Agent Invocation) — includes shared context protocol
   - Specifically check for Rule 10 (Plan Before Big Changes) — uses `.tmp/[taskname]/`
2. **AGENT.md:** Verify contains:
   - Mod metadata (name, id, version, prefix)
   - File structure section (matches actual repo)
   - Development status section

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
