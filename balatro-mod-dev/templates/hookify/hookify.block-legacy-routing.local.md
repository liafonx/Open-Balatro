---
name: block-legacy-routing
enabled: true
event: bash
pattern: codeagent|route_subagent|run_subagent
action: block
---

**Legacy routing command detected.**

Use the Task tool instead:
```
Task(subagent_type="Explore", model="sonnet", prompt="...")
```

The `codeagent`, `run_subagent`, and `route_subagent` scripts were removed in plugin v2.0.0. All sub-agent delegation now uses Claude Code's native Task tool.
