/**
 * SessionEnd hook: Parse JSONL transcript and write session summary.
 *
 * Reads transcript_path from stdin JSON (fallback: CLAUDE_TRANSCRIPT_PATH env var),
 * extracts user messages, files modified, tools used, and writes a summary
 * to ~/.claude/sessions/{date}-{project}-session.tmp.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

function getProjectName() {
  try {
    const toplevel = execSync('git rev-parse --show-toplevel', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
    return path.basename(toplevel);
  } catch (_) {
    return path.basename(process.cwd());
  }
}

function getTranscriptPath() {
  // Read stdin JSON for transcript_path
  try {
    const input = fs.readFileSync(0, 'utf8').trim();
    if (input) {
      const parsed = JSON.parse(input);
      if (parsed.transcript_path) return parsed.transcript_path;
    }
  } catch (_) {}

  // Fallback to env var
  return process.env.CLAUDE_TRANSCRIPT_PATH || null;
}

function extractUserMessage(entry) {
  // Shape 1: flat { type: "user", message: { content: "..." } }
  if (entry.type === 'user' && entry.message) {
    const content = entry.message.content;
    if (typeof content === 'string') return content;
    if (Array.isArray(content)) {
      const textParts = content
        .filter(c => c.type === 'text' && typeof c.text === 'string')
        .map(c => c.text);
      return textParts.join(' ') || null;
    }
    return null;
  }

  // Shape 2: flat { role: "user", content: "..." }
  if (entry.role === 'user') {
    const content = entry.content;
    if (typeof content === 'string') return content;
    if (Array.isArray(content)) {
      const textParts = content
        .filter(c => c.type === 'text' && typeof c.text === 'string')
        .map(c => c.text);
      return textParts.join(' ') || null;
    }
    return null;
  }

  // Shape 3: nested { message: { role: "user", content: [...] } }
  if (entry.message && entry.message.role === 'user') {
    const content = entry.message.content;
    if (typeof content === 'string') return content;
    if (Array.isArray(content)) {
      const textParts = content
        .filter(c => c.type === 'text' && typeof c.text === 'string')
        .map(c => c.text);
      return textParts.join(' ') || null;
    }
  }

  return null;
}

function extractToolsAndFiles(entry) {
  const tools = new Set();
  const files = new Set();

  // Look for tool_use in assistant messages
  const content = entry.content || (entry.message && entry.message.content);
  if (!Array.isArray(content)) return { tools, files };

  for (const block of content) {
    if (block.type === 'tool_use' && block.name) {
      tools.add(block.name);
      // Extract file paths from Edit/Write tool calls
      if ((block.name === 'Edit' || block.name === 'Write') && block.input) {
        const filePath = block.input.file_path;
        if (typeof filePath === 'string') {
          files.add(filePath);
        }
      }
    }
  }

  return { tools, files };
}

function truncate(str, maxLen) {
  if (!str || str.length <= maxLen) return str;
  return str.substring(0, maxLen) + '...';
}

function main() {
  const transcriptPath = getTranscriptPath();
  if (!transcriptPath || !fs.existsSync(transcriptPath)) {
    return; // No transcript available — nothing to do
  }

  const rawLines = fs.readFileSync(transcriptPath, 'utf8').split('\n').filter(Boolean);
  if (rawLines.length === 0) return;

  const userMessages = [];
  const allTools = new Set();
  const allFiles = new Set();
  let totalUserMessages = 0;
  let firstTimestamp = null;
  let lastTimestamp = null;

  for (const line of rawLines) {
    let entry;
    try {
      entry = JSON.parse(line);
    } catch (_) {
      continue;
    }

    // Track timestamps
    const ts = entry.timestamp || entry.created_at;
    if (ts) {
      if (!firstTimestamp) firstTimestamp = ts;
      lastTimestamp = ts;
    }

    // Extract user messages
    const userMsg = extractUserMessage(entry);
    if (userMsg) {
      totalUserMessages++;
      // Strip system-reminder tags for cleaner output
      const cleaned = userMsg.replace(/<system-reminder>[\s\S]*?<\/system-reminder>/g, '').trim();
      if (cleaned && userMessages.length < 10) {
        userMessages.push(truncate(cleaned, 200));
      }
    }

    // Extract tools and files from assistant responses
    const { tools, files } = extractToolsAndFiles(entry);
    for (const t of tools) allTools.add(t);
    for (const f of files) {
      if (allFiles.size < 30) allFiles.add(f);
    }
  }

  // Skip trivial sessions (< 2 user messages)
  if (totalUserMessages < 2) return;

  const now = new Date();
  const date = now.toISOString().split('T')[0];
  const time = now.toTimeString().split(' ')[0].substring(0, 5);
  const startTime = firstTimestamp
    ? new Date(firstTimestamp).toTimeString().split(' ')[0].substring(0, 5)
    : time;
  const projectName = getProjectName();

  // Build summary
  const lines = [
    `# Session: ${date}`,
    `**Project:** ${projectName}`,
    `**Date:** ${date}`,
    `**Started:** ${startTime}`,
    `**Last Updated:** ${time}`,
    '',
    '---',
    '',
    '## Session Summary',
    '',
    '### Tasks',
  ];

  for (const msg of userMessages) {
    lines.push(`- ${msg}`);
  }

  if (allFiles.size > 0) {
    lines.push('');
    lines.push('### Files Modified');
    for (const f of allFiles) {
      lines.push(`- ${f}`);
    }
  }

  if (allTools.size > 0) {
    const toolList = [...allTools].slice(0, 20).join(', ');
    lines.push('');
    lines.push('### Tools Used');
    lines.push(toolList);
  }

  lines.push('');
  lines.push('### Stats');
  lines.push(`- Total user messages: ${totalUserMessages}`);

  // Write to ~/.claude/sessions/
  const sessionsDir = path.join(os.homedir(), '.claude', 'sessions');
  try {
    fs.mkdirSync(sessionsDir, { recursive: true });
  } catch (_) {}

  const filename = `${date}-${projectName}-session.tmp`;
  const outputPath = path.join(sessionsDir, filename);
  fs.writeFileSync(outputPath, lines.join('\n') + '\n', 'utf8');
}

main();
