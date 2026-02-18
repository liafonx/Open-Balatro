#!/usr/bin/env node
// PostToolUse Edit hook: Warn when print() is added to .lua files in own repos
// stdin: JSON with tool_input.file_path and tool_input.new_string
// Outputs warning to stderr, always exits 0 (warning, not blocking)

let data = '';
process.stdin.on('data', chunk => data += chunk);
process.stdin.on('end', () => {
  try {
    const input = JSON.parse(data);
    const filePath = input.tool_input?.file_path || '';
    const newString = input.tool_input?.new_string || '';

    if (filePath.endsWith('.lua') && /\bprint\s*\(/.test(newString)) {
      process.stderr.write(
        '[Warning] bare print() detected in ' + filePath + '\n' +
        'Own repos should use Logger instead: local log = Logger.create("Module"); log("info", "msg")\n' +
        'For forks: use pcall(print, "[Debug] ...") and remove before PR.\n'
      );
    }

    // Always pass through (warning only, not blocking)
    process.stdout.write(data);
    process.exit(0);
  } catch (e) {
    process.stdout.write(data);
    process.exit(0);
  }
});
