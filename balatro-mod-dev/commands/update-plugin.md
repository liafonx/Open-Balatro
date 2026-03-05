---
description: Update plugin content based on new knowledge or instructions
allowed-tools: Read, Write, Edit, Grep, Glob, Bash
argument-hint: [knowledge-file|instruction]
---

# Update Plugin

Update the `balatro-mod-dev` plugin based on new knowledge or user instructions.

## Arguments

$ARGUMENTS = path to knowledge file (.md) OR direct instruction text

## Plugin Location

The plugin to update: `${CLAUDE_PLUGIN_ROOT}/`

## Plugin Structure

```
${CLAUDE_PLUGIN_ROOT}/
├── skills/balatro-mod-dev/
│   ├── SKILL.md                    # Main entry (keep under 300 lines!)
│   ├── patterns/                   # 4 pattern guides
│   └── references/                 # 4 reference docs
├── agents/                         # 11 agents
├── commands/                       # 16 commands
├── hooks/
│   ├── hooks.json                  # 9 command hooks
│   └── scripts/                   # Hook executor scripts
├── scripts/                        # Utility scripts
└── templates/                      # Mod setup templates
    ├── hookify/                    # 3 Hookify rules (scaffolded to .claude/ by /init)
    ├── rules/                      # 4 rules (scaffolded to .claude/rules/ by /init)
    └── docs/                       # User doc templates
```

## Decision Process

### 1. Analyze Input

If $ARGUMENTS is a file path:
```bash
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
| Workflow | `skills/balatro-mod-dev/SKILL.md` | New workflows, commands |
| Commands | `commands/` | New or updated commands |
| Agents | `agents/`, `references/sub-agents.md` | New agents, workflow changes |
| Lua pitfalls | `references/lua-gotchas.md` | New Lua/LuaJIT gotchas |
| Project setup | `templates/` | New templates |
| Lua rules | `templates/rules/lua-coding-style.md` | Lua coding conventions |
| Mod rules | `templates/rules/mod-conventions.md` | Mod structure conventions |

### 3. Evaluate Update

Before making changes, check:

- [ ] **Is this new knowledge?** Does the plugin already cover this?
- [ ] **Is this correct?** Verify against source (game files, SMODS repo)
- [ ] **Is this concise?** Only add what AI doesn't already know
- [ ] **Is this in the right place?** Match category to target file

### 4. Apply Update

**For SKILL.md updates:**
- Check line count before/after (must stay under 300)
- If too long, move details to pattern/reference files

**For agent updates:**
- Maintain `model`, `color`, `tools` frontmatter
- Preserve `<example>` trigger patterns
- Keep objective-context step (step 0) in workflow

### 5. Validate Changes

After updating:

```bash
# Check SKILL.md line count
wc -l "${CLAUDE_PLUGIN_ROOT}/skills/balatro-mod-dev/SKILL.md"

# Verify agent count (should be 11)
ls "${CLAUDE_PLUGIN_ROOT}/agents/"*.md | wc -l

# Verify command count (should be 16)
ls "${CLAUDE_PLUGIN_ROOT}/commands/"*.md | wc -l

# Check no Codex remnants
grep -ri "codex\|openai\.yaml\|\.codex" "${CLAUDE_PLUGIN_ROOT}/" --include="*.md" --include="*.json" | grep -v "CHANGELOG.md" | grep -v "update-plugin.md"

# Check no stale skill-version markers
grep -r "skill-version\|skill_version" "${CLAUDE_PLUGIN_ROOT}/"
```

## Report Format

```
## Plugin Update Report

### Input Analyzed
{Summary of knowledge file or instruction}

### Decision
{UPDATE | SKIP | PARTIAL}

### Reason
{Why this decision was made}

### Changes Made
- {file}: {description of change}

### Validation
- SKILL.md line count: {N}/300
- Agents: {N}/11
- Commands: {N}/16
- No Codex remnants: {OK | FOUND}
- No skill-version markers: {OK | FOUND}

### Notes
{Any follow-up needed}
```
