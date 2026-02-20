/**
 * PostToolUse Write hook: Suggest adding new mod files to mod.config.json.
 *
 * Checks if the written file is a mod source file (.lua, .toml, or in a mod directory)
 * and reminds to update mod.config.json include_files if needed.
 */

const fs = require('fs');
const path = require('path');

let data = '';
process.stdin.on('data', chunk => (data += chunk));
process.stdin.on('end', () => {
  try {
    const input = JSON.parse(data);
    const filePath = input.tool_input?.file_path || '';
    const ext = path.extname(filePath);

    // Only care about mod source files
    const modExtensions = ['.lua', '.toml'];
    const modDirs = ['Utils/', 'localization/', 'assets/', 'lovely/'];

    const isModFile = modExtensions.includes(ext) ||
      modDirs.some(d => filePath.includes(d));

    if (isModFile) {
      // Check if mod.config.json exists
      const cwd = process.cwd();
      if (fs.existsSync(path.join(cwd, 'mod.config.json'))) {
        process.stderr.write(
          'New mod source file created. Consider adding to mod.config.json include_files.'
        );
      }
    }

    console.log(data);
  } catch (_) {
    console.log(data);
  }
});
