/**
 * Prompt builder: assembles the final LLM prompt from all agent sources.
 *
 * Assembly order (intentional — most authoritative first):
 *  1. Agent SYSTEM.md
 *  2. Skill files (labeled by skill ID)
 *  3. Project memory files
 *  4. Task description
 *  5. Acceptance criteria (if provided)
 *  6. Permissions summary
 *  7. Quality gates
 *  8. Output format requirements
 */

import type { LoadedAgent } from "./types";

const DIVIDER = "─".repeat(72);

function section(title: string, content: string): string {
  return `\n${DIVIDER}\n## ${title}\n${DIVIDER}\n\n${content.trim()}\n`;
}

/**
 * Build the final prompt string that will be sent to the execution engine.
 */
export function buildPrompt(
  agent: LoadedAgent,
  task: string,
  acceptanceCriteria?: string
): string {
  const { manifest, systemPrompt, skills, memoryFiles } = agent;
  const parts: string[] = [];

  // ── 1. Agent Identity Header ──────────────────────────────────────────────
  parts.push(
    `# ${manifest.name} — Agent Execution Context\n\n` +
      `**Agent ID**: \`${manifest.id}\`  \n` +
      `**Role**: ${manifest.role}  \n` +
      `**Version**: ${manifest.version}  \n` +
      `**Model**: ${manifest.default_model}`
  );

  // ── 2. System Prompt ──────────────────────────────────────────────────────
  parts.push(section("System Prompt", systemPrompt));

  // ── 3. Skill Files ────────────────────────────────────────────────────────
  if (skills.length > 0) {
    const skillsBlock = skills
      .map(
        (skill) =>
          `### Skill: \`${skill.id}\`\n\n${skill.content.trim()}`
      )
      .join("\n\n" + "─".repeat(48) + "\n\n");

    parts.push(section(`Loaded Skills (${skills.length})`, skillsBlock));
  }

  // ── 4. Project Memory ─────────────────────────────────────────────────────
  if (memoryFiles.length > 0) {
    const memoryBlock = memoryFiles
      .map((mf) => `### File: \`${mf.path}\`\n\n\`\`\`\n${mf.content.trim()}\n\`\`\``)
      .join("\n\n");

    parts.push(section(`Project Memory (${memoryFiles.length} files)`, memoryBlock));
  }

  // ── 5. Task ───────────────────────────────────────────────────────────────
  parts.push(section("Task", task));

  // ── 6. Acceptance Criteria ────────────────────────────────────────────────
  if (acceptanceCriteria && acceptanceCriteria.trim().length > 0) {
    parts.push(section("Acceptance Criteria", acceptanceCriteria));
  }

  // ── 7. Permissions ────────────────────────────────────────────────────────
  const { permissions, memory } = manifest;
  const permLines = [
    `- **Read files**: ${permissions.read_files ? "✅ Allowed" : "🚫 Denied"}`,
    `- **Write files**: ${permissions.write_files ? "✅ Allowed" : "🚫 Denied"}`,
    `- **Run commands**: ${permissions.run_commands ? "✅ Allowed" : "🚫 Denied"}`,
    `- **Network access**: ${permissions.network_access ? "✅ Allowed" : "🚫 Denied"}`,
    "",
    `**Memory scopes**: ${memory.scopes.join(", ")}`,
    memory.writable.length > 0
      ? `**Writable paths**: ${memory.writable.map((p) => `\`${p}\``).join(", ")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  parts.push(section("Permissions & Memory", permLines));

  // ── 8. Quality Gates ─────────────────────────────────────────────────────
  if (manifest.quality_gates.length > 0) {
    const gateLines = manifest.quality_gates
      .map((gate) =>
        Object.entries(gate)
          .map(([k, v]) => `- **${k}**: ${v}`)
          .join("\n")
      )
      .join("\n");

    parts.push(section("Quality Gates (all must pass)", gateLines));
  }

  // ── 9. Output Requirements ────────────────────────────────────────────────
  const { output } = manifest;
  const outputLines = [
    `- **Format**: ${output.format}`,
    `- **Include tests**: ${output.include_tests ? `Yes (${output.test_framework ?? "any framework"})` : "No"}`,
    `- **Supported task types**: ${manifest.supported_task_types.join(", ")}`,
  ].join("\n");

  parts.push(section("Output Requirements", outputLines));

  return parts.join("\n");
}
