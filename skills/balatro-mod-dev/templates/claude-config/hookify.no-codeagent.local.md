---
name: no-codeagent
enabled: true
event: bash
action: block
skill-version: 1.4.0
conditions:
  - field: command
    operator: regex_match
    pattern: codeagent|route_subagent|run_subagent
---

**Legacy sub-agent routing detected.**

The `codeagent`, `route_subagent.sh`, and `run_subagent.sh` infrastructure has been replaced. Sub-agents now use the built-in **Task tool** with model selection.

**Correct usage:**
```
Task(subagent_type="Explore", model="sonnet", prompt="[agent template + task]")
Task(subagent_type="general-purpose", model="sonnet", prompt="[code-writer template + plan]")
Task(subagent_type="Bash", model="haiku", prompt="[script to run]")
```

**Available agents (7 total):**
- Research: game-source-researcher, smods-api-researcher, mod-pattern-researcher, lovely-patch-researcher
- Exploration: project-explorer
- Code: code-writer
- Execution: script-runner

See `references/sub-agents.md` for invocation patterns.
