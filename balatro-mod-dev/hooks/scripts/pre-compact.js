/**
 * PreCompact hook: Append compaction marker to active session file.
 *
 * Finds the most recent session file in ~/.claude/sessions/ and appends
 * a timestamped compaction marker. Also outputs a reminder via stderr.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const cwd = process.cwd();

if (fs.existsSync(path.join(cwd, 'INIT.md')) || fs.existsSync(path.join(cwd, 'AGENT.md'))) {
  // Append compaction marker to most recent session file
  const sessionsDir = path.join(os.homedir(), '.claude', 'sessions');
  try {
    if (fs.existsSync(sessionsDir)) {
      const sessionFiles = fs.readdirSync(sessionsDir)
        .filter(f => f.endsWith('-session.tmp'))
        .map(f => ({ name: f, path: path.join(sessionsDir, f), mtime: fs.statSync(path.join(sessionsDir, f)).mtimeMs }))
        .sort((a, b) => b.mtime - a.mtime);

      if (sessionFiles.length > 0) {
        const time = new Date().toTimeString().split(' ')[0].substring(0, 5);
        const marker = `\n---\n**[Compaction occurred at ${time}]** - Context was summarized\n`;
        fs.appendFileSync(sessionFiles[0].path, marker, 'utf8');
      }
    }
  } catch (_) {}

  // Keep stderr reminder — still useful as guidance for the LLM
  process.stderr.write(
    'Context is about to be compacted. Ensure TodoWrite reflects current progress. ' +
    'Session state is tracked automatically in ~/.claude/sessions/.'
  );
}
