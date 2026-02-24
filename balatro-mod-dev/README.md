# balatro-mod-dev

Claude Code plugin for Balatro mod development.

## Install

```bash
claude --plugin-dir ./balatro-mod-dev
```

## What Auto-Loads

When installed, Claude Code auto-discovers and loads:
- **1 skill**: `balatro-mod-dev` — game knowledge (patterns, references, file maps)
- **11 agents**: Research (4), debug inspection, code writing, script execution, review/synthesis/planning
- **16 commands**: Init, sync, debug, test, refactor, release, compact, help, and more
- **9 hooks**: Session init, session end (transcript parser), file protection, external read blocking, task model enforcement, compact suggestion, pre-compact
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
| `/balatro-mod-dev:knowledge` | Review session work, surface discoveries, capture knowledge |
| `/balatro-mod-dev:bump-version` | Bump mod version across files |
| `/balatro-mod-dev:test` | Run test scenarios and verify mod behavior via logs |
| `/balatro-mod-dev:help` | List all available commands and agents |
| `/balatro-mod-dev:compact` | Evaluate context health and recommend when to compact |
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
| `debug-inspector` | sonnet | Inspect runtime logs, dump metadata, mod compatibility |
| `code-writer` | sonnet | Execute implementation plans |
| `script-runner` | haiku | Run one-off scripts |
| `code-reviewer` | opus | Review code (confidence ≥80 filter) |
| `research-analyst` | opus | Synthesize multi-source research |
| `strategic-planner` | opus | Plan complex implementations |

## Hooks (9 plugin + 3 Hookify rules)

### Plugin Hooks (hooks.json — command type JS scripts)

| Hook | When |
|------|------|
| SessionStart | Load INIT.md/AGENT.md context + previous session from `~/.claude/sessions/` |
| SessionEnd | Parse JSONL transcript, write session summary to `~/.claude/sessions/` |
| PreToolUse Write/Edit | Warn on edits to protected files |
| PreToolUse Read/Grep/Glob | Block reads from external game source |
| PreToolUse Task | Enforce model parameter on sub-agent spawns (block if missing) |
| PreToolUse Write/Edit | Suggest `/compact` at tool call thresholds (50, then every 25) |
| PostToolUse Write | Suggest mod.config.json updates |
| PreCompact | Append compaction marker to session file + remind to save progress |
| Stop | Offer PR drafting for fork contributions |

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
| `manifest-json-template.json` | Mod manifest for packaging |
| `mod-json-template.json` | Mod descriptor (name, version, author) |
| `logger-template.lua` | Logger with DEBUG/INFO/WARN/ERROR levels |
| `gitignore-template` | .gitignore for mod repos |
| `release-checklist.md` | Pre-flight release verification |
| `session-state-template.md` | Legacy session handoff format (deprecated — automated by SessionEnd hook) |
| `docs/description-template.md` | Mod description scaffold |
| `docs/knowledge-base-template.md` | Knowledge base scaffold for debugging insights |
| `docs/NEXUSMODS_DESCRIPTION-template.txt` | BBCode listing for NexusMods |
| `hookify/hookify.block-legacy-routing.local.md` | Hookify rule: block legacy routing commands |
| `hookify/hookify.lua-print-warning.local.md` | Hookify rule: warn on bare print() |
| `hookify/hookify.lua-pitfall-check.local.md` | Hookify rule: warn on common Lua pitfalls |
| `rules/lua-coding-style.md` | Lua nil safety, FFI, performance rules |
| `rules/mod-conventions.md` | SMODS, localization, file placement rules |
| `rules/delegation.md` | Agent selection and iterative retrieval rules |
| `rules/git-workflow.md` | Branch naming, commit format, PR conventions |

## Scope

This plugin targets **Balatro mod repos** using Steamodded/Lovely/SMODS. Build tools (e.g., Balatro-IPA-Builder) are out-of-scope — they use different workflows, don't have mod manifests, and don't benefit from SMODS-specific agents or hooks.

## Version

Current: **2.6.0** — See `CHANGELOG.md` for history.
