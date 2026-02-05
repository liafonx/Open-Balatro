# {ModName} - Texture Pack Development Guide

> **Skill Reference:** Use the `balatro-mod-dev` skill for game source and patterns.
> **Framework Dependency:** This texture pack uses [Malverk](https://github.com/Eremel/Malverk) for texture management.

---

## 1. Big Picture

[What textures this pack provides. Theme or inspiration.]

**Mod Type:** Texture Pack
**Dependencies:** `malverk`

---

## 2. Repository Structure

```
{ModName}/
├── {mod_id}.lua          # Main script (AltTexture/TexturePack definitions)
├── {mod_id}.json         # SMODS manifest
├── README.md             # Documentation
├── localization/
│   ├── en-us.lua         # English (includes Malverk UI strings)
│   └── zh_CN.lua         # Chinese (optional)
├── assets/
│   ├── 1x/               # Standard resolution spritesheets
│   │   ├── Jokers.png
│   │   ├── Tarots.png
│   │   └── collabs/      # DeckSkin atlases (if any)
│   └── 2x/               # High resolution (same filenames as 1x)
│       ├── Jokers.png
│       ├── Tarots.png
│       └── collabs/
└── Malverk/              # Reference submodule (optional)
```

---

## 3. Textures Provided

### 3.1 Retextured Objects

| Category | Objects Changed | Spritesheet |
|----------|-----------------|-------------|
| Jokers | [list joker keys] | `Jokers.png` |
| Tarots | [list tarot keys] | `Tarots.png` |
| Planets | [list planet keys] | `Planets.png` |
| [etc.] | | |

### 3.2 Special Features

- [ ] Custom rename/retype via localization
- [ ] Animated sprites (frames parameter)
- [ ] DeckSkins
- [ ] Custom badge colors

---

## 4. Malverk Integration

### 4.1 AltTexture Definitions

```lua
-- Example from this mod
AltTexture({
    key = '{prefix}_jokers',
    set = 'Joker',
    path = 'Jokers.png',
    keys = {'j_joker', 'j_mime', ...},  -- Partial retexture (optional)
    loc_txt = { name = 'My Joker Textures' }
})
```

### 4.2 TexturePack Definition

```lua
TexturePack({
    key = '{prefix}_pack',
    textures = {'{prefix}_jokers', '{prefix}_tarots', ...},
    toggle_textures = {...},  -- Start disabled
    dynamic_display = true,
    loc_txt = { name = 'Pack Name', text = {'Description'} }
})
```

### 4.3 Localization Keys

```lua
-- localization/en-us.lua
return {
    descriptions = {
        alt_texture = {
            alt_tex_{prefix}_jokers = { name = "Display Name" },
            -- ... for each AltTexture
        },
        texture_packs = {
            texpack_{prefix}_pack = { 
                name = "Pack Name",
                text = {"Description line 1"}
            }
        }
    }
}
```

---

## 5. Asset Guidelines

### 5.1 Spritesheet Format

- **1x folder**: Standard resolution (71x95 per card typically)
- **2x folder**: Double resolution (142x190 per card)
- **Naming**: Both folders must have identical filenames
- **Format**: PNG with transparency

### 5.2 Vanilla Sheet Alignment

If replacing vanilla objects, use `original_sheet = true` to match vanilla positioning.

If creating new layouts:
- Set `px` (width) and `py` (height) for atlas dimensions
- Use `display_pos = {x, y}` for UI preview

---

## 6. Fallback Without Malverk

```lua
MALVERK_ACTIVE = rawget(_G, 'Malverk') ~= nil

if not MALVERK_ACTIVE then
    -- Use SMODS.Atlas + take_ownership as fallback
    SMODS.Atlas({
        key = 'jokers',
        path = 'Jokers.png',
        px = 71, py = 95
    })
    -- take_ownership for each card...
end
```

---

## 7. Development

### 7.1 Testing

1. Enable pack in Settings → Textures
2. Verify each texture appears correctly
3. Check 1x and 2x resolutions
4. Test priority with other texture packs

### 7.2 Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Texture not appearing | Key name mismatch | Check key name matches vanilla exactly |
| Wrong positioning | Missing sheet config | Use `original_sheet = true` or set `px`/`py` |
| 2x blurry | Wrong dimensions | Ensure 2x is exactly double 1x dimensions |
| Grey border on sprites | Transparent pixels using RGB(0,0,0) | Edge-bleed colors into transparent pixels |
| Sprite not loading | Wrong atlas dimensions | Verify image is exactly (tiles × px) wide |
| DeckSkin not appearing | pos_style mismatch | Use 'collab' for 3-column J/Q/K layouts |

### 7.3 Grey Border Fix (Transparent Pixel Issue)

When transparent pixels have RGB values of (0,0,0,0) instead of edge-bled colors, bilinear filtering causes grey borders.

**Fix:** Use PIL to copy edge colors into transparent pixels:
```python
from PIL import Image
img = Image.open("sprite.png").convert("RGBA")
# Copy neighboring opaque pixel colors to transparent pixels
# while keeping alpha=0
```

---

## 8. Open Tasks

- [ ] [Unfinished textures]
- [ ] [Missing 2x versions]
