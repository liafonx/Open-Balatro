---
description: List all available balatro-mod-dev commands
allowed-tools: Read
---

# Available Commands

Display all commands provided by the balatro-mod-dev plugin, organized by workflow phase.

## Output

Present this command reference to the user:

```
=== balatro-mod-dev Commands ===

SETUP & ONBOARDING
  /balatro-mod-dev:init          Initialize mod dev environment for current repo
  /balatro-mod-dev:familiar      Get oriented — what this mod does, how it works
  /balatro-mod-dev:check         Health audit — project config, scripts, rules, gitignore

DEVELOPMENT
  /balatro-mod-dev:sync-mod      Start file sync with watch mode
  /balatro-mod-dev:debug         Analyze Lovely logs to verify fixes
  /balatro-mod-dev:test          Run test scenarios and check mod behavior
  /balatro-mod-dev:refactor      Review codebase for refactoring opportunities
  /balatro-mod-dev:fix-sprites   Fix transparent pixel colors in sprite images

RELEASE
  /balatro-mod-dev:bump-version  Increment version and update changelogs
  /balatro-mod-dev:release       Create release packages for distribution
  /balatro-mod-dev:draft-pr      Draft a PR message for fork contributions

DOCUMENTATION
  /balatro-mod-dev:update-docs   Review and update all documentation
  /balatro-mod-dev:knowledge     Capture session discoveries into knowledge base

MAINTENANCE
  /balatro-mod-dev:update-plugin Update plugin content from new knowledge
  /balatro-mod-dev:compact       Evaluate whether to compact context now
  /balatro-mod-dev:help          Show this command reference
```

## Agents

Also mention the available agents:

```
=== Agents (auto-invoked via Task tool) ===

<!-- Agent list: also in SKILL.md and references/sub-agents.md -->
RESEARCH (sonnet, read-only)
  game-source-researcher    Search game source for functions, injection points
  smods-api-researcher      Search SMODS API for patterns, hooks
  mod-pattern-researcher    Search other mods for implementation patterns
  lovely-patch-researcher   Search Lovely patch syntax and examples
  project-explorer          Map current mod's architecture

IMPLEMENTATION
  code-writer (sonnet)      Execute implementation plans (read-write)
  script-runner (haiku)     Run one-off utility scripts

DEEP REASONING (opus)
  code-reviewer             Review code with confidence scoring (>=80)
  research-analyst          Synthesize multi-source research findings
  strategic-planner         Plan complex feature implementations

DIAGNOSTICS
  debug-inspector (sonnet)  Inspect runtime logs, dumps, mod compatibility
```
