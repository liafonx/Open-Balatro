# {ModName} - Project Rules (INIT.md)

> **File Convention (Claude & Codex use the same structure):**
> - `INIT.md` - Project instructions, rules, constraints for AI agents
> - `AGENT.md` - Repository structure, functionality, mod-specific details
> - `mod.config.json` - File lists for sync/release scripts

---

## Quick Reference

- **Mod Name:** {ModName}
- **Repo Type:** `new` / `fork` (see Repo Type Rules below)
- **Skill:** Use `balatro-mod-dev` skill for shared patterns and game source

---

## Repo Type Rules

### If `new` (my own repo):
- Full ownership - use dedicated Logger, full user docs, localization
- Required files: See "User Documentation" section
- Logging: Use `Utils/Logger.lua` pattern
- Localization: Support en-us and zh_CN natively

### If `fork` (contributing to others' repo):
- Minimal changes - follow existing patterns
- Logging: Use temp `pcall(print, "[Debug] ...")` logs only
- Remove all debug logs before PR
- Don't add new documentation files
- PR messages: Casual, conversational tone (see Rule 8)

---

## Critical Rules

### Rule 1: Protected Files

**NEVER modify without explicit user confirmation:**
- `AGENT.md` (repository documentation)
- `INIT.md` (project rules)
- `mod.config.json` (file configuration)
- `README.md`, `README_zh.md`, `CHANGELOG.md`, `CHANGELOG_zh.md`
- `docs/*` (user documentation)
- `{ModName}.json`, `manifest.json` (meta files)

If changes are needed, **STOP and ask:**
> "I'd like to update `{file}` to {reason}. Do you want me to proceed?"

### Rule 2: File Change Protocol

**After creating a source file (.lua, .toml, directory):**
1. Check if mod has `mod.config.json`
2. Ask: "Should I add `{file}` to `include_files` for sync/release?"

**After deleting a source file:**
1. Check if file was in `mod.config.json` → `include_files`
2. Ask: "Should I remove `{file}` from `include_files`?"

### Rule 3: Script Reminders

**Sync Mode:**
> Assume `./scripts/sync_to_mods.sh --watch` is running. No need to remind about syncing.

**Before release:**
> "Use `./scripts/create_release.sh [version]` to create packages."

### Rule 4: Mobile Compatibility

When modifying UI code (UIBox, draw functions, input handling):
1. Check `patterns/mobile-compat.md` in the skill
2. Verify both desktop and mobile patterns for click/hover
3. Consider `lang` parameter for text nodes

### Rule 5: Always Use Logging

**For new/my repos:**
- Use `Utils/Logger.lua` (see template)
- Create module-specific loggers: `local log = Logger.create("ModuleName")`
- Use levels: `error`, `warning`, `info`, `debug`

**For forks/others' repos:**
- Use temp logs: `pcall(print, "[Debug] checkpoint: " .. tostring(var))`
- Remove all debug logs before committing

### Rule 6: Issue Documentation

**When fixing an issue fails 3+ times:**
1. Document in `docs/knowledge-base.md`
2. Include: symptoms, attempts, root cause analysis
3. Update when resolved with lessons learned

### Rule 7: Use Skill for Common Knowledge

| Topic | Skill Reference |
|-------|----------------|
| Game file contents | `references/game-files.md` |
| Lovely syntax | `patterns/lovely-patches.md` |
| SMODS patterns | `patterns/smods-api.md` |
| Mobile differences | `patterns/mobile-compat.md` |
| UI architecture | `patterns/ui-system.md` |
| Lua/LuaJIT pitfalls, common bugs | `references/lua-gotchas.md` |

### Rule 8: PR Message Drafting (fork repos)

When user says "draft a PR message":

1. Compare current branch with upstream main (use `git diff` or GitHub tools)
2. Summarize what changed
3. Draft in casual, conversational tone:

**Style:**
- Write like explaining to a friend, not a formal report
- Share context: "I noticed...", "This matters because..."
- Mention alternatives: "if this feels overkill, I totally get it"
- Offer help: "happy to help with that too"

**Avoid:**
- Formal templates, heavy bullet lists
- Corporate language ("This PR implements...")
- Overly brief descriptions

**Example tone:**
> "I just noticed that v1.9.3 added no-SMODS support, but my earlier fix relied on the SMODS API. I managed to make it work only with Lovely."
>
> "The logic is actually pretty simple... The code looks more involved than it is."
>
> "Anyway, if this feels overkill, I totally get it, happy to just keep it in my fork."

### Rule 9: Sub-Agent Invocation

**NEVER use the Task tool or built-in agent spawning to create sub-agents.**

All sub-agent research MUST go through:
```bash
./scripts/run_subagent.sh <agent-name> <<'EOF'
[task content]
EOF
```

This adapter resolves backend config from mod.config.json and routes through codeagent.
Available agents: game-source-researcher, smods-api-researcher, mod-pattern-researcher, lovely-patch-researcher, project-explorer, script-runner.

### Rule 10: Plan Before Big Changes

**For refactoring, structural changes, or feature implementation — NEVER proceed automatically.**

1. Write a plan to `docs/PLAN.md` covering:
   - What changes and why
   - Files affected
   - Migration steps (if breaking existing code)
   - Risks or trade-offs
2. Spawn a Codex review via `script-runner`:
   ```bash
   ./scripts/run_subagent.sh script-runner <<'EOF'
   Review the plan in docs/PLAN.md. Check for:
   - Missing edge cases or files that would break
   - Simpler alternatives
   - Whether the scope is too large (should be split)
   Report: APPROVE / CONCERNS: [list]
   EOF
   ```
3. Present the plan + review to the user
4. **Only proceed after explicit user approval**

**What counts as "big":**
- Renaming or moving 3+ files
- Changing module boundaries or require chains
- Adding/removing a system (logging, config, UI framework)
- Rewriting a core function's signature or behavior

**Small changes** (typo fix, adding a field, single-file edits) do NOT need this — just do them.

---

## User Documentation (new repos only)

### Required Files at Root
| File | Purpose |
|------|---------|
| `README.md` | Main documentation (English) |
| `README_zh.md` | Main documentation (Chinese) |
| `CHANGELOG.md` | Version history (English) |
| `CHANGELOG_zh.md` | Version history (Chinese) |

### Required Files in /docs
| File | Purpose |
|------|---------|
| `docs/description.md` | Concise version of README for quick reference |
| `docs/NEXUSMODS_DESCRIPTION.txt` | BBCode format for NexusMods |
| `docs/knowledge-base.md` | Known issues and lessons learned |
| `docs/AGENT.md` | Detailed repo structure (for AI agents) |

### Meta Files at Root
| File | Purpose | Template |
|------|---------|----------|
| `{ModName}.json` | SMODS mod manifest | `mod-json-template.json` |
| `manifest.json` | Thunderstore manifest | `manifest-json-template.json` |

**When user says "update all user docs":**
1. Review and update ALL documentation files above
2. Ensure consistency across EN/ZH versions
3. Update version numbers in meta files if needed

---

## Localization (new repos only)

Support en-us and zh_CN natively:

```
localization/
├── en-us.lua
└── zh_CN.lua
```

Pattern (see `patterns/smods-api.md` for full details):
```lua
return {
    descriptions = {
        Mod = {
            mod_name = { ... }
        }
    },
    misc = {
        dictionary = {
            k_custom_key = "Custom Text"
        }
    }
}
```

---

## Mod-Specific Context

[Summarize key info from AGENT.md here]

### Purpose
[What this mod does]

### Key Files
| File | Purpose |
|------|---------|
| `main.lua` | Entry point |
| `Utils/Logger.lua` | Logging utility |

### Key Constraints
[Things to avoid, gotchas specific to this mod]

---

## Utility Scripts

| Script | Command |
|--------|---------|
| Sync to game (watch mode) | `./scripts/sync_to_mods.sh --watch` |
| Create release | `./scripts/create_release.sh [version]` |

---

## External References

Access these paths directly. No symlinks or setup needed.

### macOS Paths

| Resource | Path |
|----------|------|
| Game Source (desktop) | `~/Development/GitWorkspace/Balatro_src/desktop/` |
| Game Source (mobile) | `~/Development/GitWorkspace/Balatro_src/ios_plus/` |
| Steamodded Source | `~/Development/GitWorkspace/smods/src/` |
| Steamodded Lovely | `~/Development/GitWorkspace/smods/lovely/` |
| Lovely Docs | `~/Development/GitWorkspace/lovely-injector/` |
| Installed Mods | `~/Library/Application Support/Balatro/Mods/` |
| Lovely Logs | `~/Library/Application Support/Balatro/Mods/lovely/log/` |
| Lovely Dump | `~/Library/Application Support/Balatro/Mods/lovely/dump/` |

### Windows Paths

| Resource | Path |
|----------|------|
| Installed Mods | `%APPDATA%/Balatro/Mods/` |
| Lovely Logs | `%APPDATA%/Balatro/Mods/lovely/log/` |
| Lovely Dump | `%APPDATA%/Balatro/Mods/lovely/dump/` |