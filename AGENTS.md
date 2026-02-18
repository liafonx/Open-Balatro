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
│       ├── scripts/            # sync_to_mods, create_release, fix_sprites
│       └── templates/          # Project setup templates
│           ├── agents/         # Sub-agent templates (Task tool compatible)
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

| File | Purpose | Git | Version-tracked? |
|------|---------|-----|-----------------|
| `INIT.md` | Project rules, constraints for AI agents | ignored | Yes (`<!-- skill-version: X.Y.Z -->`) |
| `AGENT.md` | Mod-specific structure, functionality | ignored | No (fully custom) |
| `mod.config.json` | File lists, source paths for sync/release/agents | ignored | No (fully custom) |

All three live at the **project root** and are git-ignored (dev-only, not shipped). INIT.md is generated from `project-rules-template.md` and carries a version marker so `/update` can refresh its rules while preserving mod-specific sections.

### Opus Orchestrator Architecture

The main agent (Opus) orchestrates all work. Sub-agents (Sonnet/Haiku) execute research, code writing, and script running via the built-in Task tool.

```
Main Agent (Opus) → Task tool (model: sonnet|haiku) → Sub-agents
     ↑                                                    │
     └──────────────── recap ─────────────────────────────┘
```

| Role | Model | Examples |
|------|-------|---------|
| Orchestration, planning, review, synthesis | Opus (main) | Strategy, code review, decisions |
| Research, code writing, exploration | Sonnet (sub-agent) | game-source-researcher, code-writer |
| Script execution | Haiku (sub-agent) | script-runner |

**CRITICAL: The `model` parameter is REQUIRED on every Task tool call.** Omitting `model` causes the sub-agent to inherit the parent model (Opus). Always specify `model: "sonnet"` or `model: "haiku"` explicitly.

Source paths are configured in `mod.config.json > source_paths` — the main agent reads these and includes them in Task prompts.

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
├── SessionStart: Read INIT.md, inject delegation rules (Task tool + model selection)
├── PreToolUse: Protect AGENT.md, enforce delegation, block Opus sub-agents
├── PostToolUse: Suggest config updates
└── Commands: /sync-mod, /release, /debug, /refactor, /fix-sprites

Layer 3: Per-Mod Config
├── AGENT.md: Mod-specific behavior
├── mod.config.json: File lists + source paths
└── scripts/*.sh: Utility scripts

Layer 4: External References (read-only, accessed via sub-agents)
├── Game source
├── Installed mods
└── Lovely logs
```

### Workflow Components

| Component | Purpose |
|-----------|---------|
| **Skill** | Static knowledge (patterns, references, paths) |
| **Hooks** | Automated triggers (protect files, enforce delegation, suggest updates) |
| **Commands** | User-initiated actions (/sync-mod, /release, /debug, /fix-sprites) |
| **Sub-agents** | Research and code tasks via Task tool (model: sonnet/haiku) |
| **mod.config.json** | Per-mod file lists, source paths |
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
4. **Bump `skill-version`** in all maintained files when releasing (see below)
5. **Test changes** by using the skill in an actual mod repo

### Version Tracking

SKILL.md declares the canonical version. All **maintained files** (26 total) carry a matching `skill-version` marker so `/update` can detect stale deployments:

| Category | Count | Marker format | Location |
|---|---|---|---|
| Commands | 13 | `skill-version: X.Y.Z` (YAML frontmatter) | `templates/claude-config/commands/*.md` |
| Agents | 7 | `skill-version: X.Y.Z` (YAML frontmatter) | `templates/agents/*.md` |
| Hookify rules | 2 | `skill-version: X.Y.Z` (YAML frontmatter) | `templates/claude-config/hookify.*.local.md` |
| hooks.json | 1 | `"skill_version": "X.Y.Z"` (JSON field) | `templates/claude-config/hooks.json` |
| Scripts | 2 | `# skill-version: X.Y.Z` (comment) | `scripts/*.template.sh` |
| INIT.md template | 1 | `<!-- skill-version: X.Y.Z -->` (HTML comment) | `templates/project-rules-template.md` |

**Scaffold templates** (gitignore, AGENT.md, mod-json, manifest-json, logger, docs) are one-time use and not version-tracked — `/update` never replaces them.

## Skill Design Principles

- **Progressive Disclosure**: Metadata → SKILL.md → reference files
- **Concise is Key**: Only add what AI doesn't already know
- **Opus orchestrates, Sonnet/Haiku execute**
- **No extraneous files** in skill folders
