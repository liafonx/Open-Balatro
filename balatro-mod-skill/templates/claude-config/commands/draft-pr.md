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

**DO:**
- Write like explaining to a friend
- Share reasoning: "I noticed...", "This matters because..."
- Mention alternatives: "if this feels overkill, I totally get it"
- Offer help: "happy to help with that too"
- Keep it readable, light formatting

**DON'T:**
- Use formal PR templates
- Heavy bullet point lists
- Corporate language ("This PR implements...")

## Example Tone

> "I just noticed that v1.9.3 added no-SMODS support, but my earlier fix relied on the SMODS API. I managed to make it work only with Lovely."
>
> "The logic is actually pretty simple... The code looks more involved than it is."
>
> "Anyway, if this feels overkill, I totally get it, happy to just keep it in my fork."

## Output

Show the drafted PR message and ask if user wants to copy it or make changes.
