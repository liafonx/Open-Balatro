#!/usr/bin/env node
// PreToolUse Bash hook: Block legacy codeagent/route_subagent/run_subagent commands
// stdin: JSON with tool_input.command
// exit 2 (block) if command matches legacy routing patterns
// exit 0 (allow) otherwise

let data = '';
process.stdin.on('data', chunk => data += chunk);
process.stdin.on('end', () => {
  try {
    const input = JSON.parse(data);
    const cmd = input.tool_input?.command || '';
    const legacyPattern = /codeagent|route_subagent|run_subagent/;
    if (legacyPattern.test(cmd)) {
      process.stderr.write(
        'BLOCK: Legacy routing command detected (' + cmd.substring(0, 60) + '...)\n' +
        'Use the Task tool instead: Task(subagent_type="Explore", model="sonnet", prompt="...")\n'
      );
      process.exit(2);
    }
    // Pass through
    process.stdout.write(data);
    process.exit(0);
  } catch (e) {
    // On error, pass through (don't block on hook failure)
    process.stdout.write(data);
    process.exit(0);
  }
});
