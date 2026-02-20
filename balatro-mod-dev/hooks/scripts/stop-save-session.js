/**
 * Stop hook: Remind to save session state.
 *
 * Outputs a reminder to stderr. The actual session-state writing
 * is done by the LLM in response to this instruction.
 */

const fs = require('fs');
const path = require('path');

const cwd = process.cwd();

// Only remind if .tmp/ directory exists (indicates session tracking is set up)
const tmpDir = path.join(cwd, '.tmp');
if (fs.existsSync(tmpDir) || fs.existsSync(path.join(cwd, 'INIT.md'))) {
  process.stderr.write(
    'Save session state: Write a summary to .tmp/session-state.md with sections: ' +
    'Decisions Made, Key Findings, Current State, Unfinished Work, Files Modified. ' +
    'Keep under 50 lines.'
  );
}
