---
description: Publish a GitHub release with changelog and zip asset
allowed-tools: Bash, Read, Grep, Glob
argument-hint: "[version]"
---

# Publish GitHub Release

Fully automated GitHub release publisher. Run after `/bump-version` (version files, changelog, and zip already exist).

## Arguments

$ARGUMENTS = version number (optional, e.g., "1.5.0"). If omitted, version is read from mod JSON.

## Steps

### Step 1: Detect Mod Name + Version

Read `mod.config.json` to get `mod_name` and `mod_json` fields.

If `mod.config.json` is missing or incomplete, fallback: glob `*.json` in the project root, excluding `manifest.json`, `mod.config.json`, and `package.json`. The first remaining `.json` file is the mod JSON.

Read the `"version"` field from the mod JSON file.

- If `$ARGUMENTS` is provided, use it as VERSION. Cross-check against mod JSON version — if they differ, FAIL with:
  `"Version mismatch — argument v[X] does not match mod JSON v[Y]. Run /bump-version first."`
- If `$ARGUMENTS` is empty, use the version from the mod JSON.

If `manifest.json` exists, read `"version_number"` and cross-check against VERSION.
- If they differ, FAIL: `"Version mismatch between mod JSON and manifest.json — run /bump-version first."`

If VERSION is still undetectable after all fallbacks, FAIL:
`"No mod JSON found. Ensure {ModName}.json exists."`

---

### Step 2: Extract EN Changelog Section

Read `CHANGELOG.md`.

- If missing, FAIL: `"CHANGELOG.md not found."`

Search for a heading matching `## [VERSION]` (may have optional date suffix, e.g. `## [1.5.0] - 2026-02-24`).

Extract everything from that heading line up to (but not including) the next `## [` heading, or to EOF if it's the last entry. Include the heading line itself in the extracted text.

- If no matching section found, FAIL: `"No changelog entry for v[VERSION] in CHANGELOG.md."`

Store as EN_CHANGELOG.

---

### Step 3: Extract ZH Changelog Section (optional)

Check if `CHANGELOG_zh.md` exists.

- If missing: WARN `"CHANGELOG_zh.md not found — release will be EN-only."` and set ZH_AVAILABLE=false. Continue.

If it exists, search for `## [VERSION]` section using the same logic as Step 2.

- If no matching section: WARN `"No ZH changelog entry for v[VERSION] — release will be EN-only."` and set ZH_AVAILABLE=false. Continue.
- If found: set ZH_AVAILABLE=true, store as ZH_CHANGELOG.

---

### Step 4: Derive Release Title

Scan EN_CHANGELOG for the first bullet point line (line starting with `- ` or `* `).

Strip the bullet prefix. Truncate to ~60 characters, appending `…` if truncated.

Format: `v[VERSION] - [HEADLINE]`

If no bullet found, use just `v[VERSION]`.

---

### Step 5: Compose Release Body

Build the release body in this order:

1. EN_CHANGELOG (full extracted text)
2. If ZH_AVAILABLE is true:
   - `---`
   - ZH_CHANGELOG (full extracted text)

Write this to `/tmp/release-notes.md`.

---

### Step 6: Verify Zip Asset

Construct the expected zip path: `release/[VERSION]/[MOD_NAME]-[VERSION].zip`

(MOD_NAME comes from `mod_name` in `mod.config.json`, or derived from the mod JSON filename without extension.)

Check that the file exists.

- If missing, FAIL:
  `"Zip not found at release/[VERSION]/[MOD_NAME]-[VERSION].zip. Run scripts/create_release.sh first."`

---

### Step 7: Check Git State

Run `git status --porcelain`.

- If output is non-empty, FAIL:
  `"Uncommitted changes detected. Commit or stash all changes before publishing."`

Run `gh auth status`.

- If the command fails or shows unauthenticated, FAIL:
  `"Not authenticated with GitHub. Run: gh auth login"`

---

### Step 8: Create/Push Git Tag

Run `git tag -l "v[VERSION]"`.

- If tag already exists locally, skip tag creation.
- If tag does not exist, run: `git tag "v[VERSION]"`

Push the tag: `git push origin "v[VERSION]"`

- If push fails because tag already exists on remote, that is OK — continue.

---

### Step 9: Publish GitHub Release

Check if a release already exists:
```bash
gh release view "v[VERSION]" 2>/dev/null
```
- If it exists, FAIL:
  `"Release v[VERSION] already exists. To re-publish, delete it first with: gh release delete v[VERSION]"`

Create the release:
```bash
gh release create "v[VERSION]" \
  --title "v[VERSION] - HEADLINE" \
  --notes-file /tmp/release-notes.md \
  "release/[VERSION]/[MOD_NAME]-[VERSION].zip#[MOD_NAME].zip"
```

The `#[MOD_NAME].zip` suffix renames the asset on upload (drops the version suffix for a cleaner download filename).

---

### Step 10: Report

Run `gh release view "v[VERSION]" --json url --jq '.url'` to get the release URL.

Print:
```
✓ GitHub release published: [URL]

Next steps (if applicable):
  - Upload to Thunderstore
  - Upload to NexusMods
```

Clean up: `rm -f /tmp/release-notes.md`

---

## Error Reference

| Condition | Action |
|-----------|--------|
| No mod JSON found | FAIL: "No mod JSON found. Ensure {ModName}.json exists." |
| Version argument mismatch with mod JSON | FAIL: "Version mismatch — argument v[X] does not match mod JSON v[Y]. Run /bump-version first." |
| Mod JSON vs manifest.json mismatch | FAIL: "Version mismatch between mod JSON and manifest.json — run /bump-version first." |
| CHANGELOG.md missing | FAIL: "CHANGELOG.md not found." |
| No EN entry for version | FAIL: "No changelog entry for v[X] in CHANGELOG.md." |
| CHANGELOG_zh.md missing | WARN, continue EN-only |
| No ZH entry for version | WARN, continue EN-only |
| Zip missing | FAIL: "Zip not found at release/[VERSION]/[MOD_NAME]-[VERSION].zip. Run scripts/create_release.sh first." |
| Uncommitted changes | FAIL: "Uncommitted changes detected. Commit or stash all changes before publishing." |
| gh not authenticated | FAIL: "Not authenticated with GitHub. Run: gh auth login" |
| Release already exists | FAIL: "Release v[X] already exists. To re-publish, delete it first with: gh release delete v[X]" |
