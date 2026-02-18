/**
 * PreToolUse hook for Write/Edit: Block edits to protected files.
 *
 * Default protected files are always enforced. Repos can extend the list
 * by adding a "protected_files" array to their mod.config.json.
 *
 * Exit codes:
 *   0 — allow (not a protected file)
 *   2 — block (protected file, user must confirm)
 */

const fs = require('fs');
const path = require('path');

const DEFAULT_PROTECTED = [
  'AGENT.md',
  'docs/AGENT.md',
  'INIT.md',
  'mod.config.json',
  'README.md',
  'README_zh.md',
  'CHANGELOG.md',
  'CHANGELOG_zh.md',
];

/**
 * Try to read repo-specific protected files from mod.config.json in CWD.
 * Returns an empty array on any failure (missing file, parse error, etc.).
 */
function readRepoProtectedFiles() {
  try {
    const configPath = path.join(process.cwd(), 'mod.config.json');
    const raw = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(raw);
    if (Array.isArray(config.protected_files)) {
      return config.protected_files.filter(f => typeof f === 'string');
    }
  } catch (_) {
    // No config or not parseable — use defaults only
  }
  return [];
}

let data = '';
process.stdin.on('data', chunk => (data += chunk));
process.stdin.on('end', () => {
  try {
    const input = JSON.parse(data);
    const filePath = input.tool_input?.file_path || '';

    const repoProtected = readRepoProtectedFiles();
    const allProtected = [...new Set([...DEFAULT_PROTECTED, ...repoProtected])];

    const base = path.basename(filePath);
    const isProtected = allProtected.some(
      p => base === p || filePath.endsWith('/' + p) || filePath === p
    );

    if (isProtected) {
      process.stderr.write(
        'BLOCK: This is a protected file (' +
          filePath +
          '). Please confirm you want to modify it.'
      );
      process.exit(2);
    }

    console.log(data);
  } catch (_) {
    // On error, allow the operation (non-blocking failure mode)
    console.log(data);
  }
});
