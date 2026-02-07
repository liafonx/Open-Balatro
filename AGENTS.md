# Open-Balatro - Agent Guide

This repository contains the `balatro-mod-dev` skill for AI-assisted Balatro mod development.

## Repository Structure

```
Open-Balatro/
├── skills/
│   └── balatro-mod-dev/        # The main skill
│       ├── SKILL.md            # Skill entry point
│       ├── agents/openai.yaml  # Codex UI metadata
│       ├── patterns/           # Lovely, SMODS, mobile, UI guides
│       ├── references/         # Game file map, globals, sub-agent system
│       ├── scripts/            # sync_to_mods, create_release, run_subagent, fix_sprites
│       └── templates/          # Project setup templates
│           ├── agents/         # Sub-agent templates (codeagent-compatible)
│           ├── docs/           # User doc templates
│           └── claude-config/  # Hooks, commands
├── .agents/skills/             # Shared agent skills
└── .codex/skills/              # Codex skills
```

## Installation

### Using skill-installer (Codex)
```
$skill-installer install https://github.com/liafonx/Open-Balatro/tree/main/skills/balatro-mod-dev
```

### Using npx skills CLI
```bash
npx skills add https://github.com/liafonx/Open-Balatro --skill balatro-mod-dev
```

### Manual
```bash
# Claude Code
cp -r skills/balatro-mod-dev ~/.claude/skills/

# Codex
cp -r skills/balatro-mod-dev ~/.codex/skills/
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
| `mod.config.json` | File lists, backend config, source paths for sync/release/agents |

### Configurable Backends

Sub-agent backends are configurable per-mod via `mod.config.json`:

```json
"agent_backends": {
  "research": "claude",
  "execution": "codex",
  "overrides": {}
},
"source_paths": {
  "game_desktop": "~/Development/GitWorkspace/Balatro_src/desktop",
  "steamodded": "~/Development/GitWorkspace/smods/src",
  "mods": "~/Library/Application Support/Balatro/Mods"
}
```

Resolution order: per-agent override → category default → agent template fallback.
These are backend **hints** — codeagent owns final invocation policy.

Codeagent runtime ownership:
- `~/.codeagent/models.json`:
  - `agents.*` for agent presets
  - `backends.*` for backend runtime defaults and API settings (`model`, `reasoning`, `skip_permissions`, `base_url`, `api_key`, `use_api`)
- `~/.codeagent/config.yaml`: global fallback defaults.

### Codeagent Integration

Sub-agents route through the `codeagent` skill (never direct `codeagent-wrapper` calls):

```
run_subagent.sh → reads mod.config.json → route_subagent.sh → codeagent-wrapper
```

Parallel metadata normalization:
- `run_subagent.sh` normalizes both `workdir: ~/...` and `working_dir: ~/...` to `$HOME/...` before routing.

| Concern | Owned by |
|---------|----------|
| Task decomposition, backend hints, source paths | balatro-mod-dev (`mod.config.json`) |
| Backend routing + model/API behavior | codeagent (`~/.codeagent/models.json` primary, `~/.codeagent/config.yaml` fallback) |

### Five-Layer Architecture

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
└── Commands: /sync-mod, /release, /debug, /refactor, /fix-sprites

Layer 3: Per-Mod Config
├── AGENT.md: Mod-specific behavior
├── mod.config.json: File lists + agent backend config + source paths
└── scripts/*.sh: Utility scripts

Layer 4: Codeagent Routing
├── run_subagent.sh: Adapter (resolves config → routes)
├── route_subagent.sh: Codeagent entrypoint
└── ~/.codeagent/: models.json (agents/backends, use_api), config.yaml (global fallback)

Layer 5: External References (read-only)
├── Game source
├── Installed mods
└── Lovely logs
```

### Workflow Components

| Component | Purpose |
|-----------|---------|
| **Skill** | Static knowledge (patterns, references, paths) |
| **Hooks** | Automated triggers (protect files, suggest updates) |
| **Commands** | User-initiated actions (/sync-mod, /release, /debug, /fix-sprites) |
| **Sub-agents** | Research tasks via codeagent routing |
| **run_subagent.sh** | Adapter: resolves mod config → routes through codeagent |
| **mod.config.json** | Per-mod file lists, backend hints, source paths |
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
