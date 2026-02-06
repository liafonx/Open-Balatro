# Update Suggestions for `balatro-mod-dev` (Align with Codeagent Non-Bypass Contract)

## Goal

Align `balatro-mod-dev` with the updated `codeagent` policy:

- Workflow skill decides **when/what/how many** subagents.
- Workflow skill does **not** call `codeagent-wrapper` directly.
- Subagent execution goes through routed entrypoint:
  - `~/.claude/skills/codeagent/scripts/route_subagent.sh -- <wrapper args>`

## Required Changes

### 1. Replace direct wrapper invocation examples

Update these docs/sections to remove direct `codeagent-wrapper ...` examples and replace with routed form:

- `skills/balatro-mod-dev/SKILL.md` (Sub-Agents for Research section)
- `skills/balatro-mod-dev/references/sub-agents.md` (Invocation section)

Use this pattern:

```bash
~/.claude/skills/codeagent/scripts/route_subagent.sh -- --backend <backend> - <workdir> <<'EOF'
<task content>
EOF
```

And for parallel:

```bash
~/.claude/skills/codeagent/scripts/route_subagent.sh -- --parallel <<'EOF'
---TASK---
id: <id>
backend: <backend>
workdir: /absolute/path
---CONTENT---
<task>
EOF
```

### 2. Keep backend preference in workflow config, but treat as hint

Current `mod.config.json` additions are good:

- `agent_backends.research`
- `agent_backends.execution`
- `agent_backends.overrides`

Keep these as workflow-side backend hints. Do not treat them as final execution policy. Codeagent still owns invocation policy and model resolution.

### 3. Clarify model/parameter ownership

Document that backend preference and model settings are split:

- Workflow (`mod.config.json`): task/agent -> preferred backend hint.
- Codeagent (`~/.codeagent/config.yaml`, `~/.codeagent/models.json`): model, reasoning, backend API endpoint/key, agent presets.

### 4. Enforce absolute paths in parallel task metadata

In `references/sub-agents.md`, enforce absolute `workdir` values in `---TASK---` blocks.
Do not use `~` in task metadata because parser passes raw values and shell expansion does not occur there.

### 5. Fix single-task workdir examples with spaces

When showing path examples with spaces (e.g., `Application Support`), keep workdir as a positional argument but ensure examples are quoted correctly where needed.

## Recommended Optional Improvements

### A. Add local adapter helper in skill scripts

Add `skills/balatro-mod-dev/scripts/run_subagent.sh` that converts balatro-specific config + task type into routed call to:

- `~/.claude/skills/codeagent/scripts/route_subagent.sh`

This keeps your workflow docs concise and prevents repeated command templates.

### B. Add a pre-merge checklist

Add a checklist item:

- \"No direct `codeagent-wrapper` command in docs/prompts/scripts (must be routed).\"

## Validation Checklist

- [ ] No direct `codeagent-wrapper` invocation remains in balatro-mod-dev docs.
- [ ] Routed examples are used for single and parallel modes.
- [ ] Parallel examples use absolute `workdir`.
- [ ] `mod.config.json` backend preferences remain workflow hints only.
- [ ] Docs explicitly reference `~/.codeagent/models.json` and `~/.codeagent/config.yaml` for model/params.

## Why This Matters

This keeps architecture clean:

- Workflow skills remain focused on decomposition/orchestration.
- Codeagent remains the single place for backend routing/invocation policy.
- Future backend/model policy updates can happen centrally without patching every workflow skill.
