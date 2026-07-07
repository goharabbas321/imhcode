/**
 * Shared TypeScript types for the IMH-Code YAML-driven agent orchestrator.
 * IMH-Code — Imam Hussain Coding Harness Platform
 */

// ─── Agent Manifest (parsed from agent.yml) ───────────────────────────────────

export interface AgentPermissions {
  read_files: boolean;
  write_files: boolean;
  run_commands: boolean;
  network_access: boolean;
}

export interface AgentMemory {
  scopes: Array<"imhdb" | "project" | "global" | "session">;
  readable: string[];
  writable: string[];
}

export interface AgentOutput {
  format: string;
  include_tests: boolean;
  test_framework?: string;
}

export interface AgentManifest {
  id: string;
  name: string;
  description: string;
  version: string;
  role: string;
  system_prompt: string;
  skills: string[];
  preferred_engines: string[];
  fallback_engines: string[];
  default_model: string;
  permissions: AgentPermissions;
  memory: AgentMemory;
  supported_task_types: string[];
  quality_gates: Record<string, string | number>[];
  output: AgentOutput;
}

// ─── Loaded Agent (manifest + resolved file contents) ────────────────────────

export interface LoadedSkill {
  id: string;
  path: string;
  content: string;
}

export interface LoadedMemoryFile {
  path: string;
  content: string;
}

export interface LoadedAgent {
  /** Absolute path to the agent's directory */
  dir: string;
  manifest: AgentManifest;
  systemPrompt: string;
  skills: LoadedSkill[];
  memoryFiles: LoadedMemoryFile[];
}

// ─── Execution ────────────────────────────────────────────────────────────────

export interface ExecutionOptions {
  /** Override the CLI engine (claude, opencode, codex, codex-fugu, antigravity) */
  engine?: string;
  /** Explicitly override the model (e.g. gpt-4o, gemini-3.5-flash) */
  model?: string;
  /** When true, print the prompt but don't call any LLM */
  dryRun?: boolean;
  /** Directory to write session output to */
  outputDir?: string;
  /** Project root for resolving memory files */
  cwd?: string;
}

export interface ExecutionContext {
  agent: LoadedAgent;
  task: string;
  acceptanceCriteria?: string;
  finalPrompt: string;
  options: ExecutionOptions;
}

export interface ExecutionResult {
  agentId: string;
  task: string;
  model: string;
  dryRun: boolean;
  prompt: string;
  output: string;
  errors: string[];
  changedFiles: string[];
  memoryUpdates: Record<string, string>;
  sessionDir?: string;
  durationMs: number;
}

// ─── Engine Adapters ──────────────────────────────────────────────────────────

export interface EngineAdapter {
  readonly name: string;
  run(prompt: string, model: string): Promise<string>;
}
