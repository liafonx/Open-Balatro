---
name: fix-sprites
description: Fix transparent pixel colors in sprite images to prevent grey border artifacts during bilinear filtering.
arguments:
  - name: directory
    description: Path to directory containing PNG sprites (relative to project root, e.g., "assets/1x")
    required: true
  - name: options
    description: "--preview to see changes without modifying, --recursive to include subdirectories"
    required: false
---

# Fix Sprites Command

Fix transparent pixel colors to prevent grey border artifacts.

## The Problem

Transparent pixels with RGB(0,0,0,0) cause grey halos when the game's shader samples/interpolates pixels. Vanilla Balatro uses RGB(255,255,255,0) for transparent areas.

## The Solution

Edge-bleed opaque pixel colors into adjacent transparent pixels (keeping alpha=0).

## Execution

1. **Check Pillow is installed:**
   ```bash
   python3 -c "from PIL import Image; print('OK')" || pip3 install Pillow
   ```

2. **Copy script to project (if not exists):**
   ```bash
   cp ~/.claude/skills/balatro-mod-dev/scripts/fix_transparent_pixels.py scripts/
   # OR for Codex:
   cp ~/.codex/skills/balatro-mod-dev/scripts/fix_transparent_pixels.py scripts/
   ```

3. **Run with provided arguments:**
   ```bash
   python3 scripts/fix_transparent_pixels.py "$directory" $options
   ```

## Examples

| Command | Effect |
|---------|--------|
| `/fix-sprites assets/1x --preview` | Preview what would be fixed |
| `/fix-sprites assets/1x` | Fix all PNGs in assets/1x |
| `/fix-sprites assets --recursive` | Fix all PNGs in assets/ and subdirectories |
| `/fix-sprites assets/1x/cards --preview` | Preview specific subfolder |

## Expected Output

```
==================================================
Transparent Pixel Fixer for Balatro Sprites
==================================================
Directory: assets/1x
Mode: Fix
Recursive: No

  card_01.png: 156 pixels fixed
  card_02.png: OK
  card_03.png: 89 pixels fixed

--------------------------------------------------
Files processed: 3
Total pixels fixed: 245
```

## After Running

- Verify sprites in-game look correct (no grey borders)
- Commit the fixed sprites
