# {ModName} - Agent Guide

## Scope

[What this mod does in 2-3 sentences. What problem does it solve for players?]

**Mod Type:** [Standalone / Framework / Texture Pack / Tool]
**Dependencies:** [e.g., "Steamodded>=1.0.0~BETA-1221a", "Malverk"]

---

## Architecture

```
{ModName}/
├── main.lua              # Entry point
├── {ModName}.json        # SMODS manifest
├── lovely.toml           # Lovely patches (if any)
├── config.lua            # Configuration (if any)
├── localization/
│   ├── en-us.lua         # English
│   └── zh_CN.lua         # Chinese (if supported)
├── assets/
│   ├── 1x/               # Standard resolution
│   └── 2x/               # High resolution
└── [other folders]       # Mod-specific
```

### Key Files

| File | Purpose |
|------|---------|
| `main.lua` | Entry point, mod initialization |
| `{ModName}.json` | Mod manifest (id, version, deps) |
| [Add mod-specific files with purpose and key exports] |

---

## Core Behavior

### [Main Feature/System]

[Explain the core logic. Include key data flows as numbered steps.]

### Key Functions

| Function | Purpose | Location |
|----------|---------|----------|
| `function_name()` | What it does | `file.lua:line` |

### Hooks / Patches

| Hook/Patch | Target | Purpose |
|------------|--------|---------|
| `[type]` | `file.lua` | What it modifies |

---

## Constraints & Gotchas

- **DO NOT:** [Specific thing to avoid]
- **ALWAYS:** [Required behavior]
- **NEVER:** [Dangerous action]

### Known Issues

| Issue | Status | Workaround |
|-------|--------|------------|
| [Bug description] | Open/Fixed | [How to handle] |

---

## High-Risk Files

Files that require extra care when modifying:

| File | Risk | Why |
|------|------|-----|
| [file.lua] | [save compat / core logic / injection] | [explanation] |

---

## Verification Checklist

Before committing changes, verify:

1. [ ] [Key test scenario 1]
2. [ ] [Key test scenario 2]
3. [ ] [No save compatibility regression]
4. [ ] Lovely logs show no errors

---

## Lessons Learned

[Document failed approaches so they aren't repeated]

1. **[Approach Name]**: [Why it failed]

---

## Development

### Scripts

```bash
./scripts/sync_to_mods.sh        # Sync to game
./scripts/sync_to_mods.sh --watch # Auto-sync
./scripts/create_release.sh [ver] # Create release
```

### Debugging

- Lovely logs: `~/Library/Application Support/Balatro/Mods/lovely/log/` (macOS)
- Windows: `%APPDATA%/Balatro/Mods/lovely/log/`

---

<!-- FOR FORK REPOS: Use this shorter format instead of the full template above.

# {ModName} - Fork Development

| Field | Value |
|-------|-------|
| **Mod** | {ModName} (`{mod_id}`) |
| **Author** | {OriginalAuthor} |
| **Version** | {version} |
| **Prefix** | {prefix} |
| **Type** | [Standalone / Framework] |
| **Dependencies** | [list] |

## Description

[What this mod does, what your fork changes]

## Structure

```
{ModName}/
├── [file tree with brief annotations]
```

## Key Implementation Details

[How the mod works, what your changes affect, injection points]

## Dev Commands

```bash
./scripts/sync_to_mods.sh --watch  # Auto-sync
```

END FORK TEMPLATE -->
