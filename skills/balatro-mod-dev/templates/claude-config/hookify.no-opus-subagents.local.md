---
name: no-opus-subagents
enabled: true
event: all
action: block
skill-version: 1.4.5
conditions:
  - field: model
    operator: not_contains
    pattern: sonnet
  - field: model
    operator: not_contains
    pattern: haiku
---

**Task tool call missing explicit model parameter, or using a disallowed model.**

Every Task tool call MUST include `model: "sonnet"` or `model: "haiku"` explicitly. Omitting the model parameter causes the sub-agent to inherit the parent model (Opus), which wastes tokens and violates the orchestrator architecture.

**Required model selection:**
- **`model: "sonnet"`** — research agents, code-writer, project-explorer
- **`model: "haiku"`** — script-runner, simple command execution

**The main Opus agent handles directly (no sub-agent needed):**
- Planning implementation strategy
- Reviewing code and results
- Synthesizing research findings
- Presenting to user

Add an explicit `model: "sonnet"` or `model: "haiku"` parameter and retry.
