---
description: Draft a PR message for fork contributions
allowed-tools: Bash, Read
---

# Draft PR Message

Draft a conversational pull request message for contributing to another mod.

## Steps

1. Get current branch name: `git branch --show-current`
2. Get upstream remote: `git remote -v` (look for upstream or origin)
3. Compare changes: `git log origin/main..HEAD --oneline` and `git diff origin/main --stat`
4. Read the changed files to understand what was modified
5. Draft message in casual, conversational tone

## PR Message Style

**Length:** 3-5 sentences max. One paragraph unless really needed.

**DO:**
- Write like explaining to a friend
- Get to the point: what, why, done
- One sentence of context if needed
- Keep it readable, minimal formatting

**DON'T:**
- Use formal PR templates
- Heavy bullet point lists
- Corporate language ("This PR implements...")
- Over-explain technical details
- Multiple paragraphs for simple fixes

## Example: Just Right ✓

> "Fixed grey halo around suit letters on face cards. The transparent pixels had RGB(0,0,0) which bleeds through during filtering - changed them to edge-bled colors like vanilla does. All 16 sprites updated."

## Output

Show the drafted PR message and ask if user wants to copy it or make changes.
