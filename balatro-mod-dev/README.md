# balatro-mod-dev

Claude Code plugin for Balatro mod development.

## Install

```bash
claude --plugin-dir ./balatro-mod-dev
```

## What Auto-Loads

When installed, Claude Code auto-discovers and loads:
- **1 skill**: `balatro-mod-dev` — game knowledge (patterns, references, file maps)
- **10 agents**: Research (4), code writing, script execution, review/synthesis/planning
- **15 commands**: Init, sync, debug, test, refactor, release, help, and more
- **7 hooks**: Session init, file protection, external read blocking, pre-compact, session memory
- **3 Hookify rules**: Legacy command blocking, Lua print warning, Lua pitfall detection

## Getting Started

After installing the plugin, run `/balatro-mod-dev:init` in your mod repo to scaffold:
- `INIT.md` — project rules for Claude
- `AGENT.md` — mod-specific architecture notes
- `mod.config.json` — file lists, source paths
- `.claude/rules/` — Lua coding style, mod conventions, delegation rules

Then use `/balatro-mod-dev:familiar` to orient Claude to your mod.

## Commands

| Command | Purpose |
|---------|---------|
| `/balatro-mod-dev:familiar` | Read AGENT.md/INIT.md and produce orientation briefing |
| `/balatro-mod-dev:init` | Scaffold new mod repo with templates and rules |
| `/balatro-mod-dev:sync-mod` | Sync mod files to Balatro Mods directory |
| `/balatro-mod-dev:debug` | Analyze Lovely logs and trace errors |
| `/balatro-mod-dev:refactor` | Identify refactor targets with code-reviewer (opus) |
| `/balatro-mod-dev:fix-sprites` | Fix transparent pixel issues in atlases |
| `/balatro-mod-dev:release` | Package and release mod |
| `/balatro-mod-dev:draft-pr` | Draft PR description for contribution |
| `/balatro-mod-dev:update-docs` | Update README and CHANGELOG |
| `/balatro-mod-dev:knowledge` | Load session state from .tmp/session-state.md |
| `/balatro-mod-dev:bump-version` | Bump mod version across files |
| `/balatro-mod-dev:test` | Run test scenarios and verify mod behavior via logs |
| `/balatro-mod-dev:help` | List all available commands and agents |
| `/balatro-mod-dev:check` | Health audit — project config, scripts, rules, gitignore |
| `/balatro-mod-dev:update-plugin` | Update plugin knowledge from new findings |

## Agents

| Agent | Model | Role |
|-------|-------|------|
| `game-source-researcher` | sonnet | Find game functions, injection points |
| `smods-api-researcher` | sonnet | Find SMODS API patterns |
| `mod-pattern-researcher` | sonnet | Find how other mods implement X |
| `lovely-patch-researcher` | sonnet | Find Lovely patch syntax |
| `project-explorer` | sonnet | Map mod architecture |
| `code-writer` | sonnet | Execute implementation plans |
| `script-runner` | haiku | Run one-off scripts |
| `code-reviewer` | opus | Review code (confidence ≥80 filter) |
| `research-analyst` | opus | Synthesize multi-source research |
| `strategic-planner` | opus | Plan complex implementations |

## Hooks (7 plugin + 3 Hookify rules)

### Plugin Hooks (hooks.json — command type JS scripts)

| Hook | When |
|------|------|
| SessionStart | Load INIT.md/AGENT.md context on session start |
| PreToolUse Write/Edit | Block edits to protected files |
| PreToolUse Read/Grep/Glob | Block reads from external game source |
| PostToolUse Write | Suggest mod.config.json updates |
| PreCompact | Save session state before context compaction |
| Stop (PR) | Offer PR drafting for fork contributions |
| Stop (session) | Save session state to .tmp/session-state.md |

### Hookify Rules (scaffolded per-repo via `/init`)

| Rule | Action | What |
|------|--------|------|
| `block-legacy-routing` | block | Block `codeagent`/`run_subagent`/`route_subagent` bash commands |
| `lua-print-warning` | warn | Warn on bare `print()` in `.lua` files |
| `lua-pitfall-check` | warn | Warn on `G.GAME` nil access, string concat nil, FFI cdata comparison |

## Templates

| Template | Purpose |
|----------|---------|
| `agent-md-template.md` | AGENT.md scaffold for standard mods |
| `agent-texture-pack-template.md` | AGENT.md scaffold for texture packs |
| `project-rules-template.md` | INIT.md scaffold |
| `mod-config-template.json` | mod.config.json with test_saves schema |
| `logger-template.lua` | Logger with DEBUG/INFO/WARN/ERROR levels |
| `session-state-template.md` | Structured session handoff format |
| `release-checklist.md` | Pre-flight release verification |
| `rules/lua-coding-style.md` | Lua nil safety, FFI, performance rules |
| `rules/mod-conventions.md` | SMODS, localization, file placement rules |
| `rules/delegation.md` | Agent selection and iterative retrieval rules |
| `rules/git-workflow.md` | Branch naming, commit format, PR conventions |

## Scope

This plugin targets **Balatro mod repos** using Steamodded/Lovely/SMODS. Build tools (e.g., Balatro-IPA-Builder) are out-of-scope — they use different workflows, don't have mod manifests, and don't benefit from SMODS-specific agents or hooks.

## Version

Current: **2.3.0** — See `CHANGELOG.md` for history.
