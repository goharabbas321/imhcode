#!/usr/bin/env node

/**
 * IMH-Code CLI — Imam Hussain Coding Harness Platform
 *
 * Usage:
 *   imhcode                            → Initialize framework in current directory
 *   imhcode plan                       → Smart: brainstorm (LLM) OR sprint-plan (LLM) based on state
 *   imhcode execute [N]                → Execute sprint N with intelligent model routing
 *   imhcode test                       → Run the testing/security/SEO sprint
 *   imhcode report                     → Generate PROJECT_REPORT.md for the team
 *   imhcode agent list                 → List all discovered agents
 *   imhcode agent inspect <id>         → Show full manifest + loaded skills
 *   imhcode agent run <id> "<task>"    → Run agent (dry-run by default)
 *     --engine <cli>                   → Override engine (claude|opencode|codex|codex-fugu|agy|qwen|mimo)
 *     -m, --model <model>              → Override model
 *     --live                           → Call real LLM
 *     --output <path>                  → Custom session output directory
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');
const os = require('os');
const readline = require('readline');

// ─── Constants ─────────────────────────────────────────────────────────────────

const PLATFORM_NAME  = 'IMH-Code';
const PLATFORM_FULL  = 'Imam Hussain Coding Harness Platform';
const CLI_CMD        = 'imhcode';
const LOCAL_DIR_NAME = '.imhcode';
const DOCS_DIR       = 'docs';
const CONFIG_FILE    = path.join(LOCAL_DIR_NAME, 'imhcode.config.json');
const GLOBAL_DIR     = path.join(os.homedir(), '.imhcode');
const START_MD       = path.join(DOCS_DIR, 'start.md');
const BRAINSTORM_MD  = path.join(DOCS_DIR, 'brainstorming.md');
const BRIEF_MD       = path.join(DOCS_DIR, 'PROJECT_BRIEF.md');
const CONTEXT_MD     = path.join(LOCAL_DIR_NAME, 'context.md');

/**
 * Ranked priority lists per category.
 * The algorithm scores each available model against these lists
 * and selects the highest-ranked match found in the installed engines.
 */
const MODEL_PRIORITY_RANKS = {
  frontend: [
    // Engine       Model substring to match (lowercase, no hyphens/dots)
    ['mimo',      'mimov25pro'],
    ['mimo',      'mimov25'],
    ['opencode',  'mimov25pro'],
    ['opencode',  'mimov25'],
    ['codex',     'gpt55'],
    ['codex',     'gpt5'],
    ['agy',       'claudeopus46'],
    ['agy',       'claudeopus'],
    ['opencode',  'gemini35flash'],
    ['opencode',  'gemini25pro'],
    ['claude',    'claudeopus46'],
    ['claude',    'opus'],
  ],
  backend: [
    ['opencode',  'deepseekv4pro'],
    ['opencode',  'deepseekv4'],
    ['opencode',  'kimik27code'],
    ['opencode',  'kimik2'],
    ['opencode',  'qwen3coder480b'],
    ['opencode',  'qwen3coder'],
    ['codex',     'gpt55'],
    ['codex',     'gpt5'],
    ['opencode',  'gptoss120b'],
    ['qwen',      'qwen3codermax'],
    ['qwen',      'qwen3coder'],
    ['claude',    'claudesonnet46'],
    ['claude',    'sonnet'],
  ],
  planning: [
    ['agy',       'claudeopus46'],
    ['agy',       'claudeopus'],
    ['claude',    'claudeopus46'],
    ['claude',    'opus'],
    ['codex',     'gpt55'],
    ['codex',     'gpt5'],
    ['opencode',  'gemini31propreview'],
    ['opencode',  'gemini31pro'],
    ['opencode',  'deepseekv4pro'],
  ],
  testing: [
    ['codex-fugu', 'fuguultra'],
    ['codex-fugu', 'fugu'],
    ['codex',     'gpt55'],
    ['codex',     'gpt5'],
    ['agy',       'gptoss120bmedium'],
    ['agy',       'gptoss120b'],
    ['agy',       'claudeopus46'],
    ['agy',       'claudeopus'],
    ['opencode',  'deepseekv4pro'],
    ['claude',    'claudeopus46'],
  ],
  review: [
    ['codex-fugu', 'fuguultra'],
    ['codex-fugu', 'fugu'],
    ['codex',     'gpt55'],
    ['codex',     'gpt5'],
    ['agy',       'claudesonnet46'],
    ['agy',       'claudesonnet'],
    ['opencode',  'gptoss120b'],
    ['claude',    'claudesonnet46'],
    ['opencode',  'deepseekv4pro'],
  ],
  fast: [
    ['opencode',  'deepseekv4flash'],
    ['opencode',  'deepseekv4flash'],
    ['opencode',  'gemini35flash'],
    ['codex',     'gpt54mini'],
    ['codex',     'gptmini'],
    ['qwen',      'qwen3coderflash'],
    ['claude',    'claudehaiku35'],
    ['claude',    'haiku'],
  ],
};

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
} else if (command === 'report') {
  runReportCommand(args.slice(1)).catch(err => {
    console.error(err.message ?? err);
    process.exit(1);
  });
} else if (command === 'agent') {
  runAgentCommand(subcommand, args.slice(2)).catch(err => {
    console.error(err.message ?? err);
    process.exit(1);
  });
} else if (command === 'modify') {
  runModifyCommand(args.slice(1)).catch(err => {
    console.error(err.message ?? err);
    process.exit(1);
  });
} else if (command === 'feature') {
  runFeatureCommand(args.slice(1)).catch(err => {
    console.error(err.message ?? err);
    process.exit(1);
  });
} else if (command === 'fix') {
  runFixCommand(args.slice(1)).catch(err => {
    console.error(err.message ?? err);
    process.exit(1);
  });
} else if (command === 'import') {
  runImportCommand(args.slice(1)).catch(err => {
    console.error(err.message ?? err);
    process.exit(1);
  });
} else if (command === 'scan') {
  runScanCommand(args.slice(1)).catch(err => {
    console.error(err.message ?? err);
    process.exit(1);
  });
} else if (command === 'gui') {
  console.log('💡 Note: \'imhcode gui\' is deprecated in favor of the interactive TUI.');
  runTuiCommand().catch(err => {
    console.error(err.message ?? err);
    process.exit(1);
  });
} else if (command === 'init') {
  runInit().catch(err => {
    console.error(err.message ?? err);
    process.exit(1);
  });
} else if (command === 'execute-feature' || command === 'exec-feature') {
  runExecuteFeatureCommand(args.slice(1)).catch(err => {
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
  // Default: start interactive TUI
  runTuiCommand().catch(err => {
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
    ${CLI_CMD} plan                   → Smart: brainstorm (LLM) OR generate sprint plan (LLM)
    ${CLI_CMD} execute [N]            → Execute sprint N with intelligent model routing
    ${CLI_CMD} test                   → Run final testing/security/SEO sprint
    ${CLI_CMD} report                 → Generate PROJECT_REPORT.md for the team
    ${CLI_CMD} agent list             → List all 19 generic agents
    ${CLI_CMD} agent inspect <id>     → Show agent manifest + loaded skills
    ${CLI_CMD} agent run <id> "<task>" → Run agent (dry-run by default)
      --live                          → Call real LLM
      --engine <cli>                  → Override engine (claude|opencode|codex|codex-fugu|agy|qwen|mimo)
      -m, --model <model>             → Override model
      --output <path>                 → Save session to custom path

  Usability Upgrades (v2.0):
    ${CLI_CMD} modify "task"          → In-place codebase modification/enhancement (runs targeted agent)
    ${CLI_CMD} feature "description"  → Plan a targeted mini-sprint for a new feature addition
    ${CLI_CMD} execute-feature [N]    → Execute planned feature sprint N
    ${CLI_CMD} fix "description"      → Quick targeted bug fix modification (alias of modify)
    ${CLI_CMD} scan [path]            → Scan existing directory structure and detect technology stacks
    ${CLI_CMD} import [path]          → Import existing project structure and configure IMH-Code context
    ${CLI_CMD} gui [--port N]         → Start the Laravel GUI Control Center web server

  Pipeline:
    1. ${CLI_CMD}                     → Init project (no frontend/backend dirs yet)
    2. Edit docs/start.md             → Answer scope questions + write your description
    3. ${CLI_CMD} plan                → Generates docs/brainstorming.md (via planning LLM)
    4. Edit docs/brainstorming.md     → Review/edit recommended answers
    5. ${CLI_CMD} plan                → Reads answers → generates sprint plans (via planning LLM)
    6. ${CLI_CMD} execute 1           → Execute sprint 1 (each task uses its routed model)
    7. ${CLI_CMD} execute 2           → Execute sprint 2
    8. ${CLI_CMD} test                → Final testing, security + SEO audit
    9. ${CLI_CMD} report              → Generate PROJECT_REPORT.md

  Agents (19 generic — no persona names):
    planner           → Project planning, brainstorming, sprint coordination [planning model]
    designer          → UX/UI design [frontend model — Mimo v2.5 Pro preferred]
    nextjs-executor   → Next.js full-stack [frontend model — Mimo v2.5 Pro preferred]
    react-executor    → React/Vite SPA [frontend model]
    vue-executor      → Vue 3 / Nuxt 4 [frontend model]
    laravel-executor  → Laravel full-stack [backend model — DeepSeek V4 Pro preferred]
    python-executor   → Python / Django / FastAPI [backend model]
    java-executor     → Java / Spring Boot [backend model]
    flutter-executor  → Flutter / Dart [backend model]
    react-native-executor → React Native / Expo [backend model]
    ios-executor      → iOS / SwiftUI [backend model]
    android-executor  → Android / Kotlin [backend model]
    systems-executor  → Go / Rust / C++ [backend model]
    web3-executor     → Solidity / Web3 [backend model]
    devops-executor   → Docker / CI/CD [backend model]
    tester            → QA + E2E testing [testing model — GPT-5.5 preferred]
    security-auditor  → Security audit [testing model — GPT-5.5 preferred]
    seo-optimizer     → SEO / Content [review model — GPT-5.5 preferred]
    debugger          → Debugging / Root cause [review model]

  ${CLI_CMD} --version, -v           → Print version
  ${CLI_CMD} --help, -h              → Print this help
  `);
}

// ─── imhcode plan (Smart State Machine + LLM-Powered) ─────────────────────────

async function runPlanCommand(restArgs) {
  const cwd = process.cwd();
  const startMdPath    = path.join(cwd, START_MD);
  const brainstormPath = path.join(cwd, BRAINSTORM_MD);
  const hasSprintDocs  = detectSprintDocs(cwd);

  console.log(`\n🕌 ${PLATFORM_NAME} — Plan Command\n`);

  if (!fs.existsSync(startMdPath)) {
    console.log(`❌ docs/start.md not found.\n`);
    console.log(`   Create docs/start.md and write your project description inside it.`);
    console.log(`   Then run "imhcode plan" again.\n`);
    console.log(`   Tip: Run "imhcode" first to initialize the project and create the template.\n`);
    process.exit(1);
  }

  const startContent = fs.readFileSync(startMdPath, 'utf8');
  const userPrompt   = extractPromptFromStartMd(startContent);
  const scopeHints   = extractScopeHints(startContent);

  if (!userPrompt || userPrompt.trim().length < 10) {
    console.log(`❌ docs/start.md has no project description.\n`);
    console.log(`   Write your project idea in docs/start.md between the markers:\n`);
    console.log(`   <!-- WRITE_PROMPT_HERE -->`);
    console.log(`   Your project description here...`);
    console.log(`   <!-- END_PROMPT -->\n`);
    process.exit(1);
  }

  const config = loadLocalConfig(cwd);

  // ── State 1: No brainstorming yet → generate brainstorming.md via LLM ──────
  if (!fs.existsSync(brainstormPath)) {
    console.log(`📋 Phase 2: Generating brainstorming document via planning AI...\n`);
    console.log(`   Project: "${userPrompt.slice(0, 100)}${userPrompt.length > 100 ? '...' : ''}"`);

    const planningRouting = config?.model_routing?.planning;
    if (planningRouting) {
      console.log(`   Model:   ${planningRouting.model} via ${planningRouting.engine}`);
    } else {
      console.log(`   Model:   (fallback static template — run imhcode to configure model routing)`);
    }
    console.log('');

    await generateBrainstormingDoc(cwd, userPrompt, scopeHints, config);

    console.log(`\n✅ Brainstorming document created: docs/brainstorming.md\n`);
    console.log(`─`.repeat(60));
    console.log(`\n📝 NEXT STEPS:\n`);
    console.log(`  1. Open docs/brainstorming.md`);
    console.log(`  2. Review the AI-recommended answers`);
    console.log(`  3. Edit any answers you want to customize`);
    console.log(`  4. Run "imhcode plan" again to generate sprint plans\n`);
    console.log(`─`.repeat(60));
    return;
  }

  // ── State 2: Brainstorming exists, no sprint plans → generate sprints via LLM
  if (!hasSprintDocs) {
    console.log(`📋 Phase 3-4: Reading brainstorming answers → generating sprint plans via AI...\n`);

    const brainstormContent = fs.readFileSync(brainstormPath, 'utf8');
    const planningRouting = config?.model_routing?.planning;
    if (planningRouting) {
      console.log(`   Model:   ${planningRouting.model} via ${planningRouting.engine}`);
    }
    console.log('');

    await generateSprintPlans(cwd, userPrompt, brainstormContent, config);

    console.log(`\n✅ Sprint plans generated!\n`);
    console.log(`─`.repeat(60));
    console.log(`\n📝 NEXT STEPS:\n`);
    console.log(`  1. Review docs/sprint-1/plan.md`);
    console.log(`  2. Run "imhcode execute 1" to start Sprint 1`);
    console.log(`  3. Then "imhcode execute 2", "imhcode execute 3", etc.`);
    console.log(`  4. Run "imhcode test" for the final testing sprint`);
    console.log(`  5. Run "imhcode report" to generate the team report\n`);
    console.log(`─`.repeat(60));
    return;
  }

  // ── State 3: Sprints already exist ───────────────────────────────────────
  const currentSprint = detectCurrentSprint(cwd);
  console.log(`ℹ️  Sprint plans already exist (current sprint: Sprint ${currentSprint}).\n`);
  console.log(`  Use "imhcode execute ${currentSprint}" to run the current sprint.`);
  console.log(`  Use "imhcode test" to run the final testing sprint.\n`);
  console.log(`  To re-plan from scratch, delete docs/brainstorming.md and run "imhcode plan".\n`);
}

// ─── imhcode execute [N] ──────────────────────────────────────────────────────

async function runExecuteCommand(restArgs) {
  const cwd = process.cwd();
  const sprintNum    = resolveSprintNum(restArgs, cwd);
  const sprintDir    = path.join(cwd, DOCS_DIR, `sprint-${sprintNum}`);
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
    const plan      = fs.readFileSync(planPath, 'utf8');
    const taskCount = (plan.match(/^##\s+Task/gm) || []).length;
    console.log(`   Sprint: ${sprintNum}`);
    console.log(`   Tasks:  ${taskCount}`);
    console.log(`   Script: ${masterScript}\n`);
  }

  // Show active model routing
  const config = loadLocalConfig(cwd);
  if (config?.model_routing) {
    console.log(`   Model Routing (active):`);
    for (const [cat, routing] of Object.entries(config.model_routing)) {
      if (routing && typeof routing === 'object') {
        console.log(`     ${cat.padEnd(12)}: ${routing.model} (${routing.engine})`);
      }
    }
    console.log('');
  }

  try { fs.chmodSync(masterScript, 0o755); } catch { /* ignore on Windows */ }

  console.log(`─`.repeat(60));
  try {
    await markSprintStarted(cwd, sprintNum);
    execSync(`sh "${masterScript}"`, { stdio: 'inherit', cwd });
    console.log(`─`.repeat(60));
    console.log(`\n🏁 Sprint ${sprintNum} execution complete!\n`);
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
  const cwd            = process.cwd();
  const lastSprint     = detectLastSprint(cwd);
  const testSprintNum  = lastSprint + 1;
  const testSprintDir  = path.join(cwd, DOCS_DIR, `sprint-${testSprintNum}`);
  const testScript     = path.join(testSprintDir, 'run_all_tasks.sh');

  console.log(`\n🕌 ${PLATFORM_NAME} — Testing Sprint\n`);

  if (fs.existsSync(testScript)) {
    console.log(`   Running auto-generated testing sprint (Sprint ${testSprintNum})...\n`);
    try { fs.chmodSync(testScript, 0o755); } catch { /* ignore */ }
    console.log(`─`.repeat(60));
    try {
      execSync(`sh "${testScript}"`, { stdio: 'inherit', cwd });
      console.log(`─`.repeat(60));
      console.log(`\n✅ Testing sprint complete! Check docs/sprint-${testSprintNum}/ for reports.\n`);
    } catch {
      console.error(`\n❌ Testing sprint failed. Check output above.\n`);
      process.exit(1);
    }
  } else {
    console.log(`   ℹ️  No testing sprint found yet.\n`);
    console.log(`   The testing sprint is auto-generated when you run "imhcode plan".\n`);
    console.log(`   To generate it now, run:\n`);
    console.log(`     imhcode agent run planner "Generate testing sprint for Sprint ${testSprintNum}" --live\n`);
  }
}

// ─── imhcode report ───────────────────────────────────────────────────────────

async function runReportCommand(restArgs) {
  const cwd        = process.cwd();
  const reportPath = path.join(cwd, 'PROJECT_REPORT.md');
  const config     = loadLocalConfig(cwd);
  const lastSprint = detectLastSprint(cwd);

  console.log(`\n🕌 ${PLATFORM_NAME} — Generating Project Report\n`);

  // Gather all project data
  const briefContent       = safeRead(path.join(cwd, BRIEF_MD));
  const brainstormContent  = safeRead(path.join(cwd, BRAINSTORM_MD));
  const startContent       = safeRead(path.join(cwd, START_MD));
  const contextContent     = safeRead(path.join(cwd, CONTEXT_MD));

  const userPrompt = extractPromptFromStartMd(startContent || '');

  // Gather sprint data
  const sprintData = [];
  for (let i = 1; i <= lastSprint + 1; i++) {
    const sprintDir  = path.join(cwd, DOCS_DIR, `sprint-${i}`);
    const planMd     = safeRead(path.join(sprintDir, 'plan.md'));
    const progressMd = safeRead(path.join(sprintDir, 'progress.md'));
    const deferredMd = safeRead(path.join(sprintDir, 'deferred.md'));
    if (planMd || progressMd) {
      sprintData.push({ sprintNum: i, plan: planMd, progress: progressMd, deferred: deferredMd });
    }
  }

  // Build model routing summary
  let modelRoutingSummary = '';
  if (config?.model_routing) {
    const rows = Object.entries(config.model_routing).map(([cat, r]) =>
      `| ${cat.padEnd(10)} | ${(r?.engine || '?').padEnd(12)} | ${r?.model || '?'} |`
    ).join('\n');
    modelRoutingSummary = `| Category   | Engine       | Model |\n|------------|--------------|-------|\n${rows}`;
  }

  // Build sprint log table
  const sprintLogTable = sprintData.map(s => {
    const titleMatch = s.plan?.match(/^# Sprint \d+: (.+)$/m);
    const title      = titleMatch ? titleMatch[1] : `Sprint ${s.sprintNum}`;
    const tasksDone  = (s.progress?.match(/- \[x\]/g) || []).length;
    const tasksTotal = (s.progress?.match(/- \[/g) || []).length;
    const status     = tasksTotal > 0 && tasksDone === tasksTotal ? '✅ Complete' :
                       tasksDone > 0 ? `🔄 In Progress (${tasksDone}/${tasksTotal})` : '⬜ Pending';
    return `| ${s.sprintNum} | ${title} | ${status} |`;
  }).join('\n');

  // Build agent usage table from sprint plans
  const agentUsage = {};
  for (const s of sprintData) {
    if (!s.plan) continue;
    const agentMatches = s.plan.matchAll(/`([a-z-]+-executor|planner|designer|tester|security-auditor|seo-optimizer|debugger)`/g);
    for (const m of agentMatches) {
      agentUsage[m[1]] = (agentUsage[m[1]] || 0) + 1;
    }
  }
  const agentTable = Object.entries(agentUsage)
    .sort((a, b) => b[1] - a[1])
    .map(([agent, count]) => `| \`${agent}\` | ${getAgentCategory(agent)} | ${count} tasks |`)
    .join('\n');

  // Build deferred items list
  const deferredItems = sprintData
    .filter(s => s.deferred && !s.deferred.includes('None yet'))
    .map(s => `\n### Sprint ${s.sprintNum} Deferred\n\n${s.deferred}`)
    .join('');

  // Detect stack from brainstorm/context
  const stack = [];
  if (brainstormContent || contextContent) {
    const combined = (brainstormContent || '') + (contextContent || '');
    if (/next\.?js/i.test(combined))     stack.push('Next.js');
    if (/vue/i.test(combined))            stack.push('Vue 3 / Nuxt 4');
    if (/react\s*native/i.test(combined)) stack.push('React Native');
    if (/flutter/i.test(combined))        stack.push('Flutter');
    if (/laravel/i.test(combined))        stack.push('Laravel');
    if (/django|fastapi/i.test(combined)) stack.push('Python / FastAPI');
    if (/spring\s*boot/i.test(combined))  stack.push('Java / Spring Boot');
    if (/postgres/i.test(combined))       stack.push('PostgreSQL');
    if (/redis/i.test(combined))          stack.push('Redis');
    if (/docker/i.test(combined))         stack.push('Docker');
    if (/tailwind/i.test(combined))       stack.push('Tailwind CSS');
    if (/shadcn/i.test(combined))         stack.push('shadcn/ui');
  }

  const report = `# 📋 IMH-Code — Project Report

> **${PLATFORM_FULL}**
> Generated: ${new Date().toLocaleString()}

---

## 🎯 Project Summary

${userPrompt || '*(See PROJECT_BRIEF.md for details)*'}

---

## 🏗️ Technology Stack

${stack.length > 0 ? stack.map(s => `- ${s}`).join('\n') : '*(Stack detected from brainstorming and sprint plans)*'}

---

## 🤖 AI Model Routing Used

${modelRoutingSummary || '*(No imhcode.config.json found)*'}

---

## 🏃 Sprint Execution Log

| Sprint | Title | Status |
|--------|-------|--------|
${sprintLogTable || '| — | No sprints found | — |'}

---

## 🔧 Agent Execution Summary

| Agent | Category | Usage |
|-------|----------|-------|
${agentTable || '*(No sprint plans found)*'}

---

## 🚀 How to Run This Project

\`\`\`bash
# 1. Install dependencies
${stack.includes('Next.js') || stack.includes('Vue 3 / Nuxt 4') ? 'cd frontend && npm install' : ''}
${stack.includes('Laravel') ? 'cd backend && composer install && php artisan key:generate' : ''}
${stack.includes('Python / FastAPI') ? 'cd backend && pip install -r requirements.txt' : ''}

# 2. Set environment variables
cp .env.example .env  # Edit with your config

# 3. Run development server
${stack.includes('Next.js') ? 'cd frontend && npm run dev        # → http://localhost:3000' : ''}
${stack.includes('Vue 3 / Nuxt 4') ? 'cd frontend && npm run dev    # → http://localhost:3000' : ''}
${stack.includes('Laravel') ? 'cd backend  && php artisan serve  # → http://localhost:8000' : ''}
${stack.includes('Python / FastAPI') ? 'cd backend  && uvicorn main:app --reload' : ''}
\`\`\`

---

## 📂 Project Structure

\`\`\`
${path.basename(cwd)}/
├── docs/                  ← Sprint plans & documentation
│   ├── start.md           ← Project description (input)
│   ├── brainstorming.md   ← Brainstorming Q&A
│   └── sprint-*/          ← Sprint plans, tasks, progress
├── ${fs.existsSync(path.join(cwd, 'frontend')) ? 'frontend/              ← Frontend application\n├── ' : ''}${fs.existsSync(path.join(cwd, 'backend')) ? 'backend/               ← Backend application\n├── ' : ''}.imhcode/             ← IMH-Code context & sessions
├── imhcode.config.json    ← Engine & model routing config
└── PROJECT_BRIEF.md       ← Central project context
\`\`\`

---

## 📌 Known Issues & Deferred Items

${deferredItems || '*(No deferred items logged)*'}

---

## 📊 Development Metrics

| Metric | Value |
|--------|-------|
| Total Sprints | ${sprintData.length} |
| Agents Used | ${Object.keys(agentUsage).length} |
| Testing Mode | ${config?.testing_mode || 'fast'} |
| Primary Engine | ${config?.primary_engine || 'N/A'} |

---

*Report generated by ${PLATFORM_NAME} — ${PLATFORM_FULL}*
`;

  fs.writeFileSync(reportPath, report, 'utf8');
  console.log(`✅ PROJECT_REPORT.md created!\n`);
  console.log(`   Path: ${reportPath}`);
  console.log(`   Sprints covered: ${sprintData.length}`);
  console.log(`   Agents referenced: ${Object.keys(agentUsage).length}\n`);
  console.log(`   Share this file with your team for a complete project overview.\n`);
}

// ─── imhcode agent ────────────────────────────────────────────────────────────

async function runAgentCommand(subcommand, restArgs) {
  const orchestrator = loadOrchestrator();

  switch (subcommand) {
    case 'list':    return cmdList(orchestrator, restArgs);
    case 'inspect': return cmdInspect(orchestrator, restArgs);
    case 'run':     return cmdRun(orchestrator, restArgs);
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

  const config = loadLocalConfig(cwd);

  const rows = [...agents.values()].map(a => ({
    id:       a.manifest.id,
    role:     a.manifest.role,
    category: getAgentCategory(a.manifest.id),
    model:    config?.model_routing?.[getAgentCategory(a.manifest.id)]?.model || a.manifest.default_model,
    engine:   config?.model_routing?.[getAgentCategory(a.manifest.id)]?.engine || '?',
  }));

  const colId   = Math.max(...rows.map(r => r.id.length),   2);
  const colRole = Math.max(...rows.map(r => r.role.length),  4);
  const colCat  = Math.max(...rows.map(r => r.category.length), 8);
  const colEng  = Math.max(...rows.map(r => r.engine.length), 6);

  console.log(`  ${'ID'.padEnd(colId)}  ${'Role'.padEnd(colRole)}  ${'Category'.padEnd(colCat)}  ${'Engine'.padEnd(colEng)}  Model`);
  console.log(`  ${'─'.repeat(colId)}  ${'─'.repeat(colRole)}  ${'─'.repeat(colCat)}  ${'─'.repeat(colEng)}  ${'─'.repeat(32)}`);

  for (const r of rows) {
    console.log(`  ${r.id.padEnd(colId)}  ${r.role.padEnd(colRole)}  ${r.category.padEnd(colCat)}  ${r.engine.padEnd(colEng)}  ${r.model}`);
  }

  if (errors.length > 0) {
    console.log(`\n  ⚠️  ${errors.length} agent(s) failed to load:`);
    errors.forEach(e => console.log(`    • ${e.agentId}: ${e.error}`));
  }
  console.log('');
}

async function cmdInspect(orc, args) {
  const agentId = args[0];
  if (!agentId) {
    console.error(`❌ Usage: imhcode agent inspect <agent-id>`);
    process.exit(1);
  }

  const agentsDir = resolveAgentsDir();
  const cwd       = process.cwd();
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

  const config   = loadLocalConfig(cwd);
  const category = getAgentCategory(manifest.id);
  const routing  = config?.model_routing?.[category];

  console.log(divider);
  console.log(`  ${manifest.name}  (v${manifest.version})`);
  console.log(divider);
  console.log(`  ID:            ${manifest.id}`);
  console.log(`  Role:          ${manifest.role}`);
  console.log(`  Category:      ${category}`);
  console.log(`  Description:   ${manifest.description.replace(/\n\s*/g, ' ')}`);
  console.log(`  Directory:     ${dir}`);
  console.log(`  Default Model: ${manifest.default_model}`);
  if (routing) {
    console.log(`  Routed Model:  ${routing.model} via ${routing.engine} (from imhcode.config.json) ✅`);
  } else {
    console.log(`  Routed Model:  (none — run imhcode to configure model routing)`);
  }
  console.log(`  Fallbacks:     ${manifest.fallback_engines.join(', ') || '(none)'}`);
  console.log(`\n  Core Skills: ${skills.length} loaded`);
  skills.forEach(s => console.log(`    • ${s.name} — ${s.description?.slice(0, 80) ?? ''}`));

  const promptLines = systemPrompt.split('\n').length;
  console.log(`\n  System Prompt: ${promptLines} lines\n`);
  console.log(divider + '\n');
}

function printAgentHelp() {
  console.log(`\n  ${PLATFORM_NAME} — Agent Commands\n`);
  console.log(`  imhcode agent list                  → List all agents with routed models`);
  console.log(`  imhcode agent inspect <id>           → Show agent details + routing`);
  console.log(`  imhcode agent run <id> "<task>"      → Dry-run (no LLM call)`);
  console.log(`  imhcode agent run <id> "<task>" --live → Call real LLM with routed model`);
  console.log(`    --engine <cli>  → Override engine`);
  console.log(`    -m, --model <m> → Override model`);
  console.log(`    --output <path> → Save session to custom path\n`);
}

async function cmdRun(orc, args) {
  const agentId = args[0];
  const task    = args[1];

  if (!agentId || !task) {
    console.error(`❌ Usage: imhcode agent run <agent-id> "<task description>" [options]`);
    console.error(`   --live              Run live (calls real LLM)`);
    console.error(`   --engine <cli>      Override engine`);
    console.error(`   -m, --model <model> Override model`);
    console.error(`   --output <path>     Custom output dir`);
    process.exit(1);
  }

  const restArgs     = args.slice(2);
  const live         = restArgs.includes('--live');
  const engineIdx    = restArgs.indexOf('--engine');
  const engine       = engineIdx >= 0 ? restArgs[engineIdx + 1] : undefined;
  const mIndex       = restArgs.indexOf('--model');
  const shortMIndex  = restArgs.indexOf('-m');
  const modelIdx     = mIndex >= 0 ? mIndex : shortMIndex;
  const model        = modelIdx >= 0 ? restArgs[modelIdx + 1] : undefined;
  const criteriaIdx  = restArgs.indexOf('--criteria');
  const criteria     = criteriaIdx >= 0 ? restArgs[criteriaIdx + 1] : undefined;
  const outputIdx    = restArgs.indexOf('--output');
  const outputDir    = outputIdx >= 0 ? restArgs[outputIdx + 1] : undefined;

  const sprintIdx    = restArgs.indexOf('--sprint');
  const sprintVal    = sprintIdx >= 0 ? parseInt(restArgs[sprintIdx + 1], 10) : undefined;
  const taskIdx      = restArgs.indexOf('--task');
  const taskVal      = taskIdx >= 0 ? parseInt(restArgs[taskIdx + 1], 10) : undefined;

  const agentsDir = resolveAgentsDir();
  const cwd       = process.cwd();
  const config    = loadLocalConfig(cwd);
  const category  = getAgentCategory(agentId);

  // Fix 0b Part A: Auto-inject routing when no explicit override provided
  const routedEngine = engine ?? config?.model_routing?.[category]?.engine;
  const routedModel  = model  ?? config?.model_routing?.[category]?.model;

  console.log(`\n🕌 ${PLATFORM_NAME} — Agent Execution`);
  console.log(`   Agent:    ${agentId}`);
  console.log(`   Category: ${category}`);
  console.log(`   Task:     ${task}`);
  console.log(`   Mode:     ${live ? '🔴 LIVE (CLI execution)' : '🟡 DRY-RUN (no CLI execution)'}`);

  if (engine || model) {
    console.log(`   Model:    ${routedModel} via ${routedEngine} (explicit override)`);
  } else if (routedEngine && routedModel) {
    console.log(`   Model:    ${routedModel} via ${routedEngine} (auto from imhcode.config.json ✅)`);
  }
  console.log('');

  const { agents, errors } = await orc.loadRegistry(agentsDir, cwd);

  if (errors.some(e => e.agentId === agentId)) {
    const err = errors.find(e => e.agentId === agentId);
    console.error(err.error);
    process.exit(1);
  }

  const agent  = orc.getAgent(agents, agentId);

  if (live && sprintVal !== undefined) {
    await markSprintStarted(cwd, sprintVal);
  }

  // Pass the routed engine + model to runAgent (Fix 0b Part A)
  const result = await orc.runAgent(
    agent, task,
    { dryRun: !live, engine: routedEngine, model: routedModel, outputDir, cwd },
    criteria
  );

  if (!result.dryRun && result.errors.length === 0) {
    if (sprintVal !== undefined && taskVal !== undefined) {
      await markTaskCompleted(cwd, sprintVal, taskVal);
    }
  }

  console.log('\n' + '─'.repeat(72));
  if (result.errors.length > 0 && !result.dryRun) {
    console.error(`\n❌ [IMH-Code] Execution failed with errors:`);
    result.errors.forEach(e => console.error(`   • ${e}`));

    const isLimitExhausted = result.errors.some(e => e.includes('limits') && e.includes('exhausted'));
    if (isLimitExhausted) {
      const currentSprint = detectCurrentSprint(cwd);
      console.error(`\n💡 [IMH-Code] All available assistant engines hit rate/token/quota limits.`);
      console.error(`   Context saved in: ${result.sessionDir || 'sessions/'}`);
      console.error(`   Wait for limits to reset, then resume with:`);
      console.error(`     imhcode execute ${currentSprint}\n`);
    }
    process.exit(1);
  }

  if (result.dryRun) {
    console.log(`\n🟡 [DRY-RUN] Prompt built successfully — ${result.prompt.split('\n').length} lines`);
    console.log(`   Would execute with: ${routedModel || 'default'} via ${routedEngine || 'default'}`);
    console.log(`   Use --live to run with the real LLM.\n`);
    if (result.output) console.log(result.output);
  } else {
    console.log(`\n✅ [IMH-Code] Task executed successfully`);
    console.log(`   Model:    ${result.model}`);
    console.log(`   Duration: ${(result.durationMs / 1000).toFixed(1)}s`);
    if (result.sessionDir) console.log(`   Session:  ${result.sessionDir}`);
    console.log('');
  }
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
  const cwd       = process.cwd();
  const sprintNum = resolveSprintNum(restArgs, cwd);
  const sprintDir = path.join(cwd, DOCS_DIR, `sprint-${sprintNum}`);

  console.log(`\n📐 ${PLATFORM_NAME} Sprint Design Check — Sprint ${sprintNum}\n`);

  const checks = [
    { file: path.join(cwd, BRIEF_MD),                   label: 'docs/PROJECT_BRIEF.md' },
    { file: path.join(sprintDir, 'plan.md'),             label: `docs/sprint-${sprintNum}/plan.md` },
    { file: path.join(sprintDir, 'progress.md'),         label: `docs/sprint-${sprintNum}/progress.md` },
    { file: path.join(cwd, LOCAL_DIR_NAME, 'commands', `sprint-${sprintNum}`), label: `.imhcode/commands/sprint-${sprintNum}/` },
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

  const packageRoot        = path.join(__dirname, '..');
  const imhcodeScriptPath  = path.join(packageRoot, 'bin', 'imhcode.js');
  const cwd                = process.cwd();

  // Ensure global ~/.imhcode exists
  if (!fs.existsSync(GLOBAL_DIR)) {
    fs.mkdirSync(GLOBAL_DIR, { recursive: true });
  }

  const itemsToCopy = [
    { src: '.github',             dest: '.github',         desc: 'GitHub integration files' },
    { src: 'AGENTS.md',           dest: 'AGENTS.md',       desc: 'Agent manifest' },
    { src: 'CLAUDE.md',           dest: 'CLAUDE.md',       desc: 'Claude/Cursor/Copilot integration' },
    { src: '.gitignore.template', dest: '.gitignore',      desc: 'Auto-generated gitignore' },
    { src: 'SETUP.md',            dest: 'SETUP.md',        desc: 'Setup guide' },
    { src: 'USER_MANUAL.md',      dest: 'USER_MANUAL.md',  desc: 'User manual' },
    { src: 'agents',              dest: 'agents',          desc: 'YAML-driven agent manifests' },
    { src: 'skills',              dest: 'skills',          desc: 'Skill library (SKILL.md files)' },
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

  // Fix 1: Create only ESSENTIAL local directories at init time.
  // frontend/, backend/, .worktrees/ are created LATER in generateSprintPlans()
  // after brainstorming answers confirm what the user actually needs.
  const dirsToCreate = [
    DOCS_DIR,
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

  // Fix 2: Create docs/start.md template with scope questions
  const startMdPath = path.join(cwd, START_MD);
  if (!fs.existsSync(startMdPath)) {
    const startMdContent = [
      '# 🕌 IMH-Code — Project Start',
      '',
      '> **Imam Hussain Coding Harness Platform**',
      '> Answer the scope questions below, write your description, then run `imhcode plan`.',
      '',
      '---',
      '',
      '## ⚡ Quick Scope Check',
      '',
      '**Do you need a backend API / server-side logic?**',
      '> **Answer:** yes  *(change to: yes / no / unsure)*',
      '',
      '**Do you need a mobile app (iOS/Android)?**',
      '> **Answer:** no  *(change to: yes / no)*',
      '',
      '---',
      '',
      '## 📝 Your Project Description',
      '',
      'Write your complete project idea below. Be as detailed as possible.',
      'Include: what you\'re building, who it\'s for, key features, preferred stack,',
      'design preferences, integrations needed, business constraints.',
      '',
      '<!-- WRITE_PROMPT_HERE -->',
      'I want to build a SaaS dashboard for managing hotel room bookings with real-time availability,',
      'a Next.js frontend, Laravel API backend, and PostgreSQL database. Target users are hotel managers.',
      'Key features: room calendar, booking CRUD, guest management, reporting, email notifications.',
      '<!-- END_PROMPT -->',
      '',
      '---',
      '',
      '## 🚀 Next Step',
      '',
      'After filling in the scope and your description, run:',
      '',
      '```bash',
      'imhcode plan',
      '```',
      '',
      'IMH-Code will invoke your configured **planning AI model** (e.g. Claude Opus, GPT-5.5)',
      'to generate `docs/brainstorming.md` with smart, project-specific questions and answers.',
    ].join('\n');
    fs.writeFileSync(startMdPath, startMdContent, 'utf8');
    console.log(`  Created docs/start.md (write your project here)`);
  }

  const isInteractive = process.stdout.isTTY;

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
  const hasCaveman = fs.existsSync(path.join(os.homedir(), '.claude', 'skills', 'caveman')) || fs.existsSync(path.join(GLOBAL_DIR, 'skills', 'caveman'));
  const hasGraphify = fs.existsSync(path.join(os.homedir(), '.claude', 'skills', 'graphify')) || fs.existsSync(path.join(GLOBAL_DIR, 'skills', 'graphify'));
  ensureCavemanAndGraphify(hasCaveman && hasGraphify);

  // ── Interactive Engine & Model Setup ────────────────────────────────────────
  console.log('\n🔍 Scanning for local coding assistant CLIs...');
  const engines     = scanAssistantCLIs();
  const foundEngines = Object.keys(engines).filter(k => engines[k].path);

  if (foundEngines.length === 0) {
    console.warn('\n⚠️  No local coding assistant CLIs detected.');
    console.warn('   Supported: claude, opencode, codex, codex-fugu, agy (Antigravity), qwen (QwenCode), mimo (MimoCode)');
    console.warn('   Install one and re-run "imhcode" to configure model routing.\n');
  }

  let primaryEngine = 'claude';

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

  // Call setupModelRouting
  const modelRouting = await setupModelRouting(engines, foundEngines, isInteractive);

  // Write config
  const configPath = path.join(cwd, CONFIG_FILE);
  const configData = {
    primary_engine: primaryEngine,
    default_model:  defaultModel || undefined,
    testing_mode:   'fast',
    model_routing:  modelRouting,
    available_engines: {},
  };

  for (const key of foundEngines) {
    configData.available_engines[key] = {
      path:   engines[key].path,
      models: engines[key].models,
    };
  }

  fs.writeFileSync(configPath, JSON.stringify(configData, null, 2), 'utf8');
  console.log(`\n💾 Configuration saved: ${configPath}`);

  // Print final guide
  console.log(`\n✅ ${PLATFORM_NAME} initialized successfully!`);
  console.log(`─`.repeat(60));
  console.log(`\n🕌 HOW TO BUILD WITH IMH-CODE:\n`);
  console.log(`  1. Open docs/start.md → Answer scope questions + write your description`);
  console.log(`  2. Run: imhcode plan`);
  console.log(`     → Your planning AI (${modelRouting?.planning?.model || 'configured model'}) generates brainstorming.md`);
  console.log(`  3. Open docs/brainstorming.md → Review/edit AI-recommended answers`);
  console.log(`  4. Run: imhcode plan`);
  console.log(`     → Your planning AI generates sprint plans with correct agent routing`);
  console.log(`  5. Run: imhcode execute 1   → Sprint 1 (frontend tasks → ${modelRouting?.frontend?.model || 'frontend model'})`);
  console.log(`  6. Run: imhcode execute 2   → Sprint 2 (backend tasks → ${modelRouting?.backend?.model || 'backend model'})`);
  console.log(`  7. Run: imhcode test        → Final testing + security + SEO`);
  console.log(`  8. Run: imhcode report      → Generate PROJECT_REPORT.md`);
  console.log(`\n  Run "imhcode --help" for all commands.`);
  console.log(`─`.repeat(60));
  console.log('');
}

// ─── Fix 4: Model Routing Setup Wizard (Ranked Scoring Algorithm) ─────────────

/**
 * Normalize a model/engine string for fuzzy matching:
 * lowercase, remove hyphens, dots, underscores, spaces.
 */
function normalizeForMatch(s) {
  return (s || '').toLowerCase().replace(/[-._\s]/g, '');
}

/**
 * Select the best model for a category from available engines using ranked scoring.
 * Returns { engine, model } or null if nothing found.
 */
function selectBestModel(ranks, engines) {
  for (const [preferredEngine, modelSubstring] of ranks) {
    const engData = engines[preferredEngine];
    if (!engData?.path || !engData.models?.length) continue;
    const match = engData.models.find(m => normalizeForMatch(m).includes(normalizeForMatch(modelSubstring)));
    if (match) return { engine: preferredEngine, model: match };
  }
  return null;
}

async function setupModelRouting(engines, foundEngines, isInteractive) {
  const categories = {
    frontend: {
      label: 'Frontend (UI/UX, components, animations)',
      note: 'Mimo v2.5 Pro → Antigravity OPUS 4.6 → Deepseek v4 Flash',
      ranks: [
        ['mimo', 'mimo-vl-v2.5-pro'],
        ['opencode', 'mimo-v2.5-pro'],
        ['opencode', 'mimo-v2.5'],
        ['agy', 'Claude Opus 4.6'],
        ['opencode', 'deepseek-v4-flash']
      ]
    },
    backend: {
      label: 'Backend (APIs, database, business logic)',
      note: 'Deepseek v4 Pro → Antigravity OPUS 4.6 → Deepseek v4 Flash',
      ranks: [
        ['opencode', 'deepseek-v4-pro'],
        ['agy', 'Claude Opus 4.6'],
        ['opencode', 'deepseek-v4-flash']
      ]
    },
    planning: {
      label: 'Planning (brainstorming, sprint planning)',
      note: 'Claude OPUS 4.8 → Fugu → Deepseek v4 Flash',
      ranks: [
        ['claude', 'claude-opus-4-8'],
        ['agy', 'Claude Opus 4.8'],
        ['codex-fugu', 'fugu-ultra'],
        ['codex-fugu', 'fugu'],
        ['opencode', 'deepseek-v4-flash']
      ]
    },
    testing: {
      label: 'Testing (QA, security audit, E2E)',
      note: 'Claude OPUS 4.8 → Fugu → Deepseek v4 Flash',
      ranks: [
        ['claude', 'claude-opus-4-8'],
        ['agy', 'Claude Opus 4.8'],
        ['codex-fugu', 'fugu-ultra'],
        ['codex-fugu', 'fugu'],
        ['opencode', 'deepseek-v4-flash']
      ]
    },
    review: {
      label: 'Review (SEO, debugging, code review)',
      note: 'Claude OPUS 4.8 → Fugu → Deepseek v4 Flash',
      ranks: [
        ['claude', 'claude-opus-4-8'],
        ['agy', 'Claude Opus 4.8'],
        ['codex-fugu', 'fugu-ultra'],
        ['codex-fugu', 'fugu'],
        ['opencode', 'deepseek-v4-flash']
      ]
    },
    fast: {
      label: 'Fast (boilerplate, config, simple tasks)',
      note: 'Deepseek v4 Flash',
      ranks: [
        ['opencode', 'deepseek-v4-flash']
      ]
    }
  };

  const recommended = {};
  for (const [cat, cfg] of Object.entries(categories)) {
    const best = selectBestModel(cfg.ranks, engines);
    if (best) {
      recommended[cat] = {
        engine: best.engine,
        model: best.model,
        fallbacks: []
      };
      // Find all subsequent matches from ranks to act as fallback chain
      let bestFound = false;
      for (const [preferredEngine, modelSubstring] of cfg.ranks) {
        const engData = engines[preferredEngine];
        if (!engData?.path || !engData.models?.length) continue;
        const match = engData.models.find(m => normalizeForMatch(m).includes(normalizeForMatch(modelSubstring)));
        if (match) {
          if (!bestFound) {
            bestFound = true;
          } else {
            const exists = recommended[cat].fallbacks.some(f => f.engine === preferredEngine && f.model === match);
            if (!exists) {
              recommended[cat].fallbacks.push({ engine: preferredEngine, model: match });
            }
          }
        }
      }
    } else if (foundEngines.length > 0) {
      const fe = foundEngines[0];
      recommended[cat] = {
        engine: fe,
        model: engines[fe].models[0] || 'default',
        fallbacks: []
      };
    }
  }

  // Show recommended routing table
  console.log('\n' + '─'.repeat(70));
  console.log('🧠 Recommended Model Routing (ranked by priority for each category):\n');
  console.log('  Category      │ Engine        │ Model');
  console.log('  ──────────────┼───────────────┼───────────────────────────────────────');
  for (const [cat, rec] of Object.entries(recommended)) {
    const catLabel = cat.padEnd(12);
    const eng      = (rec.engine || '?').padEnd(13);
    const mdl      = rec.model || '?';
    console.log(`  ${catLabel}  │ ${eng} │ ${mdl}`);
  }
  console.log('  ' + '─'.repeat(67));
  console.log(`\n  Routings:\n` +
              `  - frontend: Mimo v2.5 Pro → Antigravity OPUS 4.6 → Deepseek v4 Flash\n` +
              `  - backend:  Deepseek v4 Pro → Antigravity OPUS 4.6 → Deepseek v4 Flash\n` +
              `  - planning: Claude OPUS 4.8 → Fugu → Deepseek v4 Flash\n` +
              `  - testing:  Claude OPUS 4.8 → Fugu → Deepseek v4 Flash\n` +
              `  - review:   Claude OPUS 4.8 → Fugu → Deepseek v4 Flash\n` +
              `  - fast:     Deepseek v4 Flash`);

  const routing = {};

  if (isInteractive) {
    const answer = await askQuestion('\nAccept recommended routing? [Y/n] ');
    if (answer.toLowerCase() === 'n' || answer.toLowerCase() === 'no') {
      // Let user customize each category
      for (const [cat, cfg] of Object.entries(categories)) {
        console.log(`\n  Configure model for [${cat}] — ${cfg.label}`);
        console.log(`  Priority: ${cfg.note}`);

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
          const rec   = recommended[cat];
          const isRec = rec && rec.engine === item.engine && rec.model === item.model;
          console.log(`    [${i + 1}] ${item.model} (${item.engine})${isRec ? ' ← Recommended ✅' : ''}`);
        });

        let primaryIdx = allModels.findIndex(m => {
          const rec = recommended[cat];
          return rec && m.engine === rec.engine && m.model === rec.model;
        });
        if (primaryIdx < 0) primaryIdx = 0;

        let primaryModel;
        while (true) {
          const ans = await askQuestion(`  Select PRIMARY model for ${cat} [1-${allModels.length}] (default: ${primaryIdx + 1}): `);
          if (ans === '') { primaryModel = allModels[primaryIdx]; break; }
          const p = parseInt(ans, 10);
          if (p >= 1 && p <= allModels.length) { primaryModel = allModels[p - 1]; break; }
          console.log(`  ❌ Invalid. Enter 1–${allModels.length}.`);
        }
        console.log(`  ✅ Primary: ${primaryModel.model} (${primaryModel.engine})`);

        routing[cat] = {
          engine: primaryModel.engine,
          model: primaryModel.model,
          fallbacks: []
        };

        // Select Fallback #1
        const fallbackChoices = allModels.filter(m => m.engine !== primaryModel.engine || m.model !== primaryModel.model);
        if (fallbackChoices.length > 0) {
          console.log(`\n  Select Fallback #1 model for [${cat}] (optional):`);
          fallbackChoices.forEach((item, i) => {
            const isRec = recommended[cat]?.fallbacks?.[0] && recommended[cat].fallbacks[0].engine === item.engine && recommended[cat].fallbacks[0].model === item.model;
            console.log(`    [${i + 1}] ${item.model} (${item.engine})${isRec ? ' ← Recommended Fallback #1 🔄' : ''}`);
          });

          let fb1Idx = fallbackChoices.findIndex(item => {
            const recFb1 = recommended[cat]?.fallbacks?.[0];
            return recFb1 && item.engine === recFb1.engine && item.model === recFb1.model;
          });
          if (fb1Idx < 0) fb1Idx = 0;

          let fb1Model = null;
          while (true) {
            const ans = await askQuestion(`  Select FALLBACK #1 model for ${cat} [1-${fallbackChoices.length}] (skip: press Enter): `);
            if (ans === '') { break; }
            const p = parseInt(ans, 10);
            if (p >= 1 && p <= fallbackChoices.length) { fb1Model = fallbackChoices[p - 1]; break; }
            console.log(`  ❌ Invalid. Enter 1–${fallbackChoices.length} or press Enter to skip.`);
          }

          if (fb1Model) {
            console.log(`  ✅ Fallback #1: ${fb1Model.model} (${fb1Model.engine})`);
            routing[cat].fallbacks.push({ engine: fb1Model.engine, model: fb1Model.model });

            // Select Fallback #2
            const fallbackChoices2 = fallbackChoices.filter(m => m.engine !== fb1Model.engine || m.model !== fb1Model.model);
            if (fallbackChoices2.length > 0) {
              console.log(`\n  Select Fallback #2 model for [${cat}] (optional):`);
              fallbackChoices2.forEach((item, i) => {
                const isRec = recommended[cat]?.fallbacks?.[1] && recommended[cat].fallbacks[1].engine === item.engine && recommended[cat].fallbacks[1].model === item.model;
                console.log(`    [${i + 1}] ${item.model} (${item.engine})${isRec ? ' ← Recommended Fallback #2 🔄' : ''}`);
              });

              let fb2Model = null;
              while (true) {
                const ans = await askQuestion(`  Select FALLBACK #2 model for ${cat} [1-${fallbackChoices2.length}] (skip: press Enter): `);
                if (ans === '') { break; }
                const p = parseInt(ans, 10);
                if (p >= 1 && p <= fallbackChoices2.length) { fb2Model = fallbackChoices2[p - 1]; break; }
                console.log(`  ❌ Invalid. Enter 1–${fallbackChoices2.length} or press Enter to skip.`);
              }

              if (fb2Model) {
                console.log(`  ✅ Fallback #2: ${fb2Model.model} (${fb2Model.engine})`);
                routing[cat].fallbacks.push({ engine: fb2Model.engine, model: fb2Model.model });
              }
            }
          }
        }
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

// ─── Fix 0: LLM-Powered Planning ─────────────────────────────────────────────

/**
 * Invoke the configured planning engine to generate brainstorming or sprint plans.
 * Uses the orchestrator's runAgent() so failover, logging, and routing all work.
 *
 * @param {string} promptText - The full system prompt to send to the planning LLM
 * @param {object} config     - Loaded imhcode.config.json
 * @param {string} cwd        - Current working directory
 * @returns {string} The LLM output text, or null if unavailable
 */
async function invokePlanningLLM(promptText, config, cwd) {
  // Check if orchestrator is built
  const distPath = path.join(__dirname, '..', 'dist', 'orchestrator', 'index.js');
  if (!fs.existsSync(distPath)) {
    console.warn('  ⚠️  Orchestrator not built. Run "npm run build" in the imhcode package.');
    return null;
  }

  const planningEngine = config?.model_routing?.planning?.engine;
  const planningModel  = config?.model_routing?.planning?.model;

  if (!planningEngine || !planningModel) {
    console.warn('  ⚠️  No planning model configured.');
    console.warn('  Run "imhcode" to set up model routing.');
    return null;
  }

  try {
    const orc       = require(distPath);
    const agentsDir = (() => {
      const g = path.join(GLOBAL_DIR, 'agents');
      if (fs.existsSync(g)) return g;
      const l = path.join(cwd, 'agents');
      if (fs.existsSync(l)) return l;
      const p = path.join(__dirname, '..', 'agents');
      if (fs.existsSync(p)) return p;
      return null;
    })();

    if (!agentsDir) {
      console.warn('  ⚠️  No agents directory found.');
      return null;
    }

    const { agents } = await orc.loadRegistry(agentsDir, cwd);
    const plannerAgent = orc.getAgent(agents, 'planner');

    console.log(`\n  🤖 Invoking planning AI: ${planningModel} via ${planningEngine}...`);

    const result = await orc.runAgent(
      plannerAgent,
      promptText,
      {
        dryRun:    false,
        engine:    planningEngine,
        model:     planningModel,
        outputDir: path.join(cwd, LOCAL_DIR_NAME, 'sessions'),
        cwd,
      }
    );

    if (result.errors.length > 0) {
      console.warn(`  ⚠️  Planning LLM returned errors:`);
      result.errors.forEach(e => console.warn(`      ${e}`));
      // Still return any partial output that was accumulated during failover attempts
      if (result.output && result.output.trim().length > 100) {
        return result.output;
      }
      return null;
    }

    return result.output || null;

  } catch (err) {
    console.warn(`  ⚠️  Planning LLM invocation failed: ${err.message}`);
    return null;
  }
}

// ─── Fix 0 + Fix 3: Brainstorming Generator (LLM-Powered + Professional) ──────

/**
 * Extract scope hints from start.md (backend? mobile? worktrees?)
 */
function extractScopeHints(startContent) {
  const lines = startContent.toLowerCase();

  const needsBackend = (() => {
    const m = startContent.match(/do you need a backend.*?\n>\s*\*\*Answer:\*\*\s*(.+)/i);
    if (m) {
      const ans = m[1].toLowerCase().trim();
      return !ans.startsWith('no');
    }
    // Infer from description
    return /backend|api|database|server|laravel|django|fastapi|express|spring/i.test(lines);
  })();

  const needsMobile = (() => {
    const m = startContent.match(/do you need a mobile.*?\n>\s*\*\*Answer:\*\*\s*(.+)/i);
    if (m) {
      const ans = m[1].toLowerCase().trim();
      return ans.startsWith('yes');
    }
    return /mobile|flutter|ios|android|react native|expo/i.test(lines);
  })();

  return { needsBackend, needsMobile };
}

async function generateBrainstormingDoc(cwd, userPrompt, scopeHints, config) {
  const { needsBackend, needsMobile } = scopeHints || {};

  // Build the LLM prompt for brainstorming
  const llmPrompt = `You are the IMH-Code Planner — an expert software architect and technical product manager.

Your task is to analyze the following project description and generate a comprehensive, professional brainstorming document in Markdown format.

## Project Description

${userPrompt}

## Scope Hints
- Backend required: ${needsBackend ? 'YES' : 'NO'}
- Mobile required:  ${needsMobile  ? 'YES' : 'NO'}

## Instructions

Generate 25-35 smart, project-specific brainstorming questions with intelligent recommended answers. The questions must be:
1. **Tailored to this exact project** — not generic
2. **Professional and thorough** — cover all aspects a senior engineer would consider
3. **Formatted exactly** as shown below

### Required Sections (include all that apply based on scope):

1. **General Requirements** — goals, users, scale, timeline, success metrics
2. **Frontend** (ALWAYS include if web app) — must include:
   - Framework choice (Next.js / Vue 3+Nuxt / React+Vite / SvelteKit)
   - UI component library (shadcn/ui / Radix / Chakra / Mantine / custom)
   - **Color palette style** (Vibrant SaaS / Dark Premium / Minimal Neutral / Pastel Soft / Corporate Blue / Bold Brand)
   - **Design aesthetic** (Glassmorphism / Neumorphism / Brutalism / Claymorphism / Minimalist Clean / Modern SaaS)
   - **Typography preference** (Modern sans-serif like Inter / Serif editorial / Mono-accented / System fonts)
   - **Animation preference** (GSAP ScrollTrigger / Framer Motion / CSS transitions / None)
   - Dark mode strategy (system/toggle/always dark/light only)
   - Mobile responsive approach (mobile-first / desktop-first / equal)
   - **Git worktree snapshots** per sprint? (yes / no — creates .worktrees/ for branch snapshots)
   - Accessibility level (WCAG AA / basic / none)
3. **Backend** (only if needsBackend=YES) — framework, database, auth, API style, real-time, payments, file uploads, rate limiting
4. **Mobile** (only if needsMobile=YES) — platform, framework, offline support, push notifications
5. **Deployment** — platform, Docker, CI/CD, CDN
6. **Testing Strategy** — Fast/Balanced/Strict TDD, testing timing
7. **Security** — audit timing, OWASP, compliance needs
8. **SEO** (if web) — requirements, timing

### CRITICAL Format — each question MUST follow this exact format:

**Q[N]: [Question text]?**
> **Recommended:** [Smart, specific recommendation based on the project]
> **Your Answer:** *(edit if needed)*

### Output

Output ONLY the Markdown content. Start with:
# 🧠 IMH-Code — Project Brainstorming

Do NOT include any preamble, explanation, or commentary outside the Markdown document.`;

  const brainstormPath = path.join(cwd, BRAINSTORM_MD);
  const mtimeBefore = fs.existsSync(brainstormPath) ? fs.statSync(brainstormPath).mtimeMs : 0;

  // Try LLM first (Fix 0)
  const llmOutput = await invokePlanningLLM(llmPrompt, config, cwd);

  const fileCreatedOrModified = (() => {
    if (!fs.existsSync(brainstormPath)) return false;
    const mtimeAfter = fs.statSync(brainstormPath).mtimeMs;
    return mtimeAfter > mtimeBefore;
  })();

  if (fileCreatedOrModified) {
    console.log(`\n  ✅ Brainstorming document created/modified directly by the planning agent.`);
  } else {
    let content;
    if (llmOutput && llmOutput.trim().length > 200) {
      // Ensure it starts correctly
      content = llmOutput.trim();
      if (!content.startsWith('#')) {
        content = `# 🧠 IMH-Code — Project Brainstorming\n\n` + content;
      }
      content += `\n\n---\n\n*Generated by ${PLATFORM_NAME} planning AI — ${new Date().toLocaleDateString()}*\n`;
      content += `\n*When ready, run \`imhcode plan\` to generate sprint plans from your answers.*\n`;
      console.log(`\n  ✅ Brainstorming document generated by planning AI (${config?.model_routing?.planning?.model || 'LLM'})`);
      
      fs.mkdirSync(path.join(cwd, DOCS_DIR), { recursive: true });
      fs.writeFileSync(brainstormPath, content, 'utf8');
    } else {
      console.error('\n❌ Error: LLM brainstorming document generation failed or returned empty output.');
      console.error('   Please check your model limits/API keys and re-run "imhcode plan".');
      process.exit(1);
    }
  }
}

/**
 * Fix 3: Professional static brainstorming fallback (used when LLM unavailable)
 */
function generateStaticBrainstorming(userPrompt, scopeHints) {
  const { needsBackend, needsMobile } = scopeHints || {};
  const p = userPrompt.toLowerCase();

  const hasFrontend = true; // Always assume frontend
  const defaultFrontend = p.includes('vue') ? 'Vue 3 + Nuxt 4' : p.includes('react') && !p.includes('next') ? 'React + Vite' : 'Next.js 15';
  const defaultBackend  = p.includes('python') || p.includes('django') ? 'Python / FastAPI' :
                           p.includes('java') ? 'Java / Spring Boot' : 'Laravel 11';

  return `# 🧠 IMH-Code — Project Brainstorming

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

**Q4: What is the timeline goal?**
> **Recommended:** MVP in 2-4 sprints (4-8 weeks)
> **Your Answer:** *(edit if needed)*

**Q5: What are the key success metrics?**
> **Recommended:** User signups, feature completion, performance benchmarks
> **Your Answer:** *(edit if needed)*

---

## 🎨 Frontend

**Q6: Which frontend framework?**
> **Recommended:** ${defaultFrontend}
> **Your Answer:** *(edit if needed)*

**Q7: UI component library?**
> **Recommended:** shadcn/ui + Tailwind CSS v4
> **Your Answer:** *(shadcn/ui / Radix / Chakra / Mantine / custom)*

**Q8: Color palette style?**
> **Recommended:** Dark Premium (deep backgrounds with vibrant accents)
> **Your Answer:** *(Vibrant SaaS / Dark Premium / Minimal Neutral / Pastel Soft / Corporate Blue / Bold Brand)*

**Q9: Design aesthetic / style?**
> **Recommended:** Modern SaaS (glassmorphism elements, clean cards, subtle gradients)
> **Your Answer:** *(Glassmorphism / Neumorphism / Brutalism / Claymorphism / Minimalist Clean / Modern SaaS)*

**Q10: Typography preference?**
> **Recommended:** Modern sans-serif (Inter + Outfit)
> **Your Answer:** *(Modern sans-serif / Serif editorial / Mono-accented / System fonts)*

**Q11: Animation & interaction style?**
> **Recommended:** Subtle micro-animations (Framer Motion for components, CSS transitions)
> **Your Answer:** *(GSAP ScrollTrigger / Framer Motion / CSS transitions / None)*

**Q12: Dark mode strategy?**
> **Recommended:** System preference + manual toggle
> **Your Answer:** *(system toggle / always dark / light only)*

**Q13: Mobile responsive approach?**
> **Recommended:** Mobile-first responsive design
> **Your Answer:** *(mobile-first / desktop-first / equal)*

**Q14: Git worktree snapshots per sprint?**
> **Recommended:** Yes (creates .worktrees/ for branch snapshots at each sprint)
> **Your Answer:** *(yes / no)*

**Q15: Accessibility level?**
> **Recommended:** WCAG 2.1 AA
> **Your Answer:** *(WCAG AA / basic / none)*

---
${needsBackend ? `
## 🔧 Backend

**Q16: Which backend framework?**
> **Recommended:** ${defaultBackend}
> **Your Answer:** *(edit if needed)*

**Q17: Database?**
> **Recommended:** PostgreSQL + Redis (caching)
> **Your Answer:** *(edit if needed)*

**Q18: Authentication system?**
> **Recommended:** JWT tokens + email verification
> **Your Answer:** *(JWT / session / OAuth / other)*

**Q19: API architecture?**
> **Recommended:** RESTful API with versioning (/api/v1)
> **Your Answer:** *(REST / GraphQL / both)*

**Q20: File uploads?**
> **Recommended:** Yes (S3-compatible storage)
> **Your Answer:** *(yes / no)*

**Q21: Real-time features?**
> **Recommended:** No (for MVP)
> **Your Answer:** *(yes — specify / no)*

**Q22: Payment integration?**
> **Recommended:** No (for MVP)
> **Your Answer:** *(yes — specify provider / no)*

**Q23: Rate limiting & API security?**
> **Recommended:** Yes (throttle 60 req/min per IP, API key auth for external)
> **Your Answer:** *(yes / no)*

---
` : ''}
${needsMobile ? `
## 📱 Mobile

**Q24: Target platforms?**
> **Recommended:** iOS + Android (cross-platform)
> **Your Answer:** *(iOS only / Android only / both)*

**Q25: Mobile framework?**
> **Recommended:** Flutter
> **Your Answer:** *(Flutter / React Native / both)*

**Q26: Offline support?**
> **Recommended:** No (for MVP)
> **Your Answer:** *(yes / no)*

**Q27: Push notifications?**
> **Recommended:** Yes (Firebase Cloud Messaging)
> **Your Answer:** *(yes / no)*

---
` : ''}

## 🚀 Deployment

**Q28: Deployment platform?**
> **Recommended:** Vercel (frontend) + Railway or DigitalOcean (backend)
> **Your Answer:** *(edit if needed)*

**Q29: Docker containerization?**
> **Recommended:** Yes
> **Your Answer:** *(yes / no)*

**Q30: CI/CD pipeline?**
> **Recommended:** GitHub Actions
> **Your Answer:** *(yes / no)*

---

## 🧪 Testing Strategy

**Q31: How should testing be handled?**

Options:
- **[A] Fast Mode (Recommended for MVPs)** — No testing during dev sprints. Final sprint handles all testing, security, SEO, browser testing. 3-5x faster.
- **[B] Balanced Mode** — Basic smoke tests per sprint. Full test suite at end.
- **[C] Strict TDD Mode** — Red-Green-Refactor on every task. Healthcare/finance only.

> **Recommended:** A (Fast Mode)
> **Your Answer:** A *(change to B or C if needed)*

---

## 🔒 Security

**Q32: Security audit timing?**
> **Recommended:** Final sprint only (OWASP Top 10 + dependency scan)
> **Your Answer:** *(final sprint only / every sprint)*

---

## 🌐 SEO

**Q33: SEO requirements?**
> **Recommended:** Technical SEO in final sprint (meta tags, Core Web Vitals, structured data)
> **Your Answer:** *(final sprint only / every sprint / not needed)*

---

## 📝 Additional Notes

Write any additional requirements, constraints, or preferences here:

> *(Your notes here)*

---

*When ready, run \`imhcode plan\` to generate sprint plans from your answers.*
`;
}

// ─── Fix 0 + Fix 5: Sprint Plan Generator (LLM-Powered + Stack-Aware) ─────────

async function generateSprintPlans(cwd, userPrompt, brainstormContent, config) {
  // Parse answers from brainstorming
  // Resolve keys dynamically to handle shifts in question numbering (Fix scope & design bugs)
  const keyTesting = resolveQuestionKey(brainstormContent, ['testing']);
  const keyQ8 = resolveQuestionKey(brainstormContent, ['color palette']);
  const keyQ9 = resolveQuestionKey(brainstormContent, ['design aesthetic']);
  const keyQ12 = resolveQuestionKey(brainstormContent, ['dark mode']);
  const keyQ14 = resolveQuestionKey(brainstormContent, ['worktree']);
  const keyQ16 = resolveQuestionKey(brainstormContent, ['backend framework']);
  const keyQ21 = resolveQuestionKey(brainstormContent, ['real-time']);
  const keyQ22 = resolveQuestionKey(brainstormContent, ['payment']);
  const keyQ25 = resolveQuestionKey(brainstormContent, ['mobile framework']);

  const testingModeRaw = extractAnswer(brainstormContent, keyTesting, 'A').trim().toUpperCase().charAt(0);
  const detectedTesting = testingModeRaw === 'B' ? 'balanced' : testingModeRaw === 'C' ? 'strict' : 'fast';

  const ansQ8  = extractAnswer(brainstormContent, keyQ8, 'Dark Premium').trim();
  const ansQ9  = extractAnswer(brainstormContent, keyQ9, 'Modern SaaS').trim();
  const ansQ12 = extractAnswer(brainstormContent, keyQ12, 'system toggle').toLowerCase();
  const ansQ14 = extractAnswer(brainstormContent, keyQ14, 'no').toLowerCase();
  const ansQ16 = extractAnswer(brainstormContent, keyQ16, 'no').toLowerCase();
  const ansQ21 = extractAnswer(brainstormContent, keyQ21, 'no').toLowerCase();
  const ansQ22 = extractAnswer(brainstormContent, keyQ22, 'no').toLowerCase();
  const ansQ25 = extractAnswer(brainstormContent, keyQ25, 'no').toLowerCase();

  const hasFrontend = true; // Always assume frontend

  // Robust scope detection: only true if user answer is not "no", "none", or standard default fallback placeholder
  const hasBackend = (() => {
    if (ansQ16.includes('no') || ansQ16.includes('none') || ansQ16.includes('edit if needed') || ansQ16.trim() === '') {
      return false;
    }
    return true;
  })();

  const hasMobile = (() => {
    if (ansQ25.includes('no') || ansQ25.includes('none') || ansQ25.includes('edit if needed') || ansQ25.trim() === '') {
      return false;
    }
    return true;
  })();

  const needsWorktrees = ansQ14.includes('yes') || ansQ14.includes('true');
  const hasPayments    = !ansQ22.includes('no') && !ansQ22.includes('none') && !ansQ22.includes('edit if needed') && ansQ22.trim().length > 0;
  const hasRealtime    = !ansQ21.includes('no') && !ansQ21.includes('none') && !ansQ21.includes('edit if needed') && ansQ21.trim().length > 0;

  const designStyle = ansQ9.replace(/\*\(.*?\)\*/g, '').trim() || 'Modern SaaS';
  const colorStyle  = ansQ8.replace(/\*\(.*?\)\*/g, '').trim() || 'Dark Premium';
  const darkmode    = ansQ12.replace(/\*\(.*?\)\*/g, '').trim() || 'system toggle';

  // Save testing mode to config
  if (config) {
    config.testing_mode = detectedTesting;
    const configPath = path.join(cwd, CONFIG_FILE);
    try { fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8'); } catch {}
  }

  // Create workspace directories lazily (only worktrees since it's a layout helper, NOT frontend/backend which must remain empty for official CLI scaffolding)
  if (needsWorktrees) {
    const wtDir = path.join(cwd, '.worktrees');
    if (!fs.existsSync(wtDir)) {
      fs.mkdirSync(wtDir, { recursive: true });
      console.log(`  📁 Created .worktrees/ (git worktree snapshots enabled)`);
    }
  }

  // Generate PROJECT_BRIEF.md
  const briefContent = generateProjectBrief(userPrompt, brainstormContent, {
    hasFrontend, hasBackend, hasMobile, designStyle, colorStyle, darkmode, detectedTesting
  });
  fs.writeFileSync(path.join(cwd, BRIEF_MD), briefContent, 'utf8');
  console.log(`  ✅ Created PROJECT_BRIEF.md`);

  // Try LLM-powered sprint generation first (Fix 0)
  const assetsSummary = getAssetsSummary(cwd);
  const llmSprintResult = await tryLLMSprintGeneration(
    cwd, userPrompt, brainstormContent, config,
    { hasFrontend, hasBackend, hasMobile, hasPayments, hasRealtime, designStyle, colorStyle, darkmode, detectedTesting, needsWorktrees, assetsSummary }
  );

  let lastSprintNum;

  if (llmSprintResult) {
    console.log(`  ✅ Sprint plans generated by planning AI`);
    lastSprintNum = llmSprintResult.sprintCount;
  } else {
    console.error('\n❌ Error: LLM sprint plans generation failed or returned empty output.');
    console.error('   Please check your model limits/API keys and re-run "imhcode plan".');
    process.exit(1);
  }

  // Auto-generate testing sprint if fast/balanced mode
  if (detectedTesting !== 'strict') {
    const testingSprintNum = lastSprintNum + 1;
    await generateTestingSprint(cwd, testingSprintNum, hasFrontend, hasBackend, config);
    console.log(`  ✅ Created Testing Sprint ${testingSprintNum} (security + SEO + E2E)`);
  }

  // Update compact context
  const contextContent = buildContextContent(userPrompt, {
    hasFrontend, hasBackend, hasMobile, detectedTesting, lastSprintNum, designStyle, colorStyle, darkmode
  });
  fs.mkdirSync(path.join(cwd, LOCAL_DIR_NAME), { recursive: true });
  fs.writeFileSync(path.join(cwd, CONTEXT_MD), contextContent, 'utf8');
  console.log(`  ✅ Created .imhcode/context.md`);
}

/**
 * Attempt LLM-generated sprint plans. Returns { sprintCount } on success, null on failure.
 */
async function tryLLMSprintGeneration(cwd, userPrompt, brainstormContent, config, scope) {
  const { hasFrontend, hasBackend, hasMobile, hasPayments, hasRealtime, designStyle, colorStyle, darkmode, detectedTesting, assetsSummary } = scope;

  const agentList = [
    'planner (planning)', 'designer (frontend)', 'nextjs-executor (frontend)', 'react-executor (frontend)',
    'vue-executor (frontend)', 'laravel-executor (backend)', 'python-executor (backend)',
    'java-executor (backend)', 'flutter-executor (backend)', 'react-native-executor (backend)',
    'ios-executor (backend)', 'android-executor (backend)', 'systems-executor (backend)',
    'web3-executor (backend)', 'devops-executor (backend)', 'tester (testing)',
    'security-auditor (testing)', 'seo-optimizer (review)', 'debugger (review)',
  ].join('\n  ');

  const modelRouting = config?.model_routing || {};
  const routingContext = Object.entries(modelRouting).map(([cat, r]) =>
    `  ${cat}: ${r?.model} via ${r?.engine}`
  ).join('\n');

  const llmPrompt = `You are the IMH-Code Sprint Planner — an expert software architect.

Generate a complete sprint plan for the following project. Output ONLY valid JSON, nothing else.

## Project Description
${userPrompt}

## Brainstorming Answers
${brainstormContent}

## Shared Assets & References
${assetsSummary || 'None'}

## Scope
- Frontend: ${hasFrontend ? 'YES' : 'NO'} (Design style: ${designStyle}, Colors: ${colorStyle}, Dark Mode Strategy: ${darkmode})
- Backend:  ${hasBackend  ? 'YES' : 'NO'}
- Mobile:   ${hasMobile   ? 'YES' : 'NO'}
- Payments: ${hasPayments ? 'YES' : 'NO'}
- Realtime: ${hasRealtime ? 'YES' : 'NO'}
- Testing:  ${detectedTesting}

## Available Agents
  ${agentList}

## Model Routing (each agent will use its category model)
${routingContext}

## Output Format

Return ONLY this JSON structure (no markdown, no explanation):

{
  "sprints": [
    {
      "num": 1,
      "title": "Foundation & Setup",
      "tasks": [
        {
          "num": 1,
          "task": "Detailed task description that a senior engineer would understand",
          "agent": "agent-id",
          "tier": "light|standard|complex",
          "deps": []
        }
      ]
    }
  ]
}

## Rules
1. Generate 2-4 sprints based on project complexity (NOT counting the testing sprint)
2. Sprint 1 = Foundation (project setup, DB schema, auth, design system)
3. Sprint 2 = Core Features (main functionality)
4. Sprint 3+ = Additional features, integrations (only if needed)
5. Task descriptions must be SPECIFIC to this project, not generic
6. Choose the RIGHT agent for each task:
   - nextjs-executor/react-executor/vue-executor/designer → frontend tasks
   - laravel-executor/python-executor/java-executor → backend tasks
   - devops-executor → infrastructure, Docker, CI/CD
   - planner → complex planning/architecture tasks
7. Respect dependencies (dep task numbers that must complete first)
8. Max 6 tasks per sprint for clean execution
9. If design style is Glassmorphism/Neumorphism — include a designer task for design tokens in Sprint 1
10. If payments needed — include payment integration task in a sprint
11. If realtime needed — include WebSocket/SSE task in a sprint
12. Under Frontend, STRICTLY respect the Dark Mode Strategy: if strategy is "light only", do NOT generate any dark mode setups, variables, toggles or dark styles. If strategy is "always dark", design the UI strictly for dark backgrounds.
13. If any shared assets or references are listed under "Shared Assets & References" (such as a backend folder, frontend theme components, config files, or stylesheets), you MUST generate sprint tasks that explicitly guide the agents to review, copy, integrate, or take implementation experience from these reference assets to build the new frontend/backend.
14. When designing tasks for backend/frontend scaffolding, instruct the agents to use the LATEST stable dependencies, commands, and coding styles, starting by running the official command-line initializers (like npx create-next-app@latest or composer create-project laravel/laravel) directly in the target directories to build a clean architecture structure.`;

  const sprintDirsBefore = fs.existsSync(path.join(cwd, DOCS_DIR))
    ? fs.readdirSync(path.join(cwd, DOCS_DIR)).filter(f => f.startsWith('sprint-'))
    : [];
  const projectBriefMtimeBefore = fs.existsSync(path.join(cwd, 'PROJECT_BRIEF.md'))
    ? fs.statSync(path.join(cwd, 'PROJECT_BRIEF.md')).mtimeMs
    : 0;

  const llmOutput = await invokePlanningLLM(llmPrompt, config, cwd);

  const sprintsCreated = (() => {
    if (!fs.existsSync(path.join(cwd, DOCS_DIR))) return false;
    const dirsAfter = fs.readdirSync(path.join(cwd, DOCS_DIR)).filter(f => f.startsWith('sprint-'));
    if (dirsAfter.length > sprintDirsBefore.length) return true;
    
    // Check PROJECT_BRIEF.md
    if (fs.existsSync(path.join(cwd, 'PROJECT_BRIEF.md'))) {
      const briefMtimeAfter = fs.statSync(path.join(cwd, 'PROJECT_BRIEF.md')).mtimeMs;
      if (briefMtimeAfter > projectBriefMtimeBefore) return true;
    }
    return false;
  })();

  if (sprintsCreated) {
    const sprintCount = fs.readdirSync(path.join(cwd, DOCS_DIR)).filter(f => f.startsWith('sprint-')).length;
    console.log(`\n  ✅ Sprint plans created/modified directly by the planning agent.`);
    return { sprintCount };
  }

  if (!llmOutput) return null;

  // Parse JSON from LLM output
  let parsed;
  try {
    // Strip markdown code fences if present
    const cleaned = llmOutput.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    parsed = JSON.parse(cleaned);
  } catch (err) {
    // Try to extract JSON object from the output
    const jsonMatch = llmOutput.match(/\{[\s\S]*"sprints"[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn('  ⚠️  Planning AI returned non-JSON output — falling back to static template');
      return null;
    }
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      console.warn('  ⚠️  Could not parse planning AI JSON — falling back to static template');
      return null;
    }
  }

  if (!parsed?.sprints?.length) return null;

  // Generate sprint files from LLM-provided structure
  for (const sprint of parsed.sprints) {
    await generateSprint(cwd, sprint.num, sprint.title, sprint.tasks, detectedTesting, config);
    console.log(`  ✅ Created Sprint ${sprint.num}: ${sprint.title} (${sprint.tasks.length} tasks)`);
  }

  return { sprintCount: parsed.sprints.length };
}

/**
 * Fix 5: Smart static sprint plan generator (fallback when LLM unavailable)
 * Generates tailored sprints based on detected scope.
 */
async function generateStaticSprintPlans(cwd, scope, config) {
  const { hasFrontend, hasBackend, hasMobile, hasPayments, hasRealtime, designStyle, colorStyle, detectedTesting } = scope;

  const frontendAgent = 'nextjs-executor';
  const backendAgent  = hasBackend ? 'laravel-executor' : 'python-executor';

  const needsDesignSprint = /glassmorphism|neumorphism|brutalism|claymorphism/i.test(designStyle);

  let sprintNum = 1;
  const sprints = [];

  // Sprint 1: Foundation
  const sprint1Tasks = [
    { task: 'Initialize monorepo structure, configure environments (.env, Docker compose, GitHub Actions skeleton)', agent: 'devops-executor', tier: 'light', deps: [] },
    ...(hasBackend ? [
      { task: `Design and implement database schema with migrations for core entities. Set up ${/laravel/i.test(backendAgent) ? 'Eloquent models' : 'ORM models'} with relationships, indexes, and seed factories`, agent: backendAgent, tier: 'standard', deps: [1] },
      { task: 'Implement full authentication system: user registration, login, logout, password reset, email verification, JWT/session management', agent: backendAgent, tier: 'complex', deps: [2] },
    ] : []),
    ...(needsDesignSprint ? [
      { task: `Design system tokens: ${colorStyle} color palette, typography scale, spacing system, ${designStyle} component patterns (glassmorphism/shadows/borders). Generate CSS custom properties and Tailwind config`, agent: 'designer', tier: 'standard', deps: [1] },
    ] : []),
    ...(hasFrontend ? [
      { task: `Set up ${frontendAgent.replace('-executor', '')} project with shadcn/ui, Tailwind CSS v4, ${needsDesignSprint ? designStyle + ' design tokens,' : ''} ESLint, Prettier, and base layout components`, agent: frontendAgent, tier: 'standard', deps: [1] },
      { task: 'Build authentication UI pages: login, register, forgot password, email verification. Connect to backend auth API with error handling and loading states', agent: frontendAgent, tier: 'standard', deps: hasBackend ? [3, needsDesignSprint ? 4 : 4] : [needsDesignSprint ? 4 : 4] },
    ] : []),
  ];
  sprints.push({ num: sprintNum++, title: 'Foundation & Setup', tasks: sprint1Tasks });

  // Sprint 2: Core Features
  const sprint2Tasks = [
    ...(hasBackend ? [
      { task: 'Build main REST API endpoints for core business logic. Include request validation, error responses, pagination, and comprehensive API documentation', agent: backendAgent, tier: 'complex', deps: [] },
      { task: 'Implement user profile, settings management, role-based permissions, and admin panel endpoints', agent: backendAgent, tier: 'standard', deps: [1] },
    ] : []),
    ...(hasFrontend ? [
      { task: 'Build main dashboard layout: sidebar navigation, header with user menu, breadcrumbs, responsive grid. Implement route structure and page transitions', agent: frontendAgent, tier: 'standard', deps: [] },
      { task: 'Implement core feature pages and reusable data components (tables, forms, modals, filters). Connect to backend APIs with optimistic UI updates', agent: frontendAgent, tier: 'complex', deps: [hasBackend ? 3 : 1] },
      { task: 'Build user settings, profile management, and notification preference pages. Implement theme toggle and responsive mobile navigation', agent: frontendAgent, tier: 'standard', deps: [hasBackend ? 4 : 2] },
    ] : []),
  ];
  sprints.push({ num: sprintNum++, title: 'Core Features', tasks: sprint2Tasks });

  // Sprint 3: Advanced Features (if payments, realtime, or mobile needed)
  const sprint3Tasks = [];
  if (hasPayments) {
    sprint3Tasks.push({ task: 'Integrate Stripe payment processing: subscription plans, checkout flow, webhooks for payment events, billing portal, invoice management', agent: backendAgent, tier: 'complex', deps: [] });
    if (hasFrontend) {
      sprint3Tasks.push({ task: 'Build pricing page, checkout UI with Stripe Elements, subscription management dashboard, billing history', agent: frontendAgent, tier: 'complex', deps: [1] });
    }
  }
  if (hasRealtime) {
    sprint3Tasks.push({ task: 'Implement WebSocket/SSE real-time features: live data updates, presence indicators, notification broadcasting. Set up Redis pub/sub', agent: backendAgent, tier: 'complex', deps: [] });
    if (hasFrontend) {
      sprint3Tasks.push({ task: 'Build real-time UI components: live activity feed, online users indicator, real-time notifications toast system', agent: frontendAgent, tier: 'standard', deps: [hasPayments ? 2 : 1] });
    }
  }
  if (hasMobile) {
    sprint3Tasks.push({ task: 'Build core mobile screens: auth flow, home/dashboard, main feature screens. Set up navigation, state management, and API integration', agent: 'flutter-executor', tier: 'complex', deps: [] });
    sprint3Tasks.push({ task: 'Implement push notifications, offline support, biometric auth, and app store metadata preparation', agent: 'flutter-executor', tier: 'standard', deps: [sprint3Tasks.length] });
  }
  if (sprint3Tasks.length > 0) {
    sprints.push({ num: sprintNum++, title: 'Advanced Features', tasks: sprint3Tasks });
  }

  // Generate all sprint files
  for (const sprint of sprints) {
    await generateSprint(cwd, sprint.num, sprint.title, sprint.tasks, detectedTesting, config);
    console.log(`  ✅ Created Sprint ${sprint.num}: ${sprint.title} (${sprint.tasks.length} tasks)`);
  }

  return sprintNum - 1; // last sprint number
}

// ─── Fix 0b Part B: Sprint File Generator (injects --engine/--model) ──────────

async function generateSprint(cwd, sprintNum, title, tasks, testingMode, config) {
  const sprintDir = path.join(cwd, DOCS_DIR, `sprint-${sprintNum}`);
  fs.mkdirSync(sprintDir, { recursive: true });
  const tasksDir  = path.join(cwd, LOCAL_DIR_NAME, 'commands', `sprint-${sprintNum}`);
  fs.mkdirSync(tasksDir, { recursive: true });

  const tddNote = testingMode === 'strict'   ? '**Testing Mode: Strict TDD** — Write failing tests first, then implement.' :
                   testingMode === 'balanced' ? '**Testing Mode: Balanced** — Add basic smoke tests per task.' :
                   '**Testing Mode: Fast** — No tests during this sprint. Final sprint handles all testing.';

  // plan.md
  let planMd = `# Sprint ${sprintNum}: ${title}

> ${tddNote}

## Task Table

| # | Task | Agent | Category | Model | Tier | Depends On |
|---|------|-------|----------|-------|------|-----------|
${tasks.map((t, i) => {
  const cat   = getAgentCategory(t.agent);
  const model = config?.model_routing?.[cat]?.model || t.agent;
  return `| ${i+1} | ${t.task} | \`${t.agent}\` | ${cat} | ${model} | ${t.tier} | ${t.deps?.length ? t.deps.join(', ') : '—'} |`;
}).join('\n')}

## Sprint Goals
- Complete all ${tasks.length} tasks in dependency order
- Each task uses its category-optimized AI model
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
${tasks.map((t, i) => `- [ ] Task ${i+1}: ${t.task} [\`${t.agent}\`]`).join('\n')}
`;
  fs.writeFileSync(path.join(sprintDir, 'progress.md'), progressMd, 'utf8');
  fs.writeFileSync(path.join(sprintDir, 'deferred.md'), `# Sprint ${sprintNum} Deferred Items\n\nNone yet.\n`, 'utf8');

  // Fix 0b Part B: Individual task scripts with --engine/--model injected
  for (let i = 0; i < tasks.length; i++) {
    const t       = tasks[i];
    const taskNum = i + 1;
    const category = getAgentCategory(t.agent);
    const routedEngine = config?.model_routing?.[category]?.engine || '';
    const routedModel  = config?.model_routing?.[category]?.model  || '';

    const engineFlag = routedEngine ? `--engine ${routedEngine}` : '';
    const modelFlag  = routedModel  ? `--model "${routedModel}"` : '';

    const taskDesc = testingMode === 'strict'   ? `[STRICT TDD] ${t.task}: Write failing tests first, then implement.` :
                      testingMode === 'balanced' ? `[BALANCED] ${t.task}: Add basic smoke tests.` :
                      t.task;

    const taskScript = `#!/bin/bash
# IMH-Code — Sprint ${sprintNum} Task ${taskNum}
# Task:   ${t.task}
# Agent:  ${t.agent} (${category})
# Model:  ${routedModel || 'default'} via ${routedEngine || 'default'}
# Tier:   ${t.tier}
CWD="$(cd "$(dirname "\${BASH_SOURCE[0]}")" && pwd)"
cd "$CWD/../../.."

# Check if task is already completed
PROGRESS_FILE="$CWD/../../../docs/sprint-${sprintNum}/progress.md"
if [ -f "$PROGRESS_FILE" ]; then
  if grep -q -e "- \\[[xX]\\] Task ${taskNum}:" "$PROGRESS_FILE"; then
    echo "✅ Task ${taskNum} is already completed. Skipping."
    exit 0
  fi
fi

TASK="${escapeForShell(taskDesc)}"

echo "📋 Running Task ${taskNum}: ${escapeForShell(t.task)}"
echo "   Agent:  ${t.agent}"
echo "   Model:  ${routedModel || 'default'} via ${routedEngine || 'default'}"
echo "   Tier:   ${t.tier}"

if command -v imhcode >/dev/null 2>&1; then
  imhcode agent run ${t.agent} "$TASK" --live ${engineFlag} ${modelFlag} --sprint ${sprintNum} --task ${taskNum}
else
  node "$(npm root -g)/imhcode/bin/imhcode.js" agent run ${t.agent} "$TASK" --live ${engineFlag} ${modelFlag} --sprint ${sprintNum} --task ${taskNum}
fi
`;
    fs.writeFileSync(path.join(tasksDir, `task_${taskNum}.sh`), taskScript, { mode: 0o755 });
  }

  // run_all_tasks.sh
  const masterScript = `#!/bin/bash
# IMH-Code — Sprint ${sprintNum}: ${title}
# Run all tasks in dependency order with correct AI model routing
set -e
CWD="$(cd "$(dirname "\${BASH_SOURCE[0]}")" && pwd)"
TASKS_DIR="$CWD/../../.imhcode/commands/sprint-${sprintNum}"

echo ""
echo "🕌 IMH-Code — Executing Sprint ${sprintNum}: ${title}"
echo "   Tasks: ${tasks.length}"
echo ""

${tasks.map((t, i) => {
  const taskNum = i + 1;
  const category = getAgentCategory(t.agent);
  const model = config?.model_routing?.[category]?.model || 'default';
  return `echo "\\n─────────────────────────────────────────────────────────────"
echo "📋 Task ${taskNum}/${tasks.length}: ${escapeForShell(t.task)}"
echo "   Agent: ${t.agent} → ${model}"
echo "─────────────────────────────────────────────────────────────"
bash "$TASKS_DIR/task_${taskNum}.sh"`;
}).join('\n\n')}

echo ""
echo "✅ Sprint ${sprintNum} complete! All ${tasks.length} tasks executed."
echo "   Run: imhcode execute ${sprintNum + 1}"
echo ""
`;
  fs.writeFileSync(path.join(sprintDir, 'run_all_tasks.sh'), masterScript, { mode: 0o755 });
}

async function generateTestingSprint(cwd, sprintNum, hasFrontend, hasBackend, config) {
  const tasks = [
    ...(hasBackend ? [
      { task: 'Write comprehensive unit tests for all backend API endpoints, service layer, and utility functions. Target 80%+ coverage', agent: 'tester', tier: 'standard', deps: [] },
      { task: 'Write integration tests for core API flows: auth, main CRUD operations, edge cases, and error handling', agent: 'tester', tier: 'complex', deps: [1] },
    ] : []),
    { task: 'Run full security audit: OWASP Top 10, dependency vulnerability scan (npm audit / composer audit), auth testing, SQL injection, XSS checks', agent: 'security-auditor', tier: 'complex', deps: [] },
    ...(hasFrontend ? [
      { task: 'Write Playwright E2E tests covering all critical user flows: registration, login, core features, payment flow (if applicable)', agent: 'tester', tier: 'complex', deps: hasBackend ? [2] : [] },
      { task: 'Run SEO audit: Core Web Vitals (LCP, CLS, INP), meta tags, structured data, sitemap.xml, robots.txt, Open Graph tags', agent: 'seo-optimizer', tier: 'standard', deps: [] },
      { task: 'Run accessibility audit (WCAG 2.1 AA): screen reader compatibility, keyboard navigation, color contrast, ARIA labels. Fix all critical issues', agent: 'tester', tier: 'standard', deps: [] },
    ] : []),
    { task: 'Generate final test coverage report. Fix any failing tests. Document known issues in PROJECT_REPORT.md', agent: 'tester', tier: 'standard', deps: [] },
  ];

  await generateSprint(cwd, sprintNum, 'Testing, Security & SEO Audit', tasks, 'fast', config);
}

// ─── Helper Functions ─────────────────────────────────────────────────────────

function generateProjectBrief(userPrompt, brainstormContent, scope) {
  const { hasFrontend, hasBackend, hasMobile, designStyle, colorStyle, detectedTesting } = scope || {};
  return `# PROJECT_BRIEF.md

> **IMH-Code — Imam Hussain Coding Harness Platform**
> This file is the centralized context memory for the project.
> Updated after each sprint by the planner agent.

## Project Summary

${userPrompt}

## Status

- **Current Sprint**: Sprint 1
- **Testing Mode**: ${detectedTesting || 'fast'} (final sprint only)
- **Generated**: ${new Date().toLocaleDateString()}

## Design Specification

- **Design Style**: ${designStyle || 'Modern SaaS'}
- **Color Palette**: ${colorStyle || 'Dark Premium'}

## Scope

- **Frontend**: ${hasFrontend ? '✅ Yes' : '❌ No'}
- **Backend**:  ${hasBackend  ? '✅ Yes' : '❌ No'}
- **Mobile**:   ${hasMobile   ? '✅ Yes' : '❌ No'}

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

function buildContextContent(userPrompt, scope) {
  const { hasFrontend, hasBackend, hasMobile, detectedTesting, designStyle, colorStyle } = scope || {};
  return `# IMH-Code Project Context

Generated: ${new Date().toLocaleDateString()}
Project: ${userPrompt.slice(0, 150)}...
Testing Mode: ${detectedTesting}
Design Style: ${designStyle} / ${colorStyle}

## Stack
${hasFrontend ? '- Frontend: Next.js 15 + shadcn/ui + Tailwind CSS v4' : ''}
${hasBackend  ? '- Backend: Laravel 11 + PostgreSQL + Redis' : ''}
${hasMobile   ? '- Mobile: Flutter' : ''}
- Auth: JWT tokens
- Deployment: Docker + GitHub Actions

## Directory Structure
${hasFrontend ? '- frontend/ — All frontend code' : ''}
${hasBackend  ? '- backend/  — All backend code' : ''}
- docs/     — Sprint plans and documentation

## Current Sprint
Sprint 1 (not started)
`;
}

function extractPromptFromStartMd(content) {
  const match = content.match(/<!-- WRITE_PROMPT_HERE -->([\s\S]*?)<!-- END_PROMPT -->/);
  if (match) return match[1].trim();
  const lines = content.split('\n').filter(l => !l.startsWith('#') && l.trim().length > 0);
  return lines.join(' ').slice(0, 500);
}

function getAssetsSummary(cwd) {
  const assetsDir = path.join(cwd, LOCAL_DIR_NAME, 'assets');
  if (!fs.existsSync(assetsDir)) {
    return 'None';
  }

  const summary = [];
  try {
    const files = fs.readdirSync(assetsDir);
    if (files.length === 0) {
      return 'None';
    }

    for (const file of files) {
      const filePath = path.join(assetsDir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        const subfiles = fs.readdirSync(filePath);
        summary.push(`- Directory \`${file}/\` containing ${subfiles.length} items (e.g. ${subfiles.slice(0, 5).map(f => "\`" + f + "\`").join(', ')}). This contains shared reference code/implementation for this category.`);
      } else {
        const ext = path.extname(file).toLowerCase();
        if (['.txt', '.md', '.json', '.js', '.ts', '.css', '.html', '.php', '.py'].includes(ext)) {
          try {
            const content = fs.readFileSync(filePath, 'utf8').slice(0, 500);
            summary.push(`- File \`${file}\` (\${stat.size} bytes). Preview of contents:\n\`\`\`\n\${content}\n\`\`\``);
          } catch {
            summary.push(`- File \`${file}\` (\${stat.size} bytes).`);
          }
        } else {
          summary.push(`- File \`${file}\` (\${stat.size} bytes) - type: \`\${ext || 'binary'}\`.`);
        }
      }
    }
  } catch (err) {
    return `Error scanning assets: \${err.message}`;
  }

  return summary.join('\n');
}

function resolveQuestionKey(content, keywords) {
  const regex = /\*\*(Q\d+):\s*([^\n*]+)\*\*/gi;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const key = match[1];
    const text = match[2].toLowerCase();
    if (keywords.every(kw => text.includes(kw.toLowerCase()))) {
      return key;
    }
  }
  return null;
}

function extractAnswer(brainstormContent, questionKey, defaultAnswer) {
  if (!questionKey) return defaultAnswer;

  // 1. Extract Your Answer section
  const answerRegex = new RegExp(`\\*\\*${questionKey}.*?\\*\\*Your Answer:?\\*\\*:?\\s*([^\\n\\r*]+)`, 's');
  const matchAnswer = brainstormContent.match(answerRegex);
  
  let answer = '';
  if (matchAnswer) {
    answer = matchAnswer[1].replace(/\*\(.*?\)\*/g, '').trim();
  }
  
  // Clean placeholders
  const isPlaceholder = !answer || 
                        /edit\s+if\s+needed/i.test(answer) || 
                        /your\s+answer/i.test(answer) || 
                        /your\s+notes/i.test(answer);

  if (!isPlaceholder) {
    return answer;
  }
  
  // 2. If it is a placeholder, extract the Recommended answer from the document
  const recommendedRegex = new RegExp(`\\*\\*${questionKey}.*?\\*\\*Recommended:?\\*\\*:?\\s*([^\\n\\r*]+)`, 's');
  const matchRec = brainstormContent.match(recommendedRegex);
  if (matchRec) {
    const recAnswer = matchRec[1].replace(/\*\(.*?\)\*/g, '').trim();
    if (recAnswer) return recAnswer;
  }
  
  return defaultAnswer;
}

function getAgentCategory(agentId) {
  const map = {
    'planner':               'planning',
    'designer':              'frontend',
    'nextjs-executor':       'frontend',
    'react-executor':        'frontend',
    'vue-executor':          'frontend',
    'laravel-executor':      'backend',
    'python-executor':       'backend',
    'java-executor':         'backend',
    'flutter-executor':      'backend',
    'react-native-executor': 'backend',
    'ios-executor':          'backend',
    'android-executor':      'backend',
    'systems-executor':      'backend',
    'web3-executor':         'backend',
    'devops-executor':       'backend',
    'tester':                'testing',
    'security-auditor':      'testing',
    'seo-optimizer':         'review',
    'debugger':              'review',
  };
  return map[agentId] || 'backend';
}

function detectSprintDocs(cwd) {
  const docsDir = path.join(cwd, DOCS_DIR);
  if (!fs.existsSync(docsDir)) return false;
  return fs.readdirSync(docsDir).some(f => /^sprint-\d+$/i.test(f));
}

function isSprintComplete(cwd, sprintNum) {
  const progressPath = path.join(cwd, DOCS_DIR, `sprint-${sprintNum}`, 'progress.md');
  if (!fs.existsSync(progressPath)) return false;
  try {
    const content = fs.readFileSync(progressPath, 'utf8');
    return !/-\s*\[\s*\]/i.test(content);
  } catch {
    return false;
  }
}

function detectCurrentSprint(cwd) {
  const docsDir = path.join(cwd, DOCS_DIR);
  if (!fs.existsSync(docsDir)) return 1;
  
  const sprintNums = [];
  for (const f of fs.readdirSync(docsDir)) {
    const m = f.match(/^sprint-(\d+)$/i);
    if (m) sprintNums.push(parseInt(m[1], 10));
  }
  
  if (sprintNums.length === 0) return 1;
  sprintNums.sort((a, b) => a - b);
  
  for (const num of sprintNums) {
    if (!isSprintComplete(cwd, num)) {
      return num;
    }
  }
  
  return sprintNums[sprintNums.length - 1];
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

function safeRead(filePath) {
  try { return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : null; } catch { return null; }
}

async function updateCompactContext(cwd, completedSprint) {
  const contextPath = path.join(cwd, CONTEXT_MD);
  if (!fs.existsSync(contextPath)) return;
  try {
    let content = fs.readFileSync(contextPath, 'utf8');
    const pattern = /(## Current Sprint\r?\nSprint )\d+\s*(\([^)]*\))?/i;
    if (pattern.test(content)) {
      content = content.replace(pattern, `$1${completedSprint + 1} (not started)`);
    } else {
      content = content.replace(
        /Current Sprint\r?\nSprint \d+ \(not started\)/,
        `Current Sprint\nSprint ${completedSprint + 1} (not started)`
      );
    }
    fs.writeFileSync(contextPath, content, 'utf8');

    // Update PROJECT_BRIEF.md Current Sprint
    const briefPath = path.join(cwd, BRIEF_MD);
    if (fs.existsSync(briefPath)) {
      try {
        let briefContent = fs.readFileSync(briefPath, 'utf8');
        const currentSprintPattern = /(Current Sprint:\s*Sprint\s*)\d+/i;
        if (currentSprintPattern.test(briefContent)) {
          briefContent = briefContent.replace(currentSprintPattern, `$1${completedSprint + 1}`);
          fs.writeFileSync(briefPath, briefContent, 'utf8');
        }
      } catch {}
    }
  } catch { /* non-critical */ }
}

async function markSprintStarted(cwd, sprintNum) {
  const progressPath = path.join(cwd, DOCS_DIR, `sprint-${sprintNum}`, 'progress.md');
  const briefPath = path.join(cwd, BRIEF_MD);

  // 1. Update progress.md
  if (fs.existsSync(progressPath)) {
    try {
      let progressContent = fs.readFileSync(progressPath, 'utf8');
      if (progressContent.includes('Status: 🟡 Not Started')) {
        progressContent = progressContent.replace('Status: 🟡 Not Started', 'Status: 🟢 In Progress');
        const dateStr = new Date().toLocaleString();
        progressContent = progressContent.replace('Start: —', `Start: ${dateStr}`);
        fs.writeFileSync(progressPath, progressContent, 'utf8');
        console.log(`  🔄 Updated sprint progress to: 🟢 In Progress`);
      }
    } catch (err) {
      console.warn(`  ⚠️ Could not update sprint progress.md: ${err.message}`);
    }
  }

  // 2. Update PROJECT_BRIEF.md status
  if (fs.existsSync(briefPath)) {
    try {
      let briefContent = fs.readFileSync(briefPath, 'utf8');
      const rowPattern = new RegExp(`^\\|\\s*${sprintNum}\\s*\\|([^|]+)\\|([^|]+)\\|`, 'm');
      const match = briefContent.match(rowPattern);
      if (match) {
        const currentStatus = match[2].trim();
        if (currentStatus.includes('Not Started') || currentStatus.includes('Pending')) {
          briefContent = updateSprintLogTable(briefContent, sprintNum, '🟢 In Progress');
          
          // Also check if Current Sprint needs updating
          const currentSprintPattern = /(Current Sprint:\s*Sprint\s*)\d+/i;
          if (currentSprintPattern.test(briefContent)) {
            briefContent = briefContent.replace(currentSprintPattern, `$1${sprintNum}`);
          }
          
          fs.writeFileSync(briefPath, briefContent, 'utf8');
          console.log(`  🔄 Updated PROJECT_BRIEF.md sprint ${sprintNum} status to: 🟢 In Progress`);
        }
      }
    } catch (err) {
      console.warn(`  ⚠️ Could not update PROJECT_BRIEF.md: ${err.message}`);
    }
  }

  // 3. Update context.md status
  await updateContextSprintStatus(cwd, sprintNum, 'in progress');
}

async function markTaskCompleted(cwd, sprintNum, taskNum) {
  const progressPath = path.join(cwd, DOCS_DIR, `sprint-${sprintNum}`, 'progress.md');
  const briefPath = path.join(cwd, BRIEF_MD);

  if (!fs.existsSync(progressPath)) return;

  try {
    let progressContent = fs.readFileSync(progressPath, 'utf8');
    const lines = progressContent.split('\n');
    let taskLineIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      const taskPattern = new RegExp(`^-\\s*\\[\\s*\\]\\s*Task\\s*${taskNum}\\b`, 'i');
      if (taskPattern.test(lines[i])) {
        taskLineIndex = i;
        lines[i] = lines[i].replace(/-\s*\[\s*\]/, '- [x]');
        break;
      }
    }

    if (taskLineIndex === -1) {
      console.warn(`  ⚠️ Could not find Task ${taskNum} checkbox in progress.md`);
      return;
    }

    progressContent = lines.join('\n');
    console.log(`  ✅ Marked Task ${taskNum} as completed in progress.md`);

    const incompleteTasksCount = (progressContent.match(/^-\s*\[\s*\]\s*Task\b/gim) || []).length;
    
    if (incompleteTasksCount === 0) {
      progressContent = progressContent.replace(/Status:\s*🟢\s*In\s*Progress/i, 'Status: ✅ Complete');
      progressContent = progressContent.replace(/Status:\s*🟡\s*Not\s*Started/i, 'Status: ✅ Complete');
      
      const dateStr = new Date().toLocaleString();
      progressContent = progressContent.replace('End: —', `End: ${dateStr}`);
      
      console.log(`  🏁 All tasks in Sprint ${sprintNum} completed! Sprint is now ✅ Complete.`);

      if (fs.existsSync(briefPath)) {
        try {
          let briefContent = fs.readFileSync(briefPath, 'utf8');
          briefContent = updateSprintLogTable(briefContent, sprintNum, '✅ Complete');
          fs.writeFileSync(briefPath, briefContent, 'utf8');
          console.log(`  🔄 Updated PROJECT_BRIEF.md sprint ${sprintNum} status to: ✅ Complete`);
        } catch (err) {
          console.warn(`  ⚠️ Could not update PROJECT_BRIEF.md: ${err.message}`);
        }
      }
    }
    
    fs.writeFileSync(progressPath, progressContent, 'utf8');
  } catch (err) {
    console.warn(`  ⚠️ Could not update task progress: ${err.message}`);
  }
}

function updateSprintLogTable(content, sprintNum, newStatus) {
  const lines = content.split('\n');
  let inSprintLog = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('## Sprint Log')) {
      inSprintLog = true;
      continue;
    }
    if (inSprintLog && line.startsWith('#')) {
      inSprintLog = false;
    }
    if (inSprintLog) {
      const match = line.match(new RegExp(`^\\|\\s*${sprintNum}\\s*\\|([^|]+)\\|([^|]+)\\|`));
      if (match) {
        const title = match[1].trim();
        lines[i] = `| ${sprintNum} | ${title} | ${newStatus} |`;
        break;
      }
    }
  }
  return lines.join('\n');
}

async function updateContextSprintStatus(cwd, sprintNum, status) {
  const contextPath = path.join(cwd, CONTEXT_MD);
  if (!fs.existsSync(contextPath)) return;
  try {
    let content = fs.readFileSync(contextPath, 'utf8');
    const pattern = /(## Current Sprint\r?\nSprint \d+)\s*\([^)]*\)/i;
    if (pattern.test(content)) {
      content = content.replace(pattern, `$1 (${status})`);
    } else {
      const simplePattern = /(## Current Sprint\r?\nSprint \d+)/i;
      if (simplePattern.test(content)) {
        content = content.replace(simplePattern, `$1 (${status})`);
      }
    }
    fs.writeFileSync(contextPath, content, 'utf8');
  } catch (err) {
    // non-critical
  }
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function escapeForShell(str) {
  return (str || '')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\`/g, '\\`')
    .replace(/\$/g, '\\$');
}

function askQuestion(query) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(query, ans => { rl.close(); resolve(ans.trim()); }));
}

function scanAssistantCLIs() {
  const engines = {
    claude:   { name: 'Claude Code',          path: resolveBinary('claude',   ['~/.local/bin/claude',  '/usr/local/bin/claude',  '/opt/homebrew/bin/claude']),   models: [], modelsCmd: b => `"${b}" --list-models 2>/dev/null || echo ''` },
    opencode: { name: 'OpenCode',              path: resolveBinary('opencode', ['~/.opencode/bin/opencode', '/usr/local/bin/opencode']),                           models: [], modelsCmd: b => `"${b}" models 2>/dev/null` },
    codex:    { name: 'Codex (OpenAI)',        path: resolveBinary('codex',    ['~/Library/PhpWebStudy/env/node/bin/codex', '/usr/local/bin/codex']),              models: [], modelsCmd: b => `"${b}" debug models 2>/dev/null` },
    'codex-fugu': { name: 'Codex Fugu',       path: resolveBinary('codex-fugu', ['~/.local/bin/codex-fugu', '/usr/local/bin/codex-fugu', '/opt/homebrew/bin/codex-fugu']), models: [], modelsCmd: b => `"${b}" debug models 2>/dev/null || echo ''` },
    agy:      { name: 'Antigravity CLI (agy)', path: resolveBinary('agy',      ['~/.local/bin/agy', '/usr/local/bin/agy', '/opt/homebrew/bin/agy']),               models: [], modelsCmd: b => `"${b}" models 2>/dev/null || echo ''` },
    qwen:     { name: 'QwenCode (qwen)',       path: resolveBinary('qwen',     ['~/.local/bin/qwen', '/usr/local/bin/qwen', '/opt/homebrew/bin/qwen']),            models: [], modelsCmd: b => `"${b}" models 2>/dev/null || echo ''` },
    mimo:     { name: 'MimoCode (mimo)',       path: resolveBinary('mimo',     ['~/.local/bin/mimo', '/usr/local/bin/mimo', '/opt/homebrew/bin/mimo', '~/.mimo/bin/mimo']), models: [], modelsCmd: b => `"${b}" models 2>/dev/null || echo ''` },
  };

  // Scan for agy2, agy3, agy4, etc.
  if (engines.agy.path) {
    const home = os.homedir();
    for (let i = 2; i <= 10; i++) {
      const key = `agy${i}`;
      let customHomeExists = false;
      if (i === 2) {
        customHomeExists = fs.existsSync(path.join(path.dirname(home), 'goharabbas', '.gemini-abbas'));
      } else {
        customHomeExists = fs.existsSync(path.join(path.dirname(home), 'goharabbas', `.gemini-agy${i}`)) ||
                           fs.existsSync(path.join(path.dirname(home), 'goharabbas', `.gemini-${i}`)) ||
                           fs.existsSync(path.join(path.dirname(home), 'goharabbas', `.gemini-abbas${i}`));
      }
      
      const specificBinaryPath = resolveBinary(key, [
        `~/.local/bin/${key}`,
        `/usr/local/bin/${key}`,
        `/opt/homebrew/bin/${key}`,
      ]);

      if (specificBinaryPath || customHomeExists) {
        engines[key] = {
          name: `Antigravity CLI (${key})`,
          path: specificBinaryPath || engines.agy.path,
          models: [],
          modelsCmd: b => `"${b}" models 2>/dev/null || echo ''`
        };
      }
    }
  }

  const fallbackModels = {
    claude: ['claude-sonnet-5', 'claude-fable-5', 'claude-opus-4-8', 'opus', 'sonnet', 'haiku'],
    opencode: ['mimo-vl-v2.5-pro', 'deepseek-v4-pro', 'deepseek-v4-flash', 'gemini-3.5-flash', 'kimi-k2.7-code', 'qwen-3-coder-480b', 'gpt-oss-120b'],
    codex: ['gpt-5.5', 'gpt-5.4-mini', 'gpt-mini'],
    'codex-fugu': ['fugu', 'fugu-ultra'],
    agy: ['claude-opus-4-6', 'gemini-3.5-flash'],
    qwen: ['qwen3-coder-max', 'qwen3-coder-flash'],
    mimo: ['mimo-vl-v2.5-pro', 'mimo-vl-v2.5']
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

    const baseKey = key.startsWith('agy') ? 'agy' : key;
    if (eng.models.length === 0 && fallbackModels[baseKey]) {
      eng.models = fallbackModels[baseKey];
    }
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
    [localBinDir, imhBinDir].forEach(dir => { if (!fs.existsSync(dir)) { try { fs.mkdirSync(dir, { recursive: true }); } catch {} } });

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

function ensureCavemanAndGraphify(skillsAlreadyConfigured) {
  if (skillsAlreadyConfigured) {
    console.log('\n🔍 Token-saving skills already configured globally. Skipping installation checks.');
    return;
  }
  console.log('\n🔍 Checking token-saving skills...');
  let skillsInstalled = false;
  try { execSync('npx --no-install skills --version', { stdio: 'ignore' }); skillsInstalled = true; } catch { /* not installed */ }

  if (!skillsInstalled) {
    console.log('  📦 Installing skills CLI globally...');
    try { execSync('npm install -g skills', { stdio: 'inherit' }); skillsInstalled = true; } catch { console.warn('  ⚠️  Failed to install skills CLI.'); }
  }

  if (skillsInstalled) {
    try { execSync('npx skills add juliusbrussee/caveman', { cwd: GLOBAL_DIR, stdio: 'inherit' }); console.log('  ✅ Caveman compression rules integrated globally'); } catch { /* ignore */ }
    try { execSync('npx skills add juliusbrussee/graphify', { cwd: GLOBAL_DIR, stdio: 'inherit' }); console.log('  ✅ Graphify compression rules integrated globally'); } catch { /* ignore */ }
  }
}

// ─── Phase A & B Upgrade Commands ──────────────────────────────────────────────

async function runModifyCommand(restArgs) {
  const cwd = process.cwd();
  const live = restArgs.includes('--live');
  const agentIdx = restArgs.indexOf('--agent');
  const agent = agentIdx >= 0 ? restArgs[agentIdx + 1] : undefined;
  const engineIdx = restArgs.indexOf('--engine');
  const engine = engineIdx >= 0 ? restArgs[engineIdx + 1] : undefined;
  const modelIdx = restArgs.includes('--model') ? restArgs.indexOf('--model') : restArgs.indexOf('-m');
  const model = modelIdx >= 0 ? restArgs[modelIdx + 1] : undefined;

  const descriptionArgs = [];
  for (let i = 0; i < restArgs.length; i++) {
    const arg = restArgs[i];
    if (arg === '--live') continue;
    if (arg === '--agent' || arg === '--engine' || arg === '--model' || arg === '-m') {
      i++;
      continue;
    }
    descriptionArgs.push(arg);
  }

  const description = descriptionArgs.join(' ').trim();
  if (!description) {
    console.error('❌ Error: Please provide a description for the modification.');
    console.error('   Usage: imhcode modify "description" [--agent <agent>] [--engine <engine>] [-m/--model <model>] [--live]');
    process.exit(1);
  }

  const orc = loadOrchestrator();
  console.log(`\n\uD83D\uDCD7 IMH-Code — Running In-place Modification`);
  const result = await orc.runModification(cwd, description, {
    agent,
    engine,
    model,
    dryRun: !live
  });

  if (result.errors && result.errors.length > 0) {
    console.error(`❌ Modification failed with errors:`, result.errors.join(', '));
    process.exit(1);
  }
}

async function runFixCommand(restArgs) {
  return runModifyCommand(restArgs);
}

async function runFeatureCommand(restArgs) {
  const cwd = process.cwd();
  const live = restArgs.includes('--live');
  
  const descriptionArgs = [];
  for (let i = 0; i < restArgs.length; i++) {
    if (restArgs[i] === '--live') continue;
    descriptionArgs.push(restArgs[i]);
  }

  const description = descriptionArgs.join(' ').trim();
  if (!description) {
    console.error('❌ Error: Please provide a description for the feature.');
    console.error('   Usage: imhcode feature "description"');
    process.exit(1);
  }

  console.log(`\n\uD83D\uDCD7 IMH-Code — Feature Sprint Planner`);
  console.log(`   Feature: "${description}"\n`);

  const config = loadLocalConfig(cwd);
  const orc = loadOrchestrator();
  const scanResult = orc.scanProjectContext(cwd);

  const docsDir = path.join(cwd, DOCS_DIR);
  let nextFeatureNum = 1;
  if (fs.existsSync(docsDir)) {
    try {
      const folders = fs.readdirSync(docsDir);
      for (const f of folders) {
        const m = f.match(/^feature-(\d+)$/i);
        if (m) nextFeatureNum = Math.max(nextFeatureNum, parseInt(m[1], 10) + 1);
      }
    } catch {}
  }

  const promptText = `You are the IMH-Code Planner.
An existing project needs a new feature: "${description}"
Existing Project Stack:
- Frontend: ${scanResult.hasFrontend ? scanResult.frontendFramework : 'None'}
- Backend: ${scanResult.hasBackend ? scanResult.backendFramework : 'None'}
- Directories: ${scanResult.directories.join(', ')}

Design a mini sprint plan with 1-3 tasks to implement this feature.
Output ONLY valid JSON in this format (no explanations, no markdown fences):
{
  "title": "Feature: ${description.replace(/"/g, '\\"')}",
  "tasks": [
    {
      "num": 1,
      "task": "Specific task description",
      "agent": "nextjs-executor|laravel-executor|designer|devops-executor",
      "tier": "light|standard|complex"
    }
  ]
}`;

  console.log(`\uD83E\uDDE0 Invoking Planning LLM...`);
  const llmOutput = await invokePlanningLLM(promptText, config, cwd);

  let parsed;
  if (llmOutput) {
    try {
      const cleaned = llmOutput.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      const jsonMatch = llmOutput.match(/\{[\s\S]*"tasks"[\s\S]*\}/);
      if (jsonMatch) {
        try { parsed = JSON.parse(jsonMatch[0]); } catch {}
      }
    }
  }

  if (!parsed || !parsed.tasks || parsed.tasks.length === 0) {
    console.log(`\u26A0\uFE0F  Could not parse JSON. Falling back to static task plan...`);
    parsed = {
      title: `Feature: ${description}`,
      tasks: [
        { num: 1, task: `Design and implement: ${description}`, agent: scanResult.hasFrontend ? 'nextjs-executor' : 'laravel-executor', tier: 'standard' }
      ]
    };
  }

  await generateFeatureSprint(cwd, nextFeatureNum, parsed.title, parsed.tasks, config);

  console.log(`\n\u2705 Feature sprint planned successfully!`);
  console.log(`   Folder: docs/feature-${nextFeatureNum}/`);
  console.log(`   Tasks planned: ${parsed.tasks.length}`);
  console.log(`\n\uD83D\uDE80 NEXT STEPS:`);
  console.log(`   1. Review the tasks in docs/feature-${nextFeatureNum}/plan.md`);
  console.log(`   2. Run command to execute all feature tasks sequentially:`);
  console.log(`      imhcode execute-feature ${nextFeatureNum}\n`);
}

async function generateFeatureSprint(cwd, featureNum, title, tasks, config) {
  const sprintDir = path.join(cwd, DOCS_DIR, `feature-${featureNum}`);
  fs.mkdirSync(sprintDir, { recursive: true });
  const tasksDir  = path.join(cwd, LOCAL_DIR_NAME, 'commands', `feature-${featureNum}`);
  fs.mkdirSync(tasksDir, { recursive: true });

  let planMd = `# Feature Sprint ${featureNum}: ${title}\n\n## Task Table\n\n| # | Task | Agent | Category | Model | Tier |\n|---|------|-------|----------|-------|------|\n`;
  tasks.forEach((t, i) => {
    const cat = getAgentCategory(t.agent);
    const model = config?.model_routing?.[cat]?.model || 'default';
    planMd += `| ${i+1} | ${t.task} | \`${t.agent}\` | ${cat} | ${model} | ${t.tier} |\n`;
  });
  fs.writeFileSync(path.join(sprintDir, 'plan.md'), planMd, 'utf-8');

  const progressMd = `# Feature Sprint ${featureNum} Progress\n\nStatus: \uD83D\uDDF2 Not Started\nStart: \u2014\nEnd: \u2014\n\n## Tasks\n` + 
    tasks.map((t, i) => `- [ ] Task ${i+1}: ${t.task} [\`${t.agent}\`]`).join('\n') + '\n';
  fs.writeFileSync(path.join(sprintDir, 'progress.md'), progressMd, 'utf-8');
  fs.writeFileSync(path.join(sprintDir, 'deferred.md'), `# Feature Sprint ${featureNum} Deferred Items\n\nNone yet.\n`, 'utf-8');

  for (let i = 0; i < tasks.length; i++) {
    const t = tasks[i];
    const taskNum = i + 1;
    const cat = getAgentCategory(t.agent);
    const routedEngine = config?.model_routing?.[cat]?.engine || '';
    const routedModel  = config?.model_routing?.[cat]?.model  || '';

    const engineFlag = routedEngine ? `--engine ${routedEngine}` : '';
    const modelFlag  = routedModel  ? `--model "${routedModel}"` : '';

    const taskScript = `#!/bin/bash
# IMH-Code — Feature \${featureNum} Task \${taskNum}
CWD="\$(cd "\$(dirname "\\\${BASH_SOURCE[0]}")" && pwd)"
cd "\$CWD/../../.."

PROGRESS_FILE="\$CWD/../../../docs/feature-${featureNum}/progress.md"
if [ -f "\$PROGRESS_FILE" ]; then
  if grep -q -e "- \\\\[xX\\\\] Task \${taskNum}:" "\$PROGRESS_FILE"; then
    echo "\u2705 Task \${taskNum} is already completed. Skipping."
    exit 0
  fi
fi

TASK="${t.task.replace(/"/g, '\\"')}"

echo "\uD83D\uDCCB Running Task \${taskNum}: ${t.task}"
echo "   Agent: ${t.agent}"
echo "   Model: ${routedModel || 'default'} via ${routedEngine || 'default'}"

if command -v imhcode >/dev/null 2>&1; then
  imhcode agent run ${t.agent} "\$TASK" --live ${engineFlag} ${modelFlag}
else
  node "\$(npm root -g)/imhcode/bin/imhcode.js" agent run ${t.agent} "\$TASK" --live ${engineFlag} ${modelFlag}
fi

if [ \$? -eq 0 ]; then
  if [ -f "\$PROGRESS_FILE" ]; then
    sed -i '' "s/- \\\\[ \\\\] Task \${taskNum}:/- [x] Task \${taskNum}:/g" "\$PROGRESS_FILE" 2>/dev/null || sed -i "s/- \\\\[ \\\\] Task \${taskNum}:/- [x] Task \${taskNum}:/g" "\$PROGRESS_FILE"
    echo "\u2705 Marked Task \${taskNum} as completed."
  fi
fi
`;
    fs.writeFileSync(path.join(tasksDir, `task_${taskNum}.sh`), taskScript, { mode: 0o755 });
  }

  const runAllScript = `#!/bin/bash
# IMH-Code — Run Feature Sprint ${featureNum}
set -e
CWD="\$(cd "\$(dirname "\\\${BASH_SOURCE[0]}")" && pwd)"
TASKS_DIR="\$CWD/../../.imhcode/commands/feature-${featureNum}"

echo "\uD83D\uDCD7 IMH-Code — Executing Feature Sprint ${featureNum}"
` + tasks.map((t, i) => `echo "\\n─── Task ${i+1}/${tasks.length} ───"\nbash "\$TASKS_DIR/task_${i+1}.sh"`).join('\n') + `\n\necho "\\n\uD83C\uDFC1 Feature Sprint ${featureNum} completed!"\n`;
  fs.writeFileSync(path.join(sprintDir, 'run_all_tasks.sh'), runAllScript, { mode: 0o755 });
}

async function runExecuteFeatureCommand(restArgs) {
  const cwd = process.cwd();
  const featureNum = parseInt(restArgs[0], 10);
  if (isNaN(featureNum)) {
    console.error('\u274C Error: Please specify a feature number to execute.');
    console.error('   Usage: imhcode execute-feature <number>');
    process.exit(1);
  }

  const scriptPath = path.join(cwd, 'docs', `feature-${featureNum}`, 'run_all_tasks.sh');
  if (!fs.existsSync(scriptPath)) {
    console.error(`\u274C Error: Feature sprint ${featureNum} not found.`);
    process.exit(1);
  }

  try { fs.chmodSync(scriptPath, 0o755); } catch {}
  console.log(`\n\uD83D\uDCD7 IMH-Code — Executing Feature ${featureNum}\n`);
  execSync(`sh "${scriptPath}"`, { stdio: 'inherit', cwd });
}

async function runImportCommand(restArgs) {
  const cwd = process.cwd();
  const targetDir = restArgs[0] ? path.resolve(cwd, restArgs[0]) : cwd;

  console.log(`\n\uD83D\uDCD7 IMH-Code — Importing Codebase`);
  console.log(`   Target Directory: ${targetDir}\n`);

  if (!fs.existsSync(targetDir)) {
    console.error(`\u274C Error: Directory does not exist: ${targetDir}`);
    process.exit(1);
  }

  const orc = loadOrchestrator();
  const result = orc.importProject(targetDir);

  if (result.success) {
    console.log(`\n\u2705 Codebase imported successfully!`);
    console.log(`   Stack detected:`);
    console.log(`     Frontend:  ${result.scanResult.detectedFrontend || 'None'}`);
    console.log(`     Backend:   ${result.scanResult.detectedBackend || 'None'}`);
    console.log(`     Database:  ${result.scanResult.database || 'None'}`);
    console.log(`\n\uD83D\uDCBE Context files generated:`);
    console.log(`     • ${path.join(targetDir, '.imhcode', 'import-map.json')}`);
    console.log(`     • ${path.join(targetDir, 'PROJECT_BRIEF.md')}`);
    console.log(`     • ${path.join(targetDir, '.imhcode', 'context.md')}`);
    console.log(`\n\uD83D\uDE80 You can now run "imhcode modify" or "imhcode feature" inside this directory.`);
  } else {
    console.error(`\u274C Import failed.`);
    process.exit(1);
  }
}

async function runScanCommand(restArgs) {
  const cwd = process.cwd();
  const targetDir = restArgs[0] ? path.resolve(cwd, restArgs[0]) : cwd;

  console.log(`\n\uD83D\uDCD7 IMH-Code — Scanning Codebase`);
  console.log(`   Target Directory: ${targetDir}\n`);

  if (!fs.existsSync(targetDir)) {
    console.error(`\u274C Error: Directory does not exist: ${targetDir}`);
    process.exit(1);
  }

  const orc = loadOrchestrator();
  const scanResult = orc.scanProject(targetDir);

  console.log(`\uD83D\uDD0D Scan Results:`);
  console.log(`   Frontend Stack: ${scanResult.detectedFrontend || 'None'} (Path: ${scanResult.frontendPath || 'N/A'})`);
  console.log(`   Backend Stack:  ${scanResult.detectedBackend || 'None'} (Path: ${scanResult.backendPath || 'N/A'})`);
  console.log(`   Database:       ${scanResult.database || 'None'}`);
  console.log(`   Dockerized:     ${scanResult.dockerized ? 'Yes' : 'No'}`);
  console.log(`   CI/CD Pipelines: ${scanResult.hasCICD ? 'Yes' : 'No'}`);
  console.log('');
}

async function runTuiCommand() {
  const cwd = process.cwd();
  
  // Terminal UI control variables
  let selectedIndex = 0;
  let menuItems = [];
  let inSubMode = false;
  let currentSubMenu = 'main'; // 'main' or 'agents'
  
  // Colors & formatting helper
  const ANSI = {
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    dim: '\x1b[2m',
    italic: '\x1b[3m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    clearScreen: '\x1b[2J\x1b[H',
    hideCursor: '\x1b[?25l',
    showCursor: '\x1b[?25h'
  };

  function buildMenuItems() {
    const state = detectProjectState(cwd);
    
    if (currentSubMenu === 'agents') {
      const agentItems = [
        { id: 'agent_list',    name: 'List Agents',     desc: 'List all 19 role-based agents' },
        { id: 'agent_inspect', name: 'Inspect Agent',    desc: 'Show agent configuration and skills' },
        { id: 'agent_run',     name: 'Run Agent',        desc: 'Execute a single agent manually' },
        { id: 'back',          name: '← Back to Main',   desc: 'Return to the main control center' }
      ];
      return agentItems;
    }
    
    const items = [];
    
    // Step 1: Init
    if (!state.hasConfig) {
      items.push({ id: 'init', name: 'Initialize Project', desc: '⚠️ Setup engines & config (Required)', highlight: true });
    } else {
      items.push({ id: 'init', name: 'Reinitialize Project', desc: 'Scan engines & reconfigure model routing' });
    }

    // Step 2: Requirements
    if (state.hasConfig && !state.hasStart) {
      items.push({ id: 'write', name: 'Write Requirements', desc: '⚠️ Input requirements & scope (Required)', highlight: true });
    } else if (state.hasConfig) {
      items.push({ id: 'write', name: 'Write Requirements', desc: 'Input requirements & scope answers' });
    }

    // Step 3: Plan & Brainstorm
    if (state.hasStart && !state.hasBrainstorm) {
      items.push({ id: 'plan', name: 'Plan (Generate Brainstorm)', desc: '👉 Generate docs/brainstorming.md', highlight: true });
    } else if (state.hasBrainstorm && !state.hasSprints) {
      items.push({ id: 'plan', name: 'Plan (Generate Sprints)', desc: '👉 Generate sprint folders & tasks', highlight: true });
    } else if (state.hasSprints) {
      items.push({ id: 'plan', name: 'Re-Plan Project', desc: 'Regenerate sprint plans (deletes current plans)' });
    }

    // Step 4: Execution
    if (state.hasSprints) {
      items.push({ id: 'execute', name: `Execute Sprint ${state.currentSprint}`, desc: '👉 Run planned tasks for active sprint', highlight: true });
    }

    // Step 5: Test
    if (state.hasSprints) {
      items.push({ id: 'test', name: 'Run E2E & Audits', desc: 'Execute final testing/security/SEO sprint' });
    }

    // Step 6: Codebase Upgrades & Modifications
    items.push({ id: 'modify', name: 'Modify Code In-Place', desc: 'Run quick, direct codebase modification' });
    items.push({ id: 'feature', name: 'Add New Feature', desc: 'Plan a mini-sprint for a new feature' });
    
    // Step 7: Scanners & Imports
    items.push({ id: 'scan', name: 'Scan Project Stack', desc: 'Analyze tech stack in current/target directory' });
    items.push({ id: 'import', name: 'Import Existing Codebase', desc: 'Import external project folder' });
    
    // Step 8: Agents Manager
    items.push({ id: 'agents_menu', name: 'Agent Manager →', desc: 'Inspect or run generic role-based agents' });

    // Step 9: Help & Exit
    items.push({ id: 'commands', name: '/commands Reference', desc: 'Show formatted table of CLI commands' });
    items.push({ id: 'exit', name: 'Exit TUI', desc: 'Quit interactive control center' });

    return items;
  }

  function detectProjectState(dir) {
    const hasConfig = fs.existsSync(path.join(dir, CONFIG_FILE));
    let hasStart = fs.existsSync(path.join(dir, START_MD));
    if (hasStart) {
      try {
        const content = fs.readFileSync(path.join(dir, START_MD), 'utf8');
        if (content.includes('hotel room bookings with real-time availability')) {
          hasStart = false; // default template hasn't been edited/replaced yet
        }
      } catch {
        hasStart = false;
      }
    }
    const hasBrainstorm = fs.existsSync(path.join(dir, BRAINSTORM_MD));
    const hasSprints = detectSprintDocs(dir);
    
    let currentSprint = 1;
    if (hasSprints) {
      currentSprint = detectCurrentSprint(dir);
    }

    return {
      hasConfig,
      hasStart,
      hasBrainstorm,
      hasSprints,
      currentSprint
    };
  }

  function getProjectStatus(state) {
    if (!state.hasConfig) return `${ANSI.red}● Uninitialized (Run Initialize Project)${ANSI.reset}`;
    if (!state.hasStart) return `${ANSI.yellow}● Missing docs/start.md (Run Write Requirements)${ANSI.reset}`;
    if (!state.hasBrainstorm) return `${ANSI.cyan}● Brainstorming Ready (Run Plan)${ANSI.reset}`;
    if (!state.hasSprints) return `${ANSI.cyan}● Sprint Planning Ready (Run Plan)${ANSI.reset}`;
    return `${ANSI.green}● Sprint ${state.currentSprint} Active${ANSI.reset}`;
  }

  function getEngineConfig() {
    try {
      const config = loadLocalConfig(cwd);
      if (config && config.primary_engine) {
        return `${config.primary_engine} (${config.default_model || 'auto'})`;
      }
    } catch {}
    return 'None';
  }

  function renderMenu() {
    menuItems = buildMenuItems();
    // Clamp selection index
    if (selectedIndex >= menuItems.length) {
      selectedIndex = Math.max(0, menuItems.length - 1);
    }
    
    const state = detectProjectState(cwd);
    const projectName = path.basename(cwd);
    const statusStr = getProjectStatus(state);
    const engineStr = getEngineConfig();

    process.stdout.write(ANSI.clearScreen);
    process.stdout.write(ANSI.hideCursor);

    const width = 76;
    
    // Header Banner
    console.log(ANSI.cyan + `  ┌${'─'.repeat(width - 4)}┐` + ANSI.reset);
    console.log(ANSI.cyan + `  │` + ANSI.bold + centerText(`${PLATFORM_NAME} Control Center`, width - 4) + ANSI.cyan + `│` + ANSI.reset);
    console.log(ANSI.cyan + `  │` + ANSI.dim + centerText(PLATFORM_FULL, width - 4) + ANSI.cyan + `│` + ANSI.reset);
    console.log(ANSI.cyan + `  ├${'─'.repeat(width - 4)}┤` + ANSI.reset);
    
    // Project Info
    const infoLeft = ` Project: ${projectName}`;
    const infoRight = `Path: ${cwd.length > 35 ? '...' + cwd.slice(-32) : cwd} `;
    const paddingInfo = width - 4 - infoLeft.length - infoRight.length;
    console.log(ANSI.cyan + `  │` + ANSI.reset + ANSI.bold + infoLeft + ' '.repeat(Math.max(0, paddingInfo)) + ANSI.dim + infoRight + ANSI.cyan + `│` + ANSI.reset);
    
    const statusLine = ` Status:  ${statusStr}`;
    const engineLine = `Engine: ${engineStr} `;
    const statusClean = statusLine.replace(/\x1b\[[0-9;]*m/g, '');
    const engineClean = engineLine.replace(/\x1b\[[0-9;]*m/g, '');
    const paddingStatus = width - 4 - statusClean.length - engineClean.length;
    console.log(ANSI.cyan + `  │` + ANSI.reset + statusLine + ' '.repeat(Math.max(0, paddingStatus)) + ANSI.dim + engineLine + ANSI.cyan + `│` + ANSI.reset);
    
    console.log(ANSI.cyan + `  ├${'─'.repeat(width - 4)}┤` + ANSI.reset);

    // Menu Items
    menuItems.forEach((item, index) => {
      const isSelected = index === selectedIndex;
      const numStr = ` [${index + 1}] `;
      const nameStr = item.name;
      
      let lineText = '';
      if (isSelected) {
        lineText = `${ANSI.bold}${ANSI.cyan}▸${ANSI.reset}${ANSI.bold}${numStr}${nameStr}${ANSI.reset}`;
      } else {
        lineText = `  ${numStr}${nameStr}`;
      }

      // Add highlight if item is next action recommended
      if (item.highlight && !isSelected) {
        lineText = `${ANSI.yellow}${lineText}${ANSI.reset}`;
      }

      const cleanLine = lineText.replace(/\x1b\[[0-9;]*m/g, '');
      const padding = 34 - cleanLine.length;
      
      let descPart = '';
      if (item.desc) {
        descPart = `${ANSI.dim} ${item.desc}${ANSI.reset}`;
      }
      
      const cleanDesc = descPart.replace(/\x1b\[[0-9;]*m/g, '');
      const lineEndPadding = width - 4 - cleanLine.length - Math.max(0, padding) - cleanDesc.length;

      console.log(
        ANSI.cyan + `  │ ` + ANSI.reset + 
        lineText + ' '.repeat(Math.max(0, padding)) + 
        descPart + ' '.repeat(Math.max(0, lineEndPadding - 1)) + 
        ANSI.cyan + `│` + ANSI.reset
      );
    });

    console.log(ANSI.cyan + `  └${'─'.repeat(width - 4)}┘` + ANSI.reset);
    console.log(ANSI.dim + `   ↑↓ Navigate   ⏎ Select   [1-${menuItems.length}] Shortcut   q Quit` + ANSI.reset);
  }

  function centerText(text, width) {
    const cleanText = text.replace(/\x1b\[[0-9;]*m/g, '');
    const padding = Math.max(0, Math.floor((width - cleanText.length) / 2));
    return ' '.repeat(padding) + text + ' '.repeat(Math.max(0, width - cleanText.length - padding));
  }

  // Set up standard input listener
  const isRaw = process.stdin.isTTY;
  if (isRaw) {
    process.stdin.setRawMode(true);
  }
  process.stdin.resume();
  process.stdin.setEncoding('utf8');

  renderMenu();

  const handleKeypress = async (key) => {
    if (inSubMode) return;

    // Graceful exit keys
    if (key === '\u0003' || key === 'q' || key === 'Q') {
      cleanupAndExit();
      return;
    }

    if (key === '\u001b[A') {
      // Up arrow
      selectedIndex = (selectedIndex - 1 + menuItems.length) % menuItems.length;
      renderMenu();
    } else if (key === '\u001b[B') {
      // Down arrow
      selectedIndex = (selectedIndex + 1) % menuItems.length;
      renderMenu();
    } else if (key === '\r' || key === '\n') {
      // Enter key
      await handleAction(menuItems[selectedIndex]);
    } else {
      // Direct number shortcuts
      const code = key.charCodeAt(0);
      if (code >= 49 && code <= 57) { // '1'-'9'
        const index = code - 49;
        if (index < menuItems.length) {
          selectedIndex = index;
          renderMenu();
          await handleAction(menuItems[index]);
        }
      } else if (key === '0') {
        const index = 9; // '0' is 10th item
        if (index < menuItems.length) {
          selectedIndex = index;
          renderMenu();
          await handleAction(menuItems[index]);
        }
      }
    }
  };

  process.stdin.on('data', handleKeypress);

  function cleanupAndExit() {
    if (isRaw) {
      process.stdin.setRawMode(false);
    }
    process.stdin.pause();
    process.stdout.write(ANSI.showCursor);
    console.log('\n🕌 Thank you for using IMH-Code. Goodbye!\n');
    process.exit(0);
  }

  async function pauseAndResume() {
    inSubMode = true;
    if (isRaw) {
      process.stdin.setRawMode(false);
    }
    process.stdin.pause();
    process.stdout.write(ANSI.showCursor + '\n');
    
    // Return a promise that resolves when user presses enter
    return new Promise((resolve) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      rl.question(ANSI.cyan + '\nPress [Enter] to return to the main menu...' + ANSI.reset, () => {
        rl.close();
        inSubMode = false;
        if (isRaw) {
          process.stdin.setRawMode(true);
        }
        process.stdin.resume();
        renderMenu();
        resolve();
      });
    });
  }

  async function handleAction(item) {
    const state = detectProjectState(cwd);
    
    switch (item.id) {
      case 'init':
        inSubMode = true;
        if (isRaw) process.stdin.setRawMode(false);
        process.stdin.resume();
        process.stdout.write(ANSI.showCursor + '\n');
        
        try {
          await runInit();
        } catch (err) {
          console.error(`❌ Initialization failed: ${err.message ?? err}`);
        }
        
        inSubMode = false;
        if (isRaw) process.stdin.setRawMode(true);
        process.stdin.resume();
        renderMenu();
        break;

      case 'write':
        inSubMode = true;
        if (isRaw) process.stdin.setRawMode(false);
        process.stdin.resume();
        process.stdout.write(ANSI.showCursor + '\n');

        console.log(ANSI.cyan + '\n🕌 IMH-Code — Write Requirements' + ANSI.reset);
        console.log('Enter your project description below. When done, type /submit or a single . on a new line to finish:\n');
        
        const lines = [];
        const rlInput = readline.createInterface({ input: process.stdin, output: process.stdout });
        
        let pasteTimeout = null;
        let isDone = false;

        await new Promise(resolve => {
          rlInput.on('line', (line) => {
            if (isDone) return;

            if (pasteTimeout) {
              clearTimeout(pasteTimeout);
              pasteTimeout = null;
            }

            const trimmed = line.trim();
            if (trimmed === '/submit' || trimmed === '.') {
              isDone = true;
              resolve();
              return;
            }

            if (trimmed === '') {
              if (lines.length > 0) {
                pasteTimeout = setTimeout(() => {
                  isDone = true;
                  resolve();
                }, 100);
              }
            }

            lines.push(line);
          });
          
          rlInput.on('close', () => {
            if (pasteTimeout) clearTimeout(pasteTimeout);
            if (!isDone) {
              isDone = true;
              resolve();
            }
          });
        });
        
        const desc = lines.join('\n');
        rlInput.close();
        
        if (desc.trim() === '') {
          console.log('⚠️  No requirements entered. Aborting.');
          inSubMode = false;
          if (isRaw) process.stdin.setRawMode(true);
          process.stdin.resume();
          renderMenu();
          break;
        }

        const rlQuestions = readline.createInterface({ input: process.stdin, output: process.stdout });

        // Ask for backend
        let backend = 'yes';
        while (true) {
          const ans = await new Promise(res => rlQuestions.question('\nDo you need a backend API / server-side logic? (yes/no/unsure) [default: yes]: ', res));
          const cleanAns = ans.trim().toLowerCase();
          if (cleanAns === '') { backend = 'yes'; break; }
          if (['yes', 'no', 'unsure'].includes(cleanAns)) { backend = cleanAns; break; }
          console.log('❌ Invalid input. Please enter yes, no, or unsure.');
        }

        // Ask for mobile
        let mobile = 'no';
        while (true) {
          const ans = await new Promise(res => rlQuestions.question('Do you need a mobile app (iOS/Android)? (yes/no) [default: no]: ', res));
          const cleanAns = ans.trim().toLowerCase();
          if (cleanAns === '') { mobile = 'no'; break; }
          if (['yes', 'no'].includes(cleanAns)) { mobile = cleanAns; break; }
          console.log('❌ Invalid input. Please enter yes or no.');
        }
        
        rlQuestions.close();

        // Write start.md template
        const startMdPath = path.join(cwd, START_MD);
        const startMdContent = [
          '# 🕌 IMH-Code — Project Start',
          '',
          '> **Imam Hussain Coding Harness Platform**',
          '',
          '---',
          '',
          '## ⚡ Quick Scope Check',
          '',
          '**Do you need a backend API / server-side logic?**',
          `> **Answer:** ${backend}`,
          '',
          '**Do you need a mobile app (iOS/Android)?**',
          `> **Answer:** ${mobile}`,
          '',
          '---',
          '',
          '## 📝 Your Project Description',
          '',
          '<!-- WRITE_PROMPT_HERE -->',
          desc,
          '<!-- END_PROMPT -->',
          '',
          '---',
          '',
          '## 🚀 Next Step',
          '',
          'After filling in the scope and your description, run:',
          '',
          '```bash',
          'imhcode plan',
          '```'
        ].join('\n');

        // Ensure directories exist
        const docsDir = path.dirname(startMdPath);
        if (!fs.existsSync(docsDir)) {
          fs.mkdirSync(docsDir, { recursive: true });
        }
        fs.writeFileSync(startMdPath, startMdContent, 'utf8');
        console.log('\n✅ Requirements updated successfully in docs/start.md!');

        inSubMode = false;
        if (isRaw) process.stdin.setRawMode(true);
        process.stdin.resume();
        renderMenu();
        break;

      case 'plan':
        inSubMode = true;
        if (isRaw) process.stdin.setRawMode(false);
        process.stdin.resume();
        process.stdout.write(ANSI.showCursor + '\n');
        
        // If sprints already exist, confirm deletion first
        let proceed = true;
        if (state.hasSprints) {
          const rlConfirm = readline.createInterface({ input: process.stdin, output: process.stdout });
          const confirmAns = await new Promise(res => rlConfirm.question(ANSI.yellow + '⚠️  Sprints already exist. Re-planning will delete docs/brainstorming.md and all planned sprint directories. Proceed? (y/N): ' + ANSI.reset, res));
          rlConfirm.close();
          if (confirmAns.toLowerCase() !== 'y') {
            proceed = false;
          } else {
            // Delete brainstorming.md and docs/sprint-*
            try {
              if (fs.existsSync(path.join(cwd, BRAINSTORM_MD))) fs.unlinkSync(path.join(cwd, BRAINSTORM_MD));
              let sNum = 1;
              while (true) {
                const sDir = path.join(cwd, DOCS_DIR, `sprint-${sNum}`);
                if (fs.existsSync(sDir)) {
                  rmRecursiveSync(sDir);
                  sNum++;
                } else {
                  break;
                }
              }
            } catch (e) {
              console.warn('⚠️  Could not clean up old plan files: ', e.message);
            }
          }
        }
        
        if (proceed) {
          try {
            await runPlanCommand([]);
          } catch (err) {
            console.error(`❌ Planning failed: ${err.message ?? err}`);
          }
        }
        
        await pauseAndResume();
        break;

      case 'execute':
        inSubMode = true;
        if (isRaw) process.stdin.setRawMode(false);
        process.stdin.resume();
        process.stdout.write(ANSI.showCursor + '\n');
        
        try {
          await runExecuteCommand([state.currentSprint.toString()]);
        } catch (err) {
          console.error(`❌ Execution failed: ${err.message ?? err}`);
        }
        
        await pauseAndResume();
        break;

      case 'test':
        inSubMode = true;
        if (isRaw) process.stdin.setRawMode(false);
        process.stdin.resume();
        process.stdout.write(ANSI.showCursor + '\n');
        
        try {
          await runTestCommand([]);
        } catch (err) {
          console.error(`❌ Testing failed: ${err.message ?? err}`);
        }
        
        await pauseAndResume();
        break;

      case 'modify':
        inSubMode = true;
        if (isRaw) process.stdin.setRawMode(false);
        process.stdin.resume();
        process.stdout.write(ANSI.showCursor + '\n');

        const rlMod = readline.createInterface({ input: process.stdin, output: process.stdout });
        const modDesc = await new Promise(res => rlMod.question('Enter description of the modification: ', res));
        rlMod.close();

        if (modDesc.trim() !== '') {
          try {
            await runModifyCommand([modDesc, '--live']);
          } catch (err) {
            console.error(`❌ Modification failed: ${err.message ?? err}`);
          }
        }
        
        await pauseAndResume();
        break;

      case 'feature':
        inSubMode = true;
        if (isRaw) process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdout.write(ANSI.showCursor + '\n');

        const rlFeat = readline.createInterface({ input: process.stdin, output: process.stdout });
        const featDesc = await new Promise(res => rlFeat.question('Enter description of the feature to plan: ', res));
        rlFeat.close();

        if (featDesc.trim() !== '') {
          try {
            await runFeatureCommand([featDesc]);
          } catch (err) {
            console.error(`❌ Feature planning failed: ${err.message ?? err}`);
          }
        }
        
        await pauseAndResume();
        break;

      case 'scan':
        inSubMode = true;
        if (isRaw) process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdout.write(ANSI.showCursor + '\n');

        const rlScan = readline.createInterface({ input: process.stdin, output: process.stdout });
        const scanPath = await new Promise(res => rlScan.question('Enter directory path to scan (default: .): ', res));
        rlScan.close();

        try {
          await runScanCommand([scanPath.trim() || '.']);
        } catch (err) {
          console.error(`❌ Scan failed: ${err.message ?? err}`);
        }
        
        await pauseAndResume();
        break;

      case 'import':
        inSubMode = true;
        if (isRaw) process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdout.write(ANSI.showCursor + '\n');

        const rlImport = readline.createInterface({ input: process.stdin, output: process.stdout });
        const importPath = await new Promise(res => rlImport.question('Enter directory path to import: ', res));
        rlImport.close();

        if (importPath.trim() !== '') {
          try {
            await runImportCommand([importPath.trim()]);
          } catch (err) {
            console.error(`❌ Import failed: ${err.message ?? err}`);
          }
        }
        
        await pauseAndResume();
        break;

      case 'agents_menu':
        currentSubMenu = 'agents';
        selectedIndex = 0;
        renderMenu();
        break;

      case 'agent_list':
        inSubMode = true;
        if (isRaw) process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdout.write(ANSI.showCursor + '\n');
        
        try {
          await runAgentCommand('list', []);
        } catch (err) {
          console.error(`❌ Listing failed: ${err.message ?? err}`);
        }
        
        await pauseAndResume();
        break;

      case 'agent_inspect':
        inSubMode = true;
        if (isRaw) process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdout.write(ANSI.showCursor + '\n');
        
        console.log('Available Agents:');
        console.log('  planner, designer, nextjs-executor, react-executor, vue-executor,');
        console.log('  laravel-executor, python-executor, java-executor, flutter-executor,');
        console.log('  react-native-executor, ios-executor, android-executor, systems-executor,');
        console.log('  web3-executor, devops-executor, tester, security-auditor, seo-optimizer, debugger\n');
        
        const rlInspect = readline.createInterface({ input: process.stdin, output: process.stdout });
        const inspectAgentId = await new Promise(res => rlInspect.question('Enter Agent ID to inspect: ', res));
        rlInspect.close();

        if (inspectAgentId.trim() !== '') {
          try {
            await runAgentCommand('inspect', [inspectAgentId.trim()]);
          } catch (err) {
            console.error(`❌ Agent inspection failed: ${err.message ?? err}`);
          }
        }
        
        await pauseAndResume();
        break;

      case 'agent_run':
        inSubMode = true;
        if (isRaw) process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdout.write(ANSI.showCursor + '\n');
        
        console.log('Available Agents:');
        console.log('  planner, designer, nextjs-executor, react-executor, vue-executor,');
        console.log('  laravel-executor, python-executor, java-executor, flutter-executor,');
        console.log('  react-native-executor, ios-executor, android-executor, systems-executor,');
        console.log('  web3-executor, devops-executor, tester, security-auditor, seo-optimizer, debugger\n');
        
        const rlRunAgent = readline.createInterface({ input: process.stdin, output: process.stdout });
        const runAgentId = await new Promise(res => rlRunAgent.question('Enter Agent ID to run: ', res));
        const runTask = await new Promise(res => rlRunAgent.question('Enter task description: ', res));
        rlRunAgent.close();

        if (runAgentId.trim() !== '' && runTask.trim() !== '') {
          try {
            await runAgentCommand('run', [runAgentId.trim(), runTask.trim(), '--live']);
          } catch (err) {
            console.error(`❌ Agent execution failed: ${err.message ?? err}`);
          }
        }
        
        await pauseAndResume();
        break;

      case 'back':
        currentSubMenu = 'main';
        selectedIndex = 0;
        renderMenu();
        break;

      case 'commands':
        inSubMode = true;
        if (isRaw) process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdout.write(ANSI.showCursor + '\n');
        
        showCommandsTable();
        
        await pauseAndResume();
        break;

      case 'exit':
        cleanupAndExit();
        break;
    }
  }

  function showCommandsTable() {
    const width = 76;
    console.log(ANSI.cyan + `  ┌${'─'.repeat(width - 4)}┐` + ANSI.reset);
    console.log(ANSI.cyan + `  │` + ANSI.bold + centerText(`📖 CLI Commands Reference`, width - 4) + ANSI.cyan + `│` + ANSI.reset);
    console.log(ANSI.cyan + `  ├${'─'.repeat(20)}┬${'─'.repeat(width - 25)}┤` + ANSI.reset);
    
    const cmds = [
      { cmd: 'imhcode',           desc: 'Launch interactive terminal TUI' },
      { cmd: 'imhcode init',      desc: 'Non-interactive environment setup' },
      { cmd: 'imhcode plan',      desc: 'Generate brainstorm or sprint plans' },
      { cmd: 'imhcode execute N', desc: 'Execute Sprint N tasks' },
      { cmd: 'imhcode test',      desc: 'Run testing/security/SEO sprint' },
      { cmd: 'imhcode modify',    desc: 'Modify codebase in-place' },
      { cmd: 'imhcode feature',   desc: 'Plan a mini-sprint for new feature' },
      { cmd: 'imhcode fix',       desc: 'Quick targeted bug fix' },
      { cmd: 'imhcode scan',      desc: 'Scan current folder for frameworks' },
      { cmd: 'imhcode import',    desc: 'Import existing codebase' },
      { cmd: 'imhcode agent list',desc: 'List all 19 generic agents' },
      { cmd: 'imhcode report',    desc: 'Generate final project team report' },
      { cmd: '--help / -h',       desc: 'Display general help instructions' }
    ];
    
    cmds.forEach(item => {
      const col1 = `  ${item.cmd}`;
      const col2 = ` ${item.desc}`;
      const pad1 = 18 - col1.length;
      const pad2 = width - 25 - col2.length;
      console.log(
        ANSI.cyan + `  │` + ANSI.reset + ANSI.bold + col1 + ' '.repeat(Math.max(0, pad1)) + 
        ANSI.cyan + `│` + ANSI.reset + col2 + ' '.repeat(Math.max(0, pad2)) + 
        ANSI.cyan + `│` + ANSI.reset
      );
    });
    
    console.log(ANSI.cyan + `  └${'─'.repeat(20)}┴${'─'.repeat(width - 25)}┘` + ANSI.reset);
  }
}
