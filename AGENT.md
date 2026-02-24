# Open-Balatro - Agent Guide

This repository contains the `balatro-mod-dev` Claude Code plugin for AI-assisted Balatro mod development.

## Repository Structure

```
Open-Balatro/
├── balatro-mod-dev/                    # THE PLUGIN (distributable)
│   ├── .claude-plugin/
│   │   └── plugin.json                 # Manifest (name, version, description)
│   ├── skills/balatro-mod-dev/
│   │   ├── SKILL.md                    # Skill entry point
│   │   ├── patterns/                   # Lovely, SMODS, mobile, UI guides
│   │   └── references/                 # Game file map, globals, sub-agent system
│   ├── agents/                         # 11 sub-agent templates
│   ├── commands/                       # 16 command templates
│   ├── hooks/
│   │   ├── hooks.json                  # 9 hook scripts (6 hook types)
│   │   └── scripts/                   # Hook executor scripts (JS)
│   ├── scripts/                        # Utility scripts (sync, release, fix-sprites)
│   └── templates/                      # Project setup templates
│       ├── hookify/                    # 3 Hookify rules (scaffolded to .claude/ by /init)
│       ├── rules/                      # 4 rules (scaffolded to .claude/rules/ by /init)
│       └── docs/                       # User doc templates
├── docs/                               # NOT part of plugin (longform guides, reference)
│   ├── the-longform-guide.md
│   ├── the-shortform-guide.md
│   ├── claude-code-plugins/            # Sample plugins
│   ├── hooks/                          # Hook examples
│   └── rules/                          # Installable rules (separate from plugin)
├── .claude/rules/                       # THIS repo's rules (NOT part of plugin)
└── README.md                           # Repository documentation
```

### IMPORTANT: `.claude/` Is NOT Part of the Plugin

`.claude/` belongs to **this repo** (Open-Balatro) only. It does NOT ship with the plugin.

- Do NOT put plugin-specific content (hook tables, agent lists, etc.) in `.claude/rules/`
- Plugin documentation belongs in `balatro-mod-dev/README.md`
- `.claude/rules/` is for general coding/workflow rules that apply when working on this repo
- The plugin scaffolds its own `.claude/rules/` into **target mod repos** via `/init` — that's a different `.claude/`

## Installation

### Plugin Directory (Local)
```bash
claude --plugin-dir ./balatro-mod-dev
```

### Marketplace (when available)
```bash
claude plugin install balatro-mod-dev
```

## Key Design Decisions

### No Symlinks Required

The plugin uses **absolute paths** to reference external resources. No setup needed.

| Resource | macOS Path |
|----------|------------|
| Game Source (desktop) | `~/Development/GitWorkspace/Balatro_src/desktop/` |
| Game Source (mobile) | `~/Development/GitWorkspace/Balatro_src/ios_plus/` |
| Steamodded Source | `~/Development/GitWorkspace/smods/src/` |
| Installed Mods | `~/Library/Application Support/Balatro/Mods/` |
| Lovely Logs | `~/Library/Application Support/Balatro/Mods/lovely/log/` |

### File Convention (mod repos)

| File | Purpose | Git |
|------|---------|-----|
| `INIT.md` | Project rules, constraints for AI agents | ignored |
| `AGENT.md` | Mod-specific structure, functionality | ignored |
| `mod.config.json` | File lists, source paths for sync/release/agents | ignored |

All three live at the **project root** and are git-ignored (dev-only, not shipped).

### Delegation Architecture

The main agent (Sonnet) orchestrates all work. Sub-agents execute research, code writing, and script running via the built-in Task tool.

```
Main Agent (Sonnet)  →  Sonnet sub-agents (research, code writing)
                     →  Opus sub-agents (code review, synthesis, planning)
                     →  Haiku sub-agents (scripts)
         ↑                    ↓
         └──────── recap ─────┘
```

| Role | Model | Examples |
|------|-------|---------|
| Orchestration, decisions, user interaction | Sonnet (main) | Planning, presenting results, small edits |
| Research, code writing, exploration | Sonnet (sub-agent) | game-source-researcher, code-writer |
| Code review, synthesis, strategic planning | Opus (sub-agent) | code-reviewer, research-analyst, strategic-planner |
| Script execution | Haiku (sub-agent) | script-runner |

Source paths are configured in `mod.config.json > source_paths` — the main agent reads these and includes them in Task prompts.

### Agent Roster (11 agents)

| Agent | Model | Role |
|-------|-------|------|
| `game-source-researcher` | sonnet | Find game functions and injection points |
| `smods-api-researcher` | sonnet | Find SMODS API patterns |
| `mod-pattern-researcher` | sonnet | Find how other mods implement X |
| `lovely-patch-researcher` | sonnet | Find Lovely patch syntax |
| `project-explorer` | sonnet | Map mod architecture |
| `debug-inspector` | sonnet | Inspect runtime logs, dumps, mod compatibility |
| `code-writer` | sonnet | Execute implementation plans |
| `script-runner` | haiku | Run temp scripts |
| `code-reviewer` | opus | Review code (confidence ≥ 80 filter) |
| `research-analyst` | opus | Synthesize multi-source research |
| `strategic-planner` | opus | Plan complex implementations |

### Plugin Architecture

```
Layer 0: Plugin Install
└── Plugin auto-loads: 16 commands, 11 agents, 1 skill, 9 hooks + 3 Hookify rules

Layer 1: Skill (balatro-mod-dev)
├── Resource paths, game file map
├── Lovely syntax, SMODS patterns
├── Mobile/desktop differences
└── Script templates

Layer 2: Hooks & Commands (auto-loaded by plugin)
├── SessionStart: Load INIT.md/AGENT.md context + previous session from ~/.claude/sessions/
├── SessionEnd: Parse JSONL transcript, write session summary to ~/.claude/sessions/
├── PreToolUse: Protect files, block external reads, enforce task model, suggest compact
├── PostToolUse: Suggest config updates
├── PreCompact: Append compaction marker to session file
├── Stop: Offer PR drafting for fork contributions
└── Commands: /init, /familiar, /sync-mod, /release, /debug, /refactor, /fix-sprites, ...

Layer 3: Per-Mod Config
├── AGENT.md: Mod-specific behavior
├── mod.config.json: File lists + source paths
├── .claude/rules/: Lua rules (scaffolded by /init)
└── scripts/*.sh: Utility scripts

Layer 4: External References (read-only, accessed via sub-agents)
├── Game source
├── Installed mods
└── Lovely logs
```

## Modifying This Plugin

1. **SKILL.md must stay under 300 lines** — use pattern/reference files for details
2. **Version in `plugin.json`** is the single source of truth (no skill-version markers)
3. **Test changes** by loading with `claude --plugin-dir ./balatro-mod-dev`

### Verification
```bash
# Check no stale skill-version markers
grep -r "skill-version\|skill_version" balatro-mod-dev/

# Check no Codex remnants
grep -ri "codex\|openai\.yaml\.codex" balatro-mod-dev/ --include="*.md" --include="*.json"

# Verify agent count (should be 11)
ls balatro-mod-dev/agents/*.md | wc -l

# Verify command count (should be 16)
ls balatro-mod-dev/commands/*.md | wc -l
```

### Doc Sync Checklist

When adding agents, commands, or hooks — update **both** README files:

| File | Counts to keep in sync |
|------|------------------------|
| `README.md` (root) | agents, commands, hooks in "What's Included" table + structure diagram |
| `balatro-mod-dev/README.md` | agents table, commands table, hooks table |
| `AGENT.md` → Layer 0 line | agent count in architecture diagram |

## Plugin Design Principles

- **Progressive Disclosure**: Metadata → SKILL.md → reference files
- **Concise is Key**: Only add what AI doesn't already know
- **Sonnet orchestrates; Opus for deep reasoning; Haiku for scripts**
- **Explicit tool lists**: Read-only agents can't modify files
- **Deterministic hooks**: Simple path matching uses JS scripts, not LLM tokens
