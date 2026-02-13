---
name: no-opus-subagents
enabled: true
event: bash
action: block
conditions:
  - field: command
    operator: regex_match
    pattern: (run_subagent|route_subagent|codeagent)
  - field: command
    operator: regex_match
    pattern: opus
  - field: command
    operator: regex_not_match
    pattern: (strategic-planner|code-reviewer|research-analyst)
---

**Opus model detected in non-reasoning sub-agent invocation.**

Opus is only allowed for **reasoning** sub-agents (planning, review, analysis). Research and execution agents must use lighter models.

**Allowed Opus agents (reasoning tier):**
- `strategic-planner` — implementation planning before complex changes
- `code-reviewer` — deep code review for correctness and edge cases
- `research-analyst` — synthesize findings from multiple research agents

**Other agents must use:**
- **Sonnet** — research requiring reasoning (game-source, smods-api, mod-pattern, lovely-patch)
- **Haiku** — pure search, grep, command execution (script-runner)

Fix the `--backend` or `--model` parameter and retry.
