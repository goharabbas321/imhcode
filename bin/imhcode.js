#!/usr/bin/env node

/**
 * IMH-Code CLI — Imam Hussain Coding Harness Platform
 *
 * Usage:
 *   imhcode                            → Initialize framework in current directory
 *   imhcode plan                       → Smart: brainstorm OR sprint-plan based on state
 *   imhcode execute [N]                → Execute sprint N with intelligent model routing
 *   imhcode test                       → Run the testing/security/SEO sprint
 *   imhcode agent list                 → List all discovered agents
 *   imhcode agent inspect <id>         → Show full manifest + loaded skills
 *   imhcode agent run <id> "<task>"    → Run agent (dry-run by default)
 *     --engine <cli>                   → Override engine (claude|opencode|codex|agy|qwen|mimo)
 *     -m, --model <model>             → Override model
 *     --live                          → Call real LLM
 *     --output <path>                 → Custom session output directory
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');
const readline = require('readline');

// ─── Constants ─────────────────────────────────────────────────────────────────

const PLATFORM_NAME  = 'IMH-Code';
const PLATFORM_FULL  = 'Imam Hussain Coding Harness Platform';
const CLI_CMD        = 'imhcode';
const CONFIG_FILE    = 'imhcode.config.json';
const GLOBAL_DIR     = path.join(os.homedir(), '.imhcode');
const LOCAL_DIR_NAME = '.imhcode';
const DOCS_DIR       = 'docs';
const START_MD       = path.join(DOCS_DIR, 'start.md');
const BRAINSTORM_MD  = path.join(DOCS_DIR, 'brainstorming.md');
const BRIEF_MD       = 'PROJECT_BRIEF.md';
const CONTEXT_MD     = path.join(LOCAL_DIR_NAME, 'context.md');

// ─── Entry Point ───────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const command = args[0];
const subcommand = args[1];

if (command === '--version' || command === '-v') {
  const pkg = require(path.join(__dirname, '..', 'package.json'));
  console.log(`${CLI_CMD} version: ${pkg.version}`);
  process.exit(0);
}

if (command === '--help' || command === '-h' || command === 'help') {
  printGeneralHelp();
  process.exit(0);
}

if (command === 'plan') {
  runPlanCommand(args.slice(1)).catch(err => {
    console.error(err.message ?? err);
    process.exit(1);
  });
} else if (command === 'execute' || command === 'exec') {
  runExecuteCommand(args.slice(1)).catch(err => {
    console.error(err.message ?? err);
    process.exit(1);
  });
} else if (command === 'test') {
  runTestCommand(args.slice(1)).catch(err => {
    console.error(err.message ?? err);
    process.exit(1);
  });
} else if (command === 'agent') {
  runAgentCommand(subcommand, args.slice(2)).catch(err => {
    console.error(err.message ?? err);
    process.exit(1);
  });
} else if (command === 'sprint') {
  // Legacy compat: zeoel sprint design/execute → imhcode execute
  runSprintLegacyCommand(subcommand, args.slice(2)).catch(err => {
    console.error(err.message ?? err);
    process.exit(1);
  });
} else {
  // Default: framework initialization
  runInit().catch(err => {
    console.error(err.message ?? err);
    process.exit(1);
  });
}

// ─── Help ─────────────────────────────────────────────────────────────────────

function printGeneralHelp() {
  console.log(`
  ╔══════════════════════════════════════════════════════════════════╗
  ║         ${PLATFORM_NAME} — ${PLATFORM_FULL}         ║
  ╚══════════════════════════════════════════════════════════════════╝

  Usage:
    ${CLI_CMD}                        → Initialize project (engine scan + model routing setup)
    ${CLI_CMD} plan                   → Smart: brainstorm OR generate sprint plan
    ${CLI_CMD} execute [N]            → Execute sprint N with intelligent model routing
    ${CLI_CMD} test                   → Run final testing/security/SEO sprint
    ${CLI_CMD} agent list             → List all 19 generic agents
    ${CLI_CMD} agent inspect <id>     → Show agent manifest + loaded skills
    ${CLI_CMD} agent run <id> "<task>" → Run agent (dry-run by default)
      --live                          → Call real LLM
      --engine <cli>                  → Override engine (claude|opencode|codex|agy|qwen|mimo)
      -m, --model <model>             → Override model
      --output <path>                 → Save session to custom path

  Pipeline:
    1. ${CLI_CMD}                     → Init project
    2. Edit docs/start.md             → Write your problem/prompt
    3. ${CLI_CMD} plan                → Generates docs/brainstorming.md with Q&A
    4. Edit docs/brainstorming.md     → Review/edit recommended answers
    5. ${CLI_CMD} plan                → Reads answers → generates sprint plans
    6. ${CLI_CMD} execute 1           → Execute sprint 1 (pure code, no tests)
    7. ${CLI_CMD} execute 2           → Execute sprint 2
    8. ${CLI_CMD} test                → Final testing, security + SEO audit

  Agents (19 generic — no persona names):
    planner           → Project planning, brainstorming, sprint coordination
    designer          → UX/UI design (Mimo v2.5 Pro preferred)
    nextjs-executor   → Next.js full-stack (Mimo v2.5 Pro preferred)
    react-executor    → React/Vite SPA
    vue-executor      → Vue 3 / Nuxt 4
    laravel-executor  → Laravel full-stack (DeepSeek V4 Pro preferred)
    python-executor   → Python / Django / FastAPI
    java-executor     → Java / Spring Boot
    flutter-executor  → Flutter / Dart
    react-native-executor → React Native / Expo
    ios-executor      → iOS / SwiftUI
    android-executor  → Android / Kotlin
    systems-executor  → Go / Rust / C++
    web3-executor     → Solidity / Web3
    devops-executor   → Docker / CI/CD
    tester            → QA + E2E testing (GPT-5.5 preferred)
    security-auditor  → Security audit (GPT-5.5 preferred)
    seo-optimizer     → SEO / Content (GPT-5.5 preferred)
    debugger          → Debugging / Root cause

  ${CLI_CMD} --version, -v           → Print version
  ${CLI_CMD} --help, -h              → Print this help
  `);
}

// ─── imhcode plan (Smart State Machine) ───────────────────────────────────────

async function runPlanCommand(restArgs) {
  const cwd = process.cwd();
  const startMdPath  = path.join(cwd, START_MD);
  const brainstormPath = path.join(cwd, BRAINSTORM_MD);
  const briefPath    = path.join(cwd, BRIEF_MD);

  console.log(`\n🕌 ${PLATFORM_NAME} — Plan Command\n`);

  // State detection
  const hasStartMd      = fs.existsSync(startMdPath);
  const hasBrainstorm   = fs.existsSync(brainstormPath);
  const hasBrief        = fs.existsSync(briefPath);
  const hasSprintDocs   = detectSprintDocs(cwd);

  if (!hasStartMd) {
    console.log(`❌ docs/start.md not found.\n`);
    console.log(`   Create docs/start.md and write your project description inside it.`);
    console.log(`   Then run "imhcode plan" again.\n`);
    console.log(`   Tip: Run "imhcode" first to initialize the project and create the template.\n`);
    process.exit(1);
  }

  // Read the start.md prompt
  const startContent = fs.readFileSync(startMdPath, 'utf8');
  const userPrompt = extractPromptFromStartMd(startContent);

  if (!userPrompt || userPrompt.trim().length < 10) {
    console.log(`❌ docs/start.md has no project description.\n`);
    console.log(`   Write your project idea in docs/start.md between the markers:\n`);
    console.log(`   <!-- WRITE_PROMPT_HERE -->`);
    console.log(`   Your project description here...`);
    console.log(`   <!-- END_PROMPT -->\n`);
    process.exit(1);
  }

  // ── State 1: No brainstorming yet → generate brainstorming.md ────────────
  if (!hasBrainstorm) {
    console.log(`📋 Phase 2: Generating brainstorming document...\n`);
    console.log(`   Reading your project description from docs/start.md...`);
    console.log(`   Prompt: "${userPrompt.slice(0, 100)}${userPrompt.length > 100 ? '...' : ''}"\n`);

    await generateBrainstormingDoc(cwd, userPrompt);

    console.log(`\n✅ Brainstorming document created: docs/brainstorming.md\n`);
    console.log(`─`.repeat(60));
    console.log(`\n📝 NEXT STEPS:\n`);
    console.log(`  1. Open docs/brainstorming.md`);
    console.log(`  2. Review the auto-recommended answers`);
    console.log(`  3. Edit any answers you want to customize`);
    console.log(`  4. Run "imhcode plan" again to generate sprint plans\n`);
    console.log(`─`.repeat(60));
    return;
  }

  // ── State 2: Brainstorming exists, no sprint plans → generate sprints ─────
  if (hasBrainstorm && !hasSprintDocs) {
    console.log(`📋 Phase 3-4: Reading brainstorming answers → generating sprint plans...\n`);

    const brainstormContent = fs.readFileSync(brainstormPath, 'utf8');
    const config = loadLocalConfig(cwd);

    await generateSprintPlans(cwd, userPrompt, brainstormContent, config);

    console.log(`\n✅ Sprint plans generated!\n`);
    console.log(`─`.repeat(60));
    console.log(`\n📝 NEXT STEPS:\n`);
    console.log(`  1. Review docs/sprint-1/plan.md`);
    console.log(`  2. Run "imhcode execute 1" to start Sprint 1`);
    console.log(`  3. Then "imhcode execute 2", "imhcode execute 3", etc.`);
    console.log(`  4. Run "imhcode test" for the final testing sprint\n`);
    console.log(`─`.repeat(60));
    return;
  }

  // ── State 3: Sprints already exist ───────────────────────────────────────
  if (hasSprintDocs) {
    const currentSprint = detectCurrentSprint(cwd);
    console.log(`ℹ️  Sprint plans already exist (current sprint: Sprint ${currentSprint}).\n`);
    console.log(`  Use "imhcode execute ${currentSprint}" to run the current sprint.`);
    console.log(`  Use "imhcode test" to run the final testing sprint.\n`);
    console.log(`  To re-plan from scratch, delete docs/brainstorming.md and run "imhcode plan".\n`);
  }
}

// ─── imhcode execute [N] ──────────────────────────────────────────────────────

async function runExecuteCommand(restArgs) {
  const cwd = process.cwd();
  const sprintNum = resolveSprintNum(restArgs, cwd);
  const sprintDir = path.join(cwd, DOCS_DIR, `sprint-${sprintNum}`);
  const masterScript = path.join(sprintDir, 'run_all_tasks.sh');
  const progressPath = path.join(sprintDir, 'progress.md');

  console.log(`\n🕌 ${PLATFORM_NAME} — Execute Sprint ${sprintNum}\n`);

  if (!fs.existsSync(progressPath)) {
    console.error(`❌ Sprint ${sprintNum} not planned yet.`);
    console.error(`   Run "imhcode plan" first to generate sprint plans.`);
    process.exit(1);
  }

  if (!fs.existsSync(masterScript)) {
    console.error(`❌ run_all_tasks.sh not found for Sprint ${sprintNum}.`);
    console.error(`   Run "imhcode plan" to regenerate the sprint plan.`);
    process.exit(1);
  }

  // Read plan to show what will be executed
  const planPath = path.join(sprintDir, 'plan.md');
  if (fs.existsSync(planPath)) {
    const plan = fs.readFileSync(planPath, 'utf8');
    const taskCount = (plan.match(/^##\s+Task/gm) || []).length;
    console.log(`   Sprint: ${sprintNum}`);
    console.log(`   Tasks:  ${taskCount}`);
    console.log(`   Script: ${masterScript}\n`);
  }

  // Check model routing config
  const config = loadLocalConfig(cwd);
  if (config?.model_routing) {
    console.log(`   Model Routing:`);
    for (const [cat, routing] of Object.entries(config.model_routing)) {
      if (routing && typeof routing === 'object') {
        console.log(`     ${cat.padEnd(12)}: ${routing.model} (${routing.engine})`);
      }
    }
    console.log('');
  }

  try {
    fs.chmodSync(masterScript, 0o755);
  } catch { /* ignore on Windows */ }

  console.log(`─`.repeat(60));
  try {
    execSync(`sh "${masterScript}"`, { stdio: 'inherit', cwd });
    console.log(`─`.repeat(60));
    console.log(`\n🏁 Sprint ${sprintNum} execution complete!\n`);

    // Update compact context after sprint
    await updateCompactContext(cwd, sprintNum);
  } catch (err) {
    console.log(`─`.repeat(60));
    console.error(`\n❌ Sprint ${sprintNum} execution failed.`);
    console.error(`   Check the output above for details.`);
    process.exit(1);
  }
}

// ─── imhcode test ─────────────────────────────────────────────────────────────

async function runTestCommand(restArgs) {
  const cwd = process.cwd();
  const lastSprint = detectLastSprint(cwd);
  const testingSprintNum = lastSprint + 1;
  const testSprintDir = path.join(cwd, DOCS_DIR, `sprint-${testingSprintNum}`);
  const testScript = path.join(testSprintDir, 'run_all_tasks.sh');

  console.log(`\n🕌 ${PLATFORM_NAME} — Testing Sprint\n`);

  if (fs.existsSync(testScript)) {
    // Run existing test sprint
    console.log(`   Running auto-generated testing sprint (Sprint ${testingSprintNum})...\n`);
    try {
      fs.chmodSync(testScript, 0o755);
    } catch { /* ignore */ }
    console.log(`─`.repeat(60));
    try {
      execSync(`sh "${testScript}"`, { stdio: 'inherit', cwd });
      console.log(`─`.repeat(60));
      console.log(`\n✅ Testing sprint complete! Check docs/sprint-${testingSprintNum}/ for reports.\n`);
    } catch {
      console.error(`\n❌ Testing sprint failed. Check output above.\n`);
      process.exit(1);
    }
  } else {
    // Guide user to generate the test sprint
    console.log(`   ℹ️  No testing sprint found yet.\n`);
    console.log(`   The testing sprint is auto-generated when you run "imhcode plan" and`);
    console.log(`   select "Fast Mode" or "Balanced Mode" for testing strategy.\n`);
    console.log(`   To generate it now, run:\n`);
    console.log(`     imhcode agent run planner "Generate testing sprint for Sprint ${testingSprintNum}" --live\n`);
  }
}

// ─── imhcode agent ────────────────────────────────────────────────────────────

async function runAgentCommand(subcommand, restArgs) {
  const orchestrator = loadOrchestrator();

  switch (subcommand) {
    case 'list':   return cmdList(orchestrator, restArgs);
    case 'inspect': return cmdInspect(orchestrator, restArgs);
    case 'run':    return cmdRun(orchestrator, restArgs);
    default:
      printAgentHelp();
      process.exit(0);
  }
}

function loadOrchestrator() {
  const distPath = path.join(__dirname, '..', 'dist', 'orchestrator', 'index.js');
  if (!fs.existsSync(distPath)) {
    console.error(
      `❌ Orchestrator not built. Run:\n` +
      `     npm run build\n` +
      `   Then retry.\n`
    );
    process.exit(1);
  }
  return require(distPath);
}

function resolveAgentsDir() {
  const globalAgents = path.join(GLOBAL_DIR, 'agents');
  if (fs.existsSync(globalAgents)) return globalAgents;

  const cwdAgents = path.join(process.cwd(), 'agents');
  if (fs.existsSync(cwdAgents)) return cwdAgents;

  const pkgAgents = path.join(__dirname, '..', 'agents');
  if (fs.existsSync(pkgAgents)) return pkgAgents;

  throw new Error(
    `❌ No "agents/" directory found.\n` +
    `  Run "imhcode" in a directory with an "agents/" folder,\n` +
    `  or run "imhcode" first to initialize the framework.`
  );
}

async function cmdList(orc, _args) {
  const agentsDir = resolveAgentsDir();
  const cwd = process.cwd();
  console.log('\n🤖 Loading agent registry...\n');

  const { agents, errors } = await orc.loadRegistry(agentsDir, cwd);

  if (agents.size === 0 && errors.length === 0) {
    console.log('  No agents found in:', agentsDir);
    return;
  }

  const rows = [...agents.values()].map(a => ({
    id: a.manifest.id,
    role: a.manifest.role,
    model: a.manifest.default_model,
    category: getAgentCategory(a.manifest.id),
  }));

  console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
  console.log(`│  ${PLATFORM_NAME} — AGENT REGISTRY                                         │`);
  console.log('├──────────────────────────┬────────────────┬──────────────┬──────────────────┤');
  console.log('│  ID                      │  Category      │  Model       │  Role            │');
  console.log('├──────────────────────────┼────────────────┼──────────────┼──────────────────┤');

  for (const row of rows) {
    const id  = row.id.padEnd(24).slice(0, 24);
    const cat = row.category.padEnd(14).slice(0, 14);
    const mdl = row.model.padEnd(12).slice(0, 12);
    const rol = row.role.padEnd(16).slice(0, 16);
    console.log(`│  ${id}  │  ${cat}  │  ${mdl}  │  ${rol}  │`);
  }

  console.log('└──────────────────────────┴────────────────┴──────────────┴──────────────────┘');
  console.log(`\n  Total: ${agents.size} agent(s)  │  Use "imhcode agent inspect <id>" for details.\n`);

  if (errors.length > 0) {
    console.log(`⚠️  ${errors.length} agent(s) failed to load:\n`);
    for (const { agentId, error } of errors) {
      console.log(`  ❌ ${agentId}: ${error.split('\n')[0]}\n`);
    }
  }
}

function getAgentCategory(agentId) {
  const map = {
    'planner': 'planning', 'designer': 'frontend',
    'nextjs-executor': 'frontend', 'react-executor': 'frontend', 'vue-executor': 'frontend',
    'laravel-executor': 'backend', 'python-executor': 'backend', 'java-executor': 'backend',
    'flutter-executor': 'backend', 'react-native-executor': 'backend', 'ios-executor': 'backend',
    'android-executor': 'backend', 'systems-executor': 'backend', 'web3-executor': 'backend',
    'devops-executor': 'backend', 'tester': 'testing', 'security-auditor': 'testing',
    'seo-optimizer': 'review', 'debugger': 'review',
  };
  return map[agentId] || 'backend';
}

async function cmdInspect(orc, args) {
  const agentId = args[0];
  if (!agentId) {
    console.error(`❌ Usage: imhcode agent inspect <agent-id>`);
    process.exit(1);
  }

  const agentsDir = resolveAgentsDir();
  const cwd = process.cwd();
  console.log(`\n🔍 Loading agent: ${agentId}\n`);

  const { agents, errors } = await orc.loadRegistry(agentsDir, cwd);

  if (errors.some(e => e.agentId === agentId)) {
    const err = errors.find(e => e.agentId === agentId);
    console.error(err.error);
    process.exit(1);
  }

  const agent = orc.getAgent(agents, agentId);
  const { manifest, systemPrompt, skills, dir } = agent;
  const divider = '─'.repeat(72);

  // Load config to show routing
  const config = loadLocalConfig(cwd);
  const category = getAgentCategory(manifest.id);
  const routing = config?.model_routing?.[category];

  console.log(divider);
  console.log(`  ${manifest.name}  (v${manifest.version})`);
  console.log(divider);
  console.log(`  ID:           ${manifest.id}`);
  console.log(`  Role:         ${manifest.role}`);
  console.log(`  Category:     ${category}`);
  console.log(`  Description:  ${manifest.description.replace(/\n\s*/g, ' ')}`);
  console.log(`  Directory:    ${dir}`);
  console.log(`  Default Model: ${manifest.default_model}`);
  if (routing) {
    console.log(`  Routed Model: ${routing.model} via ${routing.engine} (from imhcode.config.json)`);
  }
  console.log(`  Fallbacks:    ${manifest.fallback_engines.join(', ') || '(none)'}`);
  console.log(`\n  Core Skills: ${skills.length} loaded`);
  for (const skill of skills) {
    console.log(`    ► ${skill.id}`);
  }
  console.log(`\n${divider}\n`);
  console.log(`  Run this agent with:`);
  console.log(`    imhcode agent run ${manifest.id} "Your task" --live\n`);
}

async function cmdRun(orc, args) {
  const agentId = args[0];
  const task = args[1];

  if (!agentId || !task) {
    console.error(`❌ Usage: imhcode agent run <agent-id> "<task description>" [options]`);
    console.error(`   --live              Run live (calls real LLM)`);
    console.error(`   --engine <cli>      Override engine`);
    console.error(`   -m, --model <model> Override model`);
    console.error(`   --output <path>     Custom output dir`);
    process.exit(1);
  }

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
  const config = loadLocalConfig(cwd);
  const category = getAgentCategory(agentId);

  console.log(`\n🕌 ${PLATFORM_NAME} — Agent Execution`);
  console.log(`   Agent:    ${agentId}`);
  console.log(`   Category: ${category}`);
  console.log(`   Task:     ${task}`);
  console.log(`   Mode:     ${live ? '🔴 LIVE (CLI execution)' : '🟡 DRY-RUN (no CLI execution)'}`);

  // Show which model will be used
  if (!engine && !model && config?.model_routing?.[category]) {
    const r = config.model_routing[category];
    console.log(`   Model:    ${r.model} via ${r.engine} (from routing config)`);
  } else if (model) {
    console.log(`   Model:    ${model} (explicit override)`);
  }
  console.log('');

  const { agents, errors } = await orc.loadRegistry(agentsDir, cwd);

  if (errors.some(e => e.agentId === agentId)) {
    const err = errors.find(e => e.agentId === agentId);
    console.error(err.error);
    process.exit(1);
  }

  const agent = orc.getAgent(agents, agentId);
  const result = await orc.runAgent(agent, task, { dryRun: !live, engine, model, outputDir, cwd }, criteria);

  console.log('\n' + '─'.repeat(72));
  if (result.errors.length > 0 && !result.dryRun) {
    console.error(`\n❌ [IMH-Code] Execution failed with errors:`);
    result.errors.forEach(e => console.error(`   • ${e}`));
    
    // Check if the error is a limit/failover exhaustion
    const isLimitExhausted = result.errors.some(e => e.includes('limits') && e.includes('exhausted'));
    if (isLimitExhausted) {
      const currentSprint = detectCurrentSprint(cwd);
      console.error(`\n💡 [IMH-Code] All available assistant engines hit rate/token/quota limits.`);
      console.error(`   The context has been saved in the session logs: ${result.sessionDir || 'sessions/'}`);
      console.error(`   Please wait for your limits/quotas to reset, then resume development by running:`);
      console.error(`     imhcode execute ${currentSprint}\n`);
    }
    process.exit(1);
  }

  console.log(`\n✅ Execution complete`);
  console.log(`   Duration:    ${result.durationMs}ms`);
  console.log(`   Model:       ${result.model}`);
  console.log(`   Dry-run:     ${result.dryRun}`);
  if (result.sessionDir) console.log(`   Session log: ${result.sessionDir}`);
  console.log('');
}

function printAgentHelp() {
  console.log(`
  imhcode agent <subcommand>

  Subcommands:
    list                          List all 19 generic agents
    inspect <id>                  Show agent manifest, skills, and routing
    run <id> "<task>" [flags]     Build prompt and run

  Flags for "run":
    --live                        Run live LLM execution
    --engine <cli>                Override engine (claude|opencode|codex|agy|qwen|mimo)
    -m, --model <model>           Override model
    --criteria "<string>"         Acceptance criteria
    --output <path>               Custom session directory

  Agent IDs (short aliases work too):
    planner           (alias: plan, pm, orchestrator)
    nextjs-executor   (alias: nextjs, next)
    laravel-executor  (alias: laravel, php)
    react-executor    (alias: react, vite)
    vue-executor      (alias: vue, nuxt)
    python-executor   (alias: python, django, fastapi)
    tester            (alias: qa, test)
    security-auditor  (alias: security, audit)
    debugger          (alias: debug, fix)
    ... and more (run imhcode agent list)
  `);
}

// ─── Legacy Sprint Commands ────────────────────────────────────────────────────

async function runSprintLegacyCommand(subcommand, restArgs) {
  if (subcommand === 'execute') {
    return runExecuteCommand(restArgs);
  } else if (subcommand === 'design') {
    return cmdSprintDesign(restArgs);
  } else {
    console.log(`  Use "imhcode execute [N]" instead of "imhcode sprint execute [N]"`);
    console.log(`  Use "imhcode plan" instead of "imhcode sprint design [N]"\n`);
  }
}

async function cmdSprintDesign(restArgs) {
  const cwd = process.cwd();
  const sprintNum = resolveSprintNum(restArgs, cwd);
  const sprintDir = path.join(cwd, DOCS_DIR, `sprint-${sprintNum}`);

  console.log(`\n📐 ${PLATFORM_NAME} Sprint Design Check — Sprint ${sprintNum}\n`);

  const checks = [
    { file: path.join(cwd, BRIEF_MD),                   label: 'PROJECT_BRIEF.md' },
    { file: path.join(sprintDir, 'plan.md'),             label: `docs/sprint-${sprintNum}/plan.md` },
    { file: path.join(sprintDir, 'progress.md'),         label: `docs/sprint-${sprintNum}/progress.md` },
    { file: path.join(sprintDir, 'tasks'),               label: `docs/sprint-${sprintNum}/tasks/` },
    { file: path.join(sprintDir, 'run_all_tasks.sh'),    label: `docs/sprint-${sprintNum}/run_all_tasks.sh` },
  ];

  let allOk = true;
  for (const check of checks) {
    const exists = fs.existsSync(check.file);
    console.log(`  ${exists ? '✅' : '❌'} ${check.label}`);
    if (!exists) allOk = false;
  }

  if (allOk) {
    console.log(`\n✅ Sprint ${sprintNum} planning complete!`);
    console.log(`   Run: imhcode execute ${sprintNum}\n`);
  } else {
    console.log(`\n❌ Sprint ${sprintNum} planning incomplete.`);
    console.log(`   Run "imhcode plan" to generate missing files.\n`);
    process.exit(1);
  }
}

// ─── Initialization ───────────────────────────────────────────────────────────

async function runInit() {
  console.log(`\n🕌 Initializing ${PLATFORM_NAME}...\n`);
  console.log(`   ${PLATFORM_FULL}\n`);

  const packageRoot = path.join(__dirname, '..');
  const imhcodeScriptPath = path.join(packageRoot, 'bin', 'imhcode.js');
  const cwd = process.cwd();

  // Ensure global ~/.imhcode exists
  if (!fs.existsSync(GLOBAL_DIR)) {
    fs.mkdirSync(GLOBAL_DIR, { recursive: true });
  }

  const itemsToCopy = [
    { src: '.github',         dest: '.github',         desc: 'GitHub integration files' },
    { src: 'AGENTS.md',       dest: 'AGENTS.md',       desc: 'Agent manifest' },
    { src: 'CLAUDE.md',       dest: 'CLAUDE.md',       desc: 'Claude/Cursor/Copilot integration' },
    { src: '.gitignore.template', dest: '.gitignore',  desc: 'Auto-generated gitignore' },
    { src: 'SETUP.md',        dest: 'SETUP.md',        desc: 'Setup guide' },
    { src: 'USER_MANUAL.md',  dest: 'USER_MANUAL.md',  desc: 'User manual' },
    { src: 'agents',          dest: 'agents',          desc: 'YAML-driven agent manifests' },
    { src: 'skills',          dest: 'skills',          desc: 'Skill library (SKILL.md files)' },
  ];

  // Copy to global ~/.imhcode (unconditionally overwrite to apply updates)
  for (const item of itemsToCopy) {
    const sourcePath = path.join(packageRoot, item.src);
    const targetPath = path.join(GLOBAL_DIR, item.dest);
    if (!fs.existsSync(sourcePath)) {
      console.warn(`⚠️  Warning: Could not find ${item.src} in package.`);
      continue;
    }
    if (fs.existsSync(targetPath)) {
      const stats = fs.statSync(targetPath);
      if (stats.isDirectory()) rmRecursiveSync(targetPath);
      else fs.unlinkSync(targetPath);
    }
    console.log(`  Updating ${item.src} → ~/.imhcode/${item.dest} (${item.desc})...`);
    copyRecursiveSync(sourcePath, targetPath);
  }

  // Copy CLAUDE.md, AGENTS.md, and skills/ to assistant config directories globally
  const assistants = [
    { dir: path.join(os.homedir(), '.claude'),  name: 'Claude Code' },
    { dir: path.join(os.homedir(), '.gemini'),  name: 'Antigravity IDE' },
    { dir: path.join(os.homedir(), '.copilot'), name: 'Copilot' },
  ];

  for (const ast of assistants) {
    if (!fs.existsSync(ast.dir)) {
      try { fs.mkdirSync(ast.dir, { recursive: true }); } catch { continue; }
    }
    try {
      fs.copyFileSync(path.join(packageRoot, 'CLAUDE.md'), path.join(ast.dir, 'CLAUDE.md'));
      fs.copyFileSync(path.join(packageRoot, 'AGENTS.md'), path.join(ast.dir, 'AGENTS.md'));
      const skillsDest = path.join(ast.dir, 'skills');
      rmRecursiveSync(skillsDest);
      copyRecursiveSync(path.join(packageRoot, 'skills'), skillsDest);
      console.log(`  Updated rules & skills globally in ${ast.name} (${ast.dir})`);
    } catch (e) {
      console.warn(`  ⚠️  Could not update ${ast.name}: ${e.message}`);
    }
  }

  // Create local workspace directories
  const dirsToCreate = [
    'frontend', 'backend', '.worktrees', DOCS_DIR,
    LOCAL_DIR_NAME,
    path.join(LOCAL_DIR_NAME, 'commands'),
    path.join(LOCAL_DIR_NAME, 'sessions'),
  ];
  for (const dir of dirsToCreate) {
    const dirPath = path.join(cwd, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`  Created local directory: ${dir}`);
    }
  }

  // Create docs/start.md template
  const startMdPath = path.join(cwd, START_MD);
  if (!fs.existsSync(startMdPath)) {
    const startMdContent = `# 🕌 IMH-Code — Project Start

> **Imam Hussain Coding Harness Platform**
> Write your project description below, then run \`imhcode plan\`.

---

## 📝 Your Project Description

Write your complete project idea below the markers. Be as detailed as possible.
Include: what you're building, who it's for, key features, preferred stack (if any).

<!-- WRITE_PROMPT_HERE -->
I want to build a SaaS dashboard for managing hotel room bookings with real-time availability, 
a Next.js frontend, Laravel API backend, and PostgreSQL database.
<!-- END_PROMPT -->

---

## 🚀 Next Step

After writing your description, run in your terminal:

\`\`\`bash
imhcode plan
\`\`\`

This will analyze your description and generate **docs/brainstorming.md** with
smart questions about your project, with recommended answers you can review and edit.
`;
    fs.writeFileSync(startMdPath, startMdContent, 'utf8');
    console.log(`  Created docs/start.md (write your project here)`);
  }

  // Create .gitignore
  const localGitignore = path.join(cwd, '.gitignore');
  if (!fs.existsSync(localGitignore)) {
    const gitignoreTemplate = path.join(packageRoot, '.gitignore.template');
    if (fs.existsSync(gitignoreTemplate)) {
      fs.copyFileSync(gitignoreTemplate, localGitignore);
      console.log(`  Created local .gitignore`);
    }
  }

  registerCliGlobally(imhcodeScriptPath);
  ensureCavemanAndGraphify();

  // ── Interactive Engine & Model Setup ────────────────────────────────────────
  console.log('\n🔍 Scanning for local coding assistant CLIs...');
  const engines = scanAssistantCLIs();
  const foundEngines = Object.keys(engines).filter(k => engines[k].path);

  if (foundEngines.length === 0) {
    console.warn('\n⚠️  No local coding assistant CLIs detected.');
    console.warn('   Supported: claude, opencode, codex, agy (Antigravity), qwen (QwenCode), mimo (MimoCode)');
    console.warn('   Install one and re-run "imhcode" to configure model routing.\n');
  }

  let primaryEngine = 'claude';
  const isInteractive = process.stdout.isTTY;

  if (isInteractive && foundEngines.length > 0) {
    console.log('\nFound the following local coding assistant CLIs:');
    foundEngines.forEach((key, index) => {
      const eng = engines[key];
      console.log(`  [${index + 1}] ${eng.name} (${key})`);
      console.log(`      Path:   ${eng.path}`);
      if (eng.models.length > 0) {
        console.log(`      Models: ${eng.models.slice(0, 3).join(', ')}${eng.models.length > 3 ? '...' : ''} (${eng.models.length} total)`);
      }
    });

    let selectionIdx = 0;
    while (true) {
      const answer = await askQuestion(`\nSelect primary engine [1-${foundEngines.length}] (default: 1): `);
      if (answer === '') { selectionIdx = 0; break; }
      const parsed = parseInt(answer, 10);
      if (parsed >= 1 && parsed <= foundEngines.length) { selectionIdx = parsed - 1; break; }
      console.log(`❌ Invalid. Enter 1–${foundEngines.length}.`);
    }
    primaryEngine = foundEngines[selectionIdx];
    console.log(`\n✅ Primary engine: ${engines[primaryEngine].name} (${primaryEngine})`);
  } else if (foundEngines.length > 0) {
    primaryEngine = foundEngines[0];
    console.log(`\n✅ Auto-selected primary engine: ${engines[primaryEngine].name} (${primaryEngine})`);
  }

  let defaultModel = '';
  const selectedEng = engines[primaryEngine];
  if (selectedEng?.models?.length > 0) {
    if (isInteractive) {
      console.log(`\nAvailable models for ${selectedEng.name}:`);
      selectedEng.models.forEach((m, i) => console.log(`  [${i + 1}] ${m}`));
      let modelIdx = 0;
      while (true) {
        const answer = await askQuestion(`Select default model [1-${selectedEng.models.length}] (default: 1): `);
        if (answer === '') { modelIdx = 0; break; }
        const parsed = parseInt(answer, 10);
        if (parsed >= 1 && parsed <= selectedEng.models.length) { modelIdx = parsed - 1; break; }
        console.log(`❌ Invalid. Enter 1–${selectedEng.models.length}.`);
      }
      defaultModel = selectedEng.models[modelIdx];
    } else {
      defaultModel = selectedEng.models[0];
    }
    console.log(`✅ Default model: ${defaultModel}`);
  }

  // ── Smart Model Routing Setup ────────────────────────────────────────────────
  const modelRouting = await setupModelRouting(engines, foundEngines, isInteractive);

  // Write config
  const configPath = path.join(cwd, CONFIG_FILE);
  const configData = {
    primary_engine: primaryEngine,
    default_model: defaultModel || undefined,
    testing_mode: 'fast',
    model_routing: modelRouting,
    available_engines: {},
  };

  for (const key of foundEngines) {
    configData.available_engines[key] = {
      path: engines[key].path,
      models: engines[key].models,
    };
  }

  fs.writeFileSync(configPath, JSON.stringify(configData, null, 2), 'utf8');
  console.log(`\n💾 Configuration saved: ${configPath}`);

  // Print final guide
  console.log(`\n✅ ${PLATFORM_NAME} initialized successfully!`);
  console.log(`─`.repeat(60));
  console.log(`\n🕌 HOW TO BUILD WITH IMH-CODE:\n`);
  console.log(`  1. Open docs/start.md → Write your project description`);
  console.log(`  2. Run: imhcode plan`);
  console.log(`     → Generates docs/brainstorming.md with smart questions`);
  console.log(`  3. Open docs/brainstorming.md → Review/edit answers`);
  console.log(`  4. Run: imhcode plan`);
  console.log(`     → Reads your answers → generates sprint plans`);
  console.log(`  5. Run: imhcode execute 1   → Execute Sprint 1`);
  console.log(`  6. Run: imhcode execute 2   → Execute Sprint 2`);
  console.log(`  7. Run: imhcode test        → Final testing + security + SEO`);
  console.log(`\n  Run "imhcode --help" for all commands.`);
  console.log(`─`.repeat(60));
  console.log('');
}

// ─── Model Routing Setup Wizard ───────────────────────────────────────────────

async function setupModelRouting(engines, foundEngines, isInteractive) {
  const categories = {
    frontend: {
      label: 'Frontend (UI/UX, components, animations)',
      note: 'Mimo v2.5 Pro preferred → GPT-5.5 → Claude Opus',
      preferredEngines: ['mimo', 'codex', 'claude', 'opencode'],
      preferredModels: ['mimo-vl-v2.5-pro', 'gpt-5.5', 'claude-opus-4-6', 'deepseek-v4-pro'],
    },
    backend: {
      label: 'Backend (APIs, database, business logic)',
      note: 'DeepSeek V4 Pro preferred → GPT-5.5 → Qwen Coder',
      preferredEngines: ['opencode', 'codex', 'qwen', 'claude'],
      preferredModels: ['deepseek-v4-pro', 'gpt-5.5', 'qwen3-coder-max', 'claude-sonnet-4-5'],
    },
    planning: {
      label: 'Planning (brainstorming, sprint planning, architecture)',
      note: 'Claude Opus preferred → GPT-5.5',
      preferredEngines: ['claude', 'codex', 'opencode'],
      preferredModels: ['claude-opus-4-6', 'gpt-5.5', 'deepseek-v4-pro'],
    },
    testing: {
      label: 'Testing (QA, security audit, E2E)',
      note: 'GPT-5.5 preferred → Claude Opus → DeepSeek',
      preferredEngines: ['codex', 'claude', 'opencode'],
      preferredModels: ['gpt-5.5', 'claude-opus-4-6', 'deepseek-v4-pro'],
    },
    review: {
      label: 'Review (SEO, debugging, code review)',
      note: 'GPT-5.5 preferred → Claude Sonnet',
      preferredEngines: ['codex', 'claude', 'opencode'],
      preferredModels: ['gpt-5.5', 'claude-sonnet-4-5', 'deepseek-v4'],
    },
    fast: {
      label: 'Fast (boilerplate, config, simple tasks)',
      note: 'DeepSeek V4 Flash preferred → Gemini Flash → GPT Mini',
      preferredEngines: ['opencode', 'codex', 'qwen', 'claude'],
      preferredModels: ['deepseek-v4-flash', 'gpt-5.4-mini', 'qwen3-coder-flash', 'claude-haiku-3-5'],
    },
  };

  const routing = {};

  // Build recommended routing from available engines
  const recommended = {};
  for (const [cat, cfg] of Object.entries(categories)) {
    let found = false;
    for (let i = 0; i < cfg.preferredEngines.length; i++) {
      const eng = cfg.preferredEngines[i];
      const mdl = cfg.preferredModels[i];
      const engData = engines[eng];
      if (engData?.path && engData.models.length > 0) {
        const match = engData.models.find(m => m.toLowerCase().includes(mdl.replace(/-/g, '').replace(/\./g, '')));
        recommended[cat] = { engine: eng, model: match || engData.models[0] };
        found = true;
        break;
      }
    }
    if (!found && foundEngines.length > 0) {
      // Fallback to primary engine
      const fe = foundEngines[0];
      recommended[cat] = { engine: fe, model: engines[fe].models[0] || 'default' };
    }
  }

  // Show recommended routing table
  console.log('\n' + '─'.repeat(60));
  console.log('🧠 Recommended Model Routing (based on your installed engines):\n');
  console.log('  Category      │ Engine       │ Model');
  console.log('  ─────────────────────────────────────────────────────────');
  for (const [cat, rec] of Object.entries(recommended)) {
    const catLabel = cat.padEnd(12);
    const eng = (rec.engine || '?').padEnd(12);
    const mdl = rec.model || '?';
    const cfg = categories[cat];
    console.log(`  ${catLabel}  │ ${eng}  │ ${mdl}`);
  }
  console.log('  ' + '─'.repeat(57));
  console.log(`\n  Preferences: ${categories.frontend.note}`);

  if (isInteractive) {
    const answer = await askQuestion('\nAccept recommended routing? [Y/n] ');
    if (answer.toLowerCase() === 'n' || answer.toLowerCase() === 'no') {
      // Let user customize each category
      for (const [cat, cfg] of Object.entries(categories)) {
        console.log(`\n  Configure model for [${cat}] — ${cfg.label}`);
        console.log(`  (${cfg.note})`);

        // Collect all available models across all engines
        const allModels = [];
        for (const eng of foundEngines) {
          for (const m of engines[eng].models) {
            allModels.push({ engine: eng, model: m });
          }
        }

        if (allModels.length === 0) {
          routing[cat] = recommended[cat];
          continue;
        }

        allModels.forEach((item, i) => {
          const rec = recommended[cat];
          const isRec = rec && rec.engine === item.engine && rec.model === item.model;
          console.log(`    [${i + 1}] ${item.model} (${item.engine})${isRec ? ' ← Recommended' : ''}`);
        });

        let selectedIdx = allModels.findIndex(m => {
          const rec = recommended[cat];
          return rec && m.engine === rec.engine && m.model === rec.model;
        });
        if (selectedIdx < 0) selectedIdx = 0;

        while (true) {
          const ans = await askQuestion(`  Select model for ${cat} [1-${allModels.length}] (default: ${selectedIdx + 1}): `);
          if (ans === '') { routing[cat] = allModels[selectedIdx]; break; }
          const p = parseInt(ans, 10);
          if (p >= 1 && p <= allModels.length) { routing[cat] = allModels[p - 1]; break; }
          console.log(`  ❌ Invalid. Enter 1–${allModels.length}.`);
        }
        console.log(`  ✅ ${cat}: ${routing[cat].model} (${routing[cat].engine})`);
      }
    } else {
      Object.assign(routing, recommended);
      console.log('\n✅ Recommended routing accepted.');
    }
  } else {
    Object.assign(routing, recommended);
    console.log('\n✅ Recommended routing applied automatically.');
  }

  return routing;
}

// ─── Brainstorming Generator ───────────────────────────────────────────────────

async function generateBrainstormingDoc(cwd, userPrompt) {
  // Analyze keywords in the prompt to determine which sections to include
  const p = userPrompt.toLowerCase();

  const hasFrontend = p.includes('frontend') || p.includes('ui') || p.includes('dashboard') ||
                       p.includes('design') || p.includes('page') || p.includes('web') ||
                       p.includes('next') || p.includes('react') || p.includes('vue');
  const hasBackend  = p.includes('backend') || p.includes('api') || p.includes('database') ||
                       p.includes('server') || p.includes('laravel') || p.includes('django') ||
                       p.includes('fastapi') || p.includes('auth') || p.includes('data');
  const hasMobile   = p.includes('mobile') || p.includes('flutter') || p.includes('ios') ||
                       p.includes('android') || p.includes('react native') || p.includes('expo');

  // Infer default stack
  const defaultFrontend = hasFrontend ? (p.includes('vue') ? 'Vue 3 + Nuxt 4' : 'Next.js 15') : 'Next.js 15';
  const defaultBackend  = hasBackend  ? (p.includes('python') || p.includes('django') ? 'Python/FastAPI' :
                                          p.includes('java') ? 'Java/Spring Boot' : 'Laravel 11') : 'Laravel 11';

  const content = `# 🧠 IMH-Code — Project Brainstorming

> Auto-generated by \`imhcode plan\` on ${new Date().toLocaleDateString()}
> Review and edit the "**Your Answer**" fields below, then run \`imhcode plan\` again.

---

## 📋 General Requirements

**Q1: What is the primary goal of this project?**
> **Recommended:** ${userPrompt.split('.')[0].trim()}
> **Your Answer:** *(edit if needed)*

**Q2: Who are the target users?**
> **Recommended:** Business users / customers (based on your description)
> **Your Answer:** *(edit if needed)*

**Q3: What is the expected scale at launch?**
> **Recommended:** Small-medium (< 1,000 users initially)
> **Your Answer:** *(edit if needed)*

**Q4: What is the timeline?**
> **Recommended:** MVP in 2-4 sprints (4-8 weeks)
> **Your Answer:** *(edit if needed)*

---
${hasFrontend ? `
## 🎨 Frontend

**Q5: Which frontend framework?**
> **Recommended:** ${defaultFrontend}
> **Your Answer:** *(edit if needed)*

**Q6: UI Component library?**
> **Recommended:** shadcn/ui + Tailwind CSS v4
> **Your Answer:** *(edit if needed)*

**Q7: Do you need animations/3D effects?**
> **Recommended:** Light micro-animations (GSAP ScrollTrigger)
> **Your Answer:** *(yes — specify / no)*

**Q8: Mobile responsive?**
> **Recommended:** Yes (mobile-first responsive design)
> **Your Answer:** *(edit if needed)*

**Q9: Dark mode support?**
> **Recommended:** Yes (dark/light toggle)
> **Your Answer:** *(yes / no)*

**Q10: Preferred design style?**
> **Recommended:** Modern SaaS (glassmorphism, clean, premium)
> **Your Answer:** *(edit if needed)*
` : ''}
${hasBackend ? `
## 🔧 Backend

**Q11: Which backend framework?**
> **Recommended:** ${defaultBackend}
> **Your Answer:** *(edit if needed)*

**Q12: Database?**
> **Recommended:** PostgreSQL + Redis (caching)
> **Your Answer:** *(edit if needed)*

**Q13: Authentication system?**
> **Recommended:** JWT tokens + email verification
> **Your Answer:** *(JWT / session / OAuth / other)*

**Q14: API architecture?**
> **Recommended:** RESTful API
> **Your Answer:** *(REST / GraphQL / both)*

**Q15: Do you need file uploads?**
> **Recommended:** Yes (S3-compatible storage)
> **Your Answer:** *(yes / no)*

**Q16: Real-time features?**
> **Recommended:** No (for MVP)
> **Your Answer:** *(yes — specify / no)*

**Q17: Payment integration?**
> **Recommended:** No (for MVP)
> **Your Answer:** *(yes — specify provider / no)*
` : ''}
${hasMobile ? `
## 📱 Mobile

**Q18: Target platforms?**
> **Recommended:** iOS + Android (cross-platform)
> **Your Answer:** *(iOS only / Android only / both)*

**Q19: Mobile framework?**
> **Recommended:** Flutter
> **Your Answer:** *(Flutter / React Native / both)*

**Q20: Offline support?**
> **Recommended:** No (for MVP)
> **Your Answer:** *(yes / no)*
` : ''}

## 🚀 Deployment

**Q21: Deployment platform?**
> **Recommended:** Vercel (frontend) + DigitalOcean/Railway (backend)
> **Your Answer:** *(edit if needed)*

**Q22: Do you need Docker containerization?**
> **Recommended:** Yes
> **Your Answer:** *(yes / no)*

**Q23: CI/CD pipeline?**
> **Recommended:** GitHub Actions
> **Your Answer:** *(yes / no)*

---

## 🧪 Testing Strategy

**Q24: How should testing be handled?**

Options:
- **[A] Fast Mode (Recommended for MVPs)** — No testing during development sprints.
  A dedicated final sprint handles all testing, security audit, SEO, and browser testing.
  3-5x faster for initial development.
  
- **[B] Balanced Mode** — Basic smoke tests per sprint. Full test suite at end.
  ~80% development speed of Fast Mode.
  
- **[C] Strict TDD Mode** — Full Red-Green-Refactor on every task.
  Slowest but highest quality. Only for healthcare, finance, compliance projects.

> **Recommended:** A (Fast Mode)
> **Your Answer:** A *(change to B or C if needed)*

---

## 🔒 Security

**Q25: Security audit timing?**
> **Recommended:** Final sprint only (OWASP Top 10 + dependency scan)
> **Your Answer:** *(final sprint only / every sprint)*

---

## 🌐 SEO (if web app)

**Q26: SEO requirements?**
> **Recommended:** Technical SEO in final sprint (meta tags, Core Web Vitals, structured data)
> **Your Answer:** *(final sprint only / every sprint / not needed)*

---

## 📝 Additional Notes

Write any additional requirements, constraints, or preferences here:

> *(Your notes here)*

---

*When ready, run \`imhcode plan\` to generate sprint plans from your answers.*
`;

  const brainstormPath = path.join(cwd, BRAINSTORM_MD);
  fs.mkdirSync(path.join(cwd, DOCS_DIR), { recursive: true });
  fs.writeFileSync(brainstormPath, content, 'utf8');
}

// ─── Sprint Plan Generator ────────────────────────────────────────────────────

async function generateSprintPlans(cwd, userPrompt, brainstormContent, config) {
  // Parse answers from brainstorming
  const testingMode = extractAnswer(brainstormContent, 'Q24', 'A').trim().toUpperCase();
  const hasFrontend = brainstormContent.includes('frontend') || brainstormContent.includes('Next.js') || brainstormContent.includes('Vue');
  const hasBackend  = brainstormContent.includes('Laravel') || brainstormContent.includes('Python') || brainstormContent.includes('Django') || brainstormContent.includes('Java');

  const detectedTesting = testingMode === 'B' ? 'balanced' : testingMode === 'C' ? 'strict' : 'fast';

  // Save testing mode to config
  if (config) {
    config.testing_mode = detectedTesting;
    const configPath = path.join(cwd, CONFIG_FILE);
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
  }

  // Generate PROJECT_BRIEF.md
  const briefContent = generateProjectBrief(userPrompt, brainstormContent);
  fs.writeFileSync(path.join(cwd, BRIEF_MD), briefContent, 'utf8');
  console.log(`  ✅ Created PROJECT_BRIEF.md`);

  // Generate Sprint 1 (Foundation)
  await generateSprint(cwd, 1, 'Foundation & Setup', [
    { task: 'Initialize project structure and configure environments', agent: 'devops-executor', tier: 'light', deps: [] },
    { task: 'Set up database schema and migrations', agent: hasBackend ? 'laravel-executor' : 'python-executor', tier: 'standard', deps: [1] },
    { task: 'Implement authentication system (register, login, logout)', agent: hasBackend ? 'laravel-executor' : 'python-executor', tier: 'complex', deps: [2] },
    ...(hasFrontend ? [
      { task: 'Set up frontend project with design system and component library', agent: 'nextjs-executor', tier: 'standard', deps: [1] },
      { task: 'Build authentication UI pages (login, register, forgot password)', agent: 'nextjs-executor', tier: 'standard', deps: [3, 4] },
    ] : []),
  ], detectedTesting);

  // Generate Sprint 2 (Core Features)
  await generateSprint(cwd, 2, 'Core Features', [
    { task: 'Build main API endpoints for core business logic', agent: hasBackend ? 'laravel-executor' : 'python-executor', tier: 'complex', deps: [] },
    ...(hasFrontend ? [
      { task: 'Build dashboard layout with navigation and sidebar', agent: 'nextjs-executor', tier: 'standard', deps: [] },
      { task: 'Implement main feature pages and components', agent: 'nextjs-executor', tier: 'complex', deps: [2] },
      { task: 'Connect frontend to backend API with error handling', agent: 'nextjs-executor', tier: 'standard', deps: [1, 3] },
    ] : []),
    { task: 'Implement user settings and profile management', agent: hasBackend ? 'laravel-executor' : 'python-executor', tier: 'standard', deps: [1] },
  ], detectedTesting);

  // Determine last sprint number
  let lastSprintNum = 2;

  // If testing mode is fast/balanced, auto-generate testing sprint
  if (detectedTesting !== 'strict') {
    const testingSprintNum = lastSprintNum + 1;
    await generateTestingSprint(cwd, testingSprintNum, hasFrontend, hasBackend);
    console.log(`  ✅ Created auto-generated Testing Sprint ${testingSprintNum}`);
  }

  // Update compact context
  const contextContent = `# IMH-Code Project Context

Generated: ${new Date().toLocaleDateString()}
Project: ${userPrompt.slice(0, 100)}...
Testing Mode: ${detectedTesting}
Sprints: ${lastSprintNum + (detectedTesting !== 'strict' ? 1 : 0)} total

## Stack
${hasFrontend ? '- Frontend: Next.js 15 + shadcn/ui + Tailwind CSS v4' : ''}
${hasBackend ? '- Backend: Laravel 11 + PostgreSQL + Redis' : ''}
- Auth: JWT tokens
- Deployment: Docker + GitHub Actions

## Directory Structure
- frontend/ — All frontend code
- backend/ — All backend code  
- docs/ — Sprint plans and documentation

## Current Sprint
Sprint 1 (not started)

## Key Files
${hasFrontend ? '- frontend/app/ — Next.js pages' : ''}
${hasBackend ? '- backend/routes/api.php — API routes' : ''}
${hasBackend ? '- backend/app/Models/ — Eloquent models' : ''}
`;

  fs.mkdirSync(path.join(cwd, LOCAL_DIR_NAME), { recursive: true });
  fs.writeFileSync(path.join(cwd, CONTEXT_MD), contextContent, 'utf8');
  console.log(`  ✅ Created .imhcode/context.md (compact context)`);
}

async function generateSprint(cwd, sprintNum, title, tasks, testingMode) {
  const sprintDir = path.join(cwd, DOCS_DIR, `sprint-${sprintNum}`);
  const tasksDir  = path.join(sprintDir, 'tasks');
  fs.mkdirSync(tasksDir, { recursive: true });

  // plan.md
  const tddNote = testingMode === 'strict' ? '**Testing Mode: Strict TDD** — Write failing tests first.' :
                   testingMode === 'balanced' ? '**Testing Mode: Balanced** — Basic smoke tests per task.' :
                   '**Testing Mode: Fast** — No tests during this sprint. Tests handled in final sprint.';

  let planMd = `# Sprint ${sprintNum}: ${title}

> ${tddNote}

## Task Table

| # | Task | Agent | Tier | Depends On |
|---|------|-------|------|-----------|
${tasks.map((t, i) => `| ${i+1} | ${t.task} | \`${t.agent}\` | ${t.tier} | ${t.deps.length ? t.deps.join(', ') : '—'} |`).join('\n')}

## Sprint Goals
- Complete all ${tasks.length} tasks in dependency order
- Update PROJECT_BRIEF.md after completion
- Update .imhcode/context.md with what was built
`;

  fs.writeFileSync(path.join(sprintDir, 'plan.md'), planMd, 'utf8');

  // progress.md
  const progressMd = `# Sprint ${sprintNum} Progress

Status: 🟡 Not Started
Start: —
End: —

## Task Status
${tasks.map((t, i) => `- [ ] Task ${i+1}: ${t.task}`).join('\n')}
`;
  fs.writeFileSync(path.join(sprintDir, 'progress.md'), progressMd, 'utf8');

  // deferred.md
  fs.writeFileSync(path.join(sprintDir, 'deferred.md'), `# Sprint ${sprintNum} Deferred Items\n\nNone yet.\n`, 'utf8');

  // Individual task scripts
  for (let i = 0; i < tasks.length; i++) {
    const t = tasks[i];
    const taskNum = i + 1;
    const testingFlag = testingMode === 'strict' ? '# Testing mode: strict — include TDD instructions\nTASK="[STRICT TDD] ${t.task}: Write failing tests first, then implement."' :
                         testingMode === 'balanced' ? `TASK="[BALANCED] ${t.task}: Add basic smoke tests."` :
                         `TASK="${t.task}"`;

    const taskScript = `#!/bin/bash
# IMH-Code — Sprint ${sprintNum} Task ${taskNum}
# Task: ${t.task}
# Agent: ${t.agent}
# Tier: ${t.tier}
CWD="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$CWD/../../../.."

${testingFlag}

echo "📋 Running Task ${taskNum}: ${t.task}"
echo "   Agent: ${t.agent} | Tier: ${t.tier}"

if command -v imhcode >/dev/null 2>&1; then
  imhcode agent run ${t.agent} "$TASK" --live
else
  node "$(npm root -g)/imhcode/bin/imhcode.js" agent run ${t.agent} "$TASK" --live
fi
`;
    fs.writeFileSync(path.join(tasksDir, `task_${taskNum}.sh`), taskScript, { mode: 0o755 });
  }

  // run_all_tasks.sh (respects dependency ordering)
  const masterScript = `#!/bin/bash
# IMH-Code — Sprint ${sprintNum}: ${title}
# Run all tasks in dependency order
set -e
CWD="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TASKS_DIR="$CWD/tasks"

echo ""
echo "🕌 IMH-Code — Executing Sprint ${sprintNum}: ${title}"
echo "   Tasks: ${tasks.length}"
echo ""

${tasks.map((t, i) => {
  const taskNum = i + 1;
  return `echo "\\n─────────────────────────────────────────────────────────────"
echo "📋 Task ${taskNum}/${tasks.length}: ${t.task}"
echo "─────────────────────────────────────────────────────────────"
bash "$TASKS_DIR/task_${taskNum}.sh"`;
}).join('\n\n')}

echo ""
echo "✅ Sprint ${sprintNum} complete! All ${tasks.length} tasks executed."
echo "   Run: imhcode execute ${sprintNum + 1}"
echo ""
`;
  fs.writeFileSync(path.join(sprintDir, 'run_all_tasks.sh'), masterScript, { mode: 0o755 });

  console.log(`  ✅ Created Sprint ${sprintNum}: ${title} (${tasks.length} tasks)`);
}

async function generateTestingSprint(cwd, sprintNum, hasFrontend, hasBackend) {
  const tasks = [
    { task: 'Write unit tests for all backend API endpoints', agent: 'tester', tier: 'standard', deps: [] },
    { task: 'Write integration tests for core API flows', agent: 'tester', tier: 'complex', deps: [1] },
    ...(hasFrontend ? [
      { task: 'Write component tests for all frontend pages and components', agent: 'tester', tier: 'standard', deps: [] },
      { task: 'Run E2E browser tests with Playwright (all critical user flows)', agent: 'tester', tier: 'complex', deps: [3] },
    ] : []),
    { task: 'Run security audit: OWASP Top 10, dependency vulnerabilities, auth testing', agent: 'security-auditor', tier: 'complex', deps: [] },
    ...(hasFrontend ? [
      { task: 'Run SEO audit: Core Web Vitals, meta tags, structured data, sitemap', agent: 'seo-optimizer', tier: 'standard', deps: [] },
      { task: 'Run accessibility audit (WCAG 2.1 AA) and fix critical issues', agent: 'tester', tier: 'standard', deps: [3, 4] },
    ] : []),
    { task: 'Generate final test coverage report and fix failing tests', agent: 'tester', tier: 'standard', deps: [] },
  ];

  await generateSprint(cwd, sprintNum, 'Testing, Security & SEO Audit', tasks, 'fast');
}

// ─── Helper Functions ─────────────────────────────────────────────────────────

function generateProjectBrief(userPrompt, brainstormContent) {
  return `# PROJECT_BRIEF.md

> **IMH-Code — Imam Hussain Coding Harness Platform**
> This file is the centralized context memory for the project.
> Updated after each sprint by the planner agent.

## Project Summary

${userPrompt}

## Status

- **Current Sprint**: Sprint 1
- **Testing Mode**: Fast (final sprint only)
- **Generated**: ${new Date().toLocaleDateString()}

## Key Architecture Decisions

*(Will be updated as sprints complete)*

## Sprint Log

| Sprint | Title | Status |
|--------|-------|--------|
| 1 | Foundation & Setup | 🟡 Not Started |
| 2 | Core Features | ⬜ Pending |
| N | Testing & Audit | ⬜ Pending |
`;
}

function extractPromptFromStartMd(content) {
  const match = content.match(/<!-- WRITE_PROMPT_HERE -->([\s\S]*?)<!-- END_PROMPT -->/);
  if (match) return match[1].trim();
  // Fallback: return everything after the first heading
  const lines = content.split('\n').filter(l => !l.startsWith('#') && l.trim().length > 0);
  return lines.join(' ').slice(0, 500);
}

function extractAnswer(brainstormContent, questionKey, defaultAnswer) {
  const regex = new RegExp(`\\*\\*${questionKey}.*?\\*\\*Your Answer:\\*\\*([^\\n*]+)`, 's');
  const match = brainstormContent.match(regex);
  if (match) return match[1].trim();
  return defaultAnswer;
}

function detectSprintDocs(cwd) {
  const docsDir = path.join(cwd, DOCS_DIR);
  if (!fs.existsSync(docsDir)) return false;
  return fs.readdirSync(docsDir).some(f => /^sprint-\d+$/i.test(f));
}

function detectCurrentSprint(cwd) {
  const docsDir = path.join(cwd, DOCS_DIR);
  if (!fs.existsSync(docsDir)) return 1;
  let max = 0;
  for (const f of fs.readdirSync(docsDir)) {
    const m = f.match(/^sprint-(\d+)$/i);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return max || 1;
}

function detectLastSprint(cwd) {
  return detectCurrentSprint(cwd);
}

function resolveSprintNum(restArgs, cwd) {
  const numStr = restArgs.find(a => !a.startsWith('-'));
  if (numStr) {
    const n = parseInt(numStr, 10);
    if (!isNaN(n)) return n;
  }

  // Try PROJECT_BRIEF.md
  const briefPath = path.join(cwd, BRIEF_MD);
  if (fs.existsSync(briefPath)) {
    const m = fs.readFileSync(briefPath, 'utf8').match(/Current Sprint:\s*Sprint\s*(\d+)/i);
    if (m) return parseInt(m[1], 10);
  }

  return detectCurrentSprint(cwd);
}

function loadLocalConfig(cwd) {
  const configPath = path.join(cwd, CONFIG_FILE);
  if (fs.existsSync(configPath)) {
    try { return JSON.parse(fs.readFileSync(configPath, 'utf8')); } catch { return null; }
  }
  return null;
}

async function updateCompactContext(cwd, completedSprint) {
  const contextPath = path.join(cwd, CONTEXT_MD);
  if (!fs.existsSync(contextPath)) return;

  try {
    let content = fs.readFileSync(contextPath, 'utf8');
    content = content.replace(/Current Sprint\nSprint \d+ \(not started\)/, `Current Sprint\nSprint ${completedSprint + 1}`);
    fs.writeFileSync(contextPath, content, 'utf8');
  } catch { /* non-critical */ }
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function askQuestion(query) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(query, ans => { rl.close(); resolve(ans.trim()); }));
}

function scanAssistantCLIs() {
  const engines = {
    claude:   { name: 'Claude Code',           path: resolveBinary('claude',   ['~/.local/bin/claude',  '/usr/local/bin/claude',  '/opt/homebrew/bin/claude']),   models: [], modelsCmd: b => `"${b}" --list-models 2>/dev/null || echo ''` },
    opencode: { name: 'OpenCode',               path: resolveBinary('opencode', ['~/.opencode/bin/opencode', '/usr/local/bin/opencode']),                           models: [], modelsCmd: b => `"${b}" models 2>/dev/null` },
    codex:    { name: 'Codex (OpenAI)',         path: resolveBinary('codex',    ['~/Library/PhpWebStudy/env/node/bin/codex', '/usr/local/bin/codex']),              models: [], modelsCmd: b => `"${b}" debug models 2>/dev/null` },
    agy:      { name: 'Antigravity CLI (agy)',  path: resolveBinary('agy',      ['~/.local/bin/agy', '/usr/local/bin/agy', '/opt/homebrew/bin/agy']),               models: [], modelsCmd: b => `"${b}" models 2>/dev/null || echo ''` },
    qwen:     { name: 'QwenCode (qwen)',        path: resolveBinary('qwen',     ['~/.local/bin/qwen', '/usr/local/bin/qwen', '/opt/homebrew/bin/qwen']),            models: [], modelsCmd: b => `"${b}" models 2>/dev/null || echo ''` },
    mimo:     { name: 'MimoCode (mimo)',        path: resolveBinary('mimo',     ['~/.local/bin/mimo', '/usr/local/bin/mimo', '/opt/homebrew/bin/mimo', '~/.mimo/bin/mimo']), models: [], modelsCmd: b => `"${b}" models 2>/dev/null || echo ''` },
  };

  for (const [key, eng] of Object.entries(engines)) {
    if (!eng.path) continue;
    try {
      let raw = execSync(eng.modelsCmd(eng.path), { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 30000 });
      let models = [];
      try {
        const parsed = JSON.parse(raw);
        if (parsed?.models) models = parsed.models.map(m => m.slug || m.id || m.name).filter(Boolean);
        else if (Array.isArray(parsed)) models = parsed.map(m => typeof m === 'string' ? m : m.id || m.slug).filter(Boolean);
      } catch {
        models = raw.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
      }
      if (models.length > 0) eng.models = models;
    } catch { eng.models = []; }
  }

  return engines;
}

function resolveBinary(name, fallbackPaths) {
  try {
    const p = execSync(`which ${name}`, { encoding: 'utf8', stdio: [] }).trim();
    if (p && fs.existsSync(p)) return p;
  } catch { /* ignore */ }
  const home = os.homedir();
  for (const raw of fallbackPaths) {
    const p = raw.replace(/^~/, home);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function copyRecursiveSync(src, dest) {
  const stats = fs.existsSync(src) && fs.statSync(src);
  if (stats && stats.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach(child => copyRecursiveSync(path.join(src, child), path.join(dest, child)));
  } else {
    fs.copyFileSync(src, dest);
  }
}

function rmRecursiveSync(dest) {
  if (fs.existsSync(dest)) fs.rmSync(dest, { recursive: true, force: true });
}

function registerCliGlobally(imhcodeScriptPath) {
  const isWindows = process.platform === 'win32';
  console.log('\n🔗 Registering imhcode command globally...');

  if (isWindows) {
    const binDir = path.join(GLOBAL_DIR, 'bin');
    if (!fs.existsSync(binDir)) fs.mkdirSync(binDir, { recursive: true });
    fs.writeFileSync(path.join(binDir, 'imhcode.cmd'), `@echo off\r\nnode "${imhcodeScriptPath}" %*\r\n`);
    fs.writeFileSync(path.join(binDir, 'imhcode.ps1'), `node "${imhcodeScriptPath}" $args\r\n`);
    try {
      execSync(`powershell -Command "$p=[Environment]::GetEnvironmentVariable('Path','User'); if ($p -notlike '*${binDir}*') { [Environment]::SetEnvironmentVariable('Path',$p+';${binDir}','User') }"`, { stdio: 'ignore' });
      console.log(`  ✅ Registered on Windows at ${binDir}`);
    } catch { /* ignore */ }
  } else {
    const localBinDir = path.join(os.homedir(), '.local', 'bin');
    const imhBinDir   = path.join(GLOBAL_DIR, 'bin');
    [localBinDir, imhBinDir].forEach(dir => { if (!fs.existsSync(dir)) { try { fs.mkdirSync(dir, { recursive: true }); } catch { } } });

    const shimContent = `#!/bin/sh\nexec node "${imhcodeScriptPath}" "$@"\n`;
    [path.join(localBinDir, 'imhcode'), path.join(imhBinDir, 'imhcode')].forEach(t => {
      try { fs.writeFileSync(t, shimContent, { mode: 0o755 }); } catch { /* ignore */ }
    });

    const exportLine = `\n# IMH-Code PATH\nexport PATH="$HOME/.imhcode/bin:$HOME/.local/bin:$PATH"\n`;
    ['.zshrc', '.bashrc', '.bash_profile', '.profile'].forEach(f => {
      const fp = path.join(os.homedir(), f);
      if (fs.existsSync(fp)) {
        try {
          const c = fs.readFileSync(fp, 'utf8');
          if (!c.includes('.imhcode/bin') && !c.includes('.local/bin')) {
            fs.appendFileSync(fp, exportLine);
          }
        } catch { /* ignore */ }
      }
    });

    console.log(`  ✅ Shims installed in ~/.imhcode/bin and ~/.local/bin.`);
    console.log(`  ✅ PATH updated in shell config. Run: source ~/.zshrc`);
  }
}

function ensureCavemanAndGraphify() {
  console.log('\n🔍 Checking token-saving skills...');
  let skillsInstalled = false;
  try { execSync('npx --no-install skills --version', { stdio: 'ignore' }); skillsInstalled = true; } catch { /* not installed */ }

  if (!skillsInstalled) {
    console.log('  📦 Installing skills CLI globally...');
    try { execSync('npm install -g skills', { stdio: 'inherit' }); skillsInstalled = true; } catch { console.warn('  ⚠️  Failed to install skills CLI.'); }
  }

  if (skillsInstalled) {
    try { execSync('npx skills add juliusbrussee/caveman', { cwd: GLOBAL_DIR, stdio: 'inherit' }); console.log('  ✅ Caveman compression rules integrated globally'); } catch { /* ignore */ }
  }
}
