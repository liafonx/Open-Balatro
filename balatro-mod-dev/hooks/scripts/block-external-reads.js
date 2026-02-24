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

const EXTERNAL_SOURCE_ROUTES = [
  { pattern: 'Balatro_src/', agent: 'game-source-researcher' },
  { pattern: 'smods/src/', agent: 'smods-api-researcher' },
  { pattern: 'smods/lovely/', agent: 'lovely-patch-researcher' },
  { pattern: 'lovely-injector/', agent: 'lovely-patch-researcher' },
  { pattern: 'Application Support/Balatro/Mods/', agent: 'mod-pattern-researcher' },
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

    for (const { pattern, agent } of EXTERNAL_SOURCE_ROUTES) {
      if (target.includes(pattern)) {
        process.stderr.write(
          `BLOCK: Use Task(subagent_type="balatro-mod-dev:${agent}", model="sonnet") for this source. ` +
            `Do not read external source directories directly — delegate to the researcher sub-agent.`
        );
        process.exit(2);
      }
    }

    console.log(data);
  } catch (_) {
    // On error, allow the operation (non-blocking failure mode)
    console.log(data);
  }
});
