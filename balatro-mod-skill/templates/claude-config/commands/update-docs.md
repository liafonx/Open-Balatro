---
description: Review and update all user documentation files
allowed-tools: Read, Write, Edit
---

# Update All User Docs

Review and update all user-facing documentation for consistency.

## Files to Review

### Root Level
- `README.md` - Main documentation (English)
- `README_zh.md` - Main documentation (Chinese)
- `CHANGELOG.md` - Version history (English)
- `CHANGELOG_zh.md` - Version history (Chinese)

### In /docs
- `docs/description.md` - Concise README for quick reference
- `docs/NEXUSMODS_DESCRIPTION.txt` - BBCode format for NexusMods

### Meta Files
- `{ModName}.json` - Check version number
- `manifest.json` - Check version number matches

## Steps

1. Read all documentation files listed above
2. Check for consistency between EN and ZH versions
3. Verify version numbers match across meta files
4. Check if CHANGELOG has recent entries
5. Suggest updates for any inconsistencies or outdated content
6. Ask user to confirm before making changes

## Checklist

- [ ] README.md and README_zh.md have same features listed
- [ ] CHANGELOG entries match between EN and ZH
- [ ] Version in {ModName}.json matches manifest.json
- [ ] docs/description.md is up to date with README
- [ ] NexusMods description has current features
