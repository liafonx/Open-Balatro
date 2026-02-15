---
description: Check if project config, scripts, hooks, commands, file placement, gitignore, and docs are up-to-date
allowed-tools: Read, Bash, Glob, Grep, Edit
skill-version: 1.4.0
---

# Update Check (Health Audit)

Audit this mod repo for outdated scripts, hooks, commands, rules, file/dir structure, gitignore, and incomplete mod.config.json.

**MANDATORY: You MUST execute every step below in order. Do NOT skip steps. Do NOT mark items as ✓ without actually checking them. Every step produces a pass/fail line in the final report.**

**Report findings first, then ask user which items to fix.**

---

## Pre-flight: Self-Update Commands & Agents

**Before auditing anything else, ensure all deployed skill files are current.**

The skill templates live at: `~/.claude/skills/balatro-mod-dev/`
All deployable files have a `skill-version:` field in their YAML frontmatter (or `"skill_version"` in JSON).

### 0. Get current skill version

```bash
# Extract version from SKILL.md
grep '^version:' ~/.claude/skills/balatro-mod-dev/SKILL.md | head -1 | sed 's/version: *//'
```

This is the **expected version**. All deployed files should match.

### 1. Check deployed file versions

For each deployed file, extract its `skill-version:` and compare against the expected version.

```bash
SKILL_VER=$(grep '^version:' ~/.claude/skills/balatro-mod-dev/SKILL.md | head -1 | sed 's/version: *//')
echo "Skill version: $SKILL_VER"

echo "--- Commands ---"
for cmd in familiar init sync-mod bump-version release fix-sprites refactor debug draft-pr update update-docs update-skill knowledge; do
  f=".claude/commands/${cmd}.md"
  if [ ! -f "$f" ]; then
    echo "MISSING: ${cmd}.md"
  else
    v=$(grep '^skill-version:' "$f" | head -1 | sed 's/skill-version: *//')
    if [ -z "$v" ]; then
      echo "NO-VERSION: ${cmd}.md (pre-versioning file)"
    elif [ "$v" != "$SKILL_VER" ]; then
      echo "OUTDATED: ${cmd}.md (deployed: $v, current: $SKILL_VER)"
    fi
  fi
done

echo "--- Agents ---"
for agent in game-source-researcher smods-api-researcher mod-pattern-researcher lovely-patch-researcher project-explorer script-runner code-writer; do
  f=".claude/agents/${agent}.md"
  if [ ! -f "$f" ]; then
    echo "MISSING: ${agent}.md"
  else
    v=$(grep '^skill-version:' "$f" | head -1 | sed 's/skill-version: *//')
    if [ -z "$v" ]; then
      echo "NO-VERSION: ${agent}.md (pre-versioning file)"
    elif [ "$v" != "$SKILL_VER" ]; then
      echo "OUTDATED: ${agent}.md (deployed: $v, current: $SKILL_VER)"
    fi
  fi
done

echo "--- Hookify Rules ---"
for rule in hookify.no-opus-subagents.local.md hookify.no-codeagent.local.md; do
  f=".claude/${rule}"
  if [ ! -f "$f" ]; then
    echo "MISSING: ${rule}"
  else
    v=$(grep '^skill-version:' "$f" | head -1 | sed 's/skill-version: *//')
    if [ -z "$v" ]; then
      echo "NO-VERSION: ${rule} (pre-versioning file)"
    elif [ "$v" != "$SKILL_VER" ]; then
      echo "OUTDATED: ${rule} (deployed: $v, current: $SKILL_VER)"
    fi
  fi
done

echo "--- hooks.json ---"
for hf in .claude/hooks.json .claude/hooks/hooks.json; do
  if [ -f "$hf" ]; then
    v=$(grep '"skill_version"' "$hf" | head -1 | sed 's/.*: *"\(.*\)".*/\1/')
    if [ -z "$v" ]; then
      echo "NO-VERSION: $hf (pre-versioning file)"
    elif [ "$v" != "$SKILL_VER" ]; then
      echo "OUTDATED: $hf (deployed: $v, current: $SKILL_VER)"
    fi
    break
  fi
done
```

### 2. Remove obsolete files

Files from previous skill versions that must be deleted:

```bash
# Obsolete agents (replaced by main agent direct handling in v1.4.0)
for obsolete in strategic-planner code-reviewer research-analyst; do
  if [ -f ".claude/agents/${obsolete}.md" ]; then
    echo "DELETE: .claude/agents/${obsolete}.md (main agent handles this directly since v1.4.0)"
  fi
done

# Obsolete hookify rules (replaced in v1.4.0)
if [ -f ".claude/hookify.subagent-routing.local.md" ]; then
  echo "DELETE: .claude/hookify.subagent-routing.local.md (replaced by hookify.no-codeagent.local.md)"
fi

# Obsolete scripts (codeagent routing removed in v1.4.0)
if [ -f "scripts/run_subagent.sh" ]; then
  echo "DELETE: scripts/run_subagent.sh (codeagent routing deprecated in v1.4.0)"
fi
```

### 3. Check for legacy config migration

```bash
# Check if mod.config.json still has agent_backends (removed in v1.4.0)
if [ -f "mod.config.json" ]; then
  if grep -q '"agent_backends"' mod.config.json 2>/dev/null; then
    echo "MIGRATE: mod.config.json still has agent_backends section (removed in v1.4.0 — main agent selects models directly)"
  fi
fi

# Check if INIT.md references run_subagent.sh (should reference Task tool instead)
if [ -f "INIT.md" ]; then
  if grep -q 'run_subagent' INIT.md 2>/dev/null; then
    echo "MIGRATE: INIT.md still references run_subagent.sh (should use Task tool since v1.4.0)"
  fi
fi
```

### 4. Apply updates

**If ANY files are missing, outdated, no-version, or obsolete:**

1. **Delete** all obsolete files found in step 2
2. **Copy** all missing/outdated/no-version files from skill templates
3. **Migrate** legacy config if needed (remove agent_backends from mod.config.json)
4. Report what was changed

```bash
# Delete obsolete
rm -f .claude/agents/strategic-planner.md .claude/agents/code-reviewer.md .claude/agents/research-analyst.md
rm -f .claude/hookify.subagent-routing.local.md
rm -f scripts/run_subagent.sh

# Copy current templates
mkdir -p .claude/commands .claude/agents
cp ~/.claude/skills/balatro-mod-dev/templates/claude-config/commands/*.md .claude/commands/
cp ~/.claude/skills/balatro-mod-dev/templates/agents/*.md .claude/agents/
cp ~/.claude/skills/balatro-mod-dev/templates/claude-config/hookify.*.local.md .claude/
cp ~/.claude/skills/balatro-mod-dev/templates/claude-config/hooks.json .claude/hooks.json
```

**If update.md itself was outdated/no-version:** Inform the user: "The /update command was outdated and has been refreshed. This run continues with the previous version's instructions — re-run `/update` for the most accurate audit."

**If everything is current:** Proceed to Step 0.

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
3. **Source paths:** Verify `source_paths` object exists (used by main agent to construct Task prompts for researchers)
4. **File coverage:** Scan actual mod files and compare against `include_files`:
   - Look for `*.lua`, `*.toml`, `*.json` (mod manifests), `localization/`, `assets/`, `Utils/`, `lovely/`
   - Flag files/folders that exist but aren't in `include_files`
5. **Thunderstore manifest:** Verify `manifest.json` is in `thunderstore_additions`
6. **No duplicates:** Check no files appear in both `include_files` and `thunderstore_additions`

**Report lines:**
```
mod.config.json schema: [version] — ✅ / ⚠️
mod.config.json paths: ✅ / ❌ missing [key]
mod.config.json source_paths: ✅ / ⚠️ missing
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
| 3 | `PreToolUse` | `Task` (blocks Opus sub-agents) | ☐ |
| 4 | `PreToolUse` | `Read\|Grep\|Glob` (blocks external source reads) | ☐ |
| 5 | `PostToolUse` | `Write` | ☐ |
| 6 | `Stop` | `*` | ☐ |

**Report line:** `Hooks: [N]/6 configured — ✅ / ❌ missing: [list]`

### 3c. Hookify Rules

```bash
ls .claude/hookify.*.local.md 2>/dev/null
```

| # | Rule file | Installed? |
|---|-----------|------------|
| 1 | `hookify.no-opus-subagents.local.md` | ☐ |
| 2 | `hookify.no-codeagent.local.md` | ☐ |

Also check for obsolete rules to remove:
- `hookify.subagent-routing.local.md` — should be removed (replaced by no-codeagent)

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
| 7 | `code-writer.md` | yes | ☐ |

Also check for obsolete agents to remove:
- `strategic-planner.md` — main agent handles planning directly
- `code-reviewer.md` — main agent handles review directly
- `research-analyst.md` — main agent handles synthesis directly

**Report line:** `Agents: [N]/7 installed — ✅ / ❌ missing: [list]`

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
   - Rule 9: Sub-Agent Delegation (must mention Task tool + model selection)
   - Rule 10: Plan Before Big Changes (must mention code-writer)

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

Pre-flight: Self-Update (skill v[X])
- Commands: [N]/13 — [all v[X] ✅ / updated N from v[old] / copied N new / N no-version]
- Agents: [N]/7 — [all v[X] ✅ / updated N / copied N new / N no-version]
- Hookify rules: [N]/2 — [all v[X] ✅ / updated N]
- hooks.json: v[X] ✅ / ⚠️ updated / ❌ missing
- Obsolete files deleted: [list, or "none"]
- Legacy migration: [list changes, or "none needed"]
- update.md itself: [current ✅ / was outdated ⚠️ — re-run recommended]

Step 0: Worktrees
- [N worktrees found / none] — excluded from checks: [paths]

Step 1: Scripts
- sync_to_mods.sh: v[X] — ✅ / ⚠️ / ❌
- create_release.sh: v[X] — ✅ / ⚠️ / ❌

Step 2: mod.config.json
- Schema: v[X] — ✅ / ⚠️
- Paths: ✅ / ❌
- Source paths: ✅ / ⚠️
- File coverage: ✅ / ⚠️ [N] untracked files

Step 3: Commands, Hooks & Agents
- Commands: [N]/13 — ✅ / ❌ missing: [list each]
- Hooks: [N]/6 — ✅ / ❌ missing: [list each]
- Hookify rules: [N]/2 — ✅ / ❌ missing: [list each]
- Agents: [N]/7 — ✅ / ❌ missing: [list each]

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
