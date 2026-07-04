/**
 * Zod schema for agent.yml manifest validation.
 * IMH-Code — Imam Hussain Coding Harness Platform
 * Every agent must pass this schema or an actionable error is thrown.
 */

import { z } from "zod";

// ─── Sub-schemas ──────────────────────────────────────────────────────────────

const AgentPermissionsSchema = z.object({
  read_files: z.boolean().default(true),
  write_files: z.boolean().default(false),
  run_commands: z.boolean().default(false),
  network_access: z.boolean().default(false),
});

const AgentMemorySchema = z.object({
  scopes: z
    .array(z.enum(["imhdb", "project", "global", "session"]))
    .min(1, "At least one memory scope is required"),
  readable: z.array(z.string()).default([]),
  writable: z.array(z.string()).default([]),
});

const AgentOutputSchema = z.object({
  format: z.string().default("markdown"),
  include_tests: z.boolean().default(false),
  test_framework: z.string().optional(),
});

// ─── Root Manifest Schema ─────────────────────────────────────────────────────

export const AgentManifestSchema = z.object({
  /** Kebab-case unique identifier. Must match the folder name. */
  id: z
    .string()
    .min(1)
    .regex(
      /^[a-z0-9-]+$/,
      "Agent ID must be kebab-case (lowercase letters, digits, hyphens only)"
    ),

  name: z.string().min(1, "Agent name is required"),

  description: z.string().min(1, "Agent description is required"),

  version: z
    .string()
    .regex(
      /^\d+\.\d+\.\d+$/,
      "Version must follow semver format (e.g. 1.0.0)"
    )
    .default("1.0.0"),

  role: z.string().min(1, "Agent role is required"),

  /** Path to the SYSTEM.md file, relative to the agent directory */
  system_prompt: z
    .string()
    .default("./SYSTEM.md")
    .refine(
      (v) => v.endsWith(".md"),
      "system_prompt must point to a Markdown (.md) file"
    ),

  /** Paths to SKILL.md files, relative to the agent directory */
  skills: z.array(z.string()).default([]),

  preferred_engines: z
    .array(z.string())
    .min(1, "At least one preferred engine is required"),

  fallback_engines: z.array(z.string()).default([]),

  default_model: z.string().min(1, "default_model is required"),

  permissions: AgentPermissionsSchema.default({
    read_files: true,
    write_files: false,
    run_commands: false,
    network_access: false,
  }),

  memory: AgentMemorySchema.default({
    scopes: ["session"],
    readable: [],
    writable: [],
  }),

  supported_task_types: z
    .array(z.string())
    .min(1, "At least one supported task type is required"),

  /** Array of single-key objects like [{ lighthouse_score: ">= 90" }] */
  quality_gates: z.array(z.record(z.string(), z.union([z.string(), z.number()]))).default([]),

  output: AgentOutputSchema.default({
    format: "markdown",
    include_tests: false,
  }),
});

export type AgentManifestInput = z.input<typeof AgentManifestSchema>;
export type AgentManifestOutput = z.output<typeof AgentManifestSchema>;

/**
 * Validates a raw YAML-parsed object against the AgentManifest schema.
 * Returns a well-typed manifest or throws a detailed ZodError.
 */
export function validateManifest(
  raw: unknown,
  agentId: string
): AgentManifestOutput {
  const result = AgentManifestSchema.safeParse(raw);

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => {
        const path = issue.path.length > 0 ? issue.path.join(".") : "(root)";
        return `  • [${path}] ${issue.message}`;
      })
      .join("\n");

    throw new Error(
      `❌ Invalid agent.yml for agent "${agentId}":\n${issues}\n\n` +
        `  Fix the fields above and re-run the command.`
    );
  }

  // Validate that the id in the YAML matches the folder name
  if (result.data.id !== agentId) {
    throw new Error(
      `❌ Agent ID mismatch for "${agentId}":\n` +
        `  The "id" field in agent.yml is "${result.data.id}" but the folder is named "${agentId}".\n` +
        `  They must match exactly.`
    );
  }

  return result.data;
}
