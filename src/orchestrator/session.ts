/**
 * Session logger: saves all execution artifacts to a timestamped directory.
 *
 * After every execution, the following files are written to
 * sessions/{timestamp}-{agent-id}/:
 *
 *   prompt.md          — The full built prompt
 *   output.md          — The agent's response
 *   errors.json        — Any errors encountered
 *   manifest.yml       — Snapshot of the agent manifest used
 *   changed_files.json — Files the agent reported changing
 *   memory_updates.json — Memory scope changes
 */

import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import type { ExecutionResult } from "./types";

// ─── Session Directory ────────────────────────────────────────────────────────

function formatTimestamp(): string {
  return new Date()
    .toISOString()
    .replace(/[:.]/g, "-")
    .replace("T", "_")
    .slice(0, 19); // e.g. "2026-06-15_14-30-00"
}

/**
 * Resolve the session output directory.
 * Default: <cwd>/sessions/<timestamp>-<agentId>/
 */
export function resolveSessionDir(
  agentId: string,
  cwd: string,
  customOutputDir?: string
): string {
  const timestamp = formatTimestamp();
  const dirName = `${timestamp}-${agentId}`;

  if (customOutputDir) {
    return path.resolve(customOutputDir, dirName);
  }

  return path.join(cwd, "sessions", dirName);
}

// ─── Session Writer ───────────────────────────────────────────────────────────

/**
 * Write all session artifacts to disk and return the session directory path.
 */
export function saveSession(
  result: ExecutionResult,
  agentManifest: object,
  cwd: string,
  customOutputDir?: string
): string {
  const sessionDir = resolveSessionDir(result.agentId, cwd, customOutputDir);
  fs.mkdirSync(sessionDir, { recursive: true });

  // prompt.md
  fs.writeFileSync(
    path.join(sessionDir, "prompt.md"),
    result.prompt,
    "utf-8"
  );

  // output.md
  fs.writeFileSync(
    path.join(sessionDir, "output.md"),
    result.output,
    "utf-8"
  );

  // errors.json
  fs.writeFileSync(
    path.join(sessionDir, "errors.json"),
    JSON.stringify(result.errors, null, 2),
    "utf-8"
  );

  // manifest.yml (snapshot)
  fs.writeFileSync(
    path.join(sessionDir, "manifest.yml"),
    yaml.dump(agentManifest),
    "utf-8"
  );

  // changed_files.json
  fs.writeFileSync(
    path.join(sessionDir, "changed_files.json"),
    JSON.stringify(result.changedFiles, null, 2),
    "utf-8"
  );

  // memory_updates.json
  fs.writeFileSync(
    path.join(sessionDir, "memory_updates.json"),
    JSON.stringify(result.memoryUpdates, null, 2),
    "utf-8"
  );

  // session_meta.json — summary for tooling
  const meta = {
    agentId: result.agentId,
    task: result.task,
    model: result.model,
    dryRun: result.dryRun,
    durationMs: result.durationMs,
    errorCount: result.errors.length,
    skillCount:
      "skills" in agentManifest
        ? (agentManifest as { skills: unknown[] }).skills.length
        : 0,
    timestamp: new Date().toISOString(),
  };

  fs.writeFileSync(
    path.join(sessionDir, "session_meta.json"),
    JSON.stringify(meta, null, 2),
    "utf-8"
  );

  return sessionDir;
}
