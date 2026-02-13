---
name: enforce-subagent-routing
enabled: true
event: bash
action: block
conditions:
  - field: command
    operator: regex_match
    pattern: route_subagent\.sh|codeagent-wrapper|codeagent\s+run
---

**Direct codeagent invocation detected.**

All sub-agent research MUST go through `./scripts/run_subagent.sh`, which resolves backend config from `mod.config.json` and routes through codeagent automatically.

**Correct usage:**
```bash
./scripts/run_subagent.sh game-source-researcher <<'EOF'
[task content]
EOF
```

**Available agents:** game-source-researcher, smods-api-researcher, mod-pattern-researcher, lovely-patch-researcher, project-explorer, script-runner, strategic-planner, code-reviewer, research-analyst

See the balatro-mod-dev skill's `references/sub-agents.md` for invocation patterns.
