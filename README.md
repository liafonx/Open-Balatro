# Open-Balatro

AI skill for Balatro mod development with Claude and Codex.

## What is This?

A skill that teaches AI agents how to develop Balatro mods using:
- **Steamodded (SMODS)** - Mod loader and API
- **Lovely** - Lua injection framework
- **Malverk** - Texture pack API

## Installation

### Claude Code
```bash
cp -r balatro-mod-skill ~/.claude/skills/balatro-mod-dev
```

### Codex
```bash
cp -r balatro-mod-skill ~/.codex/skills/balatro-mod-dev
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

## Usage

When working on a Balatro mod, the AI will:
1. Read game source from configured paths
2. Apply SMODS/Lovely patterns
3. Handle mobile compatibility
4. Use sub-agents for research tasks

## Repository Structure

```
Open-Balatro/
├── balatro-mod-skill/          # The skill
│   ├── SKILL.md                # Main entry point
│   ├── agents/openai.yaml      # Codex UI metadata
│   ├── patterns/               # Pattern guides
│   ├── references/             # Game reference docs
│   ├── scripts/                # Script templates
│   └── templates/              # Mod setup templates
├── .claude/skills/             # Other Claude skills
└── .codex/skills/              # Other Codex skills
```

## License

MIT
