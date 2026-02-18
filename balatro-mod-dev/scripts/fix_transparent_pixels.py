#!/usr/bin/env python3
"""
Fix transparent pixel colors in card sprites to prevent grey border artifacts.

Problem: Transparent pixels with RGB(0,0,0) cause grey halos when the game's
shader samples/interpolates pixels. Vanilla Balatro uses RGB(255,255,255) for
transparent areas.

Solution: Convert transparent pixels to use the color of their nearest opaque
neighbor ("edge bleeding"), which produces clean edges during rendering.

Usage:
    python3 fix_transparent_pixels.py <directory> [--preview] [--recursive]

Arguments:
    directory   Path to directory containing PNG sprites

Options:
    --preview   Show what would be changed without modifying files
    --recursive Search subdirectories for PNG files
"""

import os
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Error: Pillow is required. Install with: pip3 install Pillow")
    sys.exit(1)


def get_nearest_opaque_color(img, x, y, max_radius=10):
    """Find the color of the nearest opaque pixel using spiral search."""
    width, height = img.size

    for radius in range(1, max_radius + 1):
        for dx in range(-radius, radius + 1):
            for dy in range(-radius, radius + 1):
                if abs(dx) != radius and abs(dy) != radius:
                    continue

                nx, ny = x + dx, y + dy
                if 0 <= nx < width and 0 <= ny < height:
                    r, g, b, a = img.getpixel((nx, ny))
                    if a > 128:
                        return (r, g, b)

    return (255, 255, 255)


def fix_sprite(img_path, preview=False):
    """Fix transparent pixels in a single sprite image."""
    img = Image.open(img_path).convert('RGBA')
    pixels = img.load()
    width, height = img.size

    to_fix = []
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if a == 0 and (r, g, b) != (255, 255, 255):
                to_fix.append((x, y))

    if not to_fix:
        return 0, "OK"

    if preview:
        return len(to_fix), "would fix"

    for x, y in to_fix:
        new_rgb = get_nearest_opaque_color(img, x, y)
        pixels[x, y] = (*new_rgb, 0)

    img.save(img_path, 'PNG', optimize=True)
    return len(to_fix), "fixed"


def main():
    args = sys.argv[1:]
    
    if not args or args[0].startswith('-'):
        print(__doc__)
        sys.exit(1)
    
    target_dir = Path(args[0])
    preview = '--preview' in args
    recursive = '--recursive' in args

    if not target_dir.exists():
        print(f"Error: Directory not found: {target_dir}")
        sys.exit(1)

    print("=" * 50)
    print("Transparent Pixel Fixer for Balatro Sprites")
    print("=" * 50)
    print(f"Directory: {target_dir}")
    print(f"Mode: {'Preview' if preview else 'Fix'}")
    print(f"Recursive: {'Yes' if recursive else 'No'}")
    print()

    total_fixed = 0
    files_processed = 0

    pattern = '**/*.png' if recursive else '*.png'
    
    for png_file in sorted(target_dir.glob(pattern)):
        count, status = fix_sprite(png_file, preview=preview)
        files_processed += 1
        total_fixed += count

        rel_path = png_file.relative_to(target_dir)
        if count > 0:
            print(f"  {rel_path}: {count} pixels {status}")
        else:
            print(f"  {rel_path}: {status}")

    print()
    print("-" * 50)
    print(f"Files processed: {files_processed}")
    print(f"Total pixels {'to fix' if preview else 'fixed'}: {total_fixed}")

    if preview and total_fixed > 0:
        print()
        print("Run without --preview to apply fixes.")


if __name__ == '__main__':
    main()
