---
name: no-opus-subagents
enabled: true
event: task
action: block
conditions:
  - field: model
    operator: regex_match
    pattern: opus
---

**Opus sub-agent detected.**

The main agent (Opus) handles planning, code review, and research synthesis directly. Opus sub-agents waste tokens by duplicating what the orchestrator already does.

**Use instead:**
- **`model: sonnet`** — research agents, code-writer, project-explorer
- **`model: haiku`** — script-runner, simple command execution

The main Opus agent should:
- Plan implementation strategy directly (was: strategic-planner)
- Review code and results directly (was: code-reviewer)
- Synthesize research findings directly (was: research-analyst)

Change the `model` parameter to `sonnet` or `haiku` and retry.
