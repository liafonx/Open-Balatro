/**
 * SessionStart hook: Output session context instructions.
 *
 * Prints instructions for Claude to read AGENTS.md (or legacy AGENT.md/INIT.md),
 * and loads the most recent session summary from ~/.claude/sessions/.
 */

const fs = require("fs");
const path = require("path");
const os = require("os");

const cwd = process.cwd();
const lines = [];

// Check which project files exist (AGENTS.md is current; AGENT.md/INIT.md are legacy fallbacks)
const hasAgents = fs.existsSync(path.join(cwd, "AGENTS.md"));
const hasAgent = fs.existsSync(path.join(cwd, "AGENT.md"));
const hasInit = fs.existsSync(path.join(cwd, "INIT.md"));

// Always output model requirement rule — enforce-task-model.js blocks on every session
lines.push(
  "RULE: Every Task tool call MUST include the model parameter. " +
    'model="sonnet" → Explore, general-purpose, claude-code-guide, research agents, code-writer, debug-inspector. ' +
    'model="haiku" → Bash, script-runner. ' +
    'model="opus" → code-reviewer, research-analyst, strategic-planner. ' +
    "Missing model will be blocked automatically. " +
    "Do NOT spawn Plan sub-agents — plan in main context. " +
    'In plan mode: all Explore/general-purpose agents MUST use model="sonnet". ' +
    "Agent routing: use debug-inspector for log inspection, game dump analysis, or mod compatibility checks — NOT Explore. " +
    "Use game-source-researcher for Balatro_src/. Use smods-api-researcher for smods/src/. " +
    "Use lovely-patch-researcher for lovely patches. Use mod-pattern-researcher for installed mods. " +
    "Never use Explore or general-purpose for runtime diagnostics or external source directories.",
);

if (hasAgents || hasAgent || hasInit) {
  lines.push("This is a Balatro mod repository.");
  if (hasAgents)
    lines.push("Read AGENTS.md (agent guide) at the project root.");
  else {
    // Legacy fallback for repos not yet migrated — run /balatro-mod-dev:check to migrate
    if (hasInit)
      lines.push(
        "Read INIT.md (project rules) at the project root. Follow ALL rules, especially Sub-Agent Delegation.",
      );
    if (hasAgent) lines.push("Read AGENT.md (repo docs) at the project root.");
  }
  lines.push(
    "Never read external source directories directly — delegate to researcher sub-agents.",
  );

  // Load most recent session from ~/.claude/sessions/
  const sessionsDir = path.join(os.homedir(), ".claude", "sessions");
  try {
    if (fs.existsSync(sessionsDir)) {
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const sessionFiles = fs
        .readdirSync(sessionsDir)
        .filter((f) => f.endsWith("-session.tmp"))
        .map((f) => ({
          name: f,
          path: path.join(sessionsDir, f),
          mtime: fs.statSync(path.join(sessionsDir, f)).mtimeMs,
        }))
        .filter((f) => f.mtime > sevenDaysAgo)
        .sort((a, b) => b.mtime - a.mtime);

      if (sessionFiles.length > 0) {
        const content = fs.readFileSync(sessionFiles[0].path, "utf8");
        // Skip files with placeholder text
        if (
          !content.includes("[Session context goes here]") &&
          content.trim().length > 0
        ) {
          lines.push("Previous session summary:\n" + content.trim());
        }
      }
    }
  } catch (_) {}
} else {
  lines.push(
    "This appears to be a Balatro mod repository but AGENTS.md is missing.",
  );
  lines.push(
    "Suggest running /balatro-mod-dev:init to scaffold the development environment.",
  );
}

// Output as stderr instruction (non-blocking)
if (lines.length > 0) {
  process.stderr.write(lines.join("\n"));
}
