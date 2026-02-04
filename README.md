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
| Reference docs | Game file map, global variables |
| Script templates | Sync to mods, create release |
| Project templates | INIT.md, AGENT.md, mod.config.json |
| Commands | `/sync-mod`, `/release`, `/debug`, `/refactor`, etc. |
| Sub-agents | Research game source, SMODS API, mod patterns |

## Repository Structure

```
Open-Balatro/
├── skills/
│   └── balatro-mod-dev/        # The skill
│       ├── SKILL.md            # Main entry point
│       ├── agents/openai.yaml  # Codex UI metadata
│       ├── patterns/           # Pattern guides
│       ├── references/         # Game reference docs
│       ├── scripts/            # Script templates
│       └── templates/          # Mod setup templates
├── .claude/skills/             # Other Claude skills
└── .codex/skills/              # Other Codex skills
```

## Contributing

See [contributing.md](contributing.md) for guidelines.

## License

MIT
