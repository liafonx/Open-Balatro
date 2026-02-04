---
description: Verify fix by extracting and analyzing Lovely logs after code changes
allowed-tools: Bash, Read, Grep
argument-hint:
---

# Debug / Verify Fix

Extract and analyze Lovely logs to verify if a fix worked, introduced new bugs, or had no effect.

**Context:** This command is called AFTER applying a fix or making changes. The goal is to verify the outcome.

## Log Location

macOS: `~/Library/Application Support/Balatro/Mods/lovely/log/`
Windows: `%APPDATA%/Balatro/Mods/lovely/log/`

## Steps

### 1. Determine Mod Key

Extract mod key from current repo (no user input needed):

```bash
# Try to get mod name from {ModName}.json in repo root
ls *.json | grep -v "manifest.json\|mod.config.json\|package.json" | head -1 | sed 's/.json//'

# Or extract from AGENT.md if it contains mod name
grep -m1 "mod_id\|ModName\|mod name" AGENT.md
```

The mod key is typically used in Logger.lua as `[ModName]`.

### 2. Find Latest Log

```bash
# macOS - get the most recent log
LATEST_LOG=$(ls -t ~/Library/Application\ Support/Balatro/Mods/lovely/log/*.log | head -1)
echo "Analyzing: $LATEST_LOG"
```

### 3. Extract Relevant Logs

**Primary: Search by mod key**
```bash
grep -n "\[{ModKey}\]" "$LATEST_LOG"
```

**Fallback: If no mod key found or no results, get error logs**
```bash
# Get errors and stack traces
grep -n "ERROR\|Oops! The game crashed\|ERROR - \[♥\]\|stack traceback\|attempt to" "$LATEST_LOG"

# Get context around errors
grep -B5 -A10 "ERROR\|Oops! The game crashed\|stack traceback" "$LATEST_LOG"
```

### 4. Analyze Results

After extracting logs, determine outcome:

| Outcome | Indicators | Next Action |
|---------|------------|-------------|
| **Fix worked** | No errors related to changed code, expected behavior in logs | Report success, close issue |
| **New bug introduced** | New errors appeared that weren't there before | Analyze new error, apply another fix |
| **No change** | Same errors as before, no improvement | Re-examine approach, check if code path was hit |
| **Game crashed earlier** | Log file is smaller/shorter than expected | Check for syntax errors, missing requires |

### 5. Report Format

```
## Verification Result: {WORKED | NEW_BUG | NO_CHANGE | CRASH}

**Log File:** {filename}
**Log Time:** {timestamp from filename}
**Mod Key:** [{ModKey}]

### What Changed
{Summary of code changes that were just applied}

### Log Evidence
{Relevant log entries with line numbers}

### Analysis
{Interpretation of what the logs show}

### Conclusion
- [ ] Fix resolved the original issue
- [ ] No new errors introduced
- [ ] Behavior matches expectations

### Next Steps
{If not fixed: what to try next}
{If fixed: any cleanup needed}
```

## Common Error Patterns

| Pattern | Meaning |
|---------|---------|
| `ERROR - [♥]` | Lovely injection error |
| `Oops! The game crashed` | Lua runtime error |
| `stack traceback:` | Start of error trace |
| `attempt to index` | Nil value access |
| `attempt to call` | Calling non-function |
| `SMODS.*nil` | SMODS API misuse |
| No mod key entries | Code path not reached, or Logger not used |

## Quick Reference

```bash
# Latest log path
LATEST=$(ls -t ~/Library/Application\ Support/Balatro/Mods/lovely/log/*.log | head -1)

# Mod-specific logs
grep -n "\[Rewinder\]" "$LATEST"

# All errors
grep -n "ERROR\|crashed\|traceback" "$LATEST"

# Last 100 lines (often contains crash)
tail -100 "$LATEST"

# Compare two logs (before/after fix)
diff <(grep "\[ModKey\]" log1.log) <(grep "\[ModKey\]" log2.log)
```
