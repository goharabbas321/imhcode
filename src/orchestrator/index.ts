/**
 * Public API barrel for the IMH-Code orchestrator.
 * IMH-Code — Imam Hussain Coding Harness Platform
 *
 * Import from here in CLI code and external integrations.
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
export { discoverAgents, loadRegistry, getAgent, resolveAgentIdAlias } from "./registry";
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

// ─── Agent Category Map ───────────────────────────────────────────────────────

/**
 * Maps agent IDs to task categories for intelligent model routing.
 * Categories determine which model is used from imhcode.config.json model_routing.
 */
export const AGENT_CATEGORY_MAP: Record<string, string> = {
  // Planning
  "planner":               "planning",

  // Frontend (visual/creative — prefer Mimo v2.5 Pro)
  "designer":              "frontend",
  "nextjs-executor":       "frontend",
  "react-executor":        "frontend",
  "vue-executor":          "frontend",

  // Backend (precise code — prefer DeepSeek V4 Pro)
  "laravel-executor":      "backend",
  "python-executor":       "backend",
  "java-executor":         "backend",
  "flutter-executor":      "backend",
  "react-native-executor": "backend",
  "ios-executor":          "backend",
  "android-executor":      "backend",
  "systems-executor":      "backend",
  "web3-executor":         "backend",
  "devops-executor":       "backend",

  // Testing (analytical — prefer GPT-5.5)
  "tester":                "testing",
  "security-auditor":      "testing",

  // Review (analytical — prefer GPT-5.5)
  "seo-optimizer":         "review",
  "debugger":              "review",
};

/**
 * Model routing: recommended models per category and engine.
 * Preferences: Mimo v2.5 Pro → frontend, DeepSeek → backend,
 *              GPT → testing/review, Claude → planning, DeepSeek Flash → fast
 */
const DEFAULT_MODEL_PREFERENCES: Record<string, { engines: string[]; models: string[] }> = {
  frontend: {
    engines: ["mimo", "codex", "claude", "opencode"],
    models: ["mimo-vl-v2.5-pro", "gpt-5.5", "claude-opus-4-6", "gemini-3.5-flash"],
  },
  backend: {
    engines: ["opencode", "codex", "claude", "qwen"],
    models: ["deepseek-v4-pro", "gpt-5.5", "claude-sonnet-4-5", "qwen3-coder-max"],
  },
  planning: {
    engines: ["claude", "codex", "opencode"],
    models: ["claude-opus-4-6", "gpt-5.5", "deepseek-v4-pro"],
  },
  testing: {
    engines: ["codex", "claude", "opencode"],
    models: ["gpt-5.5", "claude-opus-4-6", "deepseek-v4-pro"],
  },
  review: {
    engines: ["codex", "claude", "opencode"],
    models: ["gpt-5.5", "claude-sonnet-4-5", "deepseek-v4"],
  },
  fast: {
    engines: ["opencode", "codex", "qwen", "claude"],
    models: ["deepseek-v4-flash", "gpt-5.4-mini", "qwen3-coder-flash", "claude-haiku-3-5"],
  },
};

// ─── Config Loader ────────────────────────────────────────────────────────────

/**
 * Load imhcode.config.json workspace settings if it exists.
 */
function loadConfig(cwd: string): any {
  const configPath = path.join(cwd, "imhcode.config.json");
  if (fs.existsSync(configPath)) {
    try {
      return JSON.parse(fs.readFileSync(configPath, "utf8"));
    } catch {
      return null;
    }
  }
  // Fallback: check for legacy zeoel.config.json
  const legacyPath = path.join(cwd, "zeoel.config.json");
  if (fs.existsSync(legacyPath)) {
    try {
      return JSON.parse(fs.readFileSync(legacyPath, "utf8"));
    } catch {
      return null;
    }
  }
  return null;
}

// ─── Task Complexity Detection ────────────────────────────────────────────────

/**
 * Determine if a task is light complexity (use fast model) or standard/complex.
 * Light tasks: boilerplate, config, migrations, simple CRUD.
 */
function detectTaskComplexity(task: string): "light" | "standard" | "complex" {
  const t = task.toLowerCase();

  const lightKeywords = [
    "scaffold", "boilerplate", "migration", "simple", "basic", "create file",
    "add field", "rename", "move file", "update config", "add route", "crud",
    "generate", "placeholder", "stub", "gitignore", "readme",
  ];

  const complexKeywords = [
    "architecture", "refactor", "optimize", "security", "audit", "real-time",
    "websocket", "payment", "auth system", "multi-tenant", "algorithm",
    "performance", "concurrent", "distributed", "machine learning", "ai",
  ];

  if (complexKeywords.some((kw) => t.includes(kw))) return "complex";
  if (lightKeywords.some((kw) => t.includes(kw))) return "light";
  return "standard";
}

// ─── Model Resolution ─────────────────────────────────────────────────────────

/**
 * Resolve the optimal model for a task based on:
 * 1. User's model_routing config (highest priority — user has final say)
 * 2. Agent category + available models from config
 * 3. Task complexity (light → fast model)
 * 4. Default model preferences
 */
function resolveModelForTask(
  agent: LoadedAgent,
  task: string,
  cwd: string,
  engine: string
): { engine: string; model: string } {
  const config = loadConfig(cwd);
  const category = AGENT_CATEGORY_MAP[agent.manifest.id] ?? "backend";
  const complexity = detectTaskComplexity(task);

  // Light tasks → always use fast model (save tokens + cost)
  const effectiveCategory = complexity === "light" ? "fast" : category;

  // 1. User's explicit model_routing config (final authority)
  if (config?.model_routing?.[effectiveCategory]) {
    const routing = config.model_routing[effectiveCategory];
    return {
      engine: routing.engine || engine,
      model: routing.model || agent.manifest.default_model,
    };
  }

  // 2. Find best available model from installed engines
  const prefs = DEFAULT_MODEL_PREFERENCES[effectiveCategory];
  if (prefs && config?.available_engines) {
    for (let i = 0; i < prefs.engines.length; i++) {
      const preferredEngine = prefs.engines[i];
      const preferredModel = prefs.models[i];
      const engineData = config.available_engines[preferredEngine];

      if (engineData?.models?.length > 0) {
        // Check if preferred model is available
        const exactMatch = engineData.models.find((m: string) =>
          m.toLowerCase().includes(preferredModel.toLowerCase().replace(/-/g, ""))
        );
        if (exactMatch) {
          return { engine: preferredEngine, model: exactMatch };
        }
        // Use any available model from this preferred engine
        return { engine: preferredEngine, model: engineData.models[0] };
      }
    }
  }

  // 3. Fallback: use primary engine + default model
  const primaryEngine = config?.primary_engine || engine;
  const defaultModel = config?.default_model || agent.manifest.default_model;
  return { engine: primaryEngine, model: defaultModel };
}

// ─── Role Key (for model_mapping compatibility) ───────────────────────────────

/**
 * Get the role key for an agent (used in model_mapping config lookup).
 * Maps generic agent IDs to routing categories.
 */
export function getRoleKeyForAgent(agentId: string, _task: string): string {
  return AGENT_CATEGORY_MAP[agentId.toLowerCase()] ?? "backend";
}

// ─── Main Run Function ────────────────────────────────────────────────────────

/**
 * Run an agent against a task. Primary entry point for the CLI.
 *
 * @param agent   - The fully loaded agent (from loadAgent or registry)
 * @param task    - The task description string
 * @param options - Execution options (dry-run, engine override, model override, output dir, cwd)
 * @param acceptanceCriteria - Optional acceptance criteria string
 */
export async function runAgent(
  agent: LoadedAgent,
  task: string,
  options: ExecutionOptions = {},
  acceptanceCriteria?: string
): Promise<ExecutionResult> {
  const start = Date.now();
  const cwd = options.cwd ?? process.cwd();
  const dryRun = options.dryRun !== false ? true : false;

  // 1. Resolve Engine + Model via intelligent routing
  let resolvedEngine = "claude"; // ultimate fallback
  let resolvedModel = agent.manifest.default_model;

  if (options.engine && options.model) {
    // User explicitly specified both — respect that (user has final say)
    resolvedEngine = options.engine.toLowerCase();
    resolvedModel = options.model;
  } else {
    // Use intelligent routing
    const routing = resolveModelForTask(agent, task, cwd, options.engine || "claude");
    resolvedEngine = options.engine?.toLowerCase() || routing.engine;
    resolvedModel = options.model || routing.model;
  }

  // Normalize engine name aliases
  if (resolvedEngine === "claudecode" || resolvedEngine === "claude-code") resolvedEngine = "claude";
  if (resolvedEngine === "antigravity" || resolvedEngine === "antigravity-ide") resolvedEngine = "agy";
  if (resolvedEngine === "qwencode" || resolvedEngine === "qwen-code") resolvedEngine = "qwen";
  if (resolvedEngine === "mimocode" || resolvedEngine === "mimo-code") resolvedEngine = "mimo";

  // 2. Build the initial prompt (category-aware, compact context)
  const finalPrompt = buildPrompt(agent, task, acceptanceCriteria, cwd);

  const errors: string[] = [];
  let cumulativeOutput = "";

  // 3. Load config for routing checks
  const config = loadConfig(cwd);
  const category = AGENT_CATEGORY_MAP[agent.manifest.id] ?? "backend";

  // 4. Build the failover queue of engines to try
  const failoverQueue = getFailoverQueue(agent, config, resolvedEngine);

  let currentEngineIndex = 0;
  let currentEngine = resolvedEngine;
  let currentModel = resolvedModel;
  let currentPrompt = finalPrompt;
  let success = false;
  let limitExhausted = false;

  // 5. Failover Execution Loop
  while (currentEngineIndex < failoverQueue.length) {
    currentEngine = failoverQueue[currentEngineIndex];
    if (currentEngineIndex > 0) {
      currentModel = getModelForEngine(config, currentEngine, category, agent);
    } else {
      currentModel = resolvedModel;
    }

    if (dryRun) {
      // Dry-run mode: execute only the first engine without hitting a real LLM
      const adapter = getAdapter(false, currentEngine);
      cumulativeOutput = await adapter.run(currentPrompt, currentModel);
      success = true;
      break;
    }

    console.log(`\n🤖 [IMH-Code] Attempting execution on engine "${currentEngine}" using model "${currentModel}"...`);

    const adapter = getAdapter(true, currentEngine);
    let output = "";
    let error: any = null;

    try {
      output = await adapter.run(currentPrompt, currentModel);
    } catch (err: any) {
      error = err;
      output = err.message || "";
    }

    // Check if limits (tokens/quota/rate) were reached
    const check = detectLimitCondition(output, error);

    if (check.limitReached) {
      console.log(`\n⚠️  [IMH-Code] Engine "${currentEngine}" hit a limit: ${check.reason}`);
      cumulativeOutput += (cumulativeOutput ? "\n" : "") + check.partialOutput;

      currentEngineIndex++;
      if (currentEngineIndex < failoverQueue.length) {
        const nextEng = failoverQueue[currentEngineIndex];
        console.log(`🔄 [IMH-Code] Failing over to next best available engine "${nextEng}"...`);

        // Build failover resume prompt
        const failoverResumeContext = [
          `\n# ⚠️ FAILOVER RESUME CONTEXT`,
          `The previous engine execution (using ${currentEngine} with model ${currentModel}) hit a limit and was interrupted mid-task.`,
          `Here is the partial output produced by the previous run before it stopped:`,
          `\n---`,
          cumulativeOutput.trim(),
          `---\n`,
          `Please resume from exactly where the process was interrupted. Review what was already created or modified, and complete the remaining parts of the original task. Do NOT restart the entire task from scratch.`
        ].join("\n");

        currentPrompt = finalPrompt + "\n" + failoverResumeContext;
      } else {
        limitExhausted = true;
        errors.push(`All available engines (${failoverQueue.join(", ")}) hit limits and were exhausted.`);
        cumulativeOutput += "\n\n[Execution aborted: all available engines hit limits]";
      }
    } else {
      if (error) {
        // If it failed with a standard error (e.g. syntax, task validation), do NOT failover
        errors.push(error.message || String(error));
        cumulativeOutput += (cumulativeOutput ? "\n" : "") + output;
      } else {
        success = true;
        cumulativeOutput += (cumulativeOutput ? "\n" : "") + output;
      }
      break; // Successfully completed or failed with a non-limit error
    }
  }

  const durationMs = Date.now() - start;

  const result: ExecutionResult = {
    agentId: agent.manifest.id,
    task,
    model: resolvedModel, // report original requested model
    dryRun,
    prompt: finalPrompt,
    output: cumulativeOutput,
    errors,
    changedFiles: [],
    memoryUpdates: {},
    durationMs,
  };

  // 6. Save session log
  try {
    const sessionDir = saveSession(result, agent.manifest, cwd, options.outputDir);
    result.sessionDir = sessionDir;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`  ⚠️  Could not write session log: ${msg}`);
  }

  return result;
}

// ─── Failover & Recovery Helpers ──────────────────────────────────────────────

/**
 * Checks if the process output or error indicates a limit-reached condition.
 */
function detectLimitCondition(
  output: string,
  error?: any
): { limitReached: boolean; partialOutput: string; reason: string } {
  const text = (output || "") + "\n" + (error?.message || "") + "\n" + (error?.stderr || "");
  const lower = text.toLowerCase();

  const limitPatterns = [
    "limit reached",
    "rate limit",
    "token limit",
    "quota limit",
    "insufficient quota",
    "exhausted",
    "0% limit",
    "context limit",
    "rate_limit",
    "too many requests",
    "out of tokens"
  ];

  const matched = limitPatterns.find(p => lower.includes(p));
  if (matched) {
    let partial = output || "";
    // If output is stored in error message (e.g. child process output block), extract it
    if (error && error.message) {
      const matchStdout = error.message.match(/Stdout:\s*([\s\S]*)$/i);
      if (matchStdout) {
        partial = matchStdout[1];
      }
    }
    return {
      limitReached: true,
      partialOutput: partial.trim(),
      reason: `matched limit pattern: "${matched}"`
    };
  }

  return { limitReached: false, partialOutput: "", reason: "" };
}

/**
 * Scan imhcode.config.json to find which engines are actually installed and valid.
 */
function getInstalledEngines(config: any): string[] {
  if (!config || !config.available_engines) return [];
  return Object.keys(config.available_engines).filter(key => {
    const eng = config.available_engines[key];
    return eng && eng.path && fs.existsSync(eng.path);
  });
}

/**
 * Builds the ordered array of fallback engines to attempt during execution.
 */
function getFailoverQueue(
  agent: LoadedAgent,
  config: any,
  initialEngine: string
): string[] {
  const installed = getInstalledEngines(config);
  const queue = [initialEngine];

  // 1. Add preferred engines from manifest
  if (agent.manifest.preferred_engines) {
    for (const eng of agent.manifest.preferred_engines) {
      const clean = eng.toLowerCase().trim();
      if (!queue.includes(clean) && installed.includes(clean)) {
        queue.push(clean);
      }
    }
  }

  // 2. Add fallback engines from manifest
  if (agent.manifest.fallback_engines) {
    for (const eng of agent.manifest.fallback_engines) {
      const clean = eng.toLowerCase().trim();
      if (!queue.includes(clean) && installed.includes(clean)) {
        queue.push(clean);
      }
    }
  }

  // 3. Add any other installed engines as a last resort
  for (const eng of installed) {
    if (!queue.includes(eng)) {
      queue.push(eng);
    }
  }

  return queue;
}

/**
 * Resolves the model to use for a failover engine.
 */
function getModelForEngine(
  config: any,
  engineName: string,
  category: string,
  agent: LoadedAgent
): string {
  // Check user's config model routing first
  if (config?.model_routing?.[category]?.engine === engineName) {
    return config.model_routing[category].model;
  }

  // Check available models in config for this engine
  const engineData = config?.available_engines?.[engineName];
  if (engineData?.models?.length > 0) {
    return engineData.models[0];
  }

  // Check if agent manifest matches engine
  if (agent.manifest.preferred_engines?.includes(engineName)) {
    return agent.manifest.default_model;
  }

  return "default";
}

