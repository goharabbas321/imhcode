/**
 * Execution engine adapters using local CLI tools.
 * IMH-Code — Imam Hussain Coding Harness Platform
 *
 * DryRunAdapter        — default, prints the prompt; never calls a CLI/LLM.
 * ClaudeCodeCLIAdapter — shells out to `claude -p`
 * OpenCodeCLIAdapter   — shells out to `opencode run`
 * CodexCLIAdapter      — shells out to `codex exec`
 * AgyCLIAdapter        — shells out to `agy -p`  (Google Antigravity CLI)
 * QwenCodeCLIAdapter   — shells out to `qwen -p`  (Alibaba QwenCode)
 * MimoCodeCLIAdapter   — shells out to `mimo -p`  (Xiaomi MimoCode)
 */

import { execSync, spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import * as crypto from "crypto";
import type { EngineAdapter } from "./types";

// ─── Binary Resolution Helper ──────────────────────────────────────────────────

function resolveBinary(name: string, fallbackPaths: string[]): string {
  // 1. Try resolving using system PATH via `which`
  try {
    const whichPath = execSync(`which ${name}`, { encoding: "utf8" }).trim();
    if (whichPath && fs.existsSync(whichPath)) {
      return whichPath;
    }
  } catch {
    // Ignore error, try fallbacks
  }

  // 2. Try the fallback paths (expanding ~ to home directory)
  const home = os.homedir();
  for (const rawPath of fallbackPaths) {
    const resolvedPath = rawPath.replace(/^~/, home);
    if (fs.existsSync(resolvedPath)) {
      return resolvedPath;
    }
  }

  // 3. Fallback to just name and let spawn search standard PATH
  return name;
}

// ─── Spawn Helper with Stdin ───────────────────────────────────────────────────

function runCliWithStdin(
  binaryPath: string,
  args: string[],
  stdinInput: string,
  cliName: string
): Promise<string> {
  console.log(`   [1/3] 🔍 Resolved binary path: ${binaryPath}`);
  console.log(`   [2/3] 🚀 Spawning "${cliName}" CLI...`);
  console.log(`   [3/3] ✍️ Piping prompt via stdin (${(stdinInput.length / 1024).toFixed(1)} KB)...`);
  console.log(`\n─── Streaming Live Output from ${cliName} ──────────────────────────\n`);

  return new Promise((resolve, reject) => {
    const child = spawn(binaryPath, args, { stdio: ["pipe", "pipe", "pipe"] });

    let stdout = "";
    let stderr = "";
    let hasReceivedData = false;
    const isTTY = process.stdout.isTTY;
    let interval: NodeJS.Timeout | null = null;

    if (isTTY) {
      const spinnerChars = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
      let spinnerIdx = 0;
      interval = setInterval(() => {
        if (!hasReceivedData) {
          process.stdout.write(`\r  \x1b[36m${spinnerChars[spinnerIdx]}\x1b[0m ${cliName} is processing/thinking...`);
          spinnerIdx = (spinnerIdx + 1) % spinnerChars.length;
        }
      }, 100);
    }

    const clearSpinner = () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
      if (!hasReceivedData && isTTY) {
        process.stdout.write("\r\x1b[K"); // Clear the line
      }
      hasReceivedData = true;
    };

    child.stdout.on("data", (chunk) => {
      clearSpinner();
      stdout += chunk.toString();
      process.stdout.write(chunk);
    });

    child.stderr.on("data", (chunk) => {
      clearSpinner();
      stderr += chunk.toString();
      process.stderr.write(chunk);
    });

    child.on("error", (err) => {
      clearSpinner();
      reject(new Error(`Failed to start child process ${binaryPath}: ${err.message}`));
    });

    child.on("close", (code) => {
      clearSpinner();
      console.log(`\n────────────────────────────────────────────────────────────────`);
      if (code !== 0) {
        reject(
          new Error(
            `CLI process exited with code ${code}.\n` +
              `Stderr: ${stderr}\n` +
              `Stdout: ${stdout}`
          )
        );
      } else {
        resolve(stdout);
      }
    });

    // Write to stdin and close it
    child.stdin.write(stdinInput);
    child.stdin.end();
  });
}

// ─── Dry-Run Adapter (Default) ────────────────────────────────────────────────

export class DryRunAdapter implements EngineAdapter {
  readonly name = "dry-run";

  async run(prompt: string, _model: string): Promise<string> {
    const border = "═".repeat(72);
    const preview = [
      `\n${border}`,
      `  DRY-RUN MODE — Prompt preview (no LLM call made)`,
      `${border}\n`,
      prompt,
      `\n${border}`,
      `  END OF PROMPT`,
      `${border}\n`,
    ].join("\n");

    process.stdout.write(preview);
    return "[dry-run] No CLI tool was executed — run with --live to trigger the CLI.";
  }
}

// ─── Claude Code CLI Adapter ───────────────────────────────────────────────────

export class ClaudeCodeCLIAdapter implements EngineAdapter {
  readonly name = "claude";

  async run(prompt: string, model: string): Promise<string> {
    const binary = resolveBinary("claude", [
      "~/.local/bin/claude",
      "/usr/local/bin/claude",
      "/opt/homebrew/bin/claude",
    ]);

    const args = [
      "-p",
      "--dangerously-skip-permissions",
      "--no-session-persistence",
    ];
    if (model && model !== "claude" && model !== "default") {
      args.push("--model", model);
    }

    return await runCliWithStdin(binary, args, prompt, "Claude Code");
  }
}

// ─── OpenCode CLI Adapter ──────────────────────────────────────────────────────

export class OpenCodeCLIAdapter implements EngineAdapter {
  readonly name = "opencode";

  async run(prompt: string, model: string): Promise<string> {
    const binary = resolveBinary("opencode", [
      "~/.opencode/bin/opencode",
      "/usr/local/bin/opencode",
    ]);

    const args = ["run", "--dangerously-skip-permissions"];
    if (model && model !== "opencode" && model !== "default") {
      args.push("-m", model);
    }
    args.push(prompt);

    const rawOutput = await runCliWithStdin(binary, args, "", "OpenCode");

    // OpenCode prints progress lines starting with "> build ·" or similar.
    // Filter these out to get a clean result.
    const cleanOutput = rawOutput
      .split("\n")
      .filter((line) => !line.trim().startsWith("> build ·"))
      .join("\n")
      .trim();

    return cleanOutput;
  }
}

// ─── Codex CLI Adapter ─────────────────────────────────────────────────────────

export class CodexCLIAdapter implements EngineAdapter {
  readonly name = "codex";

  async run(prompt: string, model: string): Promise<string> {
    const binary = resolveBinary("codex", [
      "~/Library/PhpWebStudy/env/node/bin/codex",
      "/usr/local/bin/codex",
    ]);

    const tempFile = path.join(
      process.cwd(),
      `.codex-out-${crypto.randomBytes(6).toString("hex")}.txt`
    );

    const args = [
      "--dangerously-bypass-approvals-and-sandbox",
      "exec",
      "-",
      "-o",
      tempFile,
    ];
    if (model && model !== "codex" && model !== "default") {
      args.push("-m", model);
    }

    try {
      await runCliWithStdin(binary, args, prompt, "Codex");
      if (!fs.existsSync(tempFile)) {
        throw new Error(`Codex execution succeeded but output file was not created at ${tempFile}`);
      }
      const output = fs.readFileSync(tempFile, "utf8");
      return output;
    } finally {
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
    }
  }
}

// ─── Codex Fugu CLI Adapter ────────────────────────────────────────────────────

export class CodexFuguCLIAdapter implements EngineAdapter {
  readonly name = "codex-fugu";

  async run(prompt: string, model: string): Promise<string> {
    const binary = resolveBinary("codex-fugu", [
      "~/.local/bin/codex-fugu",
      "/usr/local/bin/codex-fugu",
      "/opt/homebrew/bin/codex-fugu",
    ]);

    const tempFile = path.join(
      process.cwd(),
      `.codex-fugu-out-${crypto.randomBytes(6).toString("hex")}.txt`
    );

    const args = [
      "--dangerously-bypass-approvals-and-sandbox",
      "exec",
      "-",
      "-o",
      tempFile,
    ];
    if (model && model !== "codex-fugu" && model !== "default") {
      args.push("-m", model);
    }

    try {
      await runCliWithStdin(binary, args, prompt, "Codex Fugu");
      if (!fs.existsSync(tempFile)) {
        throw new Error(`Codex Fugu execution succeeded but output file was not created at ${tempFile}`);
      }
      const output = fs.readFileSync(tempFile, "utf8");
      return output;
    } finally {
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
    }
  }
}

// ─── Antigravity CLI Adapter (agy) ────────────────────────────────────────────
// Google Antigravity CLI — binary: `agy`
// Docs: https://antigravity.google/docs/cli-using
// Headless: `agy -p "<prompt>"` or via stdin with `agy -p`

export class AgyCLIAdapter implements EngineAdapter {
  readonly name: string;

  constructor(name: string = "agy") {
    this.name = name;
  }

  async run(prompt: string, model: string): Promise<string> {
    const binary = resolveBinary(this.name, [
      `~/.local/bin/${this.name}`,
      `/usr/local/bin/${this.name}`,
      `/opt/homebrew/bin/${this.name}`,
    ]);

    const args: string[] = [
      "--dangerously-skip-permissions",
      "-p",
      prompt,
    ];
    if (model && model !== this.name && model !== "agy" && model !== "default") {
      args.unshift("--model", model);
    }

    return await runCliWithStdin(binary, args, "", `Antigravity (${this.name})`);
  }
}

// ─── QwenCode CLI Adapter (qwen) ──────────────────────────────────────────────
// Alibaba QwenCode CLI — binary: `qwen`
// Headless: `qwen -p "<prompt>"` or via stdin
// Model flag: `qwen --model <model-id> -p`

export class QwenCodeCLIAdapter implements EngineAdapter {
  readonly name = "qwen";

  async run(prompt: string, model: string): Promise<string> {
    const binary = resolveBinary("qwen", [
      "~/.local/bin/qwen",
      "/usr/local/bin/qwen",
      "/opt/homebrew/bin/qwen",
    ]);

    const args: string[] = [];
    if (model && model !== "qwen" && model !== "default") {
      args.push("--model", model);
    }
    args.push("-p", "-");

    return await runCliWithStdin(binary, args, prompt, "QwenCode");
  }
}

// ─── MimoCode CLI Adapter (mimo) ──────────────────────────────────────────────
// Xiaomi MimoCode CLI — binary: `mimo`
// Install: curl -fsSL https://mimo.xiaomi.com/install | bash
// Headless: `mimo -p "<prompt>"` or via stdin
// Model flag: `mimo --model <model-id> -p`

export class MimoCodeCLIAdapter implements EngineAdapter {
  readonly name = "mimo";

  async run(prompt: string, model: string): Promise<string> {
    const binary = resolveBinary("mimo", [
      "~/.local/bin/mimo",
      "/usr/local/bin/mimo",
      "/opt/homebrew/bin/mimo",
      "~/.mimo/bin/mimo",
    ]);

    const args: string[] = [];
    if (model && model !== "mimo" && model !== "default") {
      args.push("--model", model);
    }
    args.push("-p", "-");

    return await runCliWithStdin(binary, args, prompt, "MimoCode");
  }
}

// ─── Adapter Factory ──────────────────────────────────────────────────────────

export function getAdapter(
  live: boolean,
  preferredEngine?: string
): EngineAdapter {
  if (!live) {
    return new DryRunAdapter();
  }

  const engine = (preferredEngine || "").toLowerCase();

  // ── Explicit CLI keyword checks ─────────────────────────────────────────────
  if (engine === "claude" || engine === "claudecode" || engine === "claude-code") {
    return new ClaudeCodeCLIAdapter();
  }
  if (engine === "opencode") {
    return new OpenCodeCLIAdapter();
  }
  if (engine === "codex") {
    return new CodexCLIAdapter();
  }
  if (engine === "codex-fugu" || engine === "codexfugu" || engine === "fugu") {
    return new CodexFuguCLIAdapter();
  }
  if (engine === "agy" || engine === "antigravity" || /^agy\d+$/.test(engine)) {
    return new AgyCLIAdapter(engine === "antigravity" ? "agy" : engine);
  }
  if (engine === "qwen" || engine === "qwencode" || engine === "qwen-code") {
    return new QwenCodeCLIAdapter();
  }
  if (engine === "mimo" || engine === "mimocode" || engine === "mimo-code") {
    return new MimoCodeCLIAdapter();
  }

  // ── Model-name prefix → engine mapping ──────────────────────────────────────
  if (engine.startsWith("claude")) {
    return new ClaudeCodeCLIAdapter();
  }
  if (engine.startsWith("codex-fugu") || engine.startsWith("fugu")) {
    return new CodexFuguCLIAdapter();
  }
  if (engine.startsWith("gpt") || engine.startsWith("o1") || engine.startsWith("o3") || engine.startsWith("o4")) {
    return new CodexCLIAdapter();
  }
  if (engine.startsWith("gemini") || engine.startsWith("google")) {
    return new AgyCLIAdapter();
  }
  if (
    engine.startsWith("qwen") ||
    engine.startsWith("deepseek") ||
    engine.startsWith("mistral")
  ) {
    return new QwenCodeCLIAdapter();
  }
  if (engine.startsWith("mimo")) {
    return new MimoCodeCLIAdapter();
  }

  // ── Auto-detection: use first installed CLI found ────────────────────────────
  const home = os.homedir();
  const binaryExists = (name: string, fallbacks: string[]) => {
    try {
      execSync(`which ${name}`, { stdio: "ignore" });
      return true;
    } catch {
      for (const f of fallbacks) {
        if (fs.existsSync(f.replace(/^~/, home))) {
          return true;
        }
      }
    }
    return false;
  };

  if (binaryExists("opencode", ["~/.opencode/bin/opencode"])) {
    return new OpenCodeCLIAdapter();
  }
  if (binaryExists("claude", ["~/.local/bin/claude"])) {
    return new ClaudeCodeCLIAdapter();
  }
  if (binaryExists("codex-fugu", ["~/.local/bin/codex-fugu", "/opt/homebrew/bin/codex-fugu"])) {
    return new CodexFuguCLIAdapter();
  }
  if (binaryExists("codex", ["~/Library/PhpWebStudy/env/node/bin/codex"])) {
    return new CodexCLIAdapter();
  }
  if (binaryExists("agy", ["~/.local/bin/agy", "/opt/homebrew/bin/agy"])) {
    return new AgyCLIAdapter();
  }
  if (binaryExists("qwen", ["~/.local/bin/qwen", "/opt/homebrew/bin/qwen"])) {
    return new QwenCodeCLIAdapter();
  }
  if (binaryExists("mimo", ["~/.local/bin/mimo", "~/.mimo/bin/mimo"])) {
    return new MimoCodeCLIAdapter();
  }

  throw new Error(
    `❌ No active CLI agent engine could be auto-detected.\n` +
      `  Supported engines: claude, opencode, codex, codex-fugu, agy, qwen, mimo\n` +
      `  Install one and re-run, or specify with: --engine <engine-name>\n` +
      `  Run "imhcode --help" for more information.`
  );
}
