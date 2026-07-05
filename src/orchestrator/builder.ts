/**
 * Prompt builder: assembles the final LLM prompt from all agent sources.
 * IMH-Code — Imam Hussain Coding Harness Platform
 *
 * Assembly order (most authoritative first):
 *  1. Agent SYSTEM.md
 *  2. Core skill files (always loaded)
 *  3. Extended skill files (loaded on demand by keyword match)
 *  4. Compact project context (.imhcode/context.md if exists)
 *  5. Task-scoped memory files (only files relevant to this task)
 *  6. Task description
 *  7. Acceptance criteria (if provided)
 *  8. Permissions summary
 *  9. Quality gates
 * 10. Category-specific output format
 */

import * as fs from "fs";
import * as path from "path";
import type { LoadedAgent } from "./types";

const DIVIDER = "─".repeat(72);

function section(title: string, content: string): string {
  return `\n${DIVIDER}\n## ${title}\n${DIVIDER}\n\n${content.trim()}\n`;
}

// ─── Agent Category → Task-Type Rules ────────────────────────────────────────

/** Maps agent IDs to task categories for targeted prompt instructions */
const AGENT_CATEGORY_MAP: Record<string, string> = {
  "planner":              "planning",
  "designer":             "frontend",
  "nextjs-executor":      "frontend",
  "react-executor":       "frontend",
  "vue-executor":         "frontend",
  "laravel-executor":     "backend",
  "python-executor":      "backend",
  "java-executor":        "backend",
  "flutter-executor":     "backend",
  "react-native-executor":"backend",
  "ios-executor":         "backend",
  "android-executor":     "backend",
  "systems-executor":     "backend",
  "web3-executor":        "backend",
  "devops-executor":      "backend",
  "tester":               "testing",
  "security-auditor":     "testing",
  "seo-optimizer":        "review",
  "debugger":             "review",
};

/** Category-specific output instructions to keep prompts lean and focused */
const CATEGORY_OUTPUT_RULES: Record<string, string> = {
  frontend: [
    "- Focus ONLY on UI/UX, components, styling, and frontend logic.",
    "- Code MUST be written in `frontend/` directory only.",
    "- Do NOT touch backend files unless explicitly asked.",
    "- Produce working, visually excellent code on the first attempt.",
    "- Use the design system and component library specified in the project.",
  ].join("\n"),

  backend: [
    "- Focus ONLY on backend logic, APIs, database, and server-side code.",
    "- Code MUST be written in `backend/` directory only.",
    "- Do NOT touch frontend files unless explicitly asked.",
    "- Follow RESTful conventions and input validation best practices.",
    "- Write clean, production-ready code — no TODO stubs.",
  ].join("\n"),

  planning: [
    "- Produce structured markdown documents only.",
    "- Think deeply before generating sprint plans — consider dependencies.",
    "- Generate realistic, achievable tasks (not over-scoped).",
    "- Include dependency ordering and parallel task opportunities.",
    "- Save all planning docs to `docs/` directory.",
  ].join("\n"),

  testing: [
    "- Focus ONLY on test coverage, security findings, and audit reports.",
    "- Be thorough and systematic — cover edge cases.",
    "- Produce actionable reports with severity ratings.",
    "- Write actual test code, not just descriptions.",
  ].join("\n"),

  review: [
    "- Focus on code quality, performance, and correctness.",
    "- Provide specific, actionable feedback with file references.",
    "- Check for security issues, performance bottlenecks, and best practice violations.",
  ].join("\n"),
};

// ─── Compact Context Loader ───────────────────────────────────────────────────

/**
 * Load the compact project context from .imhcode/context.md if it exists.
 * This replaces loading all raw project files and saves ~40% tokens.
 */
function loadCompactContext(cwd: string): string | null {
  const contextPath = path.join(cwd, ".imhcode", "context.md");
  if (fs.existsSync(contextPath)) {
    try {
      return fs.readFileSync(contextPath, "utf-8");
    } catch {
      return null;
    }
  }
  return null;
}

// ─── Build Prompt ─────────────────────────────────────────────────────────────

/**
 * Build the final prompt string that will be sent to the execution engine.
 * Uses category-specific templates to reduce prompt size by ~40%.
 */
export function buildPrompt(
  agent: LoadedAgent,
  task: string,
  acceptanceCriteria?: string,
  cwd?: string
): string {
  const { manifest, systemPrompt, skills, memoryFiles } = agent;
  const parts: string[] = [];

  // Determine agent category for targeted instructions
  const category = AGENT_CATEGORY_MAP[manifest.id] ?? "backend";

  // ── 1. Agent Identity Header ──────────────────────────────────────────────
  parts.push(
    `# IMH-Code Agent Execution\n\n` +
      `**Agent**: \`${manifest.id}\`  \n` +
      `**Role**: ${manifest.role}  \n` +
      `**Category**: ${category}  \n` +
      `**Version**: ${manifest.version}`
  );

  // ── 2. System Prompt ──────────────────────────────────────────────────────
  parts.push(section("System Prompt", systemPrompt));

  // ── 3. Skill Files (Core + Extended) ─────────────────────────────────────
  if (skills.length > 0) {
    const skillsBlock = skills
      .map(
        (skill) =>
          `### Skill: \`${skill.id}\`\n\n${skill.content.trim()}`
      )
      .join("\n\n" + "─".repeat(48) + "\n\n");

    parts.push(section(`Loaded Skills (${skills.length})`, skillsBlock));
  }

  // ── 4. Compact Project Context (token-efficient) ──────────────────────────
  if (cwd) {
    const compactContext = loadCompactContext(cwd);
    if (compactContext) {
      parts.push(section("Project Context (Compact)", compactContext.trim()));
    } else if (memoryFiles.length > 0) {
      // Fall back to memory files if no compact context exists
      const memoryBlock = memoryFiles
        .map((mf) => `### File: \`${mf.path}\`\n\n\`\`\`\n${mf.content.trim()}\n\`\`\``)
        .join("\n\n");
      parts.push(section(`Project Memory (${memoryFiles.length} files)`, memoryBlock));
    }
  } else if (memoryFiles.length > 0) {
    const memoryBlock = memoryFiles
      .map((mf) => `### File: \`${mf.path}\`\n\n\`\`\`\n${mf.content.trim()}\n\`\`\``)
      .join("\n\n");
    parts.push(section(`Project Memory (${memoryFiles.length} files)`, memoryBlock));
  }

  // ── 4b. Assets & Shared References Integration ────────────────────────────
  if (cwd) {
    const partsList: string[] = [];
    partsList.push(
      `IMPORTANT: Always inspect the \`.imhcode/assets/\` directory at the project root for any shared reference code, designs, or assets.`,
      `- **Logo & Branding Assets**: Look for logos (e.g. \`logo.svg\`, images) or styling files. You MUST copy/integrate them into the frontend (e.g. \`frontend/public/\` or \`frontend/src/assets/\`) and use them directly.`,
      `- **Shared Frontend/Theme References**: If a \`.imhcode/assets/frontend/\` or \`theme/\` folder exists, review the components, styling sheets, layouts, and pages inside it. Take exact design/coding patterns, or directly reuse the components in your new frontend implementation to match the requested look and feel.`,
      `- **Shared Backend References**: If a \`.imhcode/assets/backend/\` folder exists, review the database schemas, API routes, models, and business logic. Replicate the architecture, reuse logic patterns, and align your new backend code structure with this reference implementation.`,
      `- **Always Use Latest Stable Stacks**: When setting up the project structure, compile and install the LATEST stable versions of libraries/frameworks. If initializing the codebase, run official command-line initializers (e.g. \`npx create-next-app@latest ./ --ts --tailwind --eslint --app --src-dir --import-alias "@/*"\` or \`composer create-project laravel/laravel .\`) directly within the target directory (\`frontend/\` or \`backend/\`) to bootstrap proper settings, then organize into a clean architecture. Do NOT hardcode deprecated versions or patterns.`
    );
    parts.push(section("Assets & Shared References Integration Guidelines", partsList.join("\n")));
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

  // ── 9. Category-Specific Output Rules ────────────────────────────────────
  let frontendDir = "frontend/";
  let backendDir = "backend/";

  if (cwd) {
    const mapPath = path.join(cwd, ".imhcode", "import-map.json");
    if (fs.existsSync(mapPath)) {
      try {
        const importMap = JSON.parse(fs.readFileSync(mapPath, "utf-8"));
        if (importMap.frontend) {
          frontendDir = importMap.frontend === "." ? "project root (./)" : `${importMap.frontend}/`;
        }
        if (importMap.backend) {
          backendDir = importMap.backend === "." ? "project root (./)" : `${importMap.backend}/`;
        }
      } catch {
        // Ignore
      }
    }
  }

  let categoryRules = CATEGORY_OUTPUT_RULES[category] ?? CATEGORY_OUTPUT_RULES["backend"];
  // Dynamically replace default folder names with actual mapped ones
  categoryRules = categoryRules
    .replace(/`frontend\/`/g, `\`${frontendDir}\``)
    .replace(/`backend\/`/g, `\`${backendDir}\``);

  const outputLines = [
    `**Category**: ${category}`,
    `**Format**: ${manifest.output.format}`,
    `**Task types**: ${manifest.supported_task_types.join(", ")}`,
    "",
    "**Rules for this task:**",
    categoryRules,
  ].join("\n");

  parts.push(section("Output Requirements", outputLines));

  // ── 10. Codebase Containment Rules ───────────────────────────────────────
  const containmentRules = [
    `- All frontend source files, styles, assets, and components → \`${frontendDir}\` directory ONLY.`,
    `- All backend source files, APIs, migrations, schemas, and logic → \`${backendDir}\` directory ONLY.`,
    `- All planning and documentation → \`docs/\` directory ONLY.`,
    `- NEVER create application code at the workspace root unless the mapped directory is root (./).`,
  ].join("\n");
  parts.push(section("Codebase Containment Rules", containmentRules));

  return parts.join("\n");
}
