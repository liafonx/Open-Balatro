# Changelog

All notable changes to the balatro-mod-dev plugin.

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
