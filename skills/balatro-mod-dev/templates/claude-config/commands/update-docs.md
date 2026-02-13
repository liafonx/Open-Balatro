---
description: Review and update all documentation — user docs, AGENT.md, INIT.md — for accuracy, clarity, and freshness
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Update All Docs

Review and update **all** documentation: user-facing docs, AI agent docs (AGENT.md, INIT.md), and meta files.

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
- `AGENT.md` — Mod structure, functions, dependencies, dev status
- `INIT.md` — Project rules, constraints, repo type

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
# What changed since last documented state
git log --oneline -20
git diff HEAD --stat
```

Read all files listed above. For each, note:
- Last meaningful update (does content match current code?)
- Any sections that reference removed/renamed files or functions
- Any duplication across files

## Phase 2: User Docs Consistency

- [ ] README.md and README_zh.md list the same features
- [ ] CHANGELOG entries match between EN and ZH
- [ ] Version in {ModName}.json matches manifest.json
- [ ] docs/description.md reflects current README
- [ ] NexusMods description has current features

## Phase 3: AGENT.md Freshness

Compare AGENT.md against the actual codebase:

### Structure Check
```bash
# Compare documented structure vs actual files (exclude worktree paths)
find . -name "*.lua" -o -name "*.toml" -o -name "*.json" | grep -v node_modules | grep -v .git | grep -v .tmp | sort
```

- [ ] **§2 Repository Structure** — Does the file tree match reality? Any new/removed files?
- [ ] **§3 Core Behavior** — Do documented functions, state variables, and hooks still exist? Check file:line references.
- [ ] **§4 API** — Are public APIs accurate? Any new exports?
- [ ] **§5 Constraints & Gotchas** — Are known issues still open or already fixed? Any new platform notes?
- [ ] **§6 Lessons Learned** — Any stale entries (lessons from code that was since refactored)?
- [ ] **§8 Recent Changes** — Does version history reflect actual changes?
- [ ] **§9 Open Tasks** — Any completed tasks still listed? Any new ones to add?

### Clarity & Verbosity Check
- [ ] **Outdated content** — Remove references to deleted files, renamed functions, old workarounds
- [ ] **Duplicate content** — If AGENT.md repeats what INIT.md says, remove from one
- [ ] **Verbose sections** — Shorten explanations that are longer than they need to be; prefer tables over prose
- [ ] **Dead references** — Check file:line citations; update if code moved
- [ ] **Structure** — Should any sections be merged, split, or reordered for clarity?

## Phase 4: INIT.md Freshness

Compare INIT.md against current project rules:

- [ ] **Repo type** — Still accurate (new/own/fork)?
- [ ] **Rule references** — Do rules reference correct file paths, script names, agent names?
- [ ] **External paths** — Are macOS/Windows paths still correct?
- [ ] **Mod-specific context** — Does the bottom section reflect current mod state?
- [ ] **Duplicate with AGENT.md** — If both files describe the same thing, keep it in ONE place:
  - INIT.md = rules, constraints, workflow instructions
  - AGENT.md = structure, behavior, state, history
- [ ] **Verbose rules** — Can any rules be shortened without losing meaning?

## Phase 5: Present Findings

```
## Docs Audit Report

### User Docs
- [file]: [status: OK / outdated / missing]
  - [specific issue if any]

### AGENT.md
- [section]: [status: OK / outdated / stale / verbose / duplicate]
  - [what needs to change]

### INIT.md
- [section]: [status: OK / outdated / stale / verbose / duplicate]
  - [what needs to change]

### Meta Files
- Version consistency: [OK / mismatch: {details}]
```

**Ask before applying:** "Found {N} issues across docs. Proceed with updates?"

## Phase 6: Apply Updates

For each approved change:
1. Make the edit
2. Keep changes minimal — fix what's wrong, don't rewrite what's fine
3. For AGENT.md/INIT.md: prefer concise tables over long prose
4. Remove outdated content entirely (don't comment it out)
5. Resolve duplicates by keeping content in the canonical location

## Phase 7: Summary

```
## Docs Update Complete

### Changes Made
- [file]: [what changed]

### Skipped (user declined or not needed)
- [file]: [reason]

### Follow-up Needed
- [anything that requires code changes or further research]
```
