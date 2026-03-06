---
description: Review and update all documentation — user docs, AGENTS.md — for accuracy, clarity, and freshness
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Update All Docs

Review and update **all** documentation: user-facing docs, AI agent docs (AGENTS.md), and meta files.

## Files to Review

### User Documentation (Root)
- `README.md` — Main documentation (English)
- `README_zh.md` — Main documentation (Chinese)
- `CHANGELOG.md` — Version history (English)
- `CHANGELOG_zh.md` — Version history (Chinese)

### User Documentation (/docs)
- `docs/description.md` — Concise README for quick reference
- `docs/NEXUSMODS_DESCRIPTION.txt` — BBCode format for NexusMods

### AI Agent Docs (Root, git-ignored)
- `AGENTS.md` — Mod structure, functions, dependencies, dev status, constraints

### Meta Files
- `{ModName}.json` — Check version number
- `manifest.json` — Check version number matches

## Phase 0: Git Worktree Detection

```bash
git worktree list 2>/dev/null
```

Exclude worktree directories from all file scans below.

## Phase 1: Audit Current State

```bash
# Find last release tag
git describe --tags --abbrev=0 2>/dev/null || echo "(no tags)"

# All commits since last release (use the tag found above)
git log <last-tag>..HEAD --oneline

# Files changed since last release
git diff <last-tag>..HEAD --stat

# If no tags exist, fall back to last 20 commits
git log --oneline -20
```

Read all files listed above AND the commit list. For each doc file, note:
- Does it mention any feature, file, or function that was added/removed/renamed since the last release?
- Any sections that reference removed/renamed files or functions
- Any duplication across files

**Treat the commit list as the source of truth for what changed** — docs should reflect every user-visible change.

## Phase 2: User Docs Consistency

- [ ] README.md and README_zh.md list the same features
- [ ] CHANGELOG entries match between EN and ZH
- [ ] Version in {ModName}.json matches manifest.json
- [ ] docs/description.md reflects current README
- [ ] NexusMods description has current features

## Phase 3: AGENTS.md Freshness

Compare AGENTS.md against the actual codebase:

- [ ] **Quick Reference** table — Is repo type, mod type, dependencies still accurate?
- [ ] **Architecture** section — Does the file tree match reality?
- [ ] **Core Behavior** section — Do documented functions, state variables, and hooks still exist?
- [ ] **Constraints & Gotchas** section — Are known issues still open or already fixed?
- [ ] **Lessons Learned** section — Any stale entries?

## Phase 5: Present Findings

```
## Docs Audit Report

### Commits Since Last Release
- Last tag: [tag or "(no tags)"]
- Commits: [N commits — list user-visible changes]
- Undocumented changes: [list anything not yet reflected in docs]

### User Docs
- [file]: [status: OK / outdated / missing]

### AGENTS.md
- [section]: [status: OK / outdated / stale / verbose / duplicate]

### Meta Files
- Version consistency: [OK / mismatch: {details}]
```

**Ask before applying:** "Found {N} issues across docs. Proceed with updates?"

## Phase 6: Apply Updates

For each approved change:
1. Make the edit
2. Keep changes minimal — fix what's wrong, don't rewrite what's fine
3. For AGENTS.md: prefer concise tables over long prose
4. Remove outdated content entirely (don't comment it out)

## Phase 7: Summary

```
## Docs Update Complete

### Changes Made
- [file]: [what changed]

### Skipped (user declined or not needed)
- [file]: [reason]
```
