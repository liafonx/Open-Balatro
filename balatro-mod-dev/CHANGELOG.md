# Changelog

All notable changes to the balatro-mod-dev plugin.

## [2.8.0] - 2026-03-06

Merged AGENT.md + INIT.md into a single AGENTS.md file for all mod repos.

- **New templates: `agents-md-template.md` and `agents-texture-pack-template.md`** — merged replacements for `agent-md-template.md`, `agent-texture-pack-template.md`, and `project-rules-template.md`. Both add a **Quick Reference** table (mod name, repo type, mod type, dependencies, rules pointer) and a **Mod-Specific** subsection under Constraints & Gotchas. General rules (Protected Files, File Change Protocol, Logging) are dropped — those live in `.claude/rules/` already
- **Deleted old templates:** `agent-md-template.md`, `agent-texture-pack-template.md`, `project-rules-template.md`
- **`/init` command** — now scaffolds a single `AGENTS.md` from `agents-md-template.md` (or `agents-texture-pack-template.md` for Malverk mods); fork variant is the HTML comment block at the bottom of the template
- **`/check` command — Step 5d: AGENTS.md Format Check** — detects current vs legacy format; if legacy (AGENT.md + INIT.md), offers to merge: extracts Quick Reference from INIT.md, copies all AGENT.md sections, appends Mod-Specific constraints, updates .gitignore, deletes old files
- **Hook backward compat:** All 4 hooks (`session-start.js`, `pre-compact.js`, `protected-file-check.js`, `stop-check.js`) check `AGENTS.md` first, fall back to `AGENT.md`/`INIT.md` — existing repos work until `/check` migrates them
- **References updated (~24 files):** commands, agents, skill, templates, README, root AGENT.md all use `AGENTS.md`

## [2.7.1] - 2026-03-06

Docs/rules alignment and minor fixes.

- **Section references in commands fixed** (`update-docs`, `knowledge`, `test`) — replaced §N numeric anchors with named section headings; removed stale §8 (Recent Changes) and §9 (Open Tasks) that were cut in v2.4.0
- **`smods-api.md`** — collapsed redundant Lua gotchas block into a single pointer to `references/lua-gotchas.md` (avoids drift between the two copies)
- **`block-external-reads.js`** — added lowercase `balatro_src/` pattern alongside `Balatro_src/` for case-insensitive path matching
- **`/help` command** — added `debug-inspector` to DIAGNOSTICS group; added `/compact` to MAINTENANCE group (was missing)
- **`debug-inspector.md`** — added cross-reference comment pointing to `/debug` for human-readable post-fix verification
- **`/debug` command** — added pointer to `debug-inspector.md` error patterns table for scripted extraction
- **SKILL.md, sub-agents.md, update-plugin.md** — updated agent count 10→11 and command count 15→16 to reflect `debug-inspector` and `/compact` added in v2.6.0/v2.4.0

## [2.7.0] - 2026-02-25

Persistent agent memory and tightened source routing for mod project code.

- **`delegation.md` template — Source Routing overhaul:**
  - Renamed "External Source Routing" section to "Source Routing (CRITICAL)" to reflect that it covers all sources, not only external ones
  - Added `project-explorer` as the first entry in the routing table — "Mod project code (UI, features, architecture, file search)" now has a dedicated agent rather than falling through to `Explore`
  - Demoted `Explore` to last entry in the model selection table with explicit scope: "Quick targeted file searches only — when no researcher above matches"
  - Added "Exploring mod project code" to the "When to Delegate" list
  - Added prohibition note below model selection table: do not spawn `Plan` sub-agents (blocked by `enforce-task-model.js`); use `strategic-planner` instead
- **Persistent memory (`memory: project`) added to 5 agents:**
  - `project-explorer` — saves module dependency maps, project type, and key file purposes; invalidates on structural changes
  - `code-reviewer` — saves project-specific anti-patterns (confidence ≥ 80), recurring Lua pitfalls, confirmed SMODS misuse; clears fixed entries
  - `game-source-researcher` — saves function→file path mappings and data structure schemas with Balatro version stamp; treats all cached entries as unverified when version changes
  - `research-analyst` — saves synthesis conclusions with Steamodded version stamp and source traceability; flags version-specific conclusions when SMODS updates
  - `smods-api-researcher` — saves SMODS object type → required fields + callback signatures with version stamp; treats all cached API signatures as unverified when version changes

## [2.6.0] - 2026-02-24

New `debug-inspector` agent for automated runtime diagnostics.

- **New agent: `debug-inspector`** (sonnet, magenta) — three capabilities: (1) latest log extraction with 19 error pattern categories, (2) game dump analysis via `lovely/dump/*.lua.json` metadata showing which mods patched which lines, (3) mod compatibility conflict detection using overlap analysis on patch regions
- **Updated `enforce-task-model.js`** — added `balatro-mod-dev:debug-inspector` → sonnet to RECOMMENDED_MODELS
- **Updated `delegation.md` template** — added debug-inspector to external source routing table, delegation trigger list, and model selection table
- Plugin agents now 11 total (was 10), commands and hooks unchanged

## [2.5.0] - 2026-02-24

Automated session persistence — replaces unreliable reminder-based hooks with programmatic transcript parsing.

- **New hook: `session-end.js`** (SessionEnd) — parses JSONL transcript at session termination, extracts user messages, files modified, tools used, and writes structured summary to `~/.claude/sessions/{date}-{project}-session.tmp`
- **Updated `session-start.js`** — loads most recent session from `~/.claude/sessions/` (within 7 days) instead of `.tmp/session-state.md`
- **Updated `pre-compact.js`** — appends timestamped compaction marker to active session file in `~/.claude/sessions/`
- **Removed `stop-save-session.js`** — replaced by automated SessionEnd hook (reminder-based approach never worked in practice)
- Session state centralized at `~/.claude/sessions/` (cross-project, project name in filename)
- `.tmp/` directory reserved for task artifacts only (plans, reviews, recovery files)
- Updated `/compact` survival table, `/knowledge` session loading, README hook descriptions
- Plugin hooks still 9 total (SessionEnd replaces Stop session hook), commands unchanged at 16

## [2.4.0] - 2026-02-21

Refined AGENT.md and INIT.md templates based on real-world usage across 4 mod repos.

- **AGENT.md template:** Cut from 166→100 lines, removed Plugin Reference banner, API section, State Variables, Recent Changes, Open Tasks. Added High-Risk Files, Verification Checklist. Fork variant included as HTML comment block
- **INIT.md template:** Cut from 312→75 lines, removed duplicated plugin content (Sub-Agent Delegation, Plan Mode Handoff, User Documentation, Localization, External References, Utility Scripts, Mod-Specific Context sections)
- **Texture pack template:** Removed Plugin Reference banner, added High-Risk Files and Verification Checklist sections
- **`/check` content validation:** Added Step 5b (AGENT.md section checks by repo type) and Step 5c (INIT.md required sections + stale content detection for old terminology, removed features, and bloated sections)
- **delegation.md:** Added "Commands vs Agents" section — clarifies Skill tool (commands) vs Task tool (agents) routing, prevents agent dispatch of slash commands
- **delegation.md:** Model Selection now requires `model` parameter on every Task call — prevents Explore agents inheriting Opus from parent (20x cost). Added full subagent→model mapping table
- **New hook: `enforce-task-model.js`** — PreToolUse hook on Task tool. Blocks if model is missing for known agent types, warns if opus used for non-opus agents
- **New hook: `suggest-compact.js`** — PreToolUse hook on Edit|Write. Counts tool calls per session, suggests `/compact` at threshold (50) and every 25 calls after. Tailored to mod dev phase transitions
- **New command: `/compact`** — Evaluates current workflow phase and recommends whether to compact. Includes decision guide (research→plan: yes, mid-implementation: no) and survival table (what persists vs what's lost)
- Plugin hooks now 9 total, commands now 16 total

## [2.3.0] - 2026-02-19

Gap analysis sweep: structural fixes, consistency audit, and cleanup.

- **Converted ALL hooks from `prompt` to `command` type** — prompt hooks cause "JSON validation failed" errors in plugins
- **Migrated 3 hooks to Hookify rules** (block-legacy-routing, lua-print-warning, lua-pitfall-check) — per-repo, customizable, dynamically reloaded
- Created 5 new JS hook scripts: session-start, stop-check, stop-save-session, pre-compact, post-write-config-suggest
- `/init` and `/check` now scaffold and verify Hookify rules
- Added LICENSE (MIT), `/test`, `/help`, `/check` commands
- Added PreCompact hook, session-state template, release checklist, git-workflow rule template
- Added repo-specific `protected_files` in mod.config.json (merged with plugin defaults)
- All remaining hook scripts extracted to JS files (zero inline `node -e` remains)
- Expanded `/debug` error patterns from 7 to 25+ with diagnosis guidance
- Verification loop documented in sub-agents.md
- `test_saves` schema defined in mod-config-template.json
- Fixed stale counts across SKILL.md, README, check.md, update-plugin.md
- Fixed check.md plugin.json path, schema version check, rules check (3→4)
- Fixed init.md embedded mod.config.json (aligned with template, schema v2.2.0+)
- Fixed "skill" → "plugin" terminology in code-writer, agent templates, project-rules-template
- Fixed typos, ambiguous relative paths, and missing `_zh` variants in rule templates
- Renamed `/update` → `/check` (disambiguate from `/update-plugin`)
- Added IPA-Builder out-of-scope note in README

## [2.0.0] - 2026-02-18

Migrated from skill (`~/.claude/skills/`) to native Claude Code plugin.

- Plugin structure with `.claude-plugin/plugin.json`, auto-loading commands/agents/hooks
- 10 agents (4 research, code-writer, script-runner, 3 opus deep-reasoning)
- 5-phase workflow: RESEARCH → SYNTHESIZE → PLAN → IMPLEMENT → REVIEW
- Iterative retrieval (max 3 cycles), context forwarding (WHY + WHAT + KNOWN)
- Confidence-based code-reviewer (>=80 threshold), tool whitelists on all agents
- 3 deterministic JS hook scripts, 3 rule templates, `/init` scaffolds `.claude/rules/`
- Removed Codex support, manual skill installation, opus-blocking hooks

## [1.4.5] - 2026-02-17

Last skill-based release before plugin migration.
