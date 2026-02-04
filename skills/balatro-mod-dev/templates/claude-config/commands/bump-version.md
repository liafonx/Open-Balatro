---
description: Increment version and update changelogs
allowed-tools: Bash, Read, Write, Edit
argument-hint: [patch|minor|major]
---

# Bump Version

Increment version number across the repo and update changelogs.

## Arguments

$ARGUMENTS = version increment type:
- `patch` (default) - 0.0.X
- `minor` - 0.X.0
- `major` - X.0.0

## Version Files to Update

1. `{ModName}.json` - `"version": "x.y.z"`
2. `manifest.json` - `"version_number": "x.y.z"`

## Workflow

### Step 1: Get Current State

```bash
# Get current version from mod JSON
grep -o '"version": "[^"]*"' *.json | head -1

# Get latest git tag
git describe --tags --abbrev=0 2>/dev/null || echo "no tags"

# Get commits since last tag
tag=$(git describe --tags --abbrev=0 2>/dev/null) && git log "$tag"..HEAD --oneline 2>/dev/null || git log --oneline 2>/dev/null
```

### Step 2: Determine Action

**If latest tag (vX.Y.Z) matches current version:**
- Only increment version number
- Don't add content to changelog (changes already documented)
- This happens when releasing an already-documented version

**If latest tag does NOT match current version:**
- Increment version number
- Generate changelog content from:
  1. Commits since last release tag
  2. Compare with existing changelog entries for current version
  3. Add new entries for undocumented changes

### Step 3: Calculate New Version

Parse current version and increment based on argument:
- `1.2.3` + patch → `1.2.4`
- `1.2.3` + minor → `1.3.0`
- `1.2.3` + major → `2.0.0`

### Step 4: Update Version Files

Update both JSON files with new version:
- `{ModName}.json`: `"version": "NEW_VERSION"`
- `manifest.json`: `"version_number": "NEW_VERSION"`

### Step 5: Update Changelogs (if needed)

Only if latest tag doesn't match current version:

1. Read CHANGELOG.md and CHANGELOG_zh.md
2. Get changes since last documented version:
   ```bash
   git log v{last_version}..HEAD --oneline
   ```
3. Add new version section at top:
   ```markdown
   ## [NEW_VERSION] - YYYY-MM-DD

   ### Added
   - New feature from commit message

   ### Fixed
   - Bug fix from commit message
   ```
4. Update both EN and ZH changelogs consistently

### Step 6: Summary

Report:
- Old version → New version
- Files updated
- Changelog entries added (if any)
- Remind: "Ready to commit and tag with `git tag vNEW_VERSION`"

## Example Output

```
Version bump: 1.2.3 → 1.2.4

Updated files:
- SaveRewinder.json
- manifest.json
- CHANGELOG.md (3 new entries)
- CHANGELOG_zh.md (3 new entries)

New changelog entries:
- Added: Save browser keyboard navigation
- Fixed: Overflow protection edge case
- Fixed: Mobile button alignment

Ready to commit. After committing, create release with:
  git tag v1.2.4
  /release 1.2.4
```
