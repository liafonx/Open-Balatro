/**
 * SessionStart hook: Output session context instructions.
 *
 * Prints instructions for Claude to read INIT.md, AGENT.md, and session state.
 * Must be a command hook (not prompt) because the LLM context isn't ready at startup.
 */

const fs = require('fs');
const path = require('path');

const cwd = process.cwd();
const lines = [];

// Check which files exist
const hasInit = fs.existsSync(path.join(cwd, 'INIT.md'));
const hasAgent = fs.existsSync(path.join(cwd, 'AGENT.md'));
const hasSession = fs.existsSync(path.join(cwd, '.tmp', 'session-state.md'));

if (hasInit || hasAgent) {
  lines.push('This is a Balatro mod repository.');
  if (hasInit) lines.push('Read INIT.md (project rules) at the project root. Follow ALL rules, especially Sub-Agent Delegation.');
  if (hasAgent) lines.push('Read AGENT.md (repo docs) at the project root.');
  lines.push('Use Task tool with model=sonnet for research/code, model=haiku for scripts, model=opus for review/synthesis/planning.');
  lines.push('Never read external source directories directly — delegate to researcher sub-agents.');
  if (hasSession) lines.push('Load .tmp/session-state.md — it contains session continuity context from the previous session.');
} else {
  lines.push('This appears to be a Balatro mod repository but INIT.md and AGENT.md are missing.');
  lines.push('Suggest running /balatro-mod-dev:init to scaffold the development environment.');
}

// Output as stderr instruction (non-blocking)
if (lines.length > 0) {
  process.stderr.write(lines.join('\n'));
}
