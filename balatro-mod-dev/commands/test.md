---
description: Run test scenarios and verify mod behavior via Lovely logs
allowed-tools: Bash, Read, Grep, Glob
argument-hint: "[scenario-name or 'all']"
---

# Test Mod

Run test scenarios for the current mod by syncing to game, checking logs, and reporting results.

## Arguments

$ARGUMENTS = optional scenario name to run (default: "all")

## Step 0: Gather Context

1. Read `AGENTS.md` for test scenarios (look for "Verification Checklist", "Testing Scenarios", or "Test Cases" section)
2. Read `mod.config.json` for `test_saves` configuration
3. Determine mod key from manifest JSON

## Step 1: Pre-Flight Checks

```bash
# Verify sync script exists
ls scripts/sync_to_mods.sh 2>/dev/null || echo "MISSING: sync script"

# Verify mod manifest is valid JSON
MOD_JSON=$(ls *.json 2>/dev/null | grep -v "manifest.json\|mod.config.json\|package.json" | head -1)
python3 -c "import json; json.load(open('$MOD_JSON'))" 2>&1 || echo "INVALID: mod manifest"

# Check for bare print() calls (should use Logger)
grep -rn "^[^-]*\bprint(" *.lua Utils/*.lua 2>/dev/null | grep -v "pcall(print" | grep -v "Logger" || echo "OK: no bare print() calls"
```

## Step 2: Sync Mod to Game

```bash
./scripts/sync_to_mods.sh
```

## Step 3: Check Test Saves

If `mod.config.json` has `test_saves` configured:

```bash
SAVES_DIR=~/Library/Application\ Support/Balatro/Saves
# For each test save defined in test_saves:
# 1. Copy save file to game saves directory
# 2. Note which scenario it tests
```

## Step 4: Analyze Lovely Logs

After user runs the game and returns:

```bash
# Find latest log
LATEST_LOG=$(ls -t ~/Library/Application\ Support/Balatro/Mods/lovely/log/*.log 2>/dev/null | head -1)

if [ -z "$LATEST_LOG" ]; then
  echo "No Lovely logs found. Has the game been run with Lovely installed?"
  exit 1
fi

echo "Analyzing: $LATEST_LOG"
echo "Log time: $(stat -f '%Sm' "$LATEST_LOG")"
```

### Search for mod-specific entries

```bash
MOD_KEY=$(jq -r '.id // .name' "$MOD_JSON" 2>/dev/null)
grep -n "\[$MOD_KEY\]" "$LATEST_LOG"
```

### Search for errors

```bash
grep -n "ERROR\|Oops! The game crashed\|stack traceback\|attempt to" "$LATEST_LOG" | head -30
```

### Search for SMODS registration

```bash
grep -n "SMODS.*$MOD_KEY\|Registered.*$MOD_KEY" "$LATEST_LOG"
```

## Step 5: Evaluate Test Scenarios

For each test scenario from AGENTS.md:

| Check | Method | Pass Criteria |
|-------|--------|---------------|
| Mod loads | Grep for mod key in log | At least one `[ModKey]` entry |
| No errors | Grep for ERROR + mod files | Zero errors referencing mod files |
| SMODS registered | Grep for registration | All objects show "Registered" |
| Feature works | User observation | User confirms expected behavior |

## Step 6: Report

```
## Test Results: {{ModName}} v{{Version}}

**Log File:** {{filename}}
**Log Time:** {{timestamp}}
**Mod Key:** [{{ModKey}}]

### Scenario Results

| # | Scenario | Status | Evidence |
|---|----------|--------|----------|
| 1 | Mod loads without errors | PASS/FAIL | [log evidence] |
| 2 | [scenario from AGENTS.md] | PASS/FAIL | [evidence] |
...

### Errors Found
[List any errors with file:line references]

### Summary
- X/Y scenarios passed
- X errors found
- X warnings found

### Recommendations
[If failures: suggest fixes referencing /debug command]
[If all pass: suggest adding more test scenarios to AGENTS.md]
```

## Test Save Schema

When `test_saves` is configured in `mod.config.json`, each entry specifies:

```json
{
  "test_saves": [
    {
      "save_name": "pre_boss_ante_3",
      "description": "Save state before Boss Blind on Ante 3 with 2 jokers",
      "test_scenario": "Verify joker effects apply correctly during boss scoring"
    }
  ]
}
```

Save files are stored in `.test-saves/` directory in the repo and copied to the game saves directory before testing.
