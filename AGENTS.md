# Open-Balatro - Agent Guide

This repository contains the `balatro-mod-dev` skill for AI-assisted Balatro mod development.

## Repository Structure

```
Open-Balatro/
├── balatro-mod-skill/          # The main skill
│   ├── SKILL.md                # Skill entry point
│   ├── agents/openai.yaml      # Codex UI metadata
│   ├── patterns/               # Lovely, SMODS, mobile, UI guides
│   ├── references/             # Game file map, globals
│   ├── scripts/                # sync_to_mods, create_release templates
│   └── templates/              # Project setup templates
│       ├── agents/             # Sub-agent templates
│       ├── docs/               # User doc templates
│       └── claude-config/      # Hooks, commands
├── .claude/skills/             # Other Claude skills
└── .codex/skills/              # Other Codex skills
```

## Key Design Decisions

### No Symlinks Required

The skill uses **absolute paths** to reference external resources. No setup needed.

| Resource | macOS Path |
|----------|------------|
| Game Source (desktop) | `~/Development/GitWorkspace/Balatro_src/desktop/` |
| Game Source (mobile) | `~/Development/GitWorkspace/Balatro_src/ios_plus/` |
| Steamodded Source | `~/Development/GitWorkspace/smods/src/` |
| Installed Mods | `~/Library/Application Support/Balatro/Mods/` |
| Lovely Logs | `~/Library/Application Support/Balatro/Mods/lovely/log/` |

### File Convention (mod repos)

Both Claude and Codex use the same file structure in mod repos:

| File | Purpose |
|------|---------|
| `INIT.md` | Project rules, constraints for AI agents |
| `AGENT.md` | Mod-specific structure, functionality |
| `mod.config.json` | File lists for sync/release scripts |

### Four-Layer Architecture

```
Layer 0: Workspace Setup
├── Skill installed in ~/.claude/skills/ or ~/.codex/skills/
└── MCP: Desktop Commander for file access

Layer 1: Skill (balatro-mod-dev)
├── Resource paths, game file map
├── Lovely syntax, SMODS patterns
├── Mobile/desktop differences
└── Script templates

Layer 2: Hooks & Commands (per-mod)
├── SessionStart: Load mod context
├── PreToolUse: Protect AGENT.md
├── PostToolUse: Suggest config updates
└── Commands: /sync-mod, /release, /debug, /refactor

Layer 3: Per-Mod Config
├── AGENT.md: Mod-specific behavior
├── mod.config.json: File lists
└── scripts/*.sh: Utility scripts

Layer 4: External References (read-only)
├── Game source
├── Installed mods
└── Lovely logs
```

### Workflow Components

| Component | Purpose |
|-----------|---------|
| **Skill** | Static knowledge (patterns, references, paths) |
| **Hooks** | Automated triggers (protect files, suggest updates) |
| **Commands** | User-initiated actions (/sync-mod, /release, /debug) |
| **Sub-agents** | Research tasks (game source, SMODS API, mod patterns) |
| **mod.config.json** | Per-mod file lists |
| **AGENT.md** | Per-mod specific behavior |

### Repo Type Awareness

| Type | Description | Implications |
|------|-------------|--------------|
| `new` | My own mod from scratch | Full docs, Logger.lua, localization |
| `fork` | Contributing to others' mod | Minimal changes, temp logs, follow existing patterns |

## Modifying This Skill

1. **SKILL.md must have YAML frontmatter** with `name` and `description`
2. **Keep SKILL.md under 500 lines** - use pattern/reference files for details
3. **Update agents/openai.yaml** if changing skill name or description
4. **Test changes** by using the skill in an actual mod repo

## Skill Design Principles

- **Progressive Disclosure**: Metadata → SKILL.md → reference files
- **Concise is Key**: Only add what AI doesn't already know
- **Main agent for code, sub-agents for research**
- **No extraneous files** in skill folders
