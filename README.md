# Open-Balatro

Claude Code plugin for Balatro mod development with Steamodded, Lovely, and SMODS.

## What is This?

A plugin that teaches Claude how to develop Balatro mods using:
- **Steamodded (SMODS)** - Mod loader and API
- **Lovely** - Lua injection framework
- **Malverk** - Texture pack API

## Installation

### Plugin Directory (Local)

```bash
claude --plugin-dir ./balatro-mod-dev
```

### Marketplace (when available)

```bash
claude plugin install balatro-mod-dev
```

## What's Included

| Component | Count | Purpose |
|-----------|-------|---------|
| Skills | 1 | `balatro-mod-dev` — game knowledge, patterns, references |
| Agents | 11 | Research, debug inspection, code writing, review (Sonnet + Opus + Haiku) |
| Commands | 16 | `/familiar`, `/init`, `/sync-mod`, `/debug`, `/refactor`, etc. |
| Hooks | 9 | Session init, file protection, task model enforcement, session memory |
| Script templates | 4 | Sync to mods, create release, fix sprites |
| Project templates | 10+ | INIT.md, AGENT.md, mod.config.json, Lua rules |

## Architecture

The main agent (Sonnet) orchestrates all work. Sub-agents handle research, code writing, and specialized reasoning via the Task tool.

```
Main Agent (Sonnet)  →  Sonnet sub-agents (research, code writing)
                     →  Opus sub-agents (code review, synthesis, planning)
                     →  Haiku sub-agents (scripts)
         ↑                    ↓
         └──────── recap ─────┘
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
├── balatro-mod-dev/            # THE PLUGIN (distributable)
│   ├── .claude-plugin/
│   │   └── plugin.json         # Manifest (name, version, description)
│   ├── skills/balatro-mod-dev/ # Skill knowledge (patterns, references)
│   ├── agents/                 # 11 sub-agent templates
│   ├── commands/               # 16 command templates
│   ├── hooks/                  # 9 hooks + JS scripts
│   ├── scripts/                # Utility scripts (sync, release, fix-sprites)
│   └── templates/              # Project setup templates
│       └── rules/              # Scaffolded to .claude/rules/ by /init
├── docs/                       # NOT part of plugin (longform guides, reference)
├── .claude/rules/              # THIS repo's rules
└── README.md
```

## Contributing

See [AGENT.md](AGENT.md) for plugin architecture and development guidelines.

## License

MIT
