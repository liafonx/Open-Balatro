---
description: Update skill content based on new knowledge or instructions
allowed-tools: Read, Write, Edit, Grep, Glob, Bash
argument-hint: [knowledge-file|instruction]
---

# Update Skill

Update the `balatro-mod-dev` skill based on new knowledge or user instructions.

## Arguments

$ARGUMENTS = path to knowledge file (.md) OR direct instruction text

## Skill Location

The skill to update: `~/Development/GitWorkspace/Open-Balatro/skills/balatro-mod-dev/`

## Skill Structure

```
skills/balatro-mod-dev/
├── SKILL.md                    # Main entry (keep under 500 lines!)
├── agents/openai.yaml          # Codex UI metadata
├── patterns/
│   ├── lovely-patches.md       # Lovely.toml syntax
│   ├── smods-api.md            # SMODS patterns
│   ├── mobile-compat.md        # Desktop vs mobile
│   └── ui-system.md            # UIBox, CardArea
├── references/
│   ├── game-files.md           # Game source map
│   ├── globals.md              # G.GAME, G.STATES
│   ├── sub-agents.md           # Sub-agent system docs
│   └── lua-gotchas.md          # Lua/LuaJIT pitfalls
├── scripts/                    # Script templates
└── templates/                  # Mod setup templates
    ├── agents/                 # Sub-agent templates (9 agents)
    ├── docs/                   # User doc templates
    └── claude-config/          # Hooks, commands (13 commands)
```

## Decision Process

### 1. Analyze Input

If $ARGUMENTS is a file path:
```bash
# Read the knowledge file
cat "$ARGUMENTS"
```

If $ARGUMENTS is instruction text, use it directly.

### 2. Categorize the Update

| Category | Target File(s) | Examples |
|----------|----------------|----------|
| Lovely syntax | `patterns/lovely-patches.md` | New patch types, syntax changes |
| SMODS API | `patterns/smods-api.md` | New hooks, API changes |
| Mobile compat | `patterns/mobile-compat.md` | New platform differences |
| UI patterns | `patterns/ui-system.md` | UIBox, draw order |
| Game files | `references/game-files.md` | New file locations, functions |
| Globals | `references/globals.md` | New G.* variables |
| Workflow | `SKILL.md` | New workflows, commands |
| Commands | `templates/claude-config/commands/` | New or updated commands |
| Sub-agents | `templates/agents/`, `references/sub-agents.md` | New agents, workflow changes |
| Lua pitfalls | `references/lua-gotchas.md` | New Lua/LuaJIT gotchas |
| Project setup | `templates/` | New templates |

### 3. Evaluate Update

Before making changes, check:

- [ ] **Is this new knowledge?** Does the skill already cover this?
- [ ] **Is this correct?** Verify against source (game files, SMODS repo)
- [ ] **Is this concise?** Only add what AI doesn't already know
- [ ] **Is this in the right place?** Match category to target file

### 4. Apply Update

**For pattern/reference updates:**
- Add to appropriate section in target file
- Keep format consistent with existing content
- Include code examples where helpful

**For SKILL.md updates:**
- Check line count before/after (must stay under 500)
- If too long, move details to pattern/reference files
- Update structure diagram if adding files

**For command updates:**
- Create new .md file in `templates/claude-config/commands/`
- Update command list in SKILL.md
- Update skill structure in SKILL.md

**For template updates:**
- Add to appropriate templates/ subfolder
- Update SKILL.md templates table

### 5. Validate Changes

After updating:

```bash
# Check SKILL.md line count
wc -l ~/Development/GitWorkspace/Open-Balatro/skills/balatro-mod-dev/SKILL.md

# Verify YAML frontmatter is intact
head -10 ~/Development/GitWorkspace/Open-Balatro/skills/balatro-mod-dev/SKILL.md

# Verify command count (should be 13)
ls ~/Development/GitWorkspace/Open-Balatro/skills/balatro-mod-dev/templates/claude-config/commands/*.md | wc -l

# Verify agent count (should be 9)
ls ~/Development/GitWorkspace/Open-Balatro/skills/balatro-mod-dev/templates/agents/*.md | wc -l
```

## Report Format

```
## Skill Update Report

### Input Analyzed
{Summary of knowledge file or instruction}

### Decision
{UPDATE | SKIP | PARTIAL}

### Reason
{Why this decision was made}

### Changes Made
- {file}: {description of change}
- {file}: {description of change}

### Validation
- SKILL.md line count: {N}/500
- YAML frontmatter: {OK | BROKEN}
- Commands: {N}/13
- Agents: {N}/9

### Notes
{Any follow-up needed}
```

## Update Principles

1. **Concise is Key** - Only add what AI doesn't already know
2. **Progressive Disclosure** - Details go in pattern/reference files, not SKILL.md
3. **Verify First** - Check source repos before adding patterns
4. **Keep Structure** - Don't reorganize without good reason
5. **Test Changes** - Use skill in actual mod repo after updates
