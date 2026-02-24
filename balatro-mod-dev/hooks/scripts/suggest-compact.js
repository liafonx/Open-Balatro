/**
 * PreToolUse hook for Edit|Write: Suggest manual compaction at logical intervals.
 *
 * Counts tool calls per session via a temp file. At threshold (default 50)
 * and every 25 calls after, suggests /compact via stderr.
 *
 * Tailored to mod development phases:
 *   Research → Plan → Implement → Test → Debug
 *
 * Environment:
 *   COMPACT_THRESHOLD - first suggestion threshold (default: 50, range: 1-10000)
 *   CLAUDE_SESSION_ID - session identifier (set by Claude Code)
 *
 * Exit codes:
 *   0 — always (never blocks)
 */

const fs = require('fs');
const os = require('os');
const path = require('path');

const REPEAT_INTERVAL = 25;
const MAX_COUNT = 1000000;

const sessionId = process.env.CLAUDE_SESSION_ID || 'default';
const counterFile = path.join(os.tmpdir(), `balatro-mod-dev-compact-${sessionId}`);

const rawThreshold = parseInt(process.env.COMPACT_THRESHOLD, 10);
const threshold = rawThreshold > 0 && rawThreshold <= 10000 ? rawThreshold : 50;

let count = 0;
try {
  const raw = fs.readFileSync(counterFile, 'utf8').trim();
  const parsed = parseInt(raw, 10);
  count = parsed > 0 && parsed <= MAX_COUNT ? parsed : 0;
} catch (_) {
  // File doesn't exist yet — first call this session
}

count += 1;

try {
  fs.writeFileSync(counterFile, String(count), 'utf8');
} catch (_) {
  // Non-critical — counter just won't persist
}

if (count === threshold) {
  process.stderr.write(
    `[Compact] ${count} edit/write calls reached. ` +
      'Consider /compact if transitioning phases ' +
      '(research→plan, plan→implement, debug→next feature). ' +
      'Skip if mid-implementation.'
  );
} else if (count > threshold && (count - threshold) % REPEAT_INTERVAL === 0) {
  process.stderr.write(
    `[Compact] ${count} edit/write calls. ` +
      'Good checkpoint for /compact if context feels stale or you finished a phase.'
  );
}

// Read and pass through stdin (required for PreToolUse hooks)
let data = '';
process.stdin.on('data', chunk => (data += chunk));
process.stdin.on('end', () => console.log(data));
