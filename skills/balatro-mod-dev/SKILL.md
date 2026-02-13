---
name: balatro-mod-dev
description: Develop Balatro mods with Steamodded, Lovely, and SMODS. Includes game source navigation, mobile compat, and debugging.
version: 1.3.2
---

# Balatro Mod Development

Create and debug Balatro mods with Steamodded, Lovely, and SMODS.

## Quick Agent Selection

When researching, spawn the right agent:

| Need to find... | Use agent | Search boundary | Default Backend |
|-----------------|-----------|----------------|----------------|
| Game function implementation | `game-source-researcher` | `Balatro_src/` only | claude |
| SMODS API usage/hooks | `smods-api-researcher` | `smods/` only | claude |
| How other mods do X | `mod-pattern-researcher` | `Mods/` folder only | claude |
| Lovely patch syntax | `lovely-patch-researcher` | lovely files only | claude |
| **Project architecture/exploration** | `project-explorer` | **Current project only** | **codex** |
| Run temp script for data | `script-runner` | N/A (execution) | codex |
| **Plan implementation strategy** | `strategic-planner` | Current project only | **opus** |
| **Review code for correctness** | `code-reviewer` | Current project only | **opus** |
| **Synthesize research findings** | `research-analyst` | Current project only | **opus** |

**Parallel:** When researching DIFFERENT sources - spawn multiple agents at once
**Sequential:** When second query depends on first result

> **⚠️ MANDATORY: Sub-Agent Invocation**
>
> **ALWAYS use `scripts/run_subagent.sh`** to spawn sub-agents. This adapter resolves backend config from `mod.config.json` and routes through codeagent.
>
> **DO NOT** use built-in agent spawning, direct shell commands, or any other method.
>
> ```bash
> # CORRECT - always use this
> ./scripts/run_subagent.sh game-source-researcher <<'EOF'
> [task content]
> EOF
>
> # WRONG - never do this
> # spawn_agent(...), create_subagent(...), direct codeagent calls, etc.
> ```

See `references/sub-agents.md` for boundaries, workflow patterns, and creating new agents.

## Repo Type Awareness

**Auto-detection:** Compare mod manifest `author` with git remote username.

```bash
# Get git remote username
git_user=$(git remote get-url origin 2>/dev/null | sed -E 's|.*[:/]([^/]+)/[^/]+\.git$|\1|' | tr '[:upper:]' '[:lower:]')

# Get mod author from manifest (first author, lowercase)
mod_author=$(jq -r '.author[0] // .author // ""' *.json 2>/dev/null | head -1 | tr '[:upper:]' '[:lower:]')

# Compare: match = own, no match = fork
[[ "$git_user" == "$mod_author" ]] && echo "own" || echo "fork"
```

| Type | Detection | Implications |
|------|-----------|--------------|
| `new` | Empty repo (no files) | Full docs, Logger.lua, localization |
| `own` | Author matches git user | Full docs, standardize structure |
| `fork` | Author differs from git user | Minimal changes, temp logs only |

See `templates/project-rules-template.md` for detailed rules per type.


## File Naming Convention (Claude & Codex)

Both Claude and Codex use the same file structure:

| File | Purpose | Git |
|------|---------|-----|
| `INIT.md` | Project rules, constraints for AI agents | ignored |
| `AGENT.md` | Mod structure, functions, dependencies, dev status (for handover) | ignored |
| `mod.config.json` | File lists for sync/release scripts | ignored |
| `docs/knowledge-base.md` | Issues & lessons learned | ignored |

**AGENT.md Purpose:** Enable seamless handover between agents. Another agent should quickly understand mod structure, functions, dependencies, and current development status without losing context.

## File Placement Rules

Only these `.md` files belong in root:
- `README.md`, `README_zh.md`
- `CHANGELOG.md`, `CHANGELOG_zh.md`
- `AGENT.md`, `INIT.md`
- `LICENSE.md`

**ALL other `.md` files MUST go in `docs/`**

## External References (No Symlinks Needed)

Access reference code directly via absolute paths. No setup required.

### Source Locations (macOS)

| Resource | Path |
|----------|------|
| Game Source (desktop) | `~/Development/GitWorkspace/Balatro_src/desktop/` |
| Game Source (mobile) | `~/Development/GitWorkspace/Balatro_src/ios_plus/` |
| Steamodded Source | `~/Development/GitWorkspace/smods/src/` |
| Steamodded Lovely | `~/Development/GitWorkspace/smods/lovely/` |
| Lovely Docs | `~/Development/GitWorkspace/lovely-injector/` |
| Installed Mods | `~/Library/Application Support/Balatro/Mods/` |
| Lovely Logs | `~/Library/Application Support/Balatro/Mods/lovely/log/` |

### Source Locations (Windows)

| Resource | Path |
|----------|------|
| Game Source | Varies by setup |
| Installed Mods | `%APPDATA%/Balatro/Mods/` |
| Lovely Logs | `%APPDATA%/Balatro/Mods/lovely/log/` |

## Finding Patterns & Examples

When you need to find how something is implemented:

| What to Find | Where to Search | Command |
|--------------|-----------------|---------|
| Game functions | Balatro_src/desktop/ | `grep -rn "function Game:start_run" ~/Development/GitWorkspace/Balatro_src/desktop/` |
| SMODS API usage | smods/src/ | `grep -rn "SMODS.Joker" ~/Development/GitWorkspace/smods/src/` |
| Lovely patch examples | smods/lovely/ | `grep -rn "patches.pattern" ~/Development/GitWorkspace/smods/lovely/` |
| Other mods' implementations | Installed Mods | `grep -rn "pattern" ~/Library/Application\ Support/Balatro/Mods/` |
| Mobile differences | Balatro_src/ios_plus/ | Compare with desktop version |

## Key Dependencies

| Dependency | Purpose |
|------------|---------|
| [Steamodded](https://github.com/Steamopollys/Steamodded) | Core mod loader, SMODS API |
| [Lovely](https://github.com/ethangreen-dev/lovely-injector) | Lua injection framework |
| [Malverk](https://github.com/Steamodded/smods/wiki/Malverk) | Texture pack API (AltTexture, TexturePack) |

## Pattern References

Read these files for specific topics:

| Topic | Reference File |
|-------|---------------|
| Lovely.toml syntax | `patterns/lovely-patches.md` |
| SMODS hooks, config, localization | `patterns/smods-api.md` |
| Desktop vs mobile differences | `patterns/mobile-compat.md` |
| UIBox, CardArea, draw order | `patterns/ui-system.md` |
| Game source file map + search tips | `references/game-files.md` |
| G.GAME, G.STATES, G.P_* globals | `references/globals.md` |
| Lua/LuaJIT pitfalls, common mod bugs | `references/lua-gotchas.md` |

## New Mod Setup (type: new)

### Templates in `templates/` folder:

| File | Purpose |
|------|---------|
| `project-rules-template.md` | INIT.md template (rules) |
| `agent-md-template.md` | AGENT.md template (repo docs) |
| `agent-texture-pack-template.md` | AGENT.md for Malverk texture packs |
| `mod-config-template.json` | Script configuration |
| `gitignore-template` | Standard .gitignore |
| `logger-template.lua` | Centralized logging utility |

### Meta Files:
| File | Purpose |
|------|---------|
| `mod-json-template.json` | SMODS mod manifest ({ModName}.json) |
| `manifest-json-template.json` | Thunderstore manifest |

### User Docs in `templates/docs/`:
| File | Purpose |
|------|---------|
| `description-template.md` | Concise README for docs/ |
| `NEXUSMODS_DESCRIPTION-template.txt` | BBCode for NexusMods |
| `knowledge-base-template.md` | Issues & lessons learned |

### Required User Docs (new repos):
```
Root:
├── README.md, README_zh.md      # Main docs (EN/ZH)
├── CHANGELOG.md, CHANGELOG_zh.md # Version history (EN/ZH)
└── {ModName}.json, manifest.json # Meta files

docs/:
├── description.md               # Concise README
├── NEXUSMODS_DESCRIPTION.txt    # BBCode format
└── knowledge-base.md            # Issues & lessons
```

### Basic Mod Structure (new repos):
```
{ModName}/
├── main.lua                 # Entry point, mod registration
├── config.lua               # Config defaults (optional)
├── lovely.toml              # Lovely patches (if needed)
├── {ModName}.json           # SMODS mod manifest
├── manifest.json            # Thunderstore manifest
├── mod.config.json          # Script configuration
├── Utils/
│   └── Logger.lua           # Centralized logging
├── localization/
│   ├── en-us.lua            # English (required)
│   └── zh_CN.lua            # Chinese
├── assets/                  # Sprites, shaders
├── scripts/                 # Utility scripts
└── docs/                    # Documentation
```

### AI Agent Config Templates

| Folder | Contents |
|--------|----------|
| `templates/claude-config/` | Claude hooks.json, init command |
| `templates/codex-config/` | Codex-specific templates (if needed) |

## Logging

### For new/my repos:
Use `Utils/Logger.lua` (from `templates/logger-template.lua`):
```lua
local Logger = require("Utils.Logger")
local log = Logger.create("ModuleName")
log("info", "Initialized")
log("error", "Failed: " .. err)
```

### For forks/others' repos:
Use temp logs only (remove before PR):
```lua
pcall(print, "[Debug] checkpoint: " .. tostring(var))
```

## Utility Scripts

| Script | Purpose |
|--------|---------|
| `scripts/sync_to_mods.template.sh` | Sync mod files to game's Mods folder |
| `scripts/create_release.template.sh` | Create release packages |
| `scripts/fix_transparent_pixels.py` | Fix grey borders on sprites |
| `scripts/mod-scripts-guide.md` | Detailed script usage |

## Workflow: Init Any Existing Repo

For ALL non-empty repos (own or fork), ALWAYS do these first:

1. **Delete `References/` folder** if exists (legacy symlink approach)
2. **Move extra `.md` files to `docs/`** - only keep in root: README*.md, CHANGELOG*.md, AGENT.md, INIT.md, LICENSE.md
3. **Add dev files** (if missing): AGENT.md, INIT.md, mod.config.json, scripts/sync_to_mods.sh
4. **Add Claude config** (if missing): `.claude/commands/`, `.claude/hooks/`, `.claude/agents/`
5. **Add hookify rules** (if missing): `.claude/hookify.no-opus-subagents.local.md` (Opus only for reasoning agents), `.claude/hookify.subagent-routing.local.md`
6. Update .gitignore with agent folders

**Then for OWN repos:** Also check manifest, scripts version (2.0.1), add create_release.sh, Logger.lua

**Then for FORK repos:** Keep AGENT.md lightweight, use fork-mode INIT.md, don't add release scripts

## Workflow: Debugging

1. Check `references/lua-gotchas.md` for known pitfalls (FFI cdata, nil scoping, boolean normalization)
2. Check platform (desktop vs mobile)
3. Search game source for function
4. Check other mods for implementations
5. Add logs (Logger.lua for own, temp for fork)
6. Check Lovely logs
7. **If fix fails 3+ times:** Document in `docs/knowledge-base.md`

## Workflow: Update User Docs

When user says "update all user docs":
1. Review ALL files: README(_zh).md, CHANGELOG(_zh).md
2. Review docs/: description.md, NEXUSMODS_DESCRIPTION.txt
3. Update version in {ModName}.json, manifest.json
4. Ensure EN/ZH consistency

## Workflow: Draft PR Message (fork repos)

Use `/draft-pr` command. Style: 3-5 sentences, casual tone, what/why/done.

## Sub-Agents for Research

Main agent handles code. Sub-agents handle information gathering via `scripts/run_subagent.sh` → codeagent routing.

**Shared context:** When invoking multiple sub-agents for a task, the main agent **must** first create `.tmp/[taskname]/task.md` as a shared brief. Sub-agents read it for context and write their artifacts (research.md, analysis.md, plan.md, review.md) to the same directory. See `references/sub-agents.md` → "Shared Task Context" for the full protocol.

| Situation | Use | Default Backend |
|-----------|-----|---------|
| Research (game, SMODS, mods, lovely) | Research agent | `claude` |
| Running temp scripts for data | `script-runner` | `codex` |
| Planning, reviewing, synthesizing | Reasoning agent | `opus` |
| Writing/editing code | **Main agent** | — |
| User interaction needed | **Main agent** | — |

Backends and source paths are **configurable** in `mod.config.json`:
- `agent_backends.research` / `agent_backends.execution` / `agent_backends.reasoning` — category defaults
- `agent_backends.overrides.{agent-name}` — per-agent override (string or `{backend, workdir}`)
- `source_paths` — where game source, SMODS, mods are located on this machine

**Model restriction:** Opus is allowed **only** for reasoning sub-agents (strategic-planner, code-reviewer, research-analyst). Research agents use Sonnet; execution agents use Haiku.

**Hookify enforcement** (requires hookify plugin on-site):
- `hookify.no-opus-subagents.local.md` — Blocks Opus for non-reasoning agents (allows strategic-planner, code-reviewer, research-analyst)
- `hookify.subagent-routing.local.md` — Blocks direct codeagent/route_subagent calls

These are backend **hints**. Codeagent owns final invocation policy (`~/.codeagent/config.yaml`, `~/.codeagent/models.json`).
`run_subagent.sh` resolves config and routes through codeagent automatically — no direct `codeagent-wrapper` calls.

See `references/sub-agents.md` for full config resolution, invocation patterns, and parallel examples.

## Available Commands
- `/familiar` - Get familiar with this mod (reads AGENT.md, INIT.md, maps architecture)
- `/init-balatro-mod` - Initialize new mod
- `/sync-mod` - Start sync with watch mode (run once at start)
- `/bump-version [patch|minor|major]` - Increment version, update changelogs
- `/release` - Create release packages (auto-detects version from manifests)
- `/fix-sprites <directory> [--preview]` - Fix grey borders on sprites
- `/refactor [focus-area]` - Review code for redundancy, outdated fallbacks, modularization
- `/debug` - Verify fix by checking Lovely logs (auto-detects mod key from repo)
- `/draft-pr` - Draft PR message (for forks)
- `/update` - Audit project health: scripts, hooks, commands, config, file placement, gitignore
- `/update-docs` - Review all docs (user docs + AGENT.md + INIT.md) for accuracy, staleness, duplication, verbosity
- `/update-skill [file|instruction]` - Update skill based on new knowledge
- `/knowledge` - Review session work, capture discoveries (project-scope → AGENT.md, general → skill)

Sub-agents available after setup:
- `game-source-researcher` - Find game functions and injection points
- `smods-api-researcher` - Find SMODS API patterns and usage
- `mod-pattern-researcher` - Find how other mods implement features
- `lovely-patch-researcher` - Find Lovely patch syntax and examples
- `project-explorer` - Extensive codebase exploration (uses codex for token efficiency)
- `script-runner` - Run temp scripts and return results
- `strategic-planner` - Plan implementation strategy (uses opus for deep reasoning)
- `code-reviewer` - Review code for correctness and edge cases (uses opus)
- `research-analyst` - Synthesize multi-source research findings (uses opus)
