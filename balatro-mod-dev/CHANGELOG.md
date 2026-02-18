# Changelog

All notable changes to the balatro-mod-dev plugin.

## [2.3.0] - 2026-02-18

### Added
- `LICENSE` (MIT) at plugin root
- `hooks/scripts/block-external-reads.js` — extracted from inline hook

### Fixed
- `check.md` (was `update.md`): plugin.json path resolved outside plugin dir (used `../` incorrectly)
- `check.md`: schema version check only accepted 2.0.0/2.1.0, rejecting valid 2.2.0 configs
- `check.md`: hook count said 8, actual is 10
- `check.md`: rules check only validated 3 of 4 rules (missed `git-workflow.md`)
- `update-plugin.md`: command count said 13, actual is 15
- `update-plugin.md`: hook count said 8 in structure diagram
- `update-plugin.md`: Codex grep pattern `codex\.yaml\.codex` matched nothing (always passed vacuously)
- `update-plugin.md`: validation report template said `/13` for commands
- `SKILL.md`: command count said 13, actual is 15; added `/test` and `/help` to list
- `README.md`: hook count said 9, table listed 10 (within-file inconsistency)
- `init.md`: embedded mod.config.json diverged from template in 7 fields (now aligned)
- `init.md`: own-repo check referenced v2.0.0 schema (now says current v2.2.0+)
- `code-writer.md`: "skill" → "plugin" terminology
- `agent-md-template.md`: "skill" → "plugin" terminology; fixed `reference/` → `references/` typo
- `agent-texture-pack-template.md`: "skill" → "plugin" terminology
- `rules/mod-conventions.md`: ambiguous relative path now references plugin context
- `rules/lua-coding-style.md`: same relative path fix
- `rules/git-workflow.md`: protected files list now includes `_zh` variants
- `project-rules-template.md`: removed circular reference to delegation.md

### Changed
- Renamed `/update` → `/check` to distinguish from `/update-plugin` (repo health audit vs plugin knowledge update)
- All 5 hook scripts now use external JS files (zero inline `node -e` commands remain)
- PreToolUse Read/Grep/Glob hook extracted to `block-external-reads.js`

## [2.2.0] - 2026-02-18

### Added
- Repo-specific `protected_files` array in mod.config.json — repos can extend the default protected file list
- `hooks/scripts/protected-file-check.js` — extracted from inline hook, reads mod.config.json for repo overrides
- Scope section in README clarifying IPA-Builder and build tools are out-of-scope
- `test_saves` and `protected_files` fields to `/init` command's embedded mod.config.json

### Changed
- PreToolUse Write/Edit hook now uses external script instead of inline node -e
- mod-config-template.json schema bumped to 2.2.0
- `/init` embedded mod.config.json bumped from 2.0.0 to 2.2.0

## [2.1.0] - 2026-02-18

### Added
- `/test` command for running test scenarios and verifying mod behavior via Lovely logs
- `/help` command for discovering all available commands
- PreCompact hook to save session state before context compaction
- Session handoff template (`templates/session-state-template.md`) for structured session continuity
- Release checklist template (`templates/release-checklist.md`) for pre-flight verification
- Git workflow rule template (`templates/rules/git-workflow.md`) for mod repos
- Verification loop documentation in sub-agents reference
- `test_saves` schema in mod-config-template.json
- Plugin CHANGELOG.md

### Fixed
- Wired `lua-pitfall-check.js` into hooks.json (script existed but was never triggered)

### Changed
- Expanded debug command error patterns from 7 to 25+ with diagnosis guidance
- Stop hook now references structured session-state template
- Updated hooks count: 8 → 9 (added PreCompact)

## [2.0.0] - 2026-02-18

### Added
- Native Claude Code plugin structure (`.claude-plugin/plugin.json`)
- 3 Opus agents restored: code-reviewer, research-analyst, strategic-planner (10 agents total)
- 5-phase workflow: RESEARCH → SYNTHESIZE → PLAN → IMPLEMENT → REVIEW
- Iterative retrieval protocol (max 3 cycles per agent)
- Context forwarding rules (WHY + WHAT + KNOWN on every Task prompt)
- Confidence-based filtering on code-reviewer (>=80 threshold)
- Tool whitelists on all agents (read-only for researchers)
- 8 hooks: SessionStart, 3x PreToolUse, 2x PostToolUse, 2x Stop
- 3 deterministic JS hook scripts (lua-print-warning, lua-pitfall-check, block-legacy-routing)
- 3 rule templates for mod repos (lua-coding-style, mod-conventions, delegation)
- `/init` Step 4b scaffolds `.claude/rules/` from templates

### Changed
- Migrated from skill (`~/.claude/skills/`) to plugin (`balatro-mod-dev/`)
- Delegation model: Sonnet is main agent, Opus for deep reasoning sub-agents
- Commands auto-load from plugin (no manual copy to `.claude/commands/`)
- Agents auto-load from plugin (no manual copy to `.claude/agents/`)
- Single version in plugin.json replaces 26 `skill-version` markers

### Removed
- Codex support (openai.yaml, `.codex/` references)
- Manual skill installation workflow
- Hook blocking Opus sub-agents (Opus is now a valid sub-agent model)
- `hookify.no-opus-subagents.local.md` and `hookify.no-codeagent.local.md`

## [1.4.5] - 2026-02-17

### Changed
- Last skill-based release before plugin migration
- Updated gitignore template
- Minor documentation fixes
