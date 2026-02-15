---
name: balatro-mod-dev
description: Develop Balatro mods with Steamodded, Lovely, and SMODS. Includes game source navigation, mobile compat, and debugging.
version: 1.4.0
---

# Balatro Mod Development

Create and debug Balatro mods with Steamodded, Lovely, and SMODS.

## Quick Agent Selection

When researching or writing code, spawn the right sub-agent via the **Task tool**:

| Need to find... | Use agent | Model | Search boundary |
|-----------------|-----------|-------|----------------|
| Game function implementation | `game-source-researcher` | sonnet | `Balatro_src/` only |
| SMODS API usage/hooks | `smods-api-researcher` | sonnet | `smods/` only |
| How other mods do X | `mod-pattern-researcher` | sonnet | `Mods/` folder only |
| Lovely patch syntax | `lovely-patch-researcher` | sonnet | lovely files only |
| Project architecture/exploration | `project-explorer` | sonnet | Current project only |
| Write code per plan | `code-writer` | sonnet | Current project only |
| Run temp script for data | `script-runner` | haiku | N/A (execution) |

**The main agent (Opus) handles directly:** Planning strategy, reviewing code, synthesizing research, making decisions, presenting to user.

**Parallel:** When researching DIFFERENT sources — spawn multiple Task calls in one message
**Sequential:** When second query depends on first result

> **Sub-Agent Invocation**
>
> Use the **Task tool** with model selection to spawn sub-agents:
>
> ```
> # Research agent
> Task(subagent_type="Explore", model="sonnet", prompt="[agent template + task]")
>
> # Code writer
> Task(subagent_type="general-purpose", model="sonnet", prompt="[code-writer template + plan]")
>
> # Script runner
> Task(subagent_type="Bash", model="haiku", prompt="[script to run]")
> ```
>
> **Never use `model: opus`** — the main agent IS Opus. Sub-agents return structured recaps.

See `references/sub-agents.md` for boundaries, workflow patterns, recap protocol, and creating new agents.

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

## Workflow: Init Any Existing Repo

For ALL non-empty repos (own or fork), ALWAYS do these first:

1. **Delete `References/` folder** if exists (legacy symlink approach)
2. **Move extra `.md` files to `docs/`** - only keep in root: README*.md, CHANGELOG*.md, AGENT.md, INIT.md, LICENSE.md
3. **Add dev files** (if missing): AGENT.md, INIT.md, mod.config.json, scripts/sync_to_mods.sh
4. **Add Claude config** — verify ALL are installed:
   - `.claude/commands/` — **13 commands required** (familiar, init, sync-mod, bump-version, release, fix-sprites, refactor, debug, draft-pr, update, update-docs, update-skill, knowledge)
   - `.claude/hooks/` or `.claude/hooks.json` — 6 hooks
   - `.claude/agents/` — **7 agents required** (game-source-researcher, smods-api-researcher, mod-pattern-researcher, lovely-patch-researcher, project-explorer, script-runner, code-writer)
5. **Add hookify rules** (if missing): `.claude/hookify.no-opus-subagents.local.md` (blocks Opus sub-agents), `.claude/hookify.no-codeagent.local.md` (blocks legacy routing)
6. Update .gitignore — must include: `INIT.md`, `AGENT.md`, `mod.config.json`, `docs/`, `.tmp/`, `.claude/`, `.codex/`, `.agents/`, `release/`

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

## Sub-Agent Delegation

The main agent (Opus) orchestrates. Sub-agents (Sonnet/Haiku) execute research, code writing, and script running via the Task tool.

| Situation | Action | Model |
|-----------|--------|-------|
| Research (game, SMODS, mods, lovely) | Spawn research agent | sonnet |
| Writing code (>20 lines or multi-file) | Spawn `code-writer` | sonnet |
| Exploring project architecture | Spawn `project-explorer` | sonnet |
| Running temp scripts for data | Spawn `script-runner` | haiku |
| Planning, reviewing, synthesizing | **Main agent does directly** | — |
| User interaction needed | **Main agent does directly** | — |

### Plan Mode → Code-Writer Handoff

**After exiting plan mode and receiving user approval, immediately delegate to Sonnet code-writer.** Do NOT implement the plan yourself.

```
EnterPlanMode → write plan → ExitPlanMode → user approves
    → Task(model="sonnet", prompt="[code-writer template + approved plan]")
    → receive recap → review changes
```

Opus's value is in planning and review. Sonnet executes mechanically from the plan. For large plans, split into multiple sequential code-writer calls.

Source paths are configured in `mod.config.json > source_paths` — the main agent reads these and includes them in Task prompts when spawning researchers.

**Recap protocol:** All sub-agents end output with a structured recap (Task/Result/Files/Issues/Needs Review). The main agent reads the recap, not raw tool output.

**Hookify enforcement** (requires hookify plugin on-site):
- `hookify.no-opus-subagents.local.md` — Blocks Opus model in Task tool calls
- `hookify.no-codeagent.local.md` — Blocks legacy codeagent/run_subagent commands

See `references/sub-agents.md` for invocation patterns, recap protocol, and delegation rules.

## Available Commands (13 total — all must be installed in `.claude/commands/`)
- `/familiar` - Get familiar with this mod (reads AGENT.md, INIT.md, maps architecture)
- `/init-balatro-mod` - Initialize new mod
- `/sync-mod` - Start sync with watch mode (run once at start)
- `/bump-version [patch|minor|major]` - Increment version, update changelogs
- `/release` - Create release packages (auto-detects version from manifests)
- `/fix-sprites <directory> [--preview]` - Fix grey borders on sprites
- `/refactor [focus-area]` - Review code for redundancy, outdated fallbacks, modularization
- `/debug` - Verify fix by checking Lovely logs (auto-detects mod key from repo)
- `/draft-pr` - Draft PR message (for forks)
- `/update` - Self-updates commands/agents from skill templates first, then audits project health
- `/update-docs` - Review all docs (user docs + AGENT.md + INIT.md) for accuracy, staleness, duplication, verbosity
- `/update-skill [file|instruction]` - Update skill based on new knowledge
- `/knowledge` - Review session work, capture discoveries (project-scope → AGENT.md, general → skill)

Sub-agents available after setup (7 total — all must be in `.claude/agents/`):
- `game-source-researcher` - Find game functions and injection points (sonnet)
- `smods-api-researcher` - Find SMODS API patterns and usage (sonnet)
- `mod-pattern-researcher` - Find how other mods implement features (sonnet)
- `lovely-patch-researcher` - Find Lovely patch syntax and examples (sonnet)
- `project-explorer` - Extensive codebase exploration (sonnet)
- `code-writer` - Execute implementation plans, write code (sonnet)
- `script-runner` - Run temp scripts and return results (haiku)
