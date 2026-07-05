import * as fs from "fs";
import * as path from "path";
import { scanProjectContext, buildModificationPrompt, detectBestAgent } from "./context-scanner";
import { loadRegistry, getAgent } from "./registry";
import { runAgent } from "./index";

export interface ModificationOptions {
  agent?: string;
  engine?: string;
  model?: string;
  dryRun?: boolean;
  scope?: string;
}

/**
 * Execute a targeted project modification.
 */
export async function runModification(
  cwd: string,
  description: string,
  options: ModificationOptions = {}
): Promise<any> {
  // 1. Scan context
  const context = scanProjectContext(cwd);

  // 2. Select agent
  const selectedAgentId = options.agent || detectBestAgent(description, context);
  
  console.log(`\n🛠️  [IMH-Code] Initializing Modification Engine`);
  console.log(`   Task:  "${description}"`);
  console.log(`   Agent:  ${selectedAgentId}`);

  // Resolve agent manifests directory
  const globalAgents = path.join(process.env.HOME || "", ".imhcode", "agents");
  const localAgents = path.join(cwd, "agents");
  const pkgAgents = path.join(__dirname, "..", "..", "agents");
  const agentsDir = fs.existsSync(globalAgents) ? globalAgents : 
                    fs.existsSync(localAgents) ? localAgents : 
                    pkgAgents;

  // 3. Load Registry
  const { agents, errors } = await loadRegistry(agentsDir, cwd);
  if (errors.some(e => e.agentId === selectedAgentId)) {
    throw new Error(`Failed to load agent "${selectedAgentId}": ${errors.find(e => e.agentId === selectedAgentId)?.error}`);
  }

  const agent = getAgent(agents, selectedAgentId);

  // 4. Build custom modification task
  const modificationTask = buildModificationPrompt(context, description);

  // 5. Run the agent
  const result = await runAgent(
    agent,
    modificationTask,
    {
      dryRun: options.dryRun !== false,
      engine: options.engine,
      model: options.model,
      outputDir: path.join(cwd, ".imhcode", "sessions"),
      cwd
    }
  );

  // 6. Log changes if live and successful
  if (!result.dryRun && result.errors.length === 0) {
    logModification(cwd, {
      task: description,
      agentId: selectedAgentId,
      model: result.model,
      durationMs: result.durationMs
    });
  }

  return result;
}

interface LogEntry {
  task: string;
  agentId: string;
  model: string;
  durationMs: number;
}

function logModification(cwd: string, entry: LogEntry): void {
  const docsDir = path.join(cwd, "docs");
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  const logPath = path.join(docsDir, "modifications.md");
  const timestamp = new Date().toISOString().replace("T", " ").substring(0, 19);
  
  let header = `# 🛠️ IMH-Code Project Modifications\n\n| Date | Task | Agent | Model | Duration |\n|------|------|-------|-------|----------|\n`;
  if (fs.existsSync(logPath)) {
    try {
      const existing = fs.readFileSync(logPath, "utf-8");
      if (existing.trim().length > 10) {
        header = existing;
      }
    } catch {
      // Ignore
    }
  }

  const row = `| ${timestamp} | ${entry.task} | \`${entry.agentId}\` | ${entry.model} | ${(entry.durationMs / 1000).toFixed(1)}s |\n`;
  fs.writeFileSync(logPath, header.endsWith("\n") ? header + row : header + "\n" + row, "utf-8");
}
