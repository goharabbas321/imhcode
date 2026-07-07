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
  ExecutionResult,
  EngineAdapter,
  FailoverTarget,
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
  CodexFuguCLIAdapter,
  AgyCLIAdapter,
  QwenCodeCLIAdapter,
  MimoCodeCLIAdapter,
  getAdapter,
} from "./executor";

// Session
export { saveSession, resolveSessionDir } from "./session";

// Modification & Scanning
export { scanProjectContext, buildModificationPrompt, detectBestAgent } from "./context-scanner";
export { runModification } from "./modification-engine";

// Project Import & Extension
export { scanProject } from "./project-scanner";
export { importProject } from "./import-engine";

// ─── High-level run function ──────────────────────────────────────────────────

import * as fs from "fs";
import * as path from "path";
import { buildPrompt } from "./builder";
import { getAdapter } from "./executor";
import { saveSession } from "./session";
import type { LoadedAgent, ExecutionOptions, ExecutionResult, FailoverTarget } from "./types";

/**
 * Model routing: recommended models per category and engine.
 * Tailored to custom priorities: Mimo/Deepseek, Claude Opus, and Fugu.
 */
const DEFAULT_MODEL_PREFERENCES: Record<string, { engine: string; model: string }[]> = {
  frontend: [
    { engine: "mimo", model: "mimo-vl-v2.5-pro" },
    { engine: "opencode", model: "mimo-v2.5-pro" },
    { engine: "opencode", model: "mimo-v2.5" },
    { engine: "agy", model: "Claude Opus 4.6" },
    { engine: "opencode", model: "deepseek-v4-flash" }
  ],
  backend: [
    { engine: "opencode", model: "deepseek-v4-pro" },
    { engine: "agy", model: "Claude Opus 4.6" },
    { engine: "opencode", model: "deepseek-v4-flash" }
  ],
  planning: [
    { engine: "claude", model: "claude-opus-4-8" },
    { engine: "agy", model: "Claude Opus 4.8" },
    { engine: "codex-fugu", model: "fugu-ultra" },
    { engine: "codex-fugu", model: "fugu" },
    { engine: "opencode", model: "deepseek-v4-flash" }
  ],
  testing: [
    { engine: "claude", model: "claude-opus-4-8" },
    { engine: "agy", model: "Claude Opus 4.8" },
    { engine: "codex-fugu", model: "fugu-ultra" },
    { engine: "codex-fugu", model: "fugu" },
    { engine: "opencode", model: "deepseek-v4-flash" }
  ],
  review: [
    { engine: "claude", model: "claude-opus-4-8" },
    { engine: "agy", model: "Claude Opus 4.8" },
    { engine: "codex-fugu", model: "fugu-ultra" },
    { engine: "codex-fugu", model: "fugu" },
    { engine: "opencode", model: "deepseek-v4-flash" }
  ],
  fast: [
    { engine: "opencode", model: "deepseek-v4-flash" }
  ],
};

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
// ─── Config Loader ────────────────────────────────────────────────────────────

/**
 * Load imhcode.config.json workspace settings if it exists.
 */
function loadConfig(cwd: string): any {
  const configPath = path.join(cwd, ".imhcode", "imhcode.config.json");
  if (fs.existsSync(configPath)) {
    try {
      return JSON.parse(fs.readFileSync(configPath, "utf8"));
    } catch {
      return null;
    }
  }
  // Fallback: check for legacy zeoel.config.json
  const legacyPath = path.join(cwd, ".imhcode", "zeoel.config.json");
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

  // 2. Find best available model from installed engines using priority ranks
  const prefs = DEFAULT_MODEL_PREFERENCES[effectiveCategory];
  if (prefs && config?.available_engines) {
    for (const pref of prefs) {
      const preferredEngine = pref.engine;
      const preferredModel = pref.model;
      const engineData = config.available_engines[preferredEngine];

      if (engineData?.models?.length > 0) {
        // Check if preferred model is available (case-insensitive fuzzy match)
        const exactMatch = engineData.models.find((m: string) =>
          m.toLowerCase().replace(/[-._\s]/g, "").includes(preferredModel.toLowerCase().replace(/[-._\s]/g, ""))
        );
        if (exactMatch) {
          return { engine: preferredEngine, model: exactMatch };
        }
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
  if (resolvedEngine === "codexfugu" || resolvedEngine === "fugu") resolvedEngine = "codex-fugu";

  // 2. Build the initial prompt (category-aware, compact context)
  const finalPrompt = buildPrompt(agent, task, acceptanceCriteria, cwd);

  const errors: string[] = [];
  let cumulativeOutput = "";

  // 3. Load config for routing checks
  const config = loadConfig(cwd);
  const category = AGENT_CATEGORY_MAP[agent.manifest.id] ?? "backend";
  const complexity = detectTaskComplexity(task);
  const effectiveCategory = complexity === "light" ? "fast" : category;

  // 4. Build the failover queue of engines to try
  const failoverQueue = getFailoverQueue(agent, config, resolvedEngine, resolvedModel, effectiveCategory);

  let currentEngineIndex = 0;
  let currentEngine = resolvedEngine;
  let currentModel = resolvedModel;
  let currentPrompt = finalPrompt;
  let success = false;
  let limitExhausted = false;

  // 5. Failover Execution Loop
  while (true) {
    while (currentEngineIndex < failoverQueue.length) {
      const target = failoverQueue[currentEngineIndex];
      currentEngine = target.engine;
      currentModel = target.model;

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

      // Check if limits (tokens/quota/rate) or command errors occurred
      const check = detectLimitCondition(output, error);
      // Also treat empty/trivially-short output (< 50 chars) as a failure
      // This catches cases where the engine exits cleanly but produces no content
      const outputEmpty = !error && (!output || output.trim().length < 50);
      const executionFailed = check.limitReached || error !== null || outputEmpty;

      if (executionFailed) {
        const reason = check.limitReached
          ? check.reason
          : outputEmpty
            ? "Engine returned empty or insufficient output"
            : (error.message || String(error));
        console.log(`\n⚠️  [IMH-Code] Engine "${currentEngine}" execution failed: ${reason}`);
        
        if (check.partialOutput || (output && !error)) {
          cumulativeOutput += (cumulativeOutput ? "\n" : "") + (check.partialOutput || output);
        }

        currentEngineIndex++;
        if (currentEngineIndex < failoverQueue.length) {
          const nextEng = failoverQueue[currentEngineIndex];
          console.log(`🔄 [IMH-Code] Failing over to next best available engine "${nextEng.engine}" using model "${nextEng.model}"...`);

          // Build failover resume prompt — only include resume context if there's meaningful partial output
          if (cumulativeOutput.trim().length > 50) {
            const failoverResumeContext = [
              `\n# ⚠️ FAILOVER RESUME CONTEXT`,
              `The previous engine execution (using ${currentEngine} with model ${currentModel}) encountered a failure and was interrupted mid-task.`,
              `Here is the partial output produced by the previous run before it stopped:`,
              `\n---`,
              cumulativeOutput.trim(),
              `---\n`,
              `Please resume from exactly where the process was interrupted. Review what was already created or modified, and complete the remaining parts of the original task. Do NOT restart the entire task from scratch.`
            ].join("\n");

            currentPrompt = finalPrompt + "\n" + failoverResumeContext;
          }
          // If no meaningful partial output, just use the original prompt (fresh start)
        } else {
          limitExhausted = true;
          errors.push(`All available engines (${failoverQueue.map(t => `${t.engine} (${t.model})`).join(", ")}) failed and were exhausted.`);
          cumulativeOutput += "\n\n[Execution aborted: all available engines failed]";
        }
      } else {
        success = true;
        cumulativeOutput += (cumulativeOutput ? "\n" : "") + output;
        break; // Successfully completed
      }
    }

    if (success || !limitExhausted) {
      break;
    }

    // Interactive retry check
    if (process.stdout.isTTY) {
      console.log(`\n❌ [IMH-Code] All available engines/models failed.`);
      console.log(`   Wait 15 seconds for limits to reset, then press Enter to retry, or type "abort" to exit.`);
      
      const readline = require("readline");
      const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
      
      const answer: string = await new Promise((resolve) => {
        rl.question(`👉 Retry or abort? [retry/abort]: `, (ans: string) => {
          rl.close();
          resolve(ans.trim().toLowerCase());
        });
      });

      if (answer === "abort") {
        break;
      } else {
        console.log(`🔄 Resetting failover queue and retrying execution...`);
        currentEngineIndex = 0;
        limitExhausted = false;
        errors.length = 0;
      }
    } else {
      break;
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
    "out of tokens",
    "exceeded",
    "limit is consumed",
    "limit consumed",
    "consumed",
    "429"
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
export function getFailoverQueue(
  agent: LoadedAgent,
  config: any,
  initialEngine: string,
  initialModel: string,
  category: string
): FailoverTarget[] {
  const installed = getInstalledEngines(config);
  const queue: FailoverTarget[] = [{ engine: initialEngine, model: initialModel }];

  const addToQueue = (engine: string, model: string) => {
    const cleanEng = engine.toLowerCase().trim();
    if (!installed.includes(cleanEng)) return;
    
    // De-duplicate same engine + model pairs
    const exists = queue.some(t => t.engine === cleanEng && t.model === model);
    if (!exists) {
      queue.push({ engine: cleanEng, model });
    }
  };

  // 0. Add user-configured fallbacks first
  const userRouting = config?.model_routing?.[category];
  if (userRouting?.fallbacks && Array.isArray(userRouting.fallbacks)) {
    for (const fb of userRouting.fallbacks) {
      if (fb?.engine && fb?.model) {
        const engineData = config?.available_engines?.[fb.engine];
        if (engineData?.models?.length > 0) {
          const exactMatch = engineData.models.find((m: string) =>
            m.toLowerCase().replace(/[-._\s]/g, "").includes(fb.model.toLowerCase().replace(/[-._\s]/g, ""))
          );
          if (exactMatch) {
            addToQueue(fb.engine, exactMatch);
          } else {
            addToQueue(fb.engine, fb.model);
          }
        }
      }
    }
  }

  // 1. Add preferred engines/models from category DEFAULT_MODEL_PREFERENCES
  const prefs = DEFAULT_MODEL_PREFERENCES[category];
  if (prefs) {
    for (const pref of prefs) {
      const targetEng = pref.engine;
      const preferredMdl = pref.model;
      
      // Find the actual model name in the installed engine's models list
      const engineData = config?.available_engines?.[targetEng];
      if (engineData?.models?.length > 0) {
        const exactMatch = engineData.models.find((m: string) =>
          m.toLowerCase().replace(/[-._\s]/g, "").includes(preferredMdl.toLowerCase().replace(/[-._\s]/g, ""))
        );
        if (exactMatch) {
          addToQueue(targetEng, exactMatch);
        } else {
          addToQueue(targetEng, engineData.models[0]);
        }
      }
    }
  }

  // 2. Add preferred engines from manifest
  if (agent.manifest.preferred_engines) {
    for (const eng of agent.manifest.preferred_engines) {
      const engineData = config?.available_engines?.[eng];
      const model = engineData?.models?.[0] || agent.manifest.default_model;
      addToQueue(eng, model);
    }
  }

  // 3. Add fallback engines from manifest
  if (agent.manifest.fallback_engines) {
    for (const eng of agent.manifest.fallback_engines) {
      const engineData = config?.available_engines?.[eng];
      const model = engineData?.models?.[0] || agent.manifest.default_model;
      addToQueue(eng, model);
    }
  }

  // 4. Add any other installed engines as a last resort
  for (const eng of installed) {
    const engineData = config?.available_engines?.[eng];
    const model = engineData?.models?.[0] || "default";
    addToQueue(eng, model);
  }

  // 5. Expand agy to include agy2, agy3, agy4... etc. right after agy
  const expandedQueue: FailoverTarget[] = [];
  for (const target of queue) {
    if (!expandedQueue.some(t => t.engine === target.engine && t.model === target.model)) {
      expandedQueue.push(target);
    }
    if (target.engine === "agy" || target.engine === "antigravity") {
      for (let i = 2; i <= 10; i++) {
        const key = `agy${i}`;
        if (installed.includes(key)) {
          const agy2Data = config?.available_engines?.[key];
          let model = target.model;
          if (agy2Data?.models?.length > 0) {
            const match = agy2Data.models.find((m: string) =>
              m.toLowerCase().replace(/[-._\s]/g, "").includes(target.model.toLowerCase().replace(/[-._\s]/g, ""))
            );
            if (match) model = match;
            else model = agy2Data.models[0];
          }
          if (!expandedQueue.some(t => t.engine === key && t.model === model)) {
            expandedQueue.push({ engine: key, model });
          }
        }
      }
    }
  }

  // 6. Ensure the fast category model is at the very end of the queue as the ultimate fallback
  const fastPrefs = DEFAULT_MODEL_PREFERENCES["fast"];
  if (fastPrefs && fastPrefs.length > 0) {
    const fastPref = fastPrefs[0];
    const fastEngineData = config?.available_engines?.[fastPref.engine];
    if (fastEngineData?.models?.length > 0) {
      const match = fastEngineData.models.find((m: string) =>
        m.toLowerCase().replace(/[-._\s]/g, "").includes(fastPref.model.toLowerCase().replace(/[-._\s]/g, ""))
      );
      const finalModel = match || fastEngineData.models[0];
      const cleanFastEng = fastPref.engine.toLowerCase().trim();
      
      if (installed.includes(cleanFastEng)) {
        const exists = expandedQueue.some(t => t.engine === cleanFastEng && t.model === finalModel);
        if (!exists) {
          expandedQueue.push({ engine: cleanFastEng, model: finalModel });
        }
      }
    }
  }

  return expandedQueue;
}

/**
 * Resolves the model to use for a failover engine.
 */
export function getModelForEngine(
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

