/**
 * Agent registry: discovers and loads all agents from the agents/ directory.
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
 * Get a single agent by ID from a pre-loaded registry.
 * Throws with a helpful message if not found.
 */
export function getAgent(
  registry: Map<string, LoadedAgent>,
  agentId: string
): LoadedAgent {
  const agent = registry.get(agentId);

  if (!agent) {
    const available = [...registry.keys()].join(", ") || "(none)";
    throw new Error(
      `❌ Agent "${agentId}" not found.\n` +
        `  Available agents: ${available}\n\n` +
        `  Run "zeoel agent list" to see all agents.`
    );
  }

  return agent;
}
