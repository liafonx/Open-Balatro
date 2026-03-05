/**
 * PreToolUse hook for Task: Enforce model selection and agent routing.
 *
 * Checks:
 *   1. DENY if model is missing for a known agent type (Claude retries with correct model)
 *   2. DENY if model is wrong for a known agent type (Claude retries with correct model)
 *   3. DENY if a blocked agent type is spawned (e.g., Plan)
 *   4. DENY if Explore/general-purpose targets external source paths or runtime content
 *
 * Output protocol: exit 0 + JSON stdout (hookSpecificOutput)
 *   - process.exit(2) does NOT reliably block Task tool calls (CC bug #26923)
 *   - permissionDecision "deny"  → blocks the tool call, reason shown to Claude
 *   - permissionDecision "allow" + additionalContext → non-blocking warning to Claude
 *
 * Note: updatedInput injection (CC bug #15897) is unreliable when multiple PreToolUse
 *   hooks run — the last hook's empty response overwrites earlier injections. Using
 *   deny instead forces Claude to retry with the correct model explicitly.
 */

// Agent types that should never be spawned as sub-agents
const BLOCKED_AGENTS = {
  Plan: "Do not spawn Plan sub-agents. Plan directly in main context — the main agent is already Opus in plan mode. Spawning a Plan agent is redundant and expensive.",
};

const RECOMMENDED_MODELS = {
  // Built-in Claude Code agent types (all covered to prevent model inheritance)
  Explore: "sonnet",
  "general-purpose": "sonnet",
  "claude-code-guide": "sonnet",
  "statusline-setup": "sonnet",
  Bash: "haiku",
  // Plugin research agents
  "balatro-mod-dev:game-source-researcher": "sonnet",
  "balatro-mod-dev:smods-api-researcher": "sonnet",
  "balatro-mod-dev:mod-pattern-researcher": "sonnet",
  "balatro-mod-dev:lovely-patch-researcher": "sonnet",
  "balatro-mod-dev:project-explorer": "sonnet",
  "balatro-mod-dev:code-writer": "sonnet",
  "balatro-mod-dev:script-runner": "haiku",
  "balatro-mod-dev:debug-inspector": "sonnet",
  // Plugin opus agents (deep reasoning — code review, synthesis, planning)
  "balatro-mod-dev:code-reviewer": "opus",
  "balatro-mod-dev:research-analyst": "opus",
  "balatro-mod-dev:strategic-planner": "opus",
};

// External source paths that must go to researcher agents, not Explore/general-purpose
// Keep in sync with EXTERNAL_SOURCE_ROUTES in block-external-reads.js
const EXTERNAL_SOURCE_ROUTES = [
  { pattern: "Balatro_src/", agent: "balatro-mod-dev:game-source-researcher" },
  { pattern: "balatro_src/", agent: "balatro-mod-dev:game-source-researcher" },
  { pattern: "smods/src/", agent: "balatro-mod-dev:smods-api-researcher" },
  {
    pattern: "smods/lovely/",
    agent: "balatro-mod-dev:lovely-patch-researcher",
  },
  {
    pattern: "lovely-injector/",
    agent: "balatro-mod-dev:lovely-patch-researcher",
  },
  {
    pattern: "Application Support/Balatro/Mods/",
    agent: "balatro-mod-dev:mod-pattern-researcher",
  },
];

// Content-based routes: prompt keywords that must go to specialized agents
const CONTENT_ROUTES = [
  {
    keywords: [
      "latest log",
      "check the log",
      "check log",
      "lovely log",
      "game log",
      "lovely/log",
      "game crashed",
      "stack traceback",
    ],
    agent: "balatro-mod-dev:debug-inspector",
    reason: "log inspection",
  },
  {
    keywords: [
      "game dump",
      "patch dump",
      "dump analysis",
      "dump metadata",
      "lovely/dump",
      "lua.json",
    ],
    agent: "balatro-mod-dev:debug-inspector",
    reason: "dump analysis",
  },
  {
    keywords: [
      "mod compatibility",
      "patch conflict",
      "patch conflicts",
      "mod conflict",
      "compatibility check",
    ],
    agent: "balatro-mod-dev:debug-inspector",
    reason: "mod compatibility check",
  },
];

const GENERIC_AGENTS = new Set(["Explore", "general-purpose"]);

function deny(reason) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: reason,
      },
    }),
  );
  process.exit(0);
}

function denyMissingModel(agentType, requiredModel) {
  deny(
    `Model not specified for Task(subagent_type="${agentType}"). ` +
      `Retry with model="${requiredModel}". ` +
      `All Task calls MUST include an explicit model parameter.`,
  );
}

function denyWrongModel(agentType, gotModel, requiredModel) {
  deny(
    `Wrong model for Task(subagent_type="${agentType}"): got "${gotModel}", expected "${requiredModel}". ` +
      `Retry with model="${requiredModel}".`,
  );
}

let data = "";
process.stdin.on("data", (chunk) => (data += chunk));
process.stdin.on("end", () => {
  try {
    const input = JSON.parse(data);
    const toolInput = input.tool_input || {};
    const agentType = toolInput.subagent_type;
    const model = toolInput.model;
    const prompt = toolInput.prompt || "";

    if (!agentType) {
      // Not a Task call we care about — pass through
      process.exit(0);
      return;
    }

    // Deny: agents that should never be spawned as sub-agents
    const blockReason = BLOCKED_AGENTS[agentType];
    if (blockReason) {
      deny(blockReason);
    }

    const recommended = RECOMMENDED_MODELS[agentType];

    // Deny: model missing for a known agent type — force Claude to retry with correct model
    if (!model && recommended) {
      denyMissingModel(agentType, recommended);
    }

    // Deny: wrong model for a known agent type — force Claude to retry with correct model
    if (model && recommended && model !== recommended) {
      denyWrongModel(agentType, model, recommended);
    }

    // Deny: Explore/general-purpose targeting external source paths or runtime diagnostic content
    if (GENERIC_AGENTS.has(agentType)) {
      for (const { pattern, agent } of EXTERNAL_SOURCE_ROUTES) {
        if (prompt.includes(pattern)) {
          deny(
            `Use Task(subagent_type="${agent}", model="sonnet") instead of ${agentType} for external sources. ` +
              `Researcher agents have pre-configured paths and domain expertise. ` +
              `Do not use Explore or general-purpose for game source, SMODS, or installed mods.`,
          );
        }
      }

      const lowerPrompt = prompt.toLowerCase();
      for (const { keywords, agent, reason } of CONTENT_ROUTES) {
        if (keywords.some((kw) => lowerPrompt.includes(kw.toLowerCase()))) {
          deny(
            `Use Task(subagent_type="${agent}", model="sonnet") instead of ${agentType} for ${reason}. ` +
              `The debug-inspector agent has pre-configured log/dump paths and produces structured diagnostic reports.`,
          );
        }
      }
    }

    // All checks passed — allow
    process.exit(0);
  } catch (_) {
    process.exit(0);
  }
});
