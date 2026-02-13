---
description: Check if project config, scripts, hooks, commands, file placement, gitignore, and docs are up-to-date
allowed-tools: Read, Bash, Glob, Grep, Edit
---

# Update Check (Health Audit)

Audit this mod repo for outdated scripts, hooks, commands, rules, file/dir structure, gitignore, and incomplete mod.config.json.

**MANDATORY: You MUST execute every step below in order. Do NOT skip steps. Do NOT mark items as ✓ without actually checking them. Every step produces a pass/fail line in the final report.**

**Report findings first, then ask user which items to fix.**

---

## Step 0: Git Worktree Detection

```bash
git worktree list 2>/dev/null
```

Record worktree paths. **Exclude them from ALL subsequent file checks.** If `ls`, `find`, or `glob` returns results inside a worktree path, ignore those results.

---

## Step 1: Script Version Check

Read `scripts/sync_to_mods.sh` and `scripts/create_release.sh`:
- Look for `# Config Version:` line
- Current template version is **2.0.1**
- Flag if version is missing or older
- Check scripts read from `mod.config.json` (not hardcoded `BASE_FILES`)

**Report line:** `Scripts: [version found] — ✅ current / ⚠️ outdated / ❌ missing`

---

## Step 2: mod.config.json Validation

Read `mod.config.json` and check:

1. **Schema version:** `$version` should be `"2.0.0"` or `"2.1.0"`
2. **Paths object:** Verify `paths` object exists with `mods_dir`, `logs_dir`, `release_dir`
3. **Agent backends:** Verify `agent_backends` has `research`, `execution`, `reasoning` keys
4. **File coverage:** Scan actual mod files and compare against `include_files`:
   - Look for `*.lua`, `*.toml`, `*.json` (mod manifests), `localization/`, `assets/`, `Utils/`, `lovely/`
   - Flag files/folders that exist but aren't in `include_files`
5. **Thunderstore manifest:** Verify `manifest.json` is in `thunderstore_additions`
6. **No duplicates:** Check no files appear in both `include_files` and `thunderstore_additions`

**Report lines:**
```
mod.config.json schema: [version] — ✅ / ⚠️
mod.config.json paths: ✅ / ❌ missing [key]
mod.config.json backends: ✅ / ⚠️ missing reasoning
mod.config.json file coverage: ✅ / ⚠️ [N] files not in include_files
```

---

## Step 3: Commands, Hooks & Agents Check

### 3a. Commands — CHECK EVERY ONE

```bash
ls .claude/commands/ 2>/dev/null
```

**You MUST check each file individually. Count installed vs required. Flag EVERY missing command.**

| # | Command file | Required? | Installed? |
|---|-------------|-----------|------------|
| 1 | `familiar.md` | yes | ☐ |
| 2 | `init.md` | yes | ☐ |
| 3 | `sync-mod.md` | yes | ☐ |
| 4 | `bump-version.md` | yes | ☐ |
| 5 | `release.md` | yes | ☐ |
| 6 | `fix-sprites.md` | yes | ☐ |
| 7 | `refactor.md` | yes | ☐ |
| 8 | `debug.md` | yes | ☐ |
| 9 | `draft-pr.md` | yes | ☐ |
| 10 | `update.md` | yes | ☐ |
| 11 | `update-docs.md` | yes | ☐ |
| 12 | `update-skill.md` | yes | ☐ |
| 13 | `knowledge.md` | yes | ☐ |

Extra project-specific commands are fine — just note them.

**Report line:** `Commands: [N]/13 installed — ✅ all present / ❌ missing: [list]`

If commands are missing, offer to copy from skill templates:
```bash
cp ~/.claude/skills/balatro-mod-dev/templates/claude-config/commands/[name].md .claude/commands/
```

### 3b. Hooks

Read `.claude/hooks.json` (or `.claude/hooks/hooks.json`) and verify:

| # | Hook | Matcher | Installed? |
|---|------|---------|------------|
| 1 | `SessionStart` | `*` | ☐ |
| 2 | `PreToolUse` | `Write\|Edit\|Replace` | ☐ |
| 3 | `PreToolUse` | `Task` | ☐ |
| 4 | `PostToolUse` | `Write` | ☐ |
| 5 | `Stop` | `*` | ☐ |

**Report line:** `Hooks: [N]/5 configured — ✅ / ❌ missing: [list]`

### 3c. Hookify Rules

```bash
ls .claude/hookify.*.local.md 2>/dev/null
```

| # | Rule file | Installed? |
|---|-----------|------------|
| 1 | `hookify.no-opus-subagents.local.md` | ☐ |
| 2 | `hookify.subagent-routing.local.md` | ☐ |

**Report line:** `Hookify rules: [N]/2 — ✅ / ❌ missing: [list]`

### 3d. Agent Templates

```bash
ls .claude/agents/ 2>/dev/null
```

| # | Agent template | Required? | Installed? |
|---|---------------|-----------|------------|
| 1 | `game-source-researcher.md` | yes | ☐ |
| 2 | `smods-api-researcher.md` | yes | ☐ |
| 3 | `mod-pattern-researcher.md` | yes | ☐ |
| 4 | `lovely-patch-researcher.md` | yes | ☐ |
| 5 | `project-explorer.md` | yes | ☐ |
| 6 | `script-runner.md` | yes | ☐ |
| 7 | `strategic-planner.md` | yes | ☐ |
| 8 | `code-reviewer.md` | yes | ☐ |
| 9 | `research-analyst.md` | yes | ☐ |

**Report line:** `Agents: [N]/9 installed — ✅ / ❌ missing: [list]`

---

## Step 4: File & Directory Structure Check

### 4a. INIT.md and AGENT.md Placement

**CRITICAL CHECK — this is commonly wrong. Verify carefully.**

Both MUST be at the **project root** and **git-ignored**. They must NOT be in `docs/`.

```bash
# Check root placement
ls -la INIT.md AGENT.md 2>/dev/null
# Check for WRONG placement in docs/
ls -la docs/INIT.md docs/AGENT.md 2>/dev/null
```

**Evaluation logic:**
- `AGENT.md` at root → ✅
- `AGENT.md` in `docs/` only → ❌ MISPLACED — must move to root
- `AGENT.md` in BOTH root and `docs/` → ⚠️ duplicate — remove `docs/AGENT.md`
- `AGENT.md` nowhere → ❌ MISSING
- Same logic for `INIT.md`

**DO NOT mark `docs/AGENT.md` as ✓. It is ALWAYS wrong there.**

**Report lines:**
```
INIT.md: [root ✅ / docs/ ❌ MISPLACED / ❌ missing]
AGENT.md: [root ✅ / docs/ ❌ MISPLACED / ❌ missing]
```

### 4b. Root .md File Placement

Only these `.md` files belong in root:
`README.md`, `README_zh.md`, `CHANGELOG.md`, `CHANGELOG_zh.md`, `AGENT.md`, `INIT.md`, `LICENSE.md`

```bash
ls *.md 2>/dev/null
```

Flag ANY other `.md` file in root → should be moved to `docs/`.

**Report line:** `Root .md files: ✅ only allowed files / ⚠️ stray files: [list]`

### 4c. .gitignore Validation

Read `.gitignore` and check for **each** required entry:

| # | Entry | Present? |
|---|-------|----------|
| 1 | `INIT.md` | ☐ |
| 2 | `AGENT.md` | ☐ |
| 3 | `mod.config.json` | ☐ |
| 4 | `docs/` | ☐ |
| 5 | `.tmp/` | ☐ |
| 6 | `.claude/` | ☐ |
| 7 | `.codex/` | ☐ |
| 8 | `.agents/` | ☐ |
| 9 | `release/` | ☐ |

**Report line:** `Gitignore: [N]/9 entries — ✅ / ❌ missing: [list]`

### 4d. Directory Structure

Verify expected directories exist (for own/new repos):

| # | Directory | Expected? | Exists? |
|---|-----------|-----------|---------|
| 1 | `scripts/` | yes | ☐ |
| 2 | `localization/` | if mod has strings | ☐ |
| 3 | `docs/` | if mod has dev docs | ☐ |
| 4 | `.claude/commands/` | yes | ☐ |
| 5 | `.claude/hooks/` or `.claude/hooks.json` | yes | ☐ |
| 6 | `.claude/agents/` | yes | ☐ |

**Report line:** `Directories: ✅ / ⚠️ missing: [list]`

### 4e. Rules & Docs Content

1. **INIT.md content:** Read INIT.md and verify it contains Rules 1-10:
   - Rule 1: Protected Files
   - Rule 2: File Change Protocol
   - Rule 3: Script Reminders
   - Rule 4: Mobile Compatibility
   - Rule 5: Always Use Logging
   - Rule 6: Issue Documentation
   - Rule 7: Use Skill for Common Knowledge
   - Rule 8: PR Message Drafting
   - Rule 9: Sub-Agent Invocation (must mention shared context + run_subagent.sh)
   - Rule 10: Plan Before Big Changes (must mention `.tmp/[taskname]/`)

2. **AGENT.md content:** Read AGENT.md and verify it contains:
   - §1 Big Picture (mod description)
   - §2 Repository Structure (file tree — must match actual files)
   - §3 Core Behavior (functions, state, hooks)
   - §5 Constraints & Gotchas
   - §7 Development (scripts, testing)

**Report lines:**
```
INIT.md rules: [N]/10 present — ✅ / ⚠️ missing rules: [list]
AGENT.md sections: [N]/5 present — ✅ / ⚠️ missing: [list]
```

---

## Step 5: Logging Check (own repos only)

Skip this step for fork repos (where temp `pcall(print, ...)` is expected).

1. **Logger.lua exists?** Check for `Utils/Logger.lua`
   - If missing: flag as "Logger utility not installed"
   - If present: read it and check it matches the template pattern (has `M.create`, `M.log`, `should_log`)

2. **Scan for ad-hoc logging** in all `.lua` files:
   - `print(` — bare print calls (not inside Logger.lua itself)
   - `pcall(print,` — protected print calls used as permanent logging
   - Direct string concatenation with prefix patterns like `"[ModName]"` or `"[Debug]"`

3. **Check Logger adoption** — for each `.lua` file (excluding Logger.lua):
   - Does it `require("Utils.Logger")` or use a `Logger.create()` call?
   - If it has logging calls but doesn't use Logger → flag for migration

**Report lines:**
```
Logger.lua: [installed ✅ / missing ❌ / outdated ⚠️]
Ad-hoc logging: [N files with bare print/pcall — list them]
```

---

## Step 6: Generate Report

**You MUST include ALL sections below. Do NOT omit any section. Every check from Steps 1-5 must appear.**

```
=== Mod Health Check ===

Step 0: Worktrees
- [N worktrees found / none] — excluded from checks: [paths]

Step 1: Scripts
- sync_to_mods.sh: v[X] — ✅ / ⚠️ / ❌
- create_release.sh: v[X] — ✅ / ⚠️ / ❌
- run_subagent.sh: ✅ / ❌

Step 2: mod.config.json
- Schema: v[X] — ✅ / ⚠️
- Paths: ✅ / ❌
- Backends (research/execution/reasoning): ✅ / ⚠️
- File coverage: ✅ / ⚠️ [N] untracked files

Step 3: Commands, Hooks & Agents
- Commands: [N]/13 — ✅ / ❌ missing: [list each]
- Hooks: [N]/5 — ✅ / ❌ missing: [list each]
- Hookify rules: [N]/2 — ✅ / ❌ missing: [list each]
- Agents: [N]/9 — ✅ / ❌ missing: [list each]

Step 4: File & Directory Structure
- INIT.md placement: [root ✅ / docs/ ❌ MISPLACED / ❌ missing]
- AGENT.md placement: [root ✅ / docs/ ❌ MISPLACED / ❌ missing]
- Root .md files: ✅ / ⚠️ stray: [list]
- Gitignore: [N]/9 entries — ✅ / ❌ missing: [list each]
- Directories: ✅ / ⚠️ missing: [list]
- INIT.md rules: [N]/10 — ✅ / ⚠️ missing: [list]
- AGENT.md sections: [N]/5 — ✅ / ⚠️ missing: [list]

Step 5: Logging
- Logger.lua: ✅ / ❌
- Ad-hoc logging: [N] files — [list]

=== Summary ===
✅ Passed: [N] checks
⚠️ Warnings: [N] items
❌ Failed: [N] items

Would you like me to fix any of these? (list numbers or "all")
```

**Wait for user response before making any changes. Do NOT suggest destructive actions (rm -rf) — only offer to move, copy, or edit files.**
