#!/usr/bin/env node

/**
 * zeoel CLI
 *
 * Usage:
 *   zeoel                              → Initialize framework in current directory
 *   zeoel agent list                   → List all discovered agents
 *   zeoel agent inspect <id>           → Show full manifest + loaded skills
 *   zeoel agent run <id> "<task>"      → Build prompt and run (dry-run by default)
 *     --criteria "<string>"            → Acceptance criteria
 *     --engine <model>                 → Override engine/model
 *     --live                           → Call real LLM (requires ANTHROPIC_API_KEY)
 *     --output <path>                  → Custom session output directory
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');
const readline = require('readline');

// ─── Entry Point ──────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const command = args[0];
const subcommand = args[1];

if (command === '--version' || command === '-v') {
  const pkg = require(path.join(__dirname, '..', 'package.json'));
  console.log(`zeoel version: ${pkg.version}`);
  process.exit(0);
}

if (command === '--help' || command === '-h' || command === 'help') {
  printGeneralHelp();
  process.exit(0);
}

if (command === 'agent') {
  runAgentCommand(subcommand, args.slice(2)).catch((err) => {
    console.error(err.message ?? err);
    process.exit(1);
  });
} else if (command === 'sprint') {
  runSprintCommand(subcommand, args.slice(2)).catch((err) => {
    console.error(err.message ?? err);
    process.exit(1);
  });
} else {
  // Default: framework initialization
  runInit().catch((err) => {
    console.error(err.message ?? err);
    process.exit(1);
  });
}

function printGeneralHelp() {
  console.log(`
  Zeoel AI Agency Framework CLI

  Usage:
    zeoel                        → Initialize/update framework globally & register command
    zeoel agent list             → List all discovered agents
    zeoel agent inspect <id>     → Show full manifest + loaded skills
    zeoel agent run <id> "<task>" → Build prompt and run (dry-run by default)
      --live                     → Call real LLM (requires API keys / local CLI)
      -m, --model <model>        → Override model (e.g. gemini-2.5-flash)
      --engine <cli>             → Override engine (claude|opencode|codex|agy)
      --criteria "<text>"        → Set acceptance criteria
      --output <path>            → Save session output to custom path

    zeoel sprint run <sprintNum> → Run tasks in a sprint (auto by default)
      --mode <auto|manual>       → Override default execution mode

    zeoel --version, -v          → Print zeoel version
    zeoel --help, -h             → Print this help message
  `);
}

// ─── Agent Commands ───────────────────────────────────────────────────────────

async function runAgentCommand(subcommand, restArgs) {
  const orchestrator = loadOrchestrator();

  switch (subcommand) {
    case 'list':
      return cmdList(orchestrator, restArgs);
    case 'inspect':
      return cmdInspect(orchestrator, restArgs);
    case 'run':
      return cmdRun(orchestrator, restArgs);
    default:
      printAgentHelp();
      process.exit(0);
  }
}

/** Load the compiled orchestrator from dist/orchestrator/index.js */
function loadOrchestrator() {
  const distPath = path.join(__dirname, '..', 'dist', 'orchestrator', 'index.js');

  if (!fs.existsSync(distPath)) {
    console.error(
      '❌ Orchestrator not built. Run:\n' +
      '     npm run build\n' +
      '   Then retry.\n'
    );
    process.exit(1);
  }

  return require(distPath);
}

/** Resolve the agents/ directory — checks global home dir, then cwd, then package root */
function resolveAgentsDir() {
  const globalAgents = path.join(os.homedir(), '.zeoel', 'agents');
  if (fs.existsSync(globalAgents)) return globalAgents;

  const cwdAgents = path.join(process.cwd(), 'agents');
  if (fs.existsSync(cwdAgents)) return cwdAgents;

  const pkgAgents = path.join(__dirname, '..', 'agents');
  if (fs.existsSync(pkgAgents)) return pkgAgents;

  throw new Error(
    '❌ No "agents/" directory found.\n' +
    '  Run "zeoel" in a directory with an "agents/" folder,\n' +
    '  or run "zeoel" first to initialize the framework.'
  );
}

// ─── zeoel agent list ─────────────────────────────────────────────────────────

async function cmdList(orc, _args) {
  const agentsDir = resolveAgentsDir();
  const cwd = process.cwd();

  console.log('\n🤖 Loading agent registry...\n');

  const { agents, errors } = await orc.loadRegistry(agentsDir, cwd);

  if (agents.size === 0 && errors.length === 0) {
    console.log('  No agents found in:', agentsDir);
    console.log('  Add a folder with agent.yml + SYSTEM.md to register an agent.\n');
    return;
  }

  // Print agents table
  const rows = [...agents.values()].map((a) => ({
    id: a.manifest.id,
    name: a.manifest.name,
    role: a.manifest.role,
    version: a.manifest.version,
    skills: a.skills.length,
    model: a.manifest.default_model,
  }));

  console.log('┌─────────────────────────────────────────────────────────────────────────┐');
  console.log('│  ZEOEL AGENT REGISTRY                                                   │');
  console.log('├──────────────────────────────┬──────────────────────────┬───────────────┤');
  console.log('│  ID                          │  Role                    │  Model        │');
  console.log('├──────────────────────────────┼──────────────────────────┼───────────────┤');

  for (const row of rows) {
    const id = row.id.padEnd(28).slice(0, 28);
    const role = row.role.padEnd(24).slice(0, 24);
    const model = row.model.padEnd(13).slice(0, 13);
    console.log(`│  ${id}  │  ${role}  │  ${model}  │`);
  }

  console.log('└──────────────────────────────┴──────────────────────────┴───────────────┘');
  console.log(`\n  Total: ${agents.size} agent(s)  │  Skills directory: ${path.join(path.dirname(agentsDir), 'skills')}`);

  if (errors.length > 0) {
    console.log(`\n⚠️  ${errors.length} agent(s) failed to load:\n`);
    for (const { agentId, error } of errors) {
      console.log(`  ❌ ${agentId}:`);
      console.log(`     ${error.split('\n').join('\n     ')}\n`);
    }
  }

  console.log('\n  Run "zeoel agent inspect <id>" to view a specific agent.\n');
}

// ─── zeoel agent inspect ──────────────────────────────────────────────────────

async function cmdInspect(orc, args) {
  const agentId = args[0];

  if (!agentId) {
    console.error('❌ Usage: zeoel agent inspect <agent-id>');
    process.exit(1);
  }

  const agentsDir = resolveAgentsDir();
  const cwd = process.cwd();

  console.log(`\n🔍 Loading agent: ${agentId}\n`);

  const { agents, errors } = await orc.loadRegistry(agentsDir, cwd);

  if (errors.some((e) => e.agentId === agentId)) {
    const err = errors.find((e) => e.agentId === agentId);
    console.error(err.error);
    process.exit(1);
  }

  const agent = orc.getAgent(agents, agentId);
  const { manifest, systemPrompt, skills, memoryFiles, dir } = agent;

  const divider = '─'.repeat(72);

  console.log(`${divider}`);
  console.log(`  ${manifest.name}  (v${manifest.version})`);
  console.log(`${divider}`);
  console.log(`  ID:          ${manifest.id}`);
  console.log(`  Role:        ${manifest.role}`);
  console.log(`  Description: ${manifest.description.replace(/\n\s*/g, ' ')}`);
  console.log(`  Directory:   ${dir}`);
  console.log(`  Model:       ${manifest.default_model}`);
  console.log(`  Fallbacks:   ${manifest.fallback_engines.join(', ') || '(none)'}`);
  console.log(`\n  Permissions:`);
  console.log(`    read_files:    ${manifest.permissions.read_files}`);
  console.log(`    write_files:   ${manifest.permissions.write_files}`);
  console.log(`    run_commands:  ${manifest.permissions.run_commands}`);
  console.log(`    network:       ${manifest.permissions.network_access}`);
  console.log(`\n  Memory Scopes: ${manifest.memory.scopes.join(', ')}`);
  console.log(`  Task Types:    ${manifest.supported_task_types.join(', ')}`);

  if (manifest.quality_gates.length > 0) {
    console.log(`\n  Quality Gates:`);
    for (const gate of manifest.quality_gates) {
      for (const [k, v] of Object.entries(gate)) {
        console.log(`    • ${k}: ${v}`);
      }
    }
  }

  if (skills.length > 0) {
    console.log(`\n${divider}`);
    console.log(`  LOADED SKILLS (${skills.length})`);
    console.log(`${divider}`);
    for (const skill of skills) {
      const preview = skill.content.split('\n').slice(0, 5).join('\n    ');
      console.log(`\n  ► ${skill.id}  (${skill.path})`);
      console.log(`    ${preview}`);
      if (skill.content.split('\n').length > 5) {
        console.log(`    ... (${skill.content.split('\n').length} lines total)`);
      }
    }
  } else {
    console.log(`\n  Skills: (none declared in agent.yml)`);
  }

  if (memoryFiles.length > 0) {
    console.log(`\n${divider}`);
    console.log(`  LOADED MEMORY FILES (${memoryFiles.length})`);
    console.log(`${divider}`);
    for (const mf of memoryFiles) {
      console.log(`  • ${mf.path}`);
    }
  }

  console.log(`\n${divider}`);
  console.log(`  SYSTEM PROMPT PREVIEW`);
  console.log(`${divider}`);
  const previewLines = systemPrompt.split('\n').slice(0, 20);
  console.log(previewLines.map((l) => `  ${l}`).join('\n'));
  if (systemPrompt.split('\n').length > 20) {
    console.log(`  ... (${systemPrompt.split('\n').length} lines total)`);
  }

  console.log(`\n${divider}\n`);
  console.log(`  Run this agent with:`);
  console.log(`    zeoel agent run ${agentId} "Your task description" --dry-run\n`);
}

// ─── zeoel agent run ──────────────────────────────────────────────────────────

async function cmdRun(orc, args) {
  // Parse: zeoel agent run <id> "<task>" [options]
  const agentId = args[0];
  const task = args[1];

  if (!agentId || !task) {
    console.error('❌ Usage: zeoel agent run <agent-id> "<task description>" [options]');
    console.error('   Options:');
    console.error('     --criteria "<string>"    Acceptance criteria');
    console.error('     --engine <cli>           Override engine CLI (claude|opencode|codex|antigravity)');
    console.error('     --model <model>          Override target model (e.g. gpt-5.5, gemini-3.5-flash)');
    console.error('     --live                   Run live execution via local CLI tool');
    console.error('     --output <path>          Custom output directory');
    process.exit(1);
  }

  // Parse flags
  const restArgs = args.slice(2);
  const live = restArgs.includes('--live');
  const engineIdx = restArgs.indexOf('--engine');
  const engine = engineIdx >= 0 ? restArgs[engineIdx + 1] : undefined;
  
  const mIndex = restArgs.indexOf('--model');
  const shortMIndex = restArgs.indexOf('-m');
  const modelIdx = mIndex >= 0 ? mIndex : shortMIndex;
  const model = modelIdx >= 0 ? restArgs[modelIdx + 1] : undefined;

  const criteriaIdx = restArgs.indexOf('--criteria');
  const criteria = criteriaIdx >= 0 ? restArgs[criteriaIdx + 1] : undefined;
  const outputIdx = restArgs.indexOf('--output');
  const outputDir = outputIdx >= 0 ? restArgs[outputIdx + 1] : undefined;

  const agentsDir = resolveAgentsDir();
  const cwd = process.cwd();

  console.log(`\n🚀 Zeoel Agent Execution`);
  console.log(`   Agent:  ${agentId}`);
  console.log(`   Task:   ${task}`);
  console.log(`   Mode:   ${live ? '🔴 LIVE (CLI execution)' : '🟡 DRY-RUN (no CLI execution)'}`);
  if (criteria) console.log(`   Criteria: ${criteria}`);
  if (engine) console.log(`   Engine override: ${engine}`);
  if (model) console.log(`   Model override:  ${model}`);
  console.log('');

  const { agents, errors } = await orc.loadRegistry(agentsDir, cwd);

  if (errors.some((e) => e.agentId === agentId)) {
    const err = errors.find((e) => e.agentId === agentId);
    console.error(err.error);
    process.exit(1);
  }

  const agent = orc.getAgent(agents, agentId);

  const result = await orc.runAgent(
    agent,
    task,
    {
      dryRun: !live,
      engine,
      model,
      outputDir,
      cwd,
    },
    criteria
  );

  console.log('\n' + '─'.repeat(72));
  console.log(`\n✅ Execution complete`);
  console.log(`   Duration:    ${result.durationMs}ms`);
  console.log(`   Model:       ${result.model}`);
  console.log(`   Dry-run:     ${result.dryRun}`);
  if (result.sessionDir) {
    console.log(`   Session log: ${result.sessionDir}`);
  }
  if (result.errors.length > 0) {
    console.log(`\n⚠️  Errors (${result.errors.length}):`);
    result.errors.forEach((e) => console.log(`   • ${e}`));
  }
  console.log('');
}

// ─── Help ─────────────────────────────────────────────────────────────────────

function printAgentHelp() {
  console.log(`
  zeoel agent <subcommand>

  Subcommands:
    list                        List all discovered agents
    inspect <id>                Show full agent manifest and loaded skills
    run <id> "<task>" [flags]   Build prompt and run (dry-run by default)

  Flags for "run":
    --criteria "<string>"       Acceptance criteria
    --engine <cli>              Override the engine CLI (claude|opencode|codex|antigravity)
    --model, -m <model>         Override the target model (e.g. gpt-5.5, gemini-3.5-flash)
    --live                      Run live execution using your local CLI coding tool
    --output <path>             Custom directory for session output

  Examples:
    zeoel agent list
    zeoel agent inspect premium-ui-designer
    zeoel agent run premium-ui-designer "Improve the hero section" --dry-run
    zeoel agent run security-reviewer "Audit the login flow" --live --criteria "Zero OWASP issues"
  `);
}

async function runSprintCommand(subcommand, restArgs) {
  switch (subcommand) {
    case 'run':
      return cmdSprintRun(restArgs);
    default:
      printSprintHelp();
      process.exit(0);
  }
}

function printSprintHelp() {
  console.log(`
  zeoel sprint <subcommand>

  Subcommands:
    run [<sprint-number>] [flags]  Run tasks in a sprint

  Flags for "run":
    --mode <auto|manual>        Override the configured execution mode (auto or manual)

  Examples:
    zeoel sprint run 1
    zeoel sprint run 2 --mode manual
  `);
}

async function cmdSprintRun(restArgs) {
  let sprintNumStr = restArgs.find(arg => !arg.startsWith('-'));
  const modeIdx = restArgs.indexOf('--mode');
  let cliMode = modeIdx >= 0 ? restArgs[modeIdx + 1] : undefined;

  const cwd = process.cwd();

  // 1. Auto-detect sprint number if not provided
  let sprintNum = 1;
  if (sprintNumStr) {
    sprintNum = parseInt(sprintNumStr, 10);
    if (isNaN(sprintNum)) {
      console.error(`❌ Invalid sprint number: ${sprintNumStr}`);
      process.exit(1);
    }
  } else {
    // Try matching from PROJECT_BRIEF.md
    const briefPath = path.join(cwd, 'PROJECT_BRIEF.md');
    let detected = false;
    if (fs.existsSync(briefPath)) {
      try {
        const briefContent = fs.readFileSync(briefPath, 'utf8');
        const sprintMatch = briefContent.match(/Current Sprint:\s*Sprint\s*(\d+)/i);
        if (sprintMatch) {
          sprintNum = parseInt(sprintMatch[1], 10);
          console.log(`🔍 Auto-detected current sprint from PROJECT_BRIEF.md: Sprint ${sprintNum}`);
          detected = true;
        }
      } catch (e) {
        // ignore
      }
    }
    if (!detected) {
      // Look at existing docs/sprint-N directories
      let maxSprint = 0;
      try {
        const docsDir = path.join(cwd, 'docs');
        if (fs.existsSync(docsDir)) {
          const files = fs.readdirSync(docsDir);
          for (const file of files) {
            const match = file.match(/^sprint-(\d+)$/i);
            if (match) {
              const num = parseInt(match[1], 10);
              if (num > maxSprint) maxSprint = num;
            }
          }
        }
      } catch (e) {
        // ignore
      }
      if (maxSprint > 0) {
        sprintNum = maxSprint;
        console.log(`🔍 Auto-detected sprint from docs/ directory: Sprint ${sprintNum}`);
      } else {
        console.log(`ℹ️ No current sprint detected. Defaulting to Sprint 1.`);
        sprintNum = 1;
      }
    }
  }

  // 2. Resolve execution mode
  let executionMode = 'auto'; // default fallback
  const configPath = path.join(cwd, 'zeoel.config.json');
  if (fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      if (config.execution_mode) {
        executionMode = config.execution_mode;
      }
    } catch (e) {
      // ignore
    }
  }
  if (cliMode) {
    if (cliMode === 'auto' || cliMode === 'manual') {
      executionMode = cliMode;
    } else {
      console.warn(`⚠️ Invalid mode flag "${cliMode}". Using configured mode: ${executionMode}`);
    }
  }

  console.log(`\n🏁 Starting Zeoel Sprint Runner`);
  console.log(`   Sprint: ${sprintNum}`);
  console.log(`   Mode:   ${executionMode.toUpperCase()}\n`);

  const progressPath = path.join(cwd, 'docs', `sprint-${sprintNum}`, 'progress.md');
  const tasksDir = path.join(cwd, 'docs', `sprint-${sprintNum}`, 'tasks');

  if (!fs.existsSync(progressPath)) {
    console.error(`❌ Progress tracker not found: ${progressPath}`);
    console.error(`   Make sure Phase 2 (Sprint Planning) is complete and progress.md exists.`);
    process.exit(1);
  }

  if (!fs.existsSync(tasksDir)) {
    console.error(`❌ Task execution scripts directory not found: ${tasksDir}`);
    process.exit(1);
  }

  // 3. Find and sort all task scripts
  let taskScripts = [];
  try {
    const files = fs.readdirSync(tasksDir);
    for (const file of files) {
      const match = file.match(/^task_(\d+)\.(sh|cmd)$/i);
      if (match) {
        const num = parseInt(match[1], 10);
        // Avoid duplicate tasks if both .sh and .cmd exist
        if (!taskScripts.some(t => t.num === num)) {
          taskScripts.push({ num, file });
        }
      }
    }
  } catch (e) {
    console.error(`❌ Failed to read task scripts: ${e.message}`);
    process.exit(1);
  }

  taskScripts.sort((a, b) => a.num - b.num);

  if (taskScripts.length === 0) {
    console.log(`ℹ️ No task scripts found in ${tasksDir}.`);
    process.exit(0);
  }

  // Helper function to check if task is completed in progress.md
  const isTaskCompleted = (taskNum) => {
    try {
      const progressContent = fs.readFileSync(progressPath, 'utf8');
      const lines = progressContent.split('\n');
      for (const line of lines) {
        if (line.includes('|')) {
          const cells = line.split('|').map(c => c.trim());
          if (cells.length > 2) {
            const firstCell = cells[1];
            if (firstCell === String(taskNum) || firstCell === `Task ${taskNum}` || parseInt(firstCell, 10) === taskNum) {
              const statusCell = cells.find(cell => 
                cell.includes('✅') || 
                cell.toLowerCase().includes('done') || 
                cell.includes('⏭️') || 
                cell.toLowerCase().includes('deferred')
              );
              if (statusCell) return true;
            }
          }
        }
      }
    } catch (e) {
      // ignore
    }
    return false;
  };

  // 4. Run loop
  for (let i = 0; i < taskScripts.length; i++) {
    const task = taskScripts[i];
    const completed = isTaskCompleted(task.num);

    if (completed) {
      console.log(`⏭️  Task ${task.num} is already completed. Skipping.`);
      continue;
    }

    console.log(`\n────────────────────────────────────────────────────────────────`);
    console.log(`📋 [Task ${task.num}/${taskScripts.length}] Preparing execution...`);
    console.log(`────────────────────────────────────────────────────────────────`);

    // In manual mode, ask user
    if (executionMode === 'manual') {
      const answer = await askQuestion(`Execute Task ${task.num}? [Y/n]: `);
      if (answer.toLowerCase().trim() === 'n') {
        console.log(`⏭️  Skipped Task ${task.num}.`);
        continue;
      }
    }

    const isWindows = process.platform === 'win32';
    const shellScript = path.join(tasksDir, `task_${task.num}.sh`);
    const cmdScript = path.join(tasksDir, `task_${task.num}.cmd`);
    let runCmd = '';

    if (isWindows && fs.existsSync(cmdScript)) {
      runCmd = `"${cmdScript}"`;
    } else {
      runCmd = `bash "${shellScript}"`;
    }

    try {
      console.log(`▶️  Executing: ${runCmd}`);
      execSync(runCmd, { stdio: 'inherit', cwd });
      console.log(`\n✅ Task ${task.num} execution completed successfully.`);
    } catch (err) {
      console.error(`\n❌ Error: Task ${task.num} execution script failed.`);
      console.log('Choices:');
      console.log('  [r] Retry the current task');
      console.log('  [s] Skip / Defer the task and continue');
      console.log('  [a] Abort execution loop');
      const action = await askQuestion('Select action [r/s/a] (default: r): ');
      const cleanAction = action.toLowerCase().trim();
      if (cleanAction === 's') {
        console.log(`⏭️  Skipping Task ${task.num} and continuing.`);
        continue;
      } else if (cleanAction === 'a') {
        console.log('🛑 Aborted.');
        process.exit(1);
      } else {
        // Retry
        console.log(`🔄 Retrying Task ${task.num}...`);
        i--; // decrement to run this task again in next iteration
        continue;
      }
    }
  }

  console.log('\n🏁 Sprint Execution finished!');
  console.log(`   All incomplete tasks in Sprint ${sprintNum} have been processed.`);
}

// ─── Framework Initialization (existing behavior + configuration scanning) ───

function resolveBinary(name, fallbackPaths) {
  try {
    const whichPath = execSync(`which ${name}`, { encoding: 'utf8', stdio: [] }).trim();
    if (whichPath && fs.existsSync(whichPath)) {
      return whichPath;
    }
  } catch (e) {
    // ignore
  }

  const home = os.homedir();
  for (const rawPath of fallbackPaths) {
    const resolvedPath = rawPath.replace(/^~/, home);
    if (fs.existsSync(resolvedPath)) {
      return resolvedPath;
    }
  }
  return null;
}

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => rl.question(query, (ans) => {
    rl.close();
    resolve(ans.trim());
  }));
}

function scanAssistantCLIs() {
  const engines = {
    claude: {
      name: "Claude Code",
      path: resolveBinary("claude", ["~/.local/bin/claude", "/usr/local/bin/claude", "/opt/homebrew/bin/claude"]),
      models: [],
      modelsCmd: (bin) => `"${bin}" --list-models 2>/dev/null || echo ''`
    },
    opencode: {
      name: "OpenCode",
      path: resolveBinary("opencode", ["~/.opencode/bin/opencode", "/usr/local/bin/opencode", "/opt/homebrew/bin/opencode"]),
      models: [],
      modelsCmd: (bin) => `"${bin}" models 2>/dev/null`
    },
    codex: {
      name: "Codex (OpenAI)",
      path: resolveBinary("codex", ["~/Library/PhpWebStudy/env/node/bin/codex", "/usr/local/bin/codex", "/opt/homebrew/bin/codex"]),
      models: [],
      modelsCmd: (bin) => `"${bin}" debug models 2>/dev/null`
    },
    agy: {
      name: "Antigravity CLI (agy)",
      path: resolveBinary("agy", ["~/.local/bin/agy", "/usr/local/bin/agy", "/opt/homebrew/bin/agy"]),
      models: [],
      modelsCmd: (bin) => `"${bin}" models 2>/dev/null || "${bin}" --list-models 2>/dev/null || echo ''`
    },
    qwen: {
      name: "QwenCode (qwen)",
      path: resolveBinary("qwen", ["~/.local/bin/qwen", "/usr/local/bin/qwen", "/opt/homebrew/bin/qwen"]),
      models: [],
      modelsCmd: (bin) => `"${bin}" models 2>/dev/null || "${bin}" --list-models 2>/dev/null || echo ''`
    },
    mimo: {
      name: "MimoCode (mimo)",
      path: resolveBinary("mimo", ["~/.local/bin/mimo", "/usr/local/bin/mimo", "/opt/homebrew/bin/mimo", "~/.mimo/bin/mimo"]),
      models: [],
      modelsCmd: (bin) => `"${bin}" models 2>/dev/null || "${bin}" --list-models 2>/dev/null || echo ''`
    }
  };

  // Dynamically query each found engine for its available models
  for (const [key, eng] of Object.entries(engines)) {
    if (!eng.path) continue;
    try {
      let raw = execSync(eng.modelsCmd(eng.path), { 
        encoding: 'utf8', 
        stdio: ['ignore', 'pipe', 'ignore'],
        timeout: 3000 // Prevent hanging if command is interactive or spawns a blocking browser
      });

      // Try JSON parse first (codex returns JSON)
      let models = [];
      try {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.models) {
          models = parsed.models.map(m => m.slug || m.id || m.name).filter(Boolean);
        } else if (Array.isArray(parsed)) {
          models = parsed.map(m => (typeof m === 'string' ? m : m.id || m.slug)).filter(Boolean);
        }
      } catch {
        // Plain text list — one model per line
        models = raw.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
      }

      if (models.length > 0) {
        eng.models = models;
      }
    } catch (e) {
      // model query failed or timed out — this means the CLI is not logged in / configured
      eng.path = null;
      eng.models = [];
    }
  }

  return engines;
}

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

function rmRecursiveSync(dest) {
  if (fs.existsSync(dest)) {
    fs.rmSync(dest, { recursive: true, force: true });
  }
}

async function runInit() {
  console.log('\n🚀 Initializing Zeoel AI Agency Framework Globally...\n');

  const packageRoot = path.join(__dirname, '..');
  const zeoelScriptPath = path.join(packageRoot, 'bin', 'zeoel.js');
  const cwd = process.cwd();
  const globalZeoelDir = path.join(os.homedir(), '.zeoel');

  // Ensure global ~/.zeoel exists
  if (!fs.existsSync(globalZeoelDir)) {
    fs.mkdirSync(globalZeoelDir, { recursive: true });
  }

  const itemsToCopy = [
    { src: '.github', dest: '.github', desc: 'Copilot and GitHub integration files' },
    { src: 'AGENTS.md', dest: 'AGENTS.md', desc: 'Agent manifest' },
    { src: 'CLAUDE.md', dest: 'CLAUDE.md', desc: 'Claude and Cursor integration file' },
    { src: '.gitignore.template', dest: '.gitignore', desc: 'Auto-generated gitignore' },
    { src: 'SETUP.md', dest: 'SETUP.md', desc: 'Setup guide' },
    { src: 'USER_MANUAL.md', dest: 'USER_MANUAL.md', desc: 'User manual' },
    { src: 'agents', dest: 'agents', desc: 'YAML-driven agent manifests' },
    { src: 'skills', dest: 'skills', desc: 'Skill library (SKILL.md files)' },
  ];

  try {
    let copiedSomething = false;

    // Copy to global Zeoel folder ~/.zeoel (unconditionally overwrite to apply updates)
    for (const item of itemsToCopy) {
      const sourcePath = path.join(packageRoot, item.src);
      const targetPath = path.join(globalZeoelDir, item.dest);

      if (!fs.existsSync(sourcePath)) {
        console.warn(`⚠️  Warning: Could not find ${item.src} in package.`);
        continue;
      }

      if (fs.existsSync(targetPath)) {
        const stats = fs.statSync(targetPath);
        if (stats.isDirectory()) {
          rmRecursiveSync(targetPath);
        } else {
          fs.unlinkSync(targetPath);
        }
      }

      console.log(`  Updating ${item.src} in global ~/.zeoel/${item.dest} (${item.desc})...`);
      copyRecursiveSync(sourcePath, targetPath);
      copiedSomething = true;
    }

    // Copy CLAUDE.md, AGENTS.md, and skills/ to assistant config directories globally
    const assistants = [
      { dir: path.join(os.homedir(), '.claude'), name: 'Claude Code' },
      { dir: path.join(os.homedir(), '.gemini'), name: 'Antigravity IDE' },
      { dir: path.join(os.homedir(), '.copilot'), name: 'Copilot' }
    ];

    for (const ast of assistants) {
      if (!fs.existsSync(ast.dir)) {
        try {
          fs.mkdirSync(ast.dir, { recursive: true });
        } catch (e) {
          console.warn(`⚠️  Could not create assistant directory ${ast.dir}: ${e.message}`);
          continue;
        }
      }

      // Copy CLAUDE.md to assistant dir
      const claudeDest = path.join(ast.dir, 'CLAUDE.md');
      fs.copyFileSync(path.join(packageRoot, 'CLAUDE.md'), claudeDest);

      // Copy AGENTS.md to assistant dir
      const agentsDest = path.join(ast.dir, 'AGENTS.md');
      fs.copyFileSync(path.join(packageRoot, 'AGENTS.md'), agentsDest);

      // Copy skills/ folder to assistant dir
      const skillsDest = path.join(ast.dir, 'skills');
      rmRecursiveSync(skillsDest);
      copyRecursiveSync(path.join(packageRoot, 'skills'), skillsDest);
      console.log(`  Updated custom rules & skills globally in ${ast.name} directory (${ast.dir})`);
    }

    // In the local workspace (cwd), create frontend, backend, docs, .worktrees, and clean local .zeoel folders
    const dirsToCreate = [
      'frontend',
      'backend',
      '.worktrees',
      'docs',
      path.join('.zeoel', 'commands'),
      path.join('.zeoel', 'questions'),
      path.join('.zeoel', 'answers')
    ];
    for (const dir of dirsToCreate) {
      const dirPath = path.join(cwd, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`  Created local directory: ${dir}`);
      }
    }

    // Always create local docs/brainstorm directory to make sure questions.md can be saved
    const docsBrainstormDir = path.join(cwd, 'docs', 'brainstorm');
    if (!fs.existsSync(docsBrainstormDir)) {
      fs.mkdirSync(docsBrainstormDir, { recursive: true });
    }

    // Create start.md inside .zeoel
    const startMdPath = path.join(cwd, '.zeoel', 'start.md');
    if (!fs.existsSync(startMdPath)) {
      const startMdContent = `# 🌌 Zeoel AI Agency - Start Project\n\nWelcome to the Zeoel AI Agency! Write your product description or project idea inside the block below, then run the brainstorming script.\n\n---\n\n## 📝 1. Your Project Idea\n\nWrite your prompt/idea inside the comments below (you can write as much detail as you want):\n\n<!-- WRITE_PROMPT_HERE -->\nI want to design a dashboard for hotel room booking.\n<!-- END_PROMPT -->\n\n---\n\n## 🚀 2. Start Brainstorming\n\nClick the **Run** button on the terminal code block below for your OS, or click the link to start Phase 1 (Brainstorming) with **Gohar (CEO)**:\n\n###  macOS / Linux\nRun this block in terminal:\n\`\`\`bash\n.zeoel/commands/start.sh\n\`\`\`\nOr click here: [Start Brainstorming (Mac/Linux)](./commands/start.sh)\n\n### ❖ Windows\nRun this block in terminal:\n\`\`\`cmd\n.zeoel\\commands\\start.cmd\n\`\`\`\nOr click here: [Start Brainstorming (Windows)](./commands/start.cmd)\n`;
      fs.writeFileSync(startMdPath, startMdContent, 'utf8');
      console.log(`  Created start.md in .zeoel directory`);
    }

    // Create start.sh (Mac/Linux) inside .zeoel/commands
    const startShPath = path.join(cwd, '.zeoel', 'commands', 'start.sh');
    const startShContent = `#!/bin/bash\n# Zeoel - Start Brainstorming Script\nCWD="\$(cd "\$(dirname "\${BASH_SOURCE[0]}")" && pwd)"\ncd "\$CWD/../.."\n\nif [ ! -f .zeoel/start.md ]; then\n  echo "❌ .zeoel/start.md not found!"\n  exit 1\nfi\n\n# Extract prompt from .zeoel/start.md\nPROMPT=\$(awk '/<!-- WRITE_PROMPT_HERE -->/{flag=1;next}/<!-- END_PROMPT -->/{flag=0}flag' .zeoel/start.md | tr '\\n' ' ' | xargs)\n\nif [ -z "\$PROMPT" ]; then\n  PROMPT="Hotel room booking"\nfi\n\necho "🚀 Running Gohar CEO for brainstorming..."\nif command -v zeoel >/dev/null 2>&1; then\n  zeoel agent run gohar-ceo "Brainstorming project: \$PROMPT" --live\nelse\n  node "${zeoelScriptPath}" agent run gohar-ceo "Brainstorming project: \$PROMPT" --live\nfi\n`;
    fs.writeFileSync(startShPath, startShContent, { mode: 0o755 });
    console.log(`  Created start.sh in .zeoel/commands directory`);

    // Create start.cmd (Windows) inside .zeoel/commands
    const startCmdPath = path.join(cwd, '.zeoel', 'commands', 'start.cmd');
    const startCmdContent = `@echo off\r\n:: Zeoel - Start Brainstorming Script (Windows)\r\nset CWD=%~dp0\r\ncd /d "%CWD%\\..\\.."\r\n\r\nif not exist .zeoel\\start.md (\r\n  echo ❌ .zeoel\\start.md not found!\r\n  exit /b 1\r\n)\r\n\r\n:: Run a simple PowerShell command to parse start.md and invoke zeoel\r\npowershell -Command " \\\r\n  $content = Get-Content .zeoel/start.md -Raw; \\\r\n  $match = [regex]::Match($content, '(?s)<!-- WRITE_PROMPT_HERE -->(.*?)<!-- END_PROMPT -->'); \\\r\n  $prompt = if ($match.Success) { $match.Groups[1].Value.Trim() } else { 'Hotel room booking' }; \\\r\n  Write-Host '🚀 Running Gohar CEO for brainstorming...'; \\\r\n  if (Get-Command zeoel -ErrorAction SilentlyContinue) { \\\r\n    zeoel agent run gohar-ceo \\"Brainstorming project: $prompt\\" --live \\\r\n  } else { \\\r\n    node \\"${zeoelScriptPath}\\" agent run gohar-ceo \\"Brainstorming project: $prompt\\" --live \\\r\n  } \\\r\n"\r\n`;
    fs.writeFileSync(startCmdPath, startCmdContent, 'utf8');
    console.log(`  Created start.cmd in .zeoel/commands directory`);

    // Create submit_answers.sh (Mac/Linux) inside .zeoel/commands
    const submitAnswersShPath = path.join(cwd, '.zeoel', 'commands', 'submit_answers.sh');
    const submitAnswersShContent = `#!/bin/bash\n# Zeoel - Submit Brainstorming Answers\nCWD="\$(cd "\$(dirname "\${BASH_SOURCE[0]}")" && pwd)"\ncd "\$CWD/../.."\n\nA_FILE=".zeoel/answers/answers.md"\nif [ ! -f "\$A_FILE" ]; then\n  echo "❌ \$A_FILE not found!"\n  exit 1\nfi\n\necho "🚀 Submitting answers to Gohar CEO..."\nif command -v zeoel >/dev/null 2>&1; then\n  zeoel agent run gohar-ceo "Brainstorming answers: Please process the answers in .zeoel/answers/answers.md" --live\nelse\n  node "${zeoelScriptPath}" agent run gohar-ceo "Brainstorming answers: Please process the answers in .zeoel/answers/answers.md" --live\nfi\n`;
    fs.writeFileSync(submitAnswersShPath, submitAnswersShContent, { mode: 0o755 });
    console.log(`  Created submit_answers.sh in .zeoel/commands directory`);

    // Create submit_answers.cmd (Windows) inside .zeoel/commands
    const submitAnswersCmdPath = path.join(cwd, '.zeoel', 'commands', 'submit_answers.cmd');
    const submitAnswersCmdContent = `@echo off\r\n:: Zeoel - Submit Brainstorming Answers (Windows)\r\nset CWD=%~dp0\r\ncd /d "%CWD%\\..\\.."\r\n\r\nset A_FILE=.zeoel\\answers\\answers.md\r\nif not exist %A_FILE% (\r\n  echo ❌ %A_FILE% not found!\r\n  exit /b 1\r\n)\r\n\r\n:: Invoke zeoel passing the static instructions\r\npowershell -Command " \\\r\n  Write-Host '🚀 Submitting answers to Gohar CEO...'; \\\r\n  if (Get-Command zeoel -ErrorAction SilentlyContinue) { \\\r\n    zeoel agent run gohar-ceo \\"Brainstorming answers: Please process the answers in .zeoel/answers/answers.md\\" --live \\\r\n  } else { \\\r\n    node \\"${zeoelScriptPath}\\" agent run gohar-ceo \\"Brainstorming answers: Please process the answers in .zeoel/answers/answers.md\\" --live \\\r\n  } \\\r\n"\r\n`;
    fs.writeFileSync(submitAnswersCmdPath, submitAnswersCmdContent, 'utf8');
    console.log(`  Created submit_answers.cmd in .zeoel/commands directory`);

    // Always create local .gitignore if not present, to keep local repository clean
    const localGitignore = path.join(cwd, '.gitignore');
    if (!fs.existsSync(localGitignore)) {
      const gitignoreTemplate = path.join(packageRoot, '.gitignore.template');
      if (fs.existsSync(gitignoreTemplate)) {
        fs.copyFileSync(gitignoreTemplate, localGitignore);
        console.log(`  Created local .gitignore`);
      }
    }

    registerCliGlobally();
    ensureCavemanAndGraphify();

    if (copiedSomething) {
      console.log('\n✅ Zeoel Framework files copied globally!');
    }

    // Interactive Engine & Model Setup
    console.log('🔍 Scanning for local coding assistant CLIs...');
    const engines = scanAssistantCLIs();
    const foundEngines = Object.keys(engines).filter(k => engines[k].path);

    if (foundEngines.length === 0) {
      console.warn('⚠️  No local coding assistant CLIs were detected.');
      console.warn('   Supported: claude, opencode, codex, agy (Antigravity), qwen (QwenCode), mimo (MimoCode)');
      console.warn('   Install one and re-run "zeoel" to update the configuration.\n');
    }

    let primaryEngine = 'claude'; // default fallback
    const isInteractive = process.stdout.isTTY;

    if (isInteractive && foundEngines.length > 0) {
      console.log('\nFound the following local coding assistant CLIs:');
      foundEngines.forEach((key, index) => {
        const eng = engines[key];
        const numModels = eng.models.length;
        console.log(`  [${index + 1}] ${eng.name} (${key})`);
        console.log(`      Path:   ${eng.path}`);
        if (numModels > 0) {
          console.log(`      Models: ${eng.models.slice(0, 3).join(', ')}${numModels > 3 ? '...' : ''} (${numModels} total)`);
        }
      });

      console.log('\nChoose your primary assistant engine:');
      let selectionIdx = -1;
      while (true) {
        const answer = await askQuestion(`Select engine number [1-${foundEngines.length}] (default: 1): `);
        if (answer === '') {
          selectionIdx = 0;
          break;
        }
        const parsed = parseInt(answer, 10);
        if (parsed >= 1 && parsed <= foundEngines.length) {
          selectionIdx = parsed - 1;
          break;
        }
        console.log(`❌ Invalid choice. Please enter a number between 1 and ${foundEngines.length}.`);
      }
      primaryEngine = foundEngines[selectionIdx];
      console.log(`\n❇️  Selected primary assistant engine: ${engines[primaryEngine].name} (${primaryEngine})`);
    } else if (foundEngines.length > 0) {
      // Non-interactive fallback
      primaryEngine = foundEngines[0];
      console.log(`\n❇️  Auto-detected and selected primary assistant engine: ${engines[primaryEngine].name} (${primaryEngine})`);
    }

    let defaultModel = '';
    const selectedEngineObj = engines[primaryEngine];
    if (selectedEngineObj && selectedEngineObj.models && selectedEngineObj.models.length > 0) {
      if (isInteractive) {
        console.log(`\nAvailable models for ${selectedEngineObj.name}:`);
        selectedEngineObj.models.forEach((modelName, index) => {
          console.log(`  [${index + 1}] ${modelName}`);
        });
        let modelSelectionIdx = -1;
        while (true) {
          const answer = await askQuestion(`Select default model number [1-${selectedEngineObj.models.length}] (default: 1): `);
          if (answer === '') {
            modelSelectionIdx = 0;
            break;
          }
          const parsed = parseInt(answer, 10);
          if (parsed >= 1 && parsed <= selectedEngineObj.models.length) {
            modelSelectionIdx = parsed - 1;
            break;
          }
          console.log(`❌ Invalid choice. Please enter a number between 1 and ${selectedEngineObj.models.length}.`);
        }
        defaultModel = selectedEngineObj.models[modelSelectionIdx];
        console.log(`\n❇️  Selected default model: ${defaultModel}`);
      } else {
        defaultModel = selectedEngineObj.models[0];
        console.log(`\n❇️  Auto-detected and selected default model: ${defaultModel}`);
      }
    } else {
      if (isInteractive) {
        const answer = await askQuestion(`Enter default model name for ${selectedEngineObj?.name || primaryEngine} (optional, press Enter to skip): `);
        if (answer !== '') {
          defaultModel = answer;
          console.log(`\n❇️  Selected default model: ${defaultModel}`);
        }
      }
    }

    let executionMode = 'auto';
    if (isInteractive) {
      console.log('\nChoose execution mode:');
      console.log('  [1] Auto task execution (default)');
      console.log('  [2] Manual execution');
      const answer = await askQuestion('Select execution mode [1-2] (default: 1): ');
      if (answer.trim() === '2') {
        executionMode = 'manual';
      }
      console.log(`\n❇️  Selected execution mode: ${executionMode}`);
    }

    // Write/Update zeoel.config.json
    const configPath = path.join(cwd, 'zeoel.config.json');
    const configData = {
      primary_engine: primaryEngine,
      default_model: defaultModel || undefined,
      execution_mode: executionMode,
      available_engines: {}
    };

    for (const key of foundEngines) {
      configData.available_engines[key] = {
        path: engines[key].path,
        models: engines[key].models
      };
    }

    fs.writeFileSync(configPath, JSON.stringify(configData, null, 2), 'utf8');
    console.log(`\n💾 Saved assistant configuration to: ${configPath}\n`);

    console.log('✅ Zeoel Framework initialized successfully!');
    console.log('─'.repeat(60));
    console.log('🚀 HOW TO START BUILDING WITH ZEOEL:');
    console.log('');
    console.log('1. Open `.zeoel/start.md` in your editor.');
    console.log('   Write your project prompt inside the comments block.');
    console.log('');
    console.log('2. Run the brainstorming start script in terminal:');
    console.log('    macOS/Linux:  bash .zeoel/commands/start.sh');
    console.log('   ❖ Windows:      .zeoel\\commands\\start.cmd');
    console.log('   (This starts Gohar CEO to review scope & ask stack questions)');
    console.log('');
    console.log('3. Open `.zeoel/answers/answers.md`.');
    console.log('   Write your stack choices & details under the questions.');
    console.log('');
    console.log('4. Submit your answers in terminal:');
    console.log('    macOS/Linux:  bash .zeoel/commands/submit_answers.sh');
    console.log('   ❖ Windows:      .zeoel\\commands\\submit_answers.cmd');
    console.log('   (This generates PROJECT_BRIEF.md & plans Sprint 1)');
    console.log('─'.repeat(60));
    console.log('');

  } catch (error) {
    console.error('❌ Failed to initialize Zeoel framework:', error.message);
    process.exit(1);
  }
}

function ensureCavemanAndGraphify() {
  const globalZeoelDir = path.join(os.homedir(), '.zeoel');
  console.log('\n🔍 Checking token-saving engines globally...');

  let skillsInstalled = false;
  try {
    execSync('npx --no-install skills --version', { stdio: 'ignore' });
    skillsInstalled = true;
  } catch (e) { /* not installed */ }

  if (!skillsInstalled) {
    console.log('  📦 Installing skills CLI globally...');
    try {
      execSync('npm install -g skills', { stdio: 'inherit' });
      skillsInstalled = true;
    } catch (e) {
      console.warn('  ⚠️  Failed to install skills CLI globally:', e.message);
    }
  }

  try {
    execSync('npx skills add juliusbrussee/caveman', { cwd: globalZeoelDir, stdio: 'inherit' });
    console.log('  ✅ Caveman compression rules integrated globally');
  } catch (e) {
    console.warn('  ⚠️  Failed to register Caveman skill globally:', e.message);
  }

  let graphifyInstalled = false;
  try {
    execSync('graphify --version', { stdio: 'ignore' });
    graphifyInstalled = true;
  } catch (e) { /* not installed */ }

  if (!graphifyInstalled) {
    console.log('  📊 Graphify not found. Attempting install...');
    const installers = [
      () => execSync('uv tool install graphifyy', { stdio: 'inherit' }),
      () => execSync('pipx install graphifyy', { stdio: 'inherit' }),
      () => execSync('pip3 install graphifyy --break-system-packages', { stdio: 'inherit' }),
      () => execSync('pip install graphifyy', { stdio: 'inherit' }),
    ];
    for (const install of installers) {
      try { install(); graphifyInstalled = true; break; } catch { /* try next */ }
    }
    if (!graphifyInstalled) {
      console.warn('  ⚠️  Graphify not installed. Run: pip install graphifyy');
    }
  }

  if (graphifyInstalled) {
    try {
      execSync('graphify install', { cwd: globalZeoelDir, stdio: 'inherit' });
      console.log('  ✅ Graphify knowledge engine registered globally');
    } catch (e) {
      console.warn('  ⚠️  Failed to register Graphify skill globally:', e.message);
    }
  }
}

function registerCliGlobally() {
  const packageRoot = path.join(__dirname, '..');
  const zeoelScriptPath = path.join(packageRoot, 'bin', 'zeoel.js');
  const isWindows = process.platform === 'win32';

  console.log('\n🔗 Registering zeoel command globally...');

  if (isWindows) {
    const binDir = path.join(os.homedir(), '.zeoel', 'bin');
    if (!fs.existsSync(binDir)) {
      fs.mkdirSync(binDir, { recursive: true });
    }

    // Write CMD shims
    const cmdContent = `@echo off\r\nnode "${zeoelScriptPath}" %*\r\n`;
    fs.writeFileSync(path.join(binDir, 'zeoel.cmd'), cmdContent);

    // Write PowerShell shims
    const psContent = `node "${zeoelScriptPath}" $args\r\n`;
    fs.writeFileSync(path.join(binDir, 'zeoel.ps1'), psContent);

    // Append to User PATH
    try {
      const psCommand = `
        $currentPath = [Environment]::GetEnvironmentVariable("Path", "User");
        if ($currentPath -notlike "*${binDir}*") {
            [Environment]::SetEnvironmentVariable("Path", $currentPath + ";${binDir}", "User");
            Write-Host "PATH updated successfully";
        }
      `;
      execSync(`powershell -Command "${psCommand.trim().replace(/\n/g, ' ')}"`, { stdio: 'ignore' });
      console.log(`  ✅ Registered globally on Windows at ${binDir}. (Please restart your terminal session to apply PATH changes.)`);
    } catch (e) {
      console.warn(`  ⚠️  Failed to automatically update Windows PATH environment variable: ${e.message}`);
    }
  } else {
    // macOS/Linux
    const localBinDir = path.join(os.homedir(), '.local', 'bin');
    const zeoelBinDir = path.join(os.homedir(), '.zeoel', 'bin');

    const dirs = [localBinDir, zeoelBinDir];
    for (const dir of dirs) {
      if (!fs.existsSync(dir)) {
        try {
          fs.mkdirSync(dir, { recursive: true });
        } catch (e) {
          // ignore if cannot write
        }
      }
    }

    // Write shims
    const shimContent = `#!/bin/sh\nexec node "${zeoelScriptPath}" "$@"\n`;

    const targets = [
      path.join(localBinDir, 'zeoel'),
      path.join(zeoelBinDir, 'zeoel')
    ];

    for (const t of targets) {
      try {
        fs.writeFileSync(t, shimContent, { mode: 0o755 });
      } catch (e) {
        // ignore if permission denied
      }
    }

    // Add to shell profiles if not present
    const profiles = [
      path.join(os.homedir(), '.zshrc'),
      path.join(os.homedir(), '.bashrc'),
      path.join(os.homedir(), '.bash_profile'),
      path.join(os.homedir(), '.profile')
    ];

    const exportLine = `\n# Zeoel Framework PATH\nexport PATH="$HOME/.zeoel/bin:$HOME/.local/bin:$PATH"\n`;

    let profileUpdated = false;
    for (const profile of profiles) {
      if (fs.existsSync(profile)) {
        try {
          const content = fs.readFileSync(profile, 'utf8');
          if (!content.includes('.zeoel/bin') && !content.includes('.local/bin')) {
            fs.appendFileSync(profile, exportLine);
            profileUpdated = true;
          }
        } catch (e) {
          // ignore read/write errors
        }
      }
    }

    console.log(`  ✅ Shims installed in ~/.zeoel/bin and ~/.local/bin.`);
    if (profileUpdated) {
      console.log(`  ✅ Added PATH export to shell configuration files. (Please run "source ~/.zshrc" or restart your terminal.)`);
    }
  }
}
