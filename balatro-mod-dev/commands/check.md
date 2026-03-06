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

The plugin ships 9 command hooks via `${CLAUDE_PLUGIN_ROOT}/hooks/hooks.json` plus 3 Hookify rules scaffolded per-repo. If hooks.json is missing at project level, it uses plugin defaults.

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

## Step 4c: Rules Content Check

For each installed rule file, compare against the plugin template to detect outdated content:

```bash
for rule in lua-coding-style mod-conventions delegation git-workflow; do
  local_file=".claude/rules/${rule}.md"
  template_file="${CLAUDE_PLUGIN_ROOT}/templates/rules/${rule}.md"
  if [ -f "$local_file" ] && [ -f "$template_file" ]; then
    if ! diff -q "$local_file" "$template_file" > /dev/null 2>&1; then
      echo "⚠️ ${rule}.md differs from plugin template"
      diff "$local_file" "$template_file" | head -20
    else
      echo "✅ ${rule}.md — matches template"
    fi
  fi
done
```

For `delegation.md` specifically, check for key content markers by version:

```bash
local_delegation=".claude/rules/delegation.md"
if [ -f "$local_delegation" ]; then
  grep -q "Commands vs Agents" "$local_delegation"   && echo "✅ delegation: Commands vs Agents section (v2.4.0+)" || echo "❌ delegation: missing Commands vs Agents section (pre-v2.4.0)"
  grep -q "External Source Routing" "$local_delegation" && echo "✅ delegation: External Source Routing table (v2.4.0+)" || echo "❌ delegation: missing External Source Routing table (pre-v2.4.0)"
  grep -q "debug-inspector" "$local_delegation"      && echo "✅ delegation: debug-inspector entry (v2.6.0+)" || echo "❌ delegation: missing debug-inspector entry (pre-v2.6.0)"
fi
```

If a rule differs from the template, offer to re-scaffold it (which replaces it with the current template — any local customizations will be lost):

```bash
cp "${CLAUDE_PLUGIN_ROOT}/templates/rules/delegation.md" .claude/rules/
```

**Report line:** `Rules content: [rule]: ✅ current / ⚠️ differs (outdated or customized) / ❌ missing`

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

### 5a. AGENTS.md Placement

AGENTS.md MUST be at the **project root** and **git-ignored**. Also check for legacy files.

```bash
ls -la AGENTS.md AGENT.md INIT.md 2>/dev/null
ls -la docs/AGENTS.md docs/AGENT.md 2>/dev/null
```

### 5b. Root .md File Placement

Only these `.md` files belong in root:
`README.md`, `README_zh.md`, `CHANGELOG.md`, `CHANGELOG_zh.md`, `AGENTS.md`, `LICENSE.md`

### 5c. .gitignore Validation

| # | Entry | Present? |
|---|-------|----------|
| 1 | `AGENTS.md` | ☐ |
| 2 | `mod.config.json` | ☐ |
| 3 | `docs/*` (with exceptions) | ☐ |
| 4 | `.tmp/` | ☐ |
| 5 | `.claude/` | ☐ |
| 6 | `.agents/` | ☐ |
| 7 | `release/` | ☐ |
| 8 | `scripts/` | ☐ |

---

## Step 5b: AGENTS.md Content Check

Read `AGENTS.md` (if it exists) and verify required sections based on repo type.

Determine repo type from `mod.config.json` or the **Quick Reference** table in `AGENTS.md`.

### For own repos, verify these sections exist:

| # | Section | Present? |
|---|---------|----------|
| 1 | Quick Reference table (mod, repo type, dependencies) | ☐ |
| 2 | Scope (or "Big Picture") | ☐ |
| 3 | Architecture (or "Repository Structure") | ☐ |
| 4 | High-Risk Files | ☐ |
| 5 | Verification Checklist | ☐ |
| 6 | Development (scripts/commands) | ☐ |

### For fork repos, verify these sections exist:

| # | Section | Present? |
|---|---------|----------|
| 1 | Quick Reference table | ☐ |
| 2 | Description | ☐ |
| 3 | Structure (file tree) | ☐ |
| 4 | Key Implementation Details | ☐ |

**Report line:**
```
AGENTS.md content ([own/fork]):
- Quick Reference: ✅ / ❌ missing
- Scope: ✅ / ❌ missing
- Architecture: ✅ / ❌ missing
- High-Risk Files: ✅ / ❌ missing
- Verification Checklist: ✅ / ❌ missing
- Development: ✅ / ❌ missing
```

---

## Step 5d: AGENTS.md Format Check (Migration)

### Detect Current Format

```bash
ls -la AGENTS.md AGENT.md INIT.md 2>/dev/null
```

| Found | Status | Action |
|-------|--------|--------|
| `AGENTS.md` only | ✅ Current | Skip |
| `AGENTS.md` + old files | ⚠️ Mixed | Offer to delete old files |
| `AGENT.md` + `INIT.md` only | ⚠️ Legacy | Offer to merge |
| `AGENT.md` only (no INIT.md) | ⚠️ Partial | Offer to rename + add Quick Reference |
| None | ❌ Missing | Note in report; suggest /init |

### If Legacy Format → Merge

**Ask user:** "Found legacy AGENT.md + INIT.md. Merge into AGENTS.md? (y/n)"

If approved:

1. Read both AGENT.md and INIT.md
2. Create AGENTS.md:
   - **Quick Reference table** — extract mod name from AGENT.md header, repo type from INIT.md Quick Reference
   - **All AGENT.md sections** — copy in order (Scope/Architecture/Core Behavior/etc.)
   - **Mod-Specific Constraints** from INIT.md → append as "### Mod-Specific" under Constraints & Gotchas
   - **Drop** general rules from INIT.md (Protected Files, File Change Protocol, Logging, etc.) — these are in `.claude/rules/` already
3. Update .gitignore: replace `AGENT.md` + `INIT.md` lines with `AGENTS.md`
4. Delete AGENT.md and INIT.md
5. Update `.claude/rules/mod-conventions.md` and `.claude/rules/git-workflow.md` if they reference old filenames

**Report line:**
```
AGENTS.md format: ✅ current / ⚠️ legacy → merged / ⚠️ legacy → user declined / ❌ missing
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

Step 4c: Rules Content
- lua-coding-style.md: ✅ current / ⚠️ differs / ❌ missing
- mod-conventions.md: ✅ current / ⚠️ differs / ❌ missing
- delegation.md: ✅ current / ⚠️ differs (Commands vs Agents ✅/❌, External Source Routing ✅/❌, debug-inspector ✅/❌) / ❌ missing
- git-workflow.md: ✅ current / ⚠️ differs / ❌ missing

Step 4b: Hookify Rules
- hookify.block-legacy-routing.local.md: ✅ / ❌ (scaffolded) / ⚠️ customized
- hookify.lua-print-warning.local.md: ✅ / ❌ (scaffolded) / ⚠️ customized
- hookify.lua-pitfall-check.local.md: ✅ / ❌ (scaffolded) / ⚠️ customized

Step 5: File & Directory Structure
- AGENTS.md placement: [root ✅ / docs/ ❌ MISPLACED / ❌ missing]
- Root .md files: ✅ / ⚠️ stray: [list]
- Gitignore: [N]/8 entries — ✅ / ❌ missing: [list]

Step 5b: AGENTS.md Content ([own/fork])
- [section]: ✅ / ❌ missing  (for each required section)

Step 5d: AGENTS.md Format
- Format: ✅ current / ⚠️ legacy → [merged / user declined] / ❌ missing

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
