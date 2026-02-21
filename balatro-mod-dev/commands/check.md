---
description: Health audit — check if project config, scripts, hooks, rules, file placement, and gitignore are up-to-date
allowed-tools: Read, Bash, Glob, Grep, Edit
---

# Update Check (Health Audit)

Audit this mod repo for outdated scripts, hooks, agents, rules, file/dir structure, gitignore, and incomplete mod.config.json.

**MANDATORY: You MUST execute every step below in order. Do NOT skip steps.**

**Report findings first, then ask user which items to fix.**

---

## Pre-flight: Check Plugin Version

```bash
# Get plugin version from plugin.json
cat "${CLAUDE_PLUGIN_ROOT}/.claude-plugin/plugin.json" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['version'])" 2>/dev/null || echo "unknown"
```

---

## Step 0: Git Worktree Detection

```bash
git worktree list 2>/dev/null
```

Record worktree paths. **Exclude them from ALL subsequent file checks.**

---

## Step 1: Script Version Check

Read `scripts/sync_to_mods.sh` and `scripts/create_release.sh`:
- Look for `# Config Version:` line — current template version is **2.0.1**
- Flag if version is missing or older
- Check scripts read from `mod.config.json` (not hardcoded `BASE_FILES`)

**Report lines:**
```
sync_to_mods.sh: Config v[X] — ✅ current / ⚠️ outdated / ❌ missing
create_release.sh: Config v[X] — ✅ current / ⚠️ outdated / ❌ missing
```

---

## Step 2: mod.config.json Validation

Read `mod.config.json` and check:

1. **Schema version:** `$version` should be `"2.2.0"` (or `"2.0.0"`/`"2.1.0"` for older repos)
2. **Paths object:** Verify `paths` object exists with `mods_dir`, `logs_dir`, `release_dir`
3. **Source paths:** Verify `source_paths` object exists
4. **File coverage:** Scan actual mod files and compare against `include_files`

---

## Step 3: Hooks Check

Look for hooks configuration at `.claude/hooks.json` or `.claude/hooks/hooks.json`.

The plugin ships 7 command hooks via `${CLAUDE_PLUGIN_ROOT}/hooks/hooks.json` plus 3 Hookify rules scaffolded per-repo. If hooks.json is missing at project level, it uses plugin defaults.

**Report line:** `Plugin hooks: ✅ active via plugin / ⚠️ overridden at project level`

---

## Step 4: Rules Check

**This is a new check for plugin-based setup.**

```bash
ls .claude/rules/ 2>/dev/null
```

| # | Rule file | Required? | Installed? |
|---|-----------|-----------|------------|
| 1 | `lua-coding-style.md` | yes | ☐ |
| 2 | `mod-conventions.md` | yes | ☐ |
| 3 | `delegation.md` | yes | ☐ |
| 4 | `git-workflow.md` | yes | ☐ |

If any are missing, scaffold them:
```bash
mkdir -p .claude/rules/
cp "${CLAUDE_PLUGIN_ROOT}/templates/rules/lua-coding-style.md" .claude/rules/ 2>/dev/null
cp "${CLAUDE_PLUGIN_ROOT}/templates/rules/mod-conventions.md" .claude/rules/ 2>/dev/null
cp "${CLAUDE_PLUGIN_ROOT}/templates/rules/delegation.md" .claude/rules/ 2>/dev/null
cp "${CLAUDE_PLUGIN_ROOT}/templates/rules/git-workflow.md" .claude/rules/ 2>/dev/null
```

**Report line:** `Rules: [N]/4 installed — ✅ / ❌ missing: [list] (scaffolded from plugin templates)`

---

## Step 4b: Hookify Rules Check

These Hookify rules provide Lua-specific warnings and legacy command blocking. They require the Hookify plugin.

```bash
ls .claude/hookify.*.local.md 2>/dev/null
```

| # | Rule file | Required? | Installed? |
|---|-----------|-----------|------------|
| 1 | `hookify.block-legacy-routing.local.md` | yes | ☐ |
| 2 | `hookify.lua-print-warning.local.md` | yes | ☐ |
| 3 | `hookify.lua-pitfall-check.local.md` | yes | ☐ |

If any are missing, scaffold them:
```bash
for rule in block-legacy-routing lua-print-warning lua-pitfall-check; do
  if [ ! -f ".claude/hookify.${rule}.local.md" ]; then
    cp "${CLAUDE_PLUGIN_ROOT}/templates/hookify/hookify.${rule}.local.md" .claude/
    echo "Scaffolded: hookify.${rule}.local.md"
  fi
done
```

If installed, check if they're outdated by comparing against plugin templates:
```bash
for rule in block-legacy-routing lua-print-warning lua-pitfall-check; do
  local_file=".claude/hookify.${rule}.local.md"
  template_file="${CLAUDE_PLUGIN_ROOT}/templates/hookify/hookify.${rule}.local.md"
  if [ -f "$local_file" ] && [ -f "$template_file" ]; then
    if ! diff -q "$local_file" "$template_file" > /dev/null 2>&1; then
      echo "⚠️ hookify.${rule}.local.md differs from plugin template (may be customized or outdated)"
    fi
  fi
done
```

**Report line:** `Hookify rules: [N]/3 installed — ✅ / ❌ missing: [list] / ⚠️ customized: [list]`

---

## Step 5: File & Directory Structure Check

### 5a. INIT.md and AGENT.md Placement

Both MUST be at the **project root** and **git-ignored**.

```bash
ls -la INIT.md AGENT.md 2>/dev/null
ls -la docs/INIT.md docs/AGENT.md 2>/dev/null
```

### 5b. Root .md File Placement

Only these `.md` files belong in root:
`README.md`, `README_zh.md`, `CHANGELOG.md`, `CHANGELOG_zh.md`, `AGENT.md`, `INIT.md`, `LICENSE.md`

### 5c. .gitignore Validation

| # | Entry | Present? |
|---|-------|----------|
| 1 | `INIT.md` | ☐ |
| 2 | `AGENT.md` | ☐ |
| 3 | `mod.config.json` | ☐ |
| 4 | `docs/*` (with exceptions) | ☐ |
| 5 | `.tmp/` | ☐ |
| 6 | `.claude/` | ☐ |
| 7 | `.agents/` | ☐ |
| 8 | `release/` | ☐ |
| 9 | `scripts/` | ☐ |

---

## Step 5b: AGENT.md Content Check

Read `AGENT.md` (if it exists) and verify required sections based on repo type.

Determine repo type from `mod.config.json` or `INIT.md` Quick Reference section.

### For own repos, verify these sections exist:

| # | Section | Present? |
|---|---------|----------|
| 1 | Scope (or "Big Picture") | ☐ |
| 2 | Architecture (or "Repository Structure") | ☐ |
| 3 | High-Risk Files | ☐ |
| 4 | Verification Checklist | ☐ |
| 5 | Development (scripts/commands) | ☐ |

### For fork repos, verify these sections exist:

| # | Section | Present? |
|---|---------|----------|
| 1 | Mod Info (metadata table) or Description | ☐ |
| 2 | Structure (file tree) | ☐ |
| 3 | Key Implementation Details | ☐ |

**Report line:**
```
AGENT.md content ([own/fork]):
- Scope: ✅ / ❌ missing
- Architecture: ✅ / ❌ missing
- High-Risk Files: ✅ / ❌ missing
- Verification Checklist: ✅ / ❌ missing
- Development: ✅ / ❌ missing
```

---

## Step 5c: INIT.md Content Check

Read `INIT.md` (if it exists) and verify required sections and check for stale content.

### Required sections (all repo types):

| # | Section | Present? |
|---|---------|----------|
| 1 | Quick Reference (mod name, repo type) | ☐ |
| 2 | Protected Files rule | ☐ |
| 3 | File Change Protocol rule | ☐ |
| 4 | Logging Standard rule | ☐ |

### Stale content detection:

Search INIT.md for these patterns. If found, flag as stale:

| # | Pattern | Found? | Issue |
|---|---------|--------|-------|
| 1 | `"skill"` (not `"plugin"`) | ☐ | Old terminology — should be "plugin" |
| 2 | `run_subagent.sh` | ☐ | Removed in v2.0.0 |
| 3 | `codex` or `agent_backends` | ☐ | Legacy infrastructure references |
| 4 | `## Sub-Agent Delegation` section | ☐ | Moved to `.claude/rules/delegation.md` |
| 5 | `## External References` section | ☐ | Paths are in `mod.config.json` and plugin |
| 6 | `## Localization` section (>10 lines) | ☐ | Reference info — belongs in plugin patterns |
| 7 | `## User Documentation` section | ☐ | Reference info — belongs in `/update-docs` |

**Report line:**
```
INIT.md content:
- Quick Reference: ✅ / ❌ missing
- Protected Files rule: ✅ / ❌ missing
- File Change Protocol rule: ✅ / ❌ missing
- Logging Standard rule: ✅ / ❌ missing
- Stale content: ✅ none / ⚠️ found: [list]
```

---

## Step 6: Logging Check (own repos only)

1. **Logger.lua exists?** Check for `Utils/Logger.lua`
2. **Scan for ad-hoc logging** in all `.lua` files:
   - `print(` — bare print calls
   - `pcall(print,` — protected print calls used as permanent logging

---

## Step 7: Generate Report

```
=== Mod Health Check ===

Plugin: balatro-mod-dev v[X]

Step 0: Worktrees
- [N worktrees found / none]

Step 1: Scripts
- sync_to_mods.sh: v[X] — ✅ / ⚠️ / ❌
- create_release.sh: v[X] — ✅ / ⚠️ / ❌

Step 2: mod.config.json
- Schema: v[X] — ✅ / ⚠️
- Paths: ✅ / ❌
- Source paths: ✅ / ⚠️
- File coverage: ✅ / ⚠️ [N] untracked files

Step 3: Hooks
- Plugin hooks: ✅ active / ⚠️ overridden

Step 4: Rules
- lua-coding-style.md: ✅ / ❌ (scaffolded)
- mod-conventions.md: ✅ / ❌ (scaffolded)
- delegation.md: ✅ / ❌ (scaffolded)
- git-workflow.md: ✅ / ❌ (scaffolded)

Step 4b: Hookify Rules
- hookify.block-legacy-routing.local.md: ✅ / ❌ (scaffolded) / ⚠️ customized
- hookify.lua-print-warning.local.md: ✅ / ❌ (scaffolded) / ⚠️ customized
- hookify.lua-pitfall-check.local.md: ✅ / ❌ (scaffolded) / ⚠️ customized

Step 5: File & Directory Structure
- INIT.md placement: [root ✅ / docs/ ❌ MISPLACED / ❌ missing]
- AGENT.md placement: [root ✅ / docs/ ❌ MISPLACED / ❌ missing]
- Root .md files: ✅ / ⚠️ stray: [list]
- Gitignore: [N]/9 entries — ✅ / ❌ missing: [list]

Step 5b: AGENT.md Content ([own/fork])
- [section]: ✅ / ❌ missing  (for each required section)

Step 5c: INIT.md Content
- Quick Reference: ✅ / ❌
- Protected Files rule: ✅ / ❌
- File Change Protocol: ✅ / ❌
- Logging Standard: ✅ / ❌
- Stale content: ✅ none / ⚠️ [list]

Step 6: Logging
- Logger.lua: ✅ / ❌
- Ad-hoc logging: [N] files — [list]

=== Summary ===
✅ Passed: [N] checks
⚠️ Warnings: [N] items
❌ Failed: [N] items

Would you like me to fix any of these? (list numbers or "all")
```

**Wait for user response before making any changes.**
