/**
 * PreToolUse hook for Write/Edit: Warn on edits to important files.
 *
 * All protected files are warn-only (exit 0) so commands like /check,
 * /update-docs, and /init can update them without being blocked.
 *
 * Repos can extend the list via "protected_files" in mod.config.json.
 */

const fs = require("fs");
const path = require("path");

const PROTECTED_FILES = [
  "AGENTS.md",
  "docs/AGENTS.md",
  // Legacy names kept for backward compat with unreleased repos
  "AGENT.md",
  "docs/AGENT.md",
  "INIT.md",
  "mod.config.json",
  "README.md",
  "README_zh.md",
  "CHANGELOG.md",
  "CHANGELOG_zh.md",
];

/**
 * Try to read repo-specific protected files from mod.config.json in CWD.
 * Returns an empty array on any failure (missing file, parse error, etc.).
 */
function readRepoProtectedFiles() {
  try {
    const configPath = path.join(process.cwd(), "mod.config.json");
    const raw = fs.readFileSync(configPath, "utf8");
    const config = JSON.parse(raw);
    if (Array.isArray(config.protected_files)) {
      return config.protected_files.filter((f) => typeof f === "string");
    }
  } catch (_) {
    // No config or not parseable — use defaults only
  }
  return [];
}

let data = "";
process.stdin.on("data", (chunk) => (data += chunk));
process.stdin.on("end", () => {
  try {
    const input = JSON.parse(data);
    const filePath = input.tool_input?.file_path || "";

    const repoProtected = readRepoProtectedFiles();
    const allProtected = [...new Set([...PROTECTED_FILES, ...repoProtected])];

    const base = path.basename(filePath);
    const isProtected = allProtected.some(
      (p) => base === p || filePath.endsWith("/" + p) || filePath === p,
    );

    if (isProtected) {
      process.stderr.write(
        "WARNING: Editing protected file " +
          base +
          ". " +
          "Ensure changes are intentional and consistent with other docs.",
      );
    }

    console.log(data);
  } catch (_) {
    // On error, allow the operation (non-blocking failure mode)
    console.log(data);
  }
});
