/**
 * PreToolUse hook for Read/Grep/Glob: Block direct reads from external sources.
 *
 * Forces delegation to researcher sub-agents instead of reading game source,
 * SMODS, or installed mods directly.
 *
 * Exit codes:
 *   0 — allow (path is not external)
 *   2 — block (external path, must delegate to researcher agent)
 */

const BLOCKED_PATHS = [
  'Balatro_src/',
  'smods/src/',
  'smods/lovely/',
  'Application Support/Balatro/Mods/',
  'lovely-injector/',
];

let data = '';
process.stdin.on('data', chunk => (data += chunk));
process.stdin.on('end', () => {
  try {
    const input = JSON.parse(data);
    const target =
      input.tool_input?.path ||
      input.tool_input?.file_path ||
      input.tool_input?.pattern ||
      '';

    if (BLOCKED_PATHS.some(b => target.includes(b))) {
      process.stderr.write(
        'BLOCK: Delegate external source searches to a research agent via Task tool. ' +
          'Do not read external references directly \u2014 spawn a researcher sub-agent instead.'
      );
      process.exit(2);
    }

    console.log(data);
  } catch (_) {
    // On error, allow the operation (non-blocking failure mode)
    console.log(data);
  }
});
