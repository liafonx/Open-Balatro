# Open-Balatro

AI skill for Balatro mod development with Claude and Codex.

## What is This?

A skill that teaches AI agents how to develop Balatro mods using:
- **Steamodded (SMODS)** - Mod loader and API
- **Lovely** - Lua injection framework
- **Malverk** - Texture pack API

## Installation

### Using skill-installer (Codex)

```
$skill-installer install https://github.com/liafonx/Open-Balatro/tree/main/skills/balatro-mod-dev
```

### Using npx skills CLI

```bash
npx skills add https://github.com/liafonx/Open-Balatro --skill balatro-mod-dev
```

### Manual Installation

**Claude Code:**
```bash
cp -r skills/balatro-mod-dev ~/.claude/skills/
```

**Codex:**
```bash
cp -r skills/balatro-mod-dev ~/.codex/skills/
```

## What's Included

| Component | Purpose |
|-----------|---------|
| Pattern guides | Lovely patches, SMODS API, mobile compat, UI system |
| Reference docs | Game file map, global variables, sub-agent system |
| Script templates | Sync to mods, create release, fix sprites |
| Project templates | INIT.md, AGENT.md, mod.config.json |
| Commands | `/sync-mod`, `/release`, `/debug`, `/refactor`, `/fix-sprites`, etc. |
| Sub-agents | Research game source, SMODS API, mod patterns, write code (via Task tool) |

## Architecture

The main agent (Opus) orchestrates all work. Sub-agents (Sonnet/Haiku) handle research, code writing, and script execution via the built-in Task tool with model selection.

```
Main Agent (Opus) → Task tool (model: sonnet|haiku) → Sub-agents
     ↑                                                    │
     └──────────────── recap ─────────────────────────────┘
```

Source paths are configured per-mod in `mod.config.json`:

```json
"source_paths": {
  "game_desktop": "~/path/to/Balatro_src/desktop",
  "steamodded": "~/path/to/smods/src",
  "mods": "~/path/to/Balatro/Mods"
}
```

## Repository Structure

```
Open-Balatro/
├── skills/
│   └── balatro-mod-dev/        # The skill
│       ├── SKILL.md            # Main entry point
│       ├── agents/openai.yaml  # Codex UI metadata
│       ├── patterns/           # Pattern guides
│       ├── references/         # Game reference docs, sub-agent system
│       ├── scripts/            # Script templates
│       └── templates/          # Mod setup templates
│           └── agents/         # Sub-agent templates (7 agents)
├── .agents/skills/             # Shared agent skills
└── .codex/skills/              # Codex skills
```

## Contributing

See [contributing.md](contributing.md) for guidelines.

## License

MIT
