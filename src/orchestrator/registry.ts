/**
 * Agent registry: discovers and loads all agents from the agents/ directory.
 * IMH-Code — Imam Hussain Coding Harness Platform
 * Agents are discovered by scanning for agents/{id}/agent.yml files.
 */

import fs from "fs";
import path from "path";
import { glob } from "glob";
import { loadAgent } from "./loader";
import type { LoadedAgent } from "./types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RegistryLoadResult {
  agents: Map<string, LoadedAgent>;
  errors: Array<{ agentId: string; error: string }>;
}

// ─── Discovery ────────────────────────────────────────────────────────────────

/**
 * Scan the agents directory and return absolute paths to all agent.yml files.
 * Pattern: <agentsDir>/{agent-id}/agent.yml
 */
export async function discoverAgents(agentsDir: string): Promise<string[]> {
  if (!fs.existsSync(agentsDir)) {
    throw new Error(
      `❌ Agents directory not found: ${agentsDir}\n` +
        `  Create the directory and add at least one agent folder with agent.yml.`
    );
  }

  const manifestPaths = await glob("*/agent.yml", {
    cwd: agentsDir,
    absolute: true,
  });

  if (manifestPaths.length === 0) {
    console.warn(
      `  ⚠️  No agents found in "${agentsDir}".\n` +
        `  Add a folder with agent.yml and SYSTEM.md to register an agent.`
    );
  }

  return manifestPaths.sort(); // deterministic order
}

// ─── Registry Loader ─────────────────────────────────────────────────────────

/**
 * Load and validate all agents from the agents directory.
 * Individual load failures are collected as errors (not thrown) so that
 * a single bad agent doesn't break listing/inspecting the rest.
 */
export async function loadRegistry(
  agentsDir: string,
  cwd: string
): Promise<RegistryLoadResult> {
  const manifestPaths = await discoverAgents(agentsDir);
  const agents = new Map<string, LoadedAgent>();
  const errors: Array<{ agentId: string; error: string }> = [];

  for (const manifestPath of manifestPaths) {
    const agentDir = path.dirname(manifestPath);
    const agentId = path.basename(agentDir);

    try {
      const loaded = await loadAgent(agentDir, cwd);
      agents.set(agentId, loaded);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      errors.push({ agentId, error: message });
    }
  }

  return { agents, errors };
}

// ─── Lookup ───────────────────────────────────────────────────────────────────

/**
 * Resolves a given agent ID or short alias to the canonical agent ID.
 *
 * IMH-Code Generic Agent Aliases:
 *
 * Core Agents:
 *   planner, plan, pm        → planner
 *   designer, design, ui, ux → designer
 *
 * Frontend Executors:
 *   nextjs, next             → nextjs-executor
 *   react, vite              → react-executor
 *   vue, nuxt, vue3          → vue-executor
 *
 * Backend Executors:
 *   laravel, php             → laravel-executor
 *   python, django, fastapi  → python-executor
 *   java, spring             → java-executor
 *   flutter, dart            → flutter-executor
 *   rn, expo, react-native   → react-native-executor
 *   ios, swift, swiftui      → ios-executor
 *   android, kotlin          → android-executor
 *   go, rust, cpp            → systems-executor
 *   web3, solidity           → web3-executor
 *   devops, docker           → devops-executor
 *
 * Quality Agents:
 *   tester, qa, test         → tester
 *   security, audit          → security-auditor
 *   seo, content             → seo-optimizer
 *   debugger, debug, fix     → debugger
 */
export function resolveAgentIdAlias(agentId: string): string {
  const clean = agentId.toLowerCase().trim();

  const aliases: Record<string, string> = {
    // ── Core ─────────────────────────────────────────────────────────────────
    "plan":               "planner",
    "orchestrator":       "planner",
    "pm":                 "planner",
    "design":             "designer",
    "ui":                 "designer",
    "ux":                 "designer",

    // ── Frontend Executors ────────────────────────────────────────────────────
    "nextjs":             "nextjs-executor",
    "next":               "nextjs-executor",
    "next-js":            "nextjs-executor",
    "react":              "react-executor",
    "vite":               "react-executor",
    "react-vite":         "react-executor",
    "vue":                "vue-executor",
    "nuxt":               "vue-executor",
    "vue3":               "vue-executor",

    // ── Backend Executors ─────────────────────────────────────────────────────
    "laravel":            "laravel-executor",
    "php":                "laravel-executor",
    "python":             "python-executor",
    "django":             "python-executor",
    "fastapi":            "python-executor",
    "flask":              "python-executor",
    "java":               "java-executor",
    "spring":             "java-executor",
    "springboot":         "java-executor",
    "quarkus":            "java-executor",
    "flutter":            "flutter-executor",
    "dart":               "flutter-executor",
    "rn":                 "react-native-executor",
    "react-native":       "react-native-executor",
    "expo":               "react-native-executor",
    "ios":                "ios-executor",
    "swift":              "ios-executor",
    "swiftui":            "ios-executor",
    "android":            "android-executor",
    "kotlin":             "android-executor",
    "go":                 "systems-executor",
    "golang":             "systems-executor",
    "rust":               "systems-executor",
    "cpp":                "systems-executor",
    "c++":                "systems-executor",
    "systems":            "systems-executor",
    "web3":               "web3-executor",
    "solidity":           "web3-executor",
    "blockchain":         "web3-executor",
    "devops":             "devops-executor",
    "docker":             "devops-executor",
    "cicd":               "devops-executor",
    "deploy":             "devops-executor",

    // ── Quality Agents ────────────────────────────────────────────────────────
    "qa":                 "tester",
    "test":               "tester",
    "testing":            "tester",
    "security":           "security-auditor",
    "audit":              "security-auditor",
    "pentest":            "security-auditor",
    "seo":                "seo-optimizer",
    "content":            "seo-optimizer",
    "marketing":          "seo-optimizer",
    "debug":              "debugger",
    "debugging":          "debugger",
    "fix":                "debugger",
  };

  return aliases[clean] || clean;
}

/**
 * Get a single agent by ID from a pre-loaded registry.
 * Throws with a helpful message if not found.
 */
export function getAgent(
  registry: Map<string, LoadedAgent>,
  agentId: string
): LoadedAgent {
  const resolvedId = resolveAgentIdAlias(agentId);
  const agent = registry.get(resolvedId);

  if (!agent) {
    const available = [...registry.keys()].join(", ") || "(none)";
    throw new Error(
      `❌ Agent "${agentId}" not found (resolved: "${resolvedId}").\n` +
        `  Available agents: ${available}\n\n` +
        `  Run "imhcode agent list" to see all agents.`
    );
  }

  return agent;
}
