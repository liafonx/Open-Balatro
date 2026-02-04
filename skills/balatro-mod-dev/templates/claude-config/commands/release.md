---
description: Create release packages for distribution
allowed-tools: Bash, Read
argument-hint: [version]
---

# Create Release

Create release packages for GitHub and Thunderstore.

## Arguments

$ARGUMENTS = version number (optional, e.g., "1.2.0")

## Steps

1. **Determine version:**
   - If version provided in $ARGUMENTS, use that
   - Otherwise, read version from both `{ModName}.json` and `manifest.json`
   - If both versions match, use that version automatically
   - If versions differ, show both and ask user which to use
   - If only one file exists, use its version

2. Check if `scripts/create_release.sh` exists
3. Run `./scripts/create_release.sh {version}`
4. Report created files in `release/` folder
5. Remind to update CHANGELOG.md and CHANGELOG_zh.md before publishing

If the script doesn't exist, suggest running /init-balatro-mod first.
