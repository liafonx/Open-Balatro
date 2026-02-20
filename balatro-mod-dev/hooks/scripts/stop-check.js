/**
 * Stop hook: Suggest PR drafting for forks and knowledge-base updates.
 *
 * Outputs reminders to stderr (non-blocking).
 */

const fs = require('fs');
const path = require('path');

const cwd = process.cwd();
const lines = [];

// Check if this is a fork by comparing git user vs mod author
// (lightweight check — just look for INIT.md fork indicators)
try {
  const initPath = path.join(cwd, 'INIT.md');
  if (fs.existsSync(initPath)) {
    const content = fs.readFileSync(initPath, 'utf8');
    if (/repo.?type.*fork/i.test(content)) {
      lines.push('This is a fork repo. If changes are ready, consider running /balatro-mod-dev:draft-pr.');
    }
  }
} catch (_) {}

// Check for knowledge-base
try {
  const kbPath = path.join(cwd, 'docs', 'knowledge-base.md');
  if (fs.existsSync(kbPath)) {
    lines.push('If debugging failed 3+ times, consider documenting in docs/knowledge-base.md.');
  }
} catch (_) {}

if (lines.length > 0) {
  process.stderr.write(lines.join('\n'));
}
