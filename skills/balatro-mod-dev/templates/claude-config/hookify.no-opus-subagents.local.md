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
---

**Opus model detected in sub-agent invocation.**

Sub-agents must NOT use Opus. Opus is reserved for the main agent only.

**Allowed models for sub-agents:**
- **Sonnet** — research requiring reasoning (game-source, smods-api, mod-pattern, lovely-patch)
- **Haiku** — pure search, grep, command execution (script-runner)

Fix the `--backend` or `--model` parameter and retry.
