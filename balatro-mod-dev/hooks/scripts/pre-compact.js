/**
 * PreCompact hook: Remind to save session state before compaction.
 *
 * Outputs instruction to stderr so the LLM preserves context.
 */

const fs = require('fs');
const path = require('path');

const cwd = process.cwd();

if (fs.existsSync(path.join(cwd, 'INIT.md')) || fs.existsSync(path.join(cwd, 'AGENT.md'))) {
  process.stderr.write(
    'Context is about to be compacted. Save critical session state to .tmp/session-state.md: ' +
    'Decisions Made, Key Findings, Current State, Unfinished Work. Keep under 50 lines.'
  );
}
