---
description: Review codebase for refactoring opportunities
allowed-tools: Read, Grep, Glob, Bash, Task
argument-hint: [focus-area]
---

# Refactor Code

Review the codebase for refactoring opportunities and code quality improvements.

## Arguments

$ARGUMENTS = optional focus area (e.g., "joker logic", "UI code", "config handling")

## Analysis Checklist

### 1. Gather Context
- Read `AGENT.md` for repo structure and mod functionality
- Read `INIT.md` for project rules and constraints
- If focus area provided, prioritize files related to $ARGUMENTS
- Otherwise, scan all Lua files in the mod

### 2. Check for Redundant/Duplicate Logic
- Functions that do similar things with slight variations
- Repeated code blocks that could be extracted
- Multiple implementations of the same pattern
- Copy-pasted code with minor changes

### 3. Check for Outdated Fallbacks
- SMODS version checks for old versions no longer supported
- Compatibility code for deprecated APIs
- Workarounds that are no longer needed
- Comments mentioning "temporary" or "TODO: remove"

### 4. Check for Modularization Opportunities
- Large functions that could be split
- Files with mixed responsibilities
- Logic that could be moved to utility modules
- Repeated patterns that could become helper functions

### 5. Check for Performance Improvements
- Calculations done repeatedly that could be cached
- Table operations in hot paths (loops, draw functions)
- String concatenation in loops (use table.concat)
- Unnecessary global lookups (localize frequently used globals)

### 6. Check Balatro-Specific Patterns
- Use sub-agent `smods-api-researcher` to verify API usage is current
- Check if newer SMODS features could simplify code
- Verify Lovely patches are still needed vs SMODS hooks

## Output Format

Provide a structured report:

```
## Refactoring Opportunities

### High Priority
1. [Issue]: [Description]
   - Location: [file:line]
   - Suggestion: [How to fix]
   - Impact: [Why this matters]

### Medium Priority
...

### Low Priority / Nice-to-Have
...

## Summary
- X redundant patterns found
- X outdated fallbacks identified
- X modularization opportunities
- X performance improvements suggested
```

## Workflow

1. **Research phase** (use sub-agents if needed):
   - Understand current code structure
   - Check SMODS API for better alternatives

2. **Analysis phase**:
   - Run through checklist above
   - Document findings with specific file:line references

3. **Report phase**:
   - Present findings organized by priority
   - Ask user which items to address

4. **Refactor phase** (if user approves):
   - Make changes one at a time
   - Test after each significant change
