---
name: balatro-mod-dev
description: Develop Balatro mods with Steamodded, Lovely, and SMODS. Includes game source navigation, mobile compat, and debugging.
version: 1.0.9
---

# Balatro Mod Development

Create and debug Balatro mods with Steamodded, Lovely, and SMODS.

## Repo Type Awareness

**First, determine repo type:**

| Type | Description | Implications |
|------|-------------|--------------|
| `new` | My own mod from scratch | Full docs, Logger.lua, localization (en-us/zh-cn) |
| `fork` | Contributing to others' mod | Minimal changes, temp logs only, follow existing patterns |

See `templates/project-rules-template.md` for detailed rules per type.

## Quick Agent Selection

When researching, spawn the right agent:

| Need to find... | Use agent | Search boundary |
|-----------------|-----------|----------------|
| Game function implementation | `game-source-researcher` | `Balatro_src/` only |
| SMODS API usage/hooks | `smods-api-researcher` | `smods/` only |
| How other mods do X | `mod-pattern-researcher` | `Mods/` folder only |
| Lovely patch syntax | `lovely-patch-researcher` | lovely files only |
| Run temp script for data | `script-runner` | N/A (execution) |

**Parallel vs Sequential:**
- **Parallel:** When researching DIFFERENT sources (game + SMODS + mods) - spawn multiple agents at once
- **Sequential:** When second query depends on first result

## File Naming Convention (Claude & Codex)

Both Claude and Codex use the same file structure:

| File | Purpose | Git |
|------|---------|-----|
| `INIT.md` | Project rules, constraints for AI agents | ignored |
| `AGENT.md` | Mod structure, functions, dependencies, dev status (for handover) | tracked |
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
├── knowledge-base.md            # Issues & lessons
└── AGENT.md                     # Repo structure (AI)
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
5. Update .gitignore with agent folders

**Then for OWN repos:** Also check manifest, scripts version (2.0.1), add create_release.sh, Logger.lua

**Then for FORK repos:** Keep AGENT.md lightweight, use fork-mode INIT.md, don't add release scripts

## Workflow: Debugging

1. Check platform (desktop vs mobile)
2. Search game source for function
3. Check other mods for implementations
4. Add logs (Logger.lua for own, temp for fork)
5. Check Lovely logs
6. **If fix fails 3+ times:** Document in `docs/knowledge-base.md`

## Workflow: Update User Docs

When user says "update all user docs":
1. Review ALL files: README(_zh).md, CHANGELOG(_zh).md
2. Review docs/: description.md, NEXUSMODS_DESCRIPTION.txt
3. Update version in {ModName}.json, manifest.json
4. Ensure EN/ZH consistency

## Workflow: Draft PR Message (fork repos)

When user says "draft a PR message":

1. **Compare branches**: Show diff between current branch and upstream main
2. **Summarize changes**: List what was added/changed/fixed
3. **Draft message**: Casual, conversational tone - NOT formal bullet points

### PR Message Style Guide:

**DO:**
- Write like you're explaining to a friend
- Share reasoning and context ("I noticed...", "This matters because...")
- Mention alternatives you considered
- Acknowledge limitations ("if this feels overkill, I totally get it")
- Offer to help with related issues
- Use simple paragraphs, not heavy formatting

**DON'T:**
- Use formal PR templates
- Heavy bullet point lists
- Corporate language ("This PR implements...")
- Overly brief descriptions

### Example Structure:
```
{Brief title describing the change}

{What you did - 1-2 sentences}

{Why you did it / context - explain the problem}

{Technical details if relevant - keep it readable}

{Optional: alternatives considered, suggestions, or limitations}

{Optional: offer to help with related issues}
```

### Example Tone:
> "I just noticed that v1.9.3 added no-SMODS support, but my earlier fix relied on the SMODS API. I managed to make it work only with Lovely."
>
> "The logic is actually pretty simple: draw background first, then jokers, then label on top. The code looks more involved than it is..."
>
> "Anyway, if this feels overkill for this function, I totally get it, happy to just keep it in my fork."

## Sub-Agents for Research

**Philosophy:** Main agent handles code development. Sub-agents handle information gathering.

**Output Constraint (ALL research agents):** Keep report under 100 lines. Focus on:
1. Direct answer to the question
2. Key code locations (file:line)
3. One code snippet (most relevant)

### When to Use Sub-Agents

| Situation | Use Sub-Agent |
|-----------|---------------|
| Finding game functions | `game-source-researcher` |
| Understanding SMODS API | `smods-api-researcher` |
| Finding mod patterns | `mod-pattern-researcher` |
| Figuring out Lovely patches | `lovely-patch-researcher` |
| Running temp scripts for data | `script-runner` |
| Writing/editing code | **Main agent** (no sub-agent) |
| User interaction needed | **Main agent** (sub-agents can't ask questions) |

### Available Sub-Agents

Templates in `templates/agents/`:

| Agent | Purpose | Search Boundary |
|-------|---------|-----------------|
| `game-source-researcher` | Search Balatro source for functions, data | `Balatro_src/` only |
| `smods-api-researcher` | Find SMODS API patterns, hooks | `smods/src/` only |
| `mod-pattern-researcher` | Find how other mods implement features | `Mods/` folder only |
| `lovely-patch-researcher` | Find Lovely patch syntax and examples | `smods/lovely/` only |
| `script-runner` | Run temp scripts, return results | N/A (execution) |

### Sub-Agent Boundaries (IMPORTANT)

**Each research agent has a FIXED search boundary.** This prevents duplicate searches wasting tokens.

| Agent | Searches IN | Does NOT search |
|-------|-------------|-----------------|
| `game-source-researcher` | `~/Development/GitWorkspace/Balatro_src/` | smods, Mods, lovely |
| `smods-api-researcher` | `~/Development/GitWorkspace/smods/src/` | game source, Mods |
| `mod-pattern-researcher` | `~/Library/Application Support/Balatro/Mods/` | game source, smods |
| `lovely-patch-researcher` | `~/Development/GitWorkspace/smods/lovely/` | game source, Mods |

**If a sub-agent needs to expand beyond its boundary:**
1. Stop and report what was found
2. Suggest which OTHER agent should search the expanded area
3. Do NOT expand search without main agent approval

### Script Runner Sub-Agent

When main agent needs to run a temporary script to get data (not as the solution, just to extract/process info):

**Use cases:**
- Image processing with PIL
- Data extraction from files
- Quick calculations
- Format conversions

**Pattern:**
```
Main Agent: I need to extract image dimensions
    ↓
Script Runner Sub-Agent: Run `python3 -c "from PIL import Image; ..."`, return result
    ↓
Main Agent: Use result to continue with actual solution
```

**Do NOT use main agent to run temp scripts** - delegate to script-runner to keep focus on the actual problem.

### Platform-Specific Setup

| Platform | Agent Location | Invocation |
|----------|----------------|------------|
| Claude | `.claude/agents/` | Automatic via description, or explicit "Use the X agent" |
| Codex | Use Task tool | `Task("Research game source for...", agent_prompt)` |

**Claude:** Copy agent templates to `.claude/agents/` - they auto-trigger based on description.

**Codex:** Use the Task tool with the agent's system prompt as context:
```
Task: Research how G.FUNCS.evaluate_poker_hand works
Context: [paste from game-source-researcher.md]
```

### Workflow Pattern

```
Main Agent: Receive user request
    ↓
Sub-Agent: Research game source / SMODS API / mod patterns
    ↓
Main Agent: Review research, write code
    ↓
Script Runner: (if needed) Run temp script, return data
    ↓
Main Agent: Complete implementation, test, user feedback
```

### Creating Sub-Agents

Agent template structure (works for both Claude and Codex):

```markdown
---
name: agent-name
description: When to use this agent (triggers automatic selection)
tools: Read, Grep, Glob, Bash
model: sonnet
---

<role>What this agent does</role>
<workflow>Step-by-step process</workflow>
<output_format>How to report findings</output_format>
<constraints>What NOT to do</constraints>
```

**Key Rules:**
- Sub-agents cannot interact with users (no AskUserQuestion)
- Use `tools:` to restrict access (Read, Grep, Glob for research; no Write/Edit)
- Sub-agents return a final report to main agent
- Use XML tags for structure, not markdown headings

## Skill Structure

```
balatro-mod-skill/
├── SKILL.md                    # This file
├── agents/openai.yaml          # Codex UI metadata
├── patterns/                   # Detailed pattern guides
│   ├── lovely-patches.md       # Lovely.toml syntax
│   ├── smods-api.md            # SMODS patterns
│   ├── mobile-compat.md        # Desktop vs mobile
│   └── ui-system.md            # UIBox, CardArea
├── references/                 # Game reference docs
│   ├── game-files.md           # Game source map
│   └── globals.md              # G.GAME, G.STATES
├── scripts/                    # Script templates
│   ├── sync_to_mods.template.sh
│   ├── create_release.template.sh
│   └── mod-scripts-guide.md
└── templates/                  # Mod setup templates
    ├── agents/                 # Sub-agent templates (shared)
    │   ├── game-source-researcher.md
    │   ├── smods-api-researcher.md
    │   ├── mod-pattern-researcher.md
    │   └── lovely-patch-researcher.md
    ├── docs/                   # User doc templates
    │   ├── description-template.md
    │   ├── NEXUSMODS_DESCRIPTION-template.txt
    │   └── knowledge-base-template.md
    └── claude-config/          # Claude hooks/commands
        ├── hooks.json          # SessionStart, PreToolUse, PostToolUse, Stop
        ├── commands/           # Command templates
        │   ├── sync-mod.md
        │   ├── bump-version.md
        │   ├── release.md
        │   ├── refactor.md
        │   ├── debug.md
        │   ├── draft-pr.md
        │   ├── update-docs.md
        │   └── update-skill.md
        └── init-balatro-mod.md # Init command
```

## Templates for Mod Repos

When setting up a new mod repo, copy these templates:

| Template | Destination | Purpose |
|----------|-------------|---------|
| `templates/claude-config/hooks.json` | `.claude/hooks/hooks.json` | Claude hooks |
| `templates/claude-config/commands/*` | `.claude/commands/` | Claude commands |
| `templates/agents/*` | `.claude/agents/` (Claude) | Research sub-agents |
| `templates/agents/*` | Reference for Task tool (Codex) | Research prompts |
| `templates/project-rules-template.md` | `INIT.md` | Project rules |
| `templates/agent-md-template.md` | `AGENT.md` | Repo documentation |

Commands available after setup:
- `/init-balatro-mod` - Initialize new mod
- `/sync-mod` - Start sync with watch mode (run once at start)
- `/bump-version [patch|minor|major]` - Increment version, update changelogs
- `/release` - Create release packages (auto-detects version from manifests)
- `/fix-sprites <directory> [--preview]` - Fix grey borders on sprites
- `/refactor [focus-area]` - Review code for redundancy, outdated fallbacks, modularization
- `/debug` - Verify fix by checking Lovely logs (auto-detects mod key from repo)
- `/draft-pr` - Draft PR message (for forks)
- `/update-docs` - Review all user docs
- `/update-skill [file|instruction]` - Update skill based on new knowledge

Sub-agents available after setup:
- `game-source-researcher` - Find game functions and injection points
- `smods-api-researcher` - Find SMODS API patterns and usage
- `mod-pattern-researcher` - Find how other mods implement features
- `lovely-patch-researcher` - Find Lovely patch syntax and examples
- `script-runner` - Run temp scripts and return results
