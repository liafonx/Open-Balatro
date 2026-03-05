---
description: Verify fix by extracting and analyzing Lovely logs after code changes
allowed-tools: Bash, Read, Grep
---

# Debug / Verify Fix

Extract and analyze Lovely logs to verify if a fix worked, introduced new bugs, or had no effect.

**Context:** This command is called AFTER applying a fix or making changes. The goal is to verify the outcome.

> **Proactive diagnostics?** Use `Task(subagent_type="balatro-mod-dev:debug-inspector", model="sonnet")` instead. It covers logs + dump metadata + mod compatibility in one pass. `/debug` is for post-fix verification only.

## Log Location

macOS: `~/Library/Application Support/Balatro/Mods/lovely/log/`
Windows: `%APPDATA%/Balatro/Mods/lovely/log/`

## Steps

### 1. Determine Mod Key

Extract mod key from current repo (no user input needed):

```bash
# Try to get mod name from {ModName}.json in repo root
if ls *.json >/dev/null 2>&1; then
  ls *.json | grep -v "manifest.json\|mod.config.json\|package.json" | head -1 | sed 's/.json//'
else
  echo "Error: No mod JSON found in repository root (*.json)" >&2
fi

# Or extract from AGENT.md if it contains mod name
grep -m1 "mod_id\|ModName\|mod name" AGENT.md
```

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

## Escalation: If Fix Fails 3+ Times

**If the same bug has been attempted 3 or more times without success:**

Spawn the `research-analyst` agent (opus) to synthesize all debugging context:

```
Task(
  subagent_type="balatro-mod-dev:research-analyst",
  model="opus",
  prompt="<objective>We have been debugging this issue for 3+ attempts without success. Synthesize all findings and recommend a fundamentally different approach.</objective>

<task>
Analyze the following debugging history and recommend a new approach.
</task>

<prior_findings>
Attempts: [list each attempt and what happened]
Error pattern: [the specific error being seen]
Code context: [relevant code sections]
</prior_findings>"
)
```

The research-analyst will synthesize findings and recommend a different approach. Document the outcome in `docs/knowledge-base.md`.

## Common Error Patterns

> For machine-readable grep patterns (useful for scripted log extraction), see the `<error_patterns>` table in `agents/debug-inspector.md`.


### Lovely / Injection Errors

| Pattern | Meaning | Diagnosis |
|---------|---------|-----------|
| `ERROR - [♥]` | Lovely injection error | Check lovely.toml syntax: valid target path, correct patch type (pattern/regex/append/prepend) |
| `Failed to find target` | Lovely patch target not found | Game function may have been renamed or moved in a Balatro update |
| `Multiple patches conflict` | Overlapping lovely patches | Check if another mod patches the same function; use `priority` field |

### Lua Runtime Errors

| Pattern | Meaning | Diagnosis |
|---------|---------|-----------|
| `Oops! The game crashed` | Lua runtime error | Read the stack traceback immediately below for the specific error |
| `stack traceback:` | Start of error trace | Read bottom-to-top: the first line referencing your mod is the culprit |
| `attempt to index` | Nil value access | A table or object is nil; add nil guard: `if obj and obj.field then` |
| `attempt to call` | Calling non-function | Variable isn't a function; check SMODS API name spelling and version |
| `attempt to perform arithmetic` | Math on non-number | Value is nil/string; validate with `tonumber()` before arithmetic |
| `attempt to concatenate` | String concat with nil | Use `tostring(val)` to safely convert before `..` operator |
| `attempt to compare` | Comparing incompatible types | Check both operands are the same type; FFI cdata needs `tonumber()` |
| `stack overflow` | Infinite recursion | Function calls itself endlessly; check recursive base case or event loop |
| `not enough memory` | Memory exhaustion | Per-frame table allocation; pre-allocate tables outside hot loops |
| `module '...' not found` | Missing require path | Check file path matches `require()` string; Lua uses `.` not `/` for paths |
| `cannot resume dead coroutine` | Coroutine lifecycle error | Coroutine already finished or errored; create a new one |
| `invalid key to 'next'` | Table modified during iteration | Don't add/remove keys while iterating with `pairs()`/`next()` |

### SMODS-Specific Errors

| Pattern | Meaning | Diagnosis |
|---------|---------|-----------|
| `SMODS.*nil` | SMODS API misuse | Check API version; method may not exist in installed SMODS version |
| `duplicate key` | SMODS registration conflict | Another mod or your mod already registered this key; use unique prefix |
| `atlas.*nil` | Missing sprite atlas | Atlas not registered or registered after the object that uses it |
| `loc_txt.*nil` | Missing localization | Add localization entry in `localization/en-us.lua` for this key |

### No Output

| Pattern | Meaning | Diagnosis |
|---------|---------|-----------|
| No mod key entries | Code path not reached | Mod may not be loading; check manifest JSON validity and `main.lua` entry |
| Log file is empty/short | Game crashed at startup | Syntax error in Lua file; run `luac -p file.lua` to check syntax |
