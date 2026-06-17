/**
 * Public API barrel for the Zeoel orchestrator.
 *
 * Import from here in CLI code and external integrations.
 * All internal modules should be imported directly for tree-shaking.
 */

// Types
export type {
  AgentManifest,
  AgentPermissions,
  AgentMemory,
  AgentOutput,
  LoadedAgent,
  LoadedSkill,
  LoadedMemoryFile,
  ExecutionOptions,
  ExecutionContext,
  ExecutionResult,
  EngineAdapter,
} from "./types";

// Schema & validation
export { AgentManifestSchema, validateManifest } from "./schema";

// Loading
export { loadYaml, loadMarkdown, resolveAgentPath, loadAgent } from "./loader";

// Registry
export { discoverAgents, loadRegistry, getAgent } from "./registry";
export type { RegistryLoadResult } from "./registry";

// Prompt building
export { buildPrompt } from "./builder";

// Execution
export {
  DryRunAdapter,
  ClaudeCodeCLIAdapter,
  OpenCodeCLIAdapter,
  CodexCLIAdapter,
  AgyCLIAdapter,
  QwenCodeCLIAdapter,
  MimoCodeCLIAdapter,
  getAdapter,
} from "./executor";

// Session
export { saveSession, resolveSessionDir } from "./session";

// ─── High-level run function ──────────────────────────────────────────────────

import * as fs from "fs";
import * as path from "path";
import { buildPrompt } from "./builder";
import { getAdapter } from "./executor";
import { saveSession } from "./session";
import type { LoadedAgent, ExecutionOptions, ExecutionResult } from "./types";

/**
 * Helper to load zeoel.config.json workspace settings if it exists.
 */
function loadConfig(cwd: string): any {
  const configPath = path.join(cwd, "zeoel.config.json");
  if (fs.existsSync(configPath)) {
    try {
      return JSON.parse(fs.readFileSync(configPath, "utf8"));
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Resolve the optimal engine model for a task based on the current sprint plan tier and selected engine.
 */
function resolveModelForTask(agent: LoadedAgent, task: string, cwd: string, engine: string): string {
  let tier: "light" | "standard" | "complex" = "standard";

  const briefPath = path.join(cwd, "PROJECT_BRIEF.md");
  if (fs.existsSync(briefPath)) {
    try {
      const briefContent = fs.readFileSync(briefPath, "utf8");
      const sprintMatch = briefContent.match(/Current Sprint:\s*Sprint\s*(\d+)/i);
      if (sprintMatch) {
        const sprintNum = sprintMatch[1];
        const planPath = path.join(cwd, "docs", `sprint-${sprintNum}`, "plan.md");
        if (fs.existsSync(planPath)) {
          const planContent = fs.readFileSync(planPath, "utf8");
          const lines = planContent.split("\n");
          let headerRowIdx = -1;
          let headers: string[] = [];

          for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.startsWith("|") && line.toLowerCase().includes("model tier")) {
              headerRowIdx = i;
              headers = line.split("|").map(cell => cell.trim().toLowerCase());
              break;
            }
          }

          if (headerRowIdx !== -1) {
            const taskIdx = headers.indexOf("task");
            const descIdx = headers.indexOf("description");
            const tierIdx = headers.indexOf("model tier");
            const numberIdx = headers.indexOf("#");

            const isStringMatch = (val: string, query: string): boolean => {
              if (!val) return false;
              const cleanVal = val.toLowerCase().replace(/[^a-z0-9]/g, "");
              const cleanQuery = query.toLowerCase().replace(/[^a-z0-9]/g, "");
              return cleanVal.length > 5 && (cleanQuery.includes(cleanVal) || cleanVal.includes(cleanQuery));
            };

            for (let i = headerRowIdx + 2; i < lines.length; i++) {
              const line = lines[i].trim();
              if (!line.startsWith("|")) break;

              const cells = line.split("|").map(c => c.trim());
              if (cells.length < headers.length) continue;

              const taskNum = numberIdx >= 0 ? cells[numberIdx] : "";
              const taskName = taskIdx >= 0 ? cells[taskIdx] : "";
              const taskDesc = descIdx >= 0 ? cells[descIdx] : "";
              const tierVal = cells[tierIdx];

              let isMatch = false;
              if (taskNum && task.toLowerCase().includes(`task ${taskNum}`)) {
                isMatch = true;
              } else if (taskName && isStringMatch(taskName, task)) {
                isMatch = true;
              } else if (taskDesc && isStringMatch(taskDesc, task)) {
                isMatch = true;
              }

              if (isMatch && tierVal) {
                const t = tierVal.toLowerCase();
                if (t.includes("light") || t.includes("green") || t.includes("🟢")) {
                  tier = "light";
                } else if (t.includes("complex") || t.includes("red") || t.includes("🔴")) {
                  tier = "complex";
                }
                break;
              }
            }
          }
        }
      }
    } catch {
      // ignore
    }
  }

  // Prioritize user-configured default_model if executing standard tier
  if (tier === "standard") {
    const config = loadConfig(cwd);
    if (config?.default_model) {
      const configEngineNormalized = config.primary_engine?.toLowerCase();
      const activeEngineNormalized = engine?.toLowerCase();
      if (configEngineNormalized === activeEngineNormalized || 
         (configEngineNormalized === "agy" && activeEngineNormalized === "antigravity") ||
         (configEngineNormalized === "claude" && activeEngineNormalized === "claudecode") ||
         (configEngineNormalized === "qwen" && activeEngineNormalized === "qwencode") ||
         (configEngineNormalized === "mimo" && activeEngineNormalized === "mimocode")) {
        return config.default_model;
      }
    }
  }

  // Map tier to appropriate model name depending on active engine ecosystem
  if (engine === "claude") {
    if (tier === "light") return "claude-3-5-haiku";
    if (tier === "complex") return "claude-3-opus";
    return "claude-3-5-sonnet";
  }

  if (engine === "opencode") {
    const config = loadConfig(cwd);
    const opencodeModels: string[] = config?.available_engines?.["opencode"]?.models || [];

    if (tier === "light") {
      const g35f = opencodeModels.find(m => m.includes("gemini-3.5-flash"));
      if (g35f) return g35f;
      const g25f = opencodeModels.find(m => m.includes("gemini-2.5-flash"));
      if (g25f) return g25f;
      const anyFlash = opencodeModels.find(m => m.toLowerCase().includes("flash"));
      if (anyFlash) return anyFlash;
      return "google/gemini-2.5-flash";
    }

    if (tier === "complex") {
      const g31p = opencodeModels.find(m => m.includes("gemini-3.1-pro-preview"));
      if (g31p) return g31p;
      const q37m = opencodeModels.find(m => m.includes("qwen3.7-max"));
      if (q37m) return q37m;
      const dsPro = opencodeModels.find(m => m.includes("deepseek") && m.includes("pro"));
      if (dsPro) return dsPro;
      const anyPro = opencodeModels.find(m => m.toLowerCase().includes("pro") || m.toLowerCase().includes("max"));
      if (anyPro) return anyPro;
      return "google/gemini-3.1-pro-preview";
    }

    const g35f = opencodeModels.find(m => m.includes("gemini-3.5-flash"));
    if (g35f) return g35f;
    const g25p = opencodeModels.find(m => m.includes("gemini-2.5-pro"));
    if (g25p) return g25p;
    const q37p = opencodeModels.find(m => m.includes("qwen3.7-plus"));
    if (q37p) return q37p;
    const g25f = opencodeModels.find(m => m.includes("gemini-2.5-flash"));
    if (g25f) return g25f;
    return "google/gemini-2.5-flash";
  }

  if (engine === "codex") {
    const config = loadConfig(cwd);
    const codexModels: string[] = config?.available_engines?.["codex"]?.models || [];

    if (tier === "light") {
      const g54m = codexModels.find(m => m.includes("gpt-5.4-mini"));
      if (g54m) return g54m;
      const anyMini = codexModels.find(m => m.toLowerCase().includes("mini"));
      if (anyMini) return anyMini;
      return "gpt-4o-mini";
    }

    if (tier === "complex") {
      const g55 = codexModels.find(m => m.includes("gpt-5.5"));
      if (g55) return g55;
      const o1 = codexModels.find(m => m.includes("o1"));
      if (o1) return o1;
      const o3 = codexModels.find(m => m.includes("o3"));
      if (o3) return o3;
      return "gpt-5.5";
    }

    const g54 = codexModels.find(m => m.includes("gpt-5.4") && !m.includes("mini"));
    if (g54) return g54;
    const g4o = codexModels.find(m => m.includes("gpt-4o") && !m.includes("mini"));
    if (g4o) return g4o;
    const anyGpt5 = codexModels.find(m => m.includes("gpt-5") && !m.includes("mini"));
    if (anyGpt5) return anyGpt5;
    return "gpt-4o";
  }

  // ── Antigravity CLI (agy) — Gemini family ───────────────────────────────────
  if (engine === "agy") {
    const config = loadConfig(cwd);
    const agyModels: string[] = config?.available_engines?.["agy"]?.models || [];

    if (tier === "light") {
      const flash = agyModels.find(m => m.toLowerCase().includes("flash"));
      if (flash) return flash;
      return "gemini-2.5-flash";
    }
    if (tier === "complex") {
      const pro = agyModels.find(m => m.toLowerCase().includes("pro") || m.toLowerCase().includes("ultra"));
      if (pro) return pro;
      return "gemini-2.5-pro";
    }
    const standard = agyModels.find(m => m.toLowerCase().includes("pro"));
    if (standard) return standard;
    return "gemini-2.5-flash";
  }

  // ── QwenCode (qwen) — Qwen family ───────────────────────────────────────────
  if (engine === "qwen") {
    const config = loadConfig(cwd);
    const qwenModels: string[] = config?.available_engines?.["qwen"]?.models || [];

    if (tier === "light") {
      const flash = qwenModels.find(m => m.toLowerCase().includes("flash") || m.toLowerCase().includes("mini"));
      if (flash) return flash;
      return "qwen3-coder-flash";
    }
    if (tier === "complex") {
      const max = qwenModels.find(m => m.toLowerCase().includes("max") || m.toLowerCase().includes("plus"));
      if (max) return max;
      return "qwen3-coder-max";
    }
    const standard = qwenModels.find(m => m.toLowerCase().includes("plus") || m.toLowerCase().includes("pro"));
    if (standard) return standard;
    return "qwen3-coder-plus";
  }

  // ── MimoCode (mimo) — MiMo family ───────────────────────────────────────────
  if (engine === "mimo") {
    const config = loadConfig(cwd);
    const mimoModels: string[] = config?.available_engines?.["mimo"]?.models || [];

    if (tier === "light") {
      const fast = mimoModels.find(m => m.toLowerCase().includes("mini") || m.toLowerCase().includes("flash") || m.toLowerCase().includes("fast"));
      if (fast) return fast;
      return "mimo-vl-7b";
    }
    if (tier === "complex") {
      const large = mimoModels.find(m => m.toLowerCase().includes("72b") || m.toLowerCase().includes("pro") || m.toLowerCase().includes("max"));
      if (large) return large;
      return "mimo-vl-72b";
    }
    const standard = mimoModels.find(m => m.toLowerCase().includes("vl"));
    if (standard) return standard;
    return "mimo-vl-7b";
  }

  const config = loadConfig(cwd);
  if (config?.default_model) {
    const configEngineNormalized = config.primary_engine?.toLowerCase();
    const activeEngineNormalized = engine?.toLowerCase();
    if (configEngineNormalized === activeEngineNormalized || 
       (configEngineNormalized === "agy" && activeEngineNormalized === "antigravity") ||
       (configEngineNormalized === "claude" && activeEngineNormalized === "claudecode") ||
       (configEngineNormalized === "qwen" && activeEngineNormalized === "qwencode") ||
       (configEngineNormalized === "mimo" && activeEngineNormalized === "mimocode")) {
      return config.default_model;
    }
  }

  return agent.manifest.default_model;
}

/**
 * Resolves the conceptual role key for a given agent and task.
 *
 * @param agentId - The executing agent's ID
 * @param task    - The task description
 * @returns The matched role key
 */
export function getRoleKeyForAgent(agentId: string, task: string): string {
  const cleanAgent = agentId.toLowerCase();
  const cleanTask = task.toLowerCase();

  // Hamid (Security)
  if (cleanAgent === 'hamid-security' || cleanAgent.includes('security')) {
    if (cleanTask.includes('fallback') || cleanTask.includes('laravel')) {
      return 'security_fallback';
    }
    return 'primary_security_reviewer';
  }

  // Sajjad (Debugger)
  if (cleanAgent === 'sajjad-debugger' || cleanAgent.includes('debug') || cleanAgent.includes('bug')) {
    return 'fast_bug_fixing';
  }

  // Designers (Mahdi, Mustafa)
  if (
    cleanAgent === 'mahdi-designer' ||
    cleanAgent === 'mustafa-visual' ||
    cleanAgent.includes('design') ||
    cleanAgent.includes('visual')
  ) {
    if (cleanTask.includes('polish') || cleanTask.includes('ux') || cleanTask.includes('review')) {
      return 'design_polish_ux_review';
    }
    if (cleanTask.includes('fallback')) {
      return 'design_fallback';
    }
    return 'primary_design_brain';
  }

  // Frontends (Karar, Hassan, Noor, Anas, Amina, Hasan)
  if (
    cleanAgent === 'karar-frontend' ||
    cleanAgent === 'hassan-bootstrap' ||
    cleanAgent === 'noor-shadcn' ||
    cleanAgent === 'anas-react' ||
    cleanAgent === 'amina-vue' ||
    cleanAgent === 'hasan-css' ||
    cleanAgent.includes('frontend') ||
    cleanAgent.includes('react') ||
    cleanAgent.includes('vue') ||
    cleanAgent.includes('css')
  ) {
    if (cleanTask.includes('review') || cleanTask.includes('audit') || cleanTask.includes('final')) {
      return 'frontend_final_review';
    }
    if (cleanTask.includes('fallback')) {
      return 'frontend_fallback';
    }
    return 'frontend_builder';
  }

  // Backends (Tariq, Abbas, Bilal, Yusuf, Fatima)
  if (
    cleanAgent === 'tariq-backend' ||
    cleanAgent === 'abbas-python' ||
    cleanAgent === 'bilal-systems' ||
    cleanAgent === 'yusuf-java' ||
    cleanAgent === 'fatima-data' ||
    cleanAgent.includes('backend') ||
    cleanAgent.includes('python') ||
    cleanAgent.includes('systems') ||
    cleanAgent.includes('java') ||
    cleanAgent.includes('data')
  ) {
    if (
      cleanTask.includes('multi-file') ||
      cleanTask.includes('multiple files') ||
      cleanTask.includes('refactor') ||
      cleanTask.includes('large')
    ) {
      return 'backend_multi_file_builder';
    }
    if (cleanTask.includes('fallback')) {
      return 'backend_fallback';
    }
    return 'primary_backend_builder';
  }

  // QA / Auditing / Snapshot / DevOps / Zara SEO / Gohar
  if (
    cleanAgent === 'muhammad-qa' ||
    cleanAgent === 'zara-content' ||
    cleanAgent === 'ali-devops' ||
    cleanAgent === 'gohar-ceo' ||
    cleanAgent.includes('qa') ||
    cleanAgent.includes('seo') ||
    cleanAgent.includes('devops') ||
    cleanAgent.includes('ceo')
  ) {
    if (
      cleanTask.includes('audit') ||
      cleanTask.includes('final') ||
      cleanTask.includes('snapshot') ||
      cleanTask.includes('verify')
    ) {
      return 'external_final_audit';
    }
  }

  // Default fallback is primary_architecture_reviewer or default_model
  if (cleanTask.includes('architecture') || cleanTask.includes('review') || cleanTask.includes('plan')) {
    return 'primary_architecture_reviewer';
  }

  return 'primary_architecture_reviewer';
}

/**
 * Run an agent against a task. This is the primary entry point for the CLI.
 *
 * @param agent   - The fully loaded agent (from loadAgent or registry)
 * @param task    - The task description string
 * @param options - Execution options (dry-run, engine override, model override, output dir, cwd)
 * @param acceptanceCriteria - Optional acceptance criteria string
 * @returns ExecutionResult with prompt, output, errors, and session path
 */
export async function runAgent(
  agent: LoadedAgent,
  task: string,
  options: ExecutionOptions = {},
  acceptanceCriteria?: string
): Promise<ExecutionResult> {
  const start = Date.now();
  const cwd = options.cwd ?? process.cwd();
  const dryRun = options.dryRun !== false ? true : false; // default: dry-run

  const config = loadConfig(cwd);
  const roleKey = getRoleKeyForAgent(agent.manifest.id, task);
  let mappedEngine = "";
  let mappedModel = "";

  if (config && config.model_mapping && config.model_mapping[roleKey]) {
    const mapping = config.model_mapping[roleKey];
    if (mapping.engine) {
      mappedEngine = mapping.engine;
    }
    if (mapping.model) {
      mappedModel = mapping.model;
    }
  }

  // 1. Resolve Engine
  let resolvedEngine = "claude"; // fallback
  if (options.engine) {
    resolvedEngine = options.engine.toLowerCase();
  } else if (mappedEngine) {
    resolvedEngine = mappedEngine.toLowerCase();
  } else if (config && config.primary_engine) {
    resolvedEngine = config.primary_engine.toLowerCase();
  } else if (agent.manifest.preferred_engines && agent.manifest.preferred_engines.length > 0) {
    resolvedEngine = agent.manifest.preferred_engines[0].toLowerCase();
  }

  // Normalize engine name aliases
  if (resolvedEngine === "claudecode" || resolvedEngine === "claude-code") resolvedEngine = "claude";
  if (resolvedEngine === "antigravity" || resolvedEngine === "antigravity-ide") resolvedEngine = "agy";
  if (resolvedEngine === "qwencode" || resolvedEngine === "qwen-code") resolvedEngine = "qwen";
  if (resolvedEngine === "mimocode" || resolvedEngine === "mimo-code") resolvedEngine = "mimo";

  // 2. Resolve Model
  let resolvedModel = "";
  if (options.model) {
    resolvedModel = options.model;
  } else if (mappedModel) {
    resolvedModel = mappedModel;
  } else {
    resolvedModel = resolveModelForTask(agent, task, cwd, resolvedEngine);
  }

  const adapter = getAdapter(!dryRun, resolvedEngine);

  // Build the final prompt
  const finalPrompt = buildPrompt(agent, task, acceptanceCriteria);

  const errors: string[] = [];
  let output = "";

  try {
    output = await adapter.run(finalPrompt, resolvedModel);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    errors.push(msg);
    output = `[Error during execution]: ${msg}`;
  }

  const durationMs = Date.now() - start;

  const result: ExecutionResult = {
    agentId: agent.manifest.id,
    task,
    model: resolvedModel,
    dryRun,
    prompt: finalPrompt,
    output,
    errors,
    changedFiles: [],
    memoryUpdates: {},
    durationMs,
  };

  // Always save the session log
  try {
    const sessionDir = saveSession(
      result,
      agent.manifest,
      cwd,
      options.outputDir
    );
    result.sessionDir = sessionDir;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`  ⚠️  Could not write session log: ${msg}`);
  }

  return result;
}
