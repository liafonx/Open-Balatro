# Open-Balatro

AI skill for Balatro mod development with Claude and Codex. Version 1.2.0.

## What is This?

A skill that teaches AI agents how to develop Balatro mods using:
- **Steamodded (SMODS)** - Mod loader and API
- **Lovely** - Lua injection framework
- **Malverk** - Texture pack API
- **Codeagent** - Routed sub-agent execution (configurable backends)

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
| Sub-agents | Research game source, SMODS API, mod patterns (via codeagent routing) |
| run_subagent.sh | Adapter that resolves per-mod backend config and routes through codeagent |

## Configurable Backends

Sub-agent backends are configurable per-mod in `mod.config.json`:

```json
"agent_backends": {
  "research": "claude",
  "execution": "codex",
  "overrides": {}
},
"source_paths": {
  "game_desktop": "~/path/to/Balatro_src/desktop",
  "steamodded": "~/path/to/smods/src",
  "mods": "~/path/to/Balatro/Mods"
}
```

Resolution: per-agent override → category default → template fallback.
These are hints — [codeagent](https://github.com/liafonx/myclaude) owns final invocation policy.

## Repository Structure

```
Open-Balatro/
├── skills/
│   └── balatro-mod-dev/        # The skill (v1.2.0)
│       ├── SKILL.md            # Main entry point
│       ├── agents/openai.yaml  # Codex UI metadata
│       ├── patterns/           # Pattern guides
│       ├── references/         # Game reference docs, sub-agent system
│       ├── scripts/            # Script templates + run_subagent.sh adapter
│       └── templates/          # Mod setup templates
│           └── agents/         # Sub-agent templates (codeagent-compatible)
├── .agents/skills/             # Shared agent skills
└── .codex/skills/              # Codex skills
```

## Contributing

See [contributing.md](contributing.md) for guidelines.

## License

MIT
