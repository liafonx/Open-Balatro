#!/usr/bin/env node
// PostToolUse Edit hook: Warn about common nil-unsafe patterns in .lua edits
// stdin: JSON with tool_input.file_path and tool_input.new_string
// Outputs warnings to stderr, always exits 0 (warning, not blocking)

let data = '';
process.stdin.on('data', chunk => data += chunk);
process.stdin.on('end', () => {
  try {
    const input = JSON.parse(data);
    const filePath = input.tool_input?.file_path || '';
    const newString = input.tool_input?.new_string || '';

    if (!filePath.endsWith('.lua')) {
      process.stdout.write(data);
      process.exit(0);
    }

    const warnings = [];

    // Check: direct game state access without nil guard
    if (/G\.GAME\.(?!and)/.test(newString) && !/if\s+G\.GAME/.test(newString)) {
      warnings.push('G.GAME accessed without nil guard — use: if G.GAME and G.GAME.field then');
    }

    // Check: string concatenation with potential nil
    const concatMatch = newString.match(/\.\.\.?\s*\w+(?:\[\w+\])?\s*(?!--)/);
    if (concatMatch) {
      warnings.push('String concatenation detected — ensure value is not nil (use tostring() for safety)');
    }

    // Check: FFI comparison (cdata == number)
    if (/cdata.*==\s*\d|\d\s*==.*cdata/.test(newString)) {
      warnings.push('Possible FFI cdata comparison with number — use tonumber() first');
    }

    if (warnings.length > 0) {
      process.stderr.write(
        '[Lua Pitfall Check] ' + filePath + ':\n' +
        warnings.map(w => '  ⚠ ' + w).join('\n') + '\n' +
        'See references/lua-gotchas.md for details.\n'
      );
    }

    process.stdout.write(data);
    process.exit(0);
  } catch (e) {
    process.stdout.write(data);
    process.exit(0);
  }
});
