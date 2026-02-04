# {ModName} - AI Development Guide

> **Skill Reference:** Use the `balatro-mod-dev` skill for:
> - Game source paths and search recipes
> - Lovely patch syntax (`patterns/lovely-patches.md`)
> - SMODS API patterns (`patterns/smods-api.md`)
> - Mobile compatibility (`patterns/mobile-compat.md`)
> - UI architecture (`patterns/ui-system.md`)
> - Global variables (`reference/globals.md`)

---

## 1. Big Picture

[What this mod does in 2-3 sentences. What problem does it solve for players?]

**Mod Type:** [Standalone / Framework / Texture Pack / Tool]
**Dependencies:** [List dependencies, e.g., "Steamodded>=1.0.0~BETA-1221a", "Malverk"]

---

## 2. Repository Structure

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

| File | Purpose | Key Exports/Functions |
|------|---------|----------------------|
| `main.lua` | Entry point, mod initialization | `{MOD_GLOBAL}` table |
| `{ModName}.json` | Mod manifest (id, version, deps) | - |
| [Add mod-specific files] | | |

---

## 3. Core Behavior

### 3.1 [Main Feature/System]

[Explain the core logic that makes this mod work]

### 3.2 State Variables

```lua
-- State stored in G.GAME for save compatibility
G.GAME.{mod_name} = {
    -- [describe each field]
}
```

### 3.3 Key Functions

| Function | Purpose | Location |
|----------|---------|----------|
| `function_name()` | What it does | `file.lua:line` |

### 3.4 Hooks / Patches

| Hook/Patch | Target | Purpose |
|------------|--------|---------|
| `[type]` | `file.lua` | What it modifies |

---

## 4. API (if framework/library mod)

### 4.1 Public API

```lua
-- Example API usage
MyMod.function_name(param1, param2)
```

### 4.2 Extension Points

[How other mods can extend/use this mod]

---

## 5. Constraints & Gotchas

### 5.1 Critical Rules

- **DO NOT:** [Specific thing to avoid]
- **ALWAYS:** [Required behavior]
- **NEVER:** [Dangerous action]

### 5.2 Platform Notes

| Platform | Consideration |
|----------|---------------|
| Desktop | [Any desktop-specific notes] |
| Mobile | [Touch handling, lang parameter, etc.] |

### 5.3 Known Issues

| Issue | Status | Workaround |
|-------|--------|------------|
| [Bug description] | Open/Fixed | [How to handle] |

---

## 6. Lessons Learned

### 6.1 What Didn't Work

[Document failed approaches so they aren't repeated]

1. **[Approach Name]**: [Why it failed]

### 6.2 Key Insights

- [Important discovery during development]

---

## 7. Development

### 7.1 Scripts

```bash
./scripts/sync_to_mods.sh        # Sync to game
./scripts/sync_to_mods.sh --watch # Auto-sync
./scripts/create_release.sh [ver] # Create release
```

### 7.2 Testing

| Scenario | Steps | Expected |
|----------|-------|----------|
| [Test case] | 1. Do X | Y happens |

### 7.3 Debugging

- Lovely logs: `~/Library/Application Support/Balatro/Mods/lovely/log/` (macOS)
- Windows: `%APPDATA%/Balatro/Mods/lovely/log/`
- [Mod-specific debug tips]

---

## 8. Recent Changes

| Version | Change |
|---------|--------|
| v1.x.x | [Notable change] |

---

## 9. Open Tasks

- [ ] [Unfinished feature]
- [ ] [Known bug to fix]
