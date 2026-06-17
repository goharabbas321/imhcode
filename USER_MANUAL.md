# Zeoel Framework — User Manual

> **Version**: 2.0 | **Updated**: June 2026  
> Full CLI reference, workflow guide, troubleshooting, and advanced usage.

---

## Table of Contents

1. [Installation & Setup](#1-installation--setup)
2. [Getting Started — Your First Project](#2-getting-started--your-first-project)
3. [CLI Commands](#3-cli-commands)
4. [Supported Engines & Models](#4-supported-engines--models)
5. [The 4-Phase Pipeline](#5-the-4-phase-pipeline)
6. [Agent Dispatch Protocol](#6-agent-dispatch-protocol)
7. [Model Routing & zeoel.config.json](#7-model-routing--zeoelconfigjson)
8. [Project Structure](#8-project-structure)
9. [Troubleshooting](#9-troubleshooting)
10. [Advanced Usage](#10-advanced-usage)
11. [Contact & Support](#11-contact--support)

---

## 1. Installation & Setup

### Prerequisites

You need **Node.js 18+** and at least one of the supported AI CLI tools installed on your machine (see [Section 4](#4-supported-engines--models)).

### Install Zeoel

```bash
# Install globally (recommended)
npm install -g zeoel

# Or run directly with npx (no install)
npx zeoel
```

### Initialize in Your Project

Navigate to any project directory and run:

```bash
cd your-project
zeoel
```

The interactive setup wizard will:

1. **Scan** your system PATH for supported CLI engines (`claude`, `opencode`, `codex`, `agy`, `qwen`, `mimo`)
2. **Display** each found engine with its path and available models
3. **Ask you** to pick your primary engine
4. **Write** `zeoel.config.json` with the detected engine paths and model catalog
5. **Copy** `agents/`, `skills/`, `AGENTS.md`, `CLAUDE.md`, `SETUP.md`, and `USER_MANUAL.md` into your project
6. **Create** `frontend/`, `backend/`, and `.worktrees/` directories

**Example wizard output:**

```
🚀 Initializing Zeoel AI Agency Framework...

🔍 Scanning for local coding assistant CLIs...

Found the following local coding assistant CLIs:
  [1] Claude Code (claude)
      Path:   /Users/you/.local/bin/claude
      Models: claude-opus-4-5, claude-sonnet-4-5, claude-haiku-4-5 (8 total)

  [2] Antigravity CLI (agy)
      Path:   /usr/local/bin/agy
      Models: gemini-2.5-pro, gemini-2.5-flash (5 total)

  [3] QwenCode (qwen)
      Path:   /usr/local/bin/qwen
      Models: qwen3-coder-max, qwen3-coder-plus, qwen3-coder-flash (4 total)

Choose your primary assistant engine:
Select engine number [1-3] (default: 1): 1

❇️  Selected primary assistant engine: Claude Code (claude)

💾 Saved assistant configuration to: ./zeoel.config.json
```

> **Re-run `zeoel` at any time** to rescan for new CLIs and update `zeoel.config.json`.

---

## 2. Getting Started — Your First Project

Once initialized, open your AI coding tool of choice (the one you selected as primary engine) and simply say:

```
"I want to build a SaaS dashboard with auth and Stripe billing"
```

Zeoel's `AGENTS.md` and `CLAUDE.md` are auto-detected by all supported tools. Gohar (the CEO agent) will take it from there.

### What happens automatically:

**Step 0 — Smart Config Inference**

Gohar reads your prompt and infers your stack:

```
═══════════════════════════════════════════
  🔍 SMART CONFIG — Auto-detected from your prompt
═══════════════════════════════════════════
  ✅ Stack:     Full-stack (detected: "auth and billing")
  ✅ Frontend:  Next.js  (detected: "SaaS dashboard")
  ✅ Backend:   Laravel  (detected: "billing" → SaaS default)
  ✅ Database:  PostgreSQL (detected: "SaaS" → multi-tenant)
  ✅ TDD:       Strict (default)
  ❓ Mobile:    Not mentioned — do you need one?
═══════════════════════════════════════════
```

He only asks about what he couldn't infer. You confirm or correct.

**Phase 1 → Phase 4** run automatically once you approve each phase. See [Section 5](#5-the-4-phase-pipeline) for full details.

---

## 3. CLI Commands

All CLI commands start with `zeoel`. Run from any directory that has been initialized with `zeoel`.

---

### `zeoel`

**Initialize or update the framework** in the current directory.

```bash
zeoel
```

- Scans for installed CLI engines
- Runs the interactive engine selection wizard
- Writes/updates `zeoel.config.json`
- Copies framework files if not already present

---

### `zeoel agent list`

**List all registered agents** in your `agents/` directory.

```bash
zeoel agent list
```

Shows a table of all agents with their ID, role, and default model.

---

### `zeoel agent inspect <agent-id>`

**Show the full manifest, skills, memory files, and system prompt preview** for an agent.

```bash
zeoel agent inspect mustafa-visual
zeoel agent inspect karar-frontend
zeoel agent inspect hamid-security
```

**Output includes:**
- Agent ID, name, version, role, description
- Directory path
- Default model & fallback engines
- Permissions (read_files, write_files, run_commands, network)
- Memory scopes
- Supported task types
- Quality gates
- All loaded skills (with content preview)
- Memory files
- System prompt preview (first 20 lines)

---

### `zeoel agent run <agent-id> "<task>" [flags]`

**Build the full agent prompt and execute a task.**

By default runs in **dry-run** mode (shows the prompt, no LLM called). Add `--live` to call your real CLI engine.

#### Basic Usage

```bash
# Dry-run — inspect the full prompt without calling any LLM
zeoel agent run mustafa-visual "Create a dark-mode hero section" --dry-run

# Live — calls your primary engine from zeoel.config.json
zeoel agent run mustafa-visual "Create a dark-mode hero section" --live
```

#### Engine Selection

```bash
# Use a specific engine for this run
zeoel agent run karar-frontend "Build the pricing page" --live --engine claude
zeoel agent run karar-frontend "Build the pricing page" --live --engine opencode
zeoel agent run karar-frontend "Build the pricing page" --live --engine codex
zeoel agent run karar-frontend "Build the pricing page" --live --engine agy
zeoel agent run karar-frontend "Build the pricing page" --live --engine qwen
zeoel agent run karar-frontend "Build the pricing page" --live --engine mimo
```

#### Model Override

```bash
# Pin a specific model for this run (overrides auto-routing)
zeoel agent run tariq-backend "Implement JWT auth" --live -m claude-opus-4-5
zeoel agent run tariq-backend "Implement JWT auth" --live --model gpt-5.5
zeoel agent run anas-react "Add a skeleton loader" --live --model qwen3-coder-flash
```

#### Acceptance Criteria

```bash
# Add acceptance criteria that get injected into the prompt
zeoel agent run hamid-security "Audit the login flow" --live \
  --criteria "Zero OWASP Top 10 issues, all inputs sanitized, rate limiting on /login"

zeoel agent run muhammad-qa "Write E2E tests for checkout" --live \
  --criteria "Cover happy path, empty cart, payment failure, and network timeout"
```

#### Custom Session Output

```bash
# Save session logs to a custom directory
zeoel agent run mustafa-visual "Design the onboarding flow" --live --output ./sessions
```

#### All Flags

| Flag | Short | Default | Description |
|------|-------|---------|-------------|
| `--live` | | `false` | Execute via real CLI (default is dry-run) |
| `--dry-run` | | `true` | Preview prompt only, no LLM call |
| `--engine <name>` | | from config | Override engine: `claude`, `opencode`, `codex`, `agy`, `qwen`, `mimo` |
| `--model <model>` | `-m` | auto-routed | Pin a specific model ID |
| `--criteria "<text>"` | | none | Acceptance criteria injected into prompt |
| `--output <path>` | | `./sessions/` | Custom directory for session logs |

#### Complete Examples

```bash
# Frontend design work
zeoel agent run mustafa-visual "Create a glassmorphism pricing card" --live --engine claude

# Backend API
zeoel agent run tariq-backend "Add Stripe webhook for subscription events" --live \
  --model claude-opus-4-5 --criteria "Handle all Stripe event types, idempotent, logged"

# Security audit
zeoel agent run hamid-security "Red-team the authentication flow" --live \
  --engine codex --criteria "OWASP Top 10 clean, no SQL injection, no XSS"

# QA testing
zeoel agent run muhammad-qa "Write Playwright tests for the signup flow" --live

# Debugging
zeoel agent run sajjad-debugger "The cart total is wrong when applying two coupons" --live

# SEO check
zeoel agent run zara-content "Audit the landing page for technical SEO issues" --live

# Research
zeoel agent run yahya-researcher "Summarize recent papers on RAG vs fine-tuning" --live \
  --engine agy --model gemini-2.5-pro

# Mobile
zeoel agent run abdullah-mobile "Build the onboarding screens in Flutter" --live

# Data pipeline
zeoel agent run fatima-data "Set up the analytics dashboard queries in ClickHouse" --live
```

---

## 4. Supported Engines & Models

Zeoel supports 6 local AI CLI tools. All are detected automatically during `zeoel` init.

### Claude Code (`claude`)

```bash
# Install
# Follow: https://docs.anthropic.com/claude-code

# How Zeoel calls it
claude -p [--model <model-id>]

# Model tiers (defaults)
# Light:    claude-haiku
# Standard: claude-sonnet
# Complex:  claude-opus
```

### OpenCode (`opencode`)

```bash
# Install: https://opencode.ai
# or: npm install -g opencode

# How Zeoel calls it
opencode run --dangerously-skip-permissions [-m <model-id>]

# Model tiers (from your catalog)
# Light:    gemini-2.5-flash or similar flash model
# Standard: gemini-2.5-pro or similar
# Complex:  deepseek-pro or top-ranked model
```

### Codex — OpenAI (`codex`)

```bash
# Install: https://platform.openai.com/codex
# or: npm install -g @openai/codex

# How Zeoel calls it
codex --dangerously-bypass-approvals-and-sandbox exec - -o <output-file> [-m <model-id>]

# Model tiers (defaults)
# Light:    gpt-4o-mini
# Standard: gpt-4o
# Complex:  gpt-5.5 or o3
```

### Antigravity CLI (`agy`)

```bash
# Install
curl -fsSL https://antigravity.google/cli/install.sh | bash

# How Zeoel calls it
agy -p [--model <model-id>]

# Model tiers (defaults)
# Light:    gemini-2.5-flash
# Standard: gemini-2.5-flash  
# Complex:  gemini-2.5-pro
```

### QwenCode (`qwen`)

```bash
# Install: https://qwenlm.github.io/blog/qwen-code/

# How Zeoel calls it
qwen -p [--model <model-id>]

# Model tiers (defaults)
# Light:    qwen3-coder-flash
# Standard: qwen3-coder-plus
# Complex:  qwen3-coder-max
```

### MimoCode (`mimo`)

```bash
# Install
curl -fsSL https://mimo.xiaomi.com/install | bash
# or: npm install -g @mimo-ai/cli

# How Zeoel calls it
mimo -p [--model <model-id>]

# Model tiers (defaults)
# Light:    mimo-vl-7b
# Standard: mimo-vl-7b
# Complex:  mimo-vl-72b
```

---

### `zeoel.config.json`

After setup, your project root will have this file:

```json
{
  "primary_engine": "claude",
  "available_engines": {
    "claude": {
      "path": "/Users/you/.local/bin/claude",
      "models": ["claude-opus-4-5", "claude-sonnet-4-5", "claude-haiku-4-5"]
    },
    "agy": {
      "path": "/usr/local/bin/agy",
      "models": ["gemini-2.5-pro", "gemini-2.5-flash"]
    },
    "qwen": {
      "path": "/usr/local/bin/qwen",
      "models": ["qwen3-coder-max", "qwen3-coder-plus", "qwen3-coder-flash"]
    }
  }
}
```

**Zeoel uses this file to:**
- Know which engine to call when no `--engine` flag is given
- Pick the right model for each complexity tier from your real installed catalog (not hardcoded guesses)

> **Re-run `zeoel`** whenever you install a new CLI or update models to refresh this file.

---

## 5. The 4-Phase Pipeline

Zeoel's HARD-GATE rule: **you must follow all 4 phases in order**. No shortcuts.

### Phase 1 — Brainstorm

**Trigger:** Just describe your project to your AI tool.

```
"I want to build a team task manager with real-time updates and Slack integration"
```

**What happens:**
1. Gohar (CEO) reads your prompt and infers stack preferences
2. He simulates a debate between relevant agents (Mahdi for design, Tariq for backend, Ali for DevOps, etc.)
3. He produces a **Smart Config Summary** — confirm or correct
4. Final output: `PROJECT_BRIEF.md` + `docs/brainstorm/summary.md`

**Your role:** Answer any clarifying questions, confirm the brief.

---

### Phase 2 — Sprint Planning

**Trigger:** "Approved. Plan Sprint 1."

**What happens:**
1. Gohar decomposes `PROJECT_BRIEF.md` into specific tasks
2. Each task gets: agent assignment, model tier, acceptance criteria, and test plan
3. Output: `docs/sprint-1/plan.md` + `docs/sprint-1/progress.md`

**Example plan.md row:**
```
| # | Task                    | Agent   | Model Tier | Tests              |
|---|-------------------------|---------|------------|--------------------|
| 1 | Auth pages (login/reg)  | Karar   | 🟡 Standard | Component + E2E    |
| 2 | JWT middleware          | Tariq   | 🟡 Standard | Unit + Integration |
| 3 | README update           | Baqir   | 🟢 Light    | None               |
| 4 | Security audit auth     | Hamid   | 🔴 Complex  | OWASP checklist    |
```

**Your role:** Review and approve the sprint plan.

---

### Phase 3 — Execute (Strict TDD)

**Trigger:** "Approved. Execute Sprint 1."

**What happens:**
1. Gohar dispatches agents one by one in dependency order
2. Each agent announces their persona and loaded skills
3. **Red phase:** Agent writes failing tests first
4. **Green phase:** Agent writes minimal code to pass tests
5. **Refactor phase:** Code is cleaned up
6. Progress updated in `docs/sprint-1/progress.md` after each task

**Codebase Containment Rule:** All code must live in `frontend/` or `backend/`. No exceptions.

**Your role:** Watch progress. Optionally review code after each task.

---

### Phase 4 — Verify & Snapshot

**Trigger:** Automatic when all Phase 3 tasks are done.

**What happens:**
1. **Muhammad (QA)** runs all tests — must pass 100%
2. **Hamid (Security)** runs OWASP audit
3. **Zara (SEO)** checks meta tags, headings, JSON-LD (if applicable)
4. Gohar generates `docs/sprint-1/done.md`
5. Branch merges to `main`
6. Sprint archived to `.worktrees/sprint-1/`

**Your role:** Test the running app. If it looks good, plan Sprint 2.

---

## 6. Agent Dispatch Protocol

When Gohar dispatches an agent, the output looks like:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  DISPATCHING: Karar (Sr. Frontend Engineer)
  Task: #4 — Build the pricing page
  Skills: nextjs-turbopack, shadcn-ui-patterns, frontend-design
  Model Tier: 🟡 Standard
  Model: claude-sonnet-4-5
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

I am now acting as Karar (Sr. Frontend Engineer).
Skills loaded: nextjs-turbopack, shadcn-ui-patterns, frontend-design, test-driven-development

[Red] Writing failing component test for PricingPage...
[Green] Implementing PricingPage component...
[Refactor] Cleaning up...

✅ Task #4 complete. Tests: 3/3 passing.
Returning to Gohar (CEO).
```

### Skill Loading

Each agent has ⭐ primary skills defined in their `agent.yml`. The full skill content from `skills/<skill-name>/SKILL.md` is injected into the prompt. This is how agents know best practices without you explaining them.

### Memory Scopes

Agents share memory via `docs/` files:
- `PROJECT_BRIEF.md` — shared project requirements
- `docs/sprint-N/plan.md` — shared sprint plan
- `docs/sprint-N/progress.md` — shared progress log
- Named `zeoeldb` memory — persistent cross-session agent memory

---

## 7. Model Routing & zeoel.config.json

### How Automatic Model Selection Works

1. Zeoel reads the sprint plan (`docs/sprint-N/plan.md`) to find the task's complexity tier
2. It looks up your `zeoel.config.json` for the active engine's model catalog
3. It picks the best matching model from your real catalog using keyword matching (flash → light, pro/max → complex)
4. Falls back to sensible defaults if the catalog is empty

### Override Priority (Highest → Lowest)

```
--model flag  >  --engine flag  >  zeoel.config.json primary_engine  >  agent.yml preferred_engines
```

### Updating Your Model Catalog

```bash
# Re-run the wizard to rescan all CLIs and update zeoel.config.json
zeoel
```

Or manually edit `zeoel.config.json`:

```json
{
  "primary_engine": "agy",
  "available_engines": {
    "agy": {
      "path": "/usr/local/bin/agy",
      "models": ["gemini-2.5-pro", "gemini-2.5-flash", "gemini-2.5-flash-lite"]
    }
  }
}
```

---

## 8. Project Structure

```
your-project/
│
├── agents/                          # 33 agent definitions
│   ├── mustafa-visual/
│   │   ├── agent.yml                # Manifest: skills, model, permissions
│   │   └── SYSTEM.md                # Agent system prompt
│   ├── karar-frontend/
│   │   ├── agent.yml
│   │   └── SYSTEM.md
│   └── ...
│
├── skills/                          # 450+ curated skills
│   ├── nextjs-turbopack/
│   │   └── SKILL.md
│   ├── test-driven-development/
│   │   └── SKILL.md
│   └── ...
│
├── frontend/                        # ← ALL frontend code goes here
│   └── (Next.js / React / Vue / etc.)
│
├── backend/                         # ← ALL backend code goes here
│   └── (Laravel / Django / FastAPI / etc.)
│
├── docs/
│   ├── brainstorm/
│   │   └── summary.md
│   └── sprint-1/
│       ├── plan.md                  # Tasks + model tiers
│       ├── progress.md              # Live progress tracker
│       ├── done.md                  # Final verification report
│       └── deferred.md             # Deferred tasks
│
├── .worktrees/
│   └── sprint-1/                    # Runnable snapshot of completed sprint
│
├── sessions/                        # CLI session logs (one per agent run)
│   └── 2026-06-15_14-00-mustafa-visual/
│
├── PROJECT_BRIEF.md                 # Master requirements document
├── zeoel.config.json                # Your engine + model configuration
├── AGENTS.md                        # Agent quick reference (auto-detected)
├── CLAUDE.md                        # AI tool instructions (all platforms)
├── README.md
└── USER_MANUAL.md
```

---

## 9. Troubleshooting

### "Orchestrator not built. Run: npm run build"

The TypeScript source hasn't been compiled yet. Run:

```bash
cd /path/to/zeoel
npm run build
```

Then retry your command.

---

### "No agents/ directory found"

You're running `zeoel agent` commands from a directory that hasn't been initialized. Either:

```bash
# Initialize first
zeoel

# Or run from the zeoel directory itself
cd /path/to/zeoel
zeoel agent list
```

---

### "No local coding assistant CLIs were detected"

None of the supported binaries (`claude`, `opencode`, `codex`, `agy`, `qwen`, `mimo`) were found in your PATH. Install at least one:

```bash
# Claude Code
# See: https://docs.anthropic.com/claude-code

# OpenCode
npm install -g opencode

# Codex
npm install -g @openai/codex

# Antigravity CLI (agy)
curl -fsSL https://antigravity.google/cli/install.sh | bash

# QwenCode (qwen)
# See: https://qwenlm.github.io/blog/qwen-code/

# MimoCode (mimo)
curl -fsSL https://mimo.xiaomi.com/install | bash
```

After installing, run `zeoel` again to rescan.

---

### CLI exits with non-zero code / stderr errors

Each agent run creates a session log in `sessions/`. Check the log file listed in the output:

```
Session log: ./sessions/2026-06-15_14-00-mustafa-visual/
```

The log contains:
- `prompt.md` — the full prompt sent
- `output.md` — the raw CLI output
- `metadata.json` — engine, model, duration, errors

---

### Agent ignores the task / goes off-script

The agent system prompt is in `agents/<agent-id>/SYSTEM.md`. You can read it with:

```bash
zeoel agent inspect <agent-id>
```

If an agent consistently ignores instructions, edit its `SYSTEM.md` or `agent.yml` to be more explicit.

---

### Code is being created outside `frontend/` or `backend/`

Remind the agent of the containment rule:

> "Follow the Codebase Containment Rules. All code must be in `frontend/` or `backend/` only."

---

### Context loss / agent forgets what it was doing

If the AI assistant loses context between messages:

> "Run the Context Recovery Protocol. Re-read PROJECT_BRIEF.md and docs/sprint-N/progress.md."

---

### Debugging with Sajjad

If something is broken, dispatch the debugger:

```bash
zeoel agent run sajjad-debugger "The cart total is wrong when two coupons are applied" --live
```

Sajjad follows a systematic 4-phase root cause process:
1. **Reproduce** — write a failing test that triggers the bug
2. **Isolate** — narrow down to the exact file/commit/function
3. **Trace** — find the logical root cause
4. **Fix** — apply the minimal change to make the test pass

**Never** allow "shotgun debugging" (randomly changing code hoping it fixes itself).

---

## 10. Advanced Usage

### Running Multiple Agents in Sequence

```bash
# Build the UI first, then have QA test it
zeoel agent run karar-frontend "Build the checkout page" --live --engine claude
zeoel agent run muhammad-qa "Write E2E tests for the checkout page" --live --engine claude
zeoel agent run hamid-security "Audit the checkout for payment vulnerabilities" --live
```

### Using a Different Engine Per Agent

Some agents work better with certain engines. You can mix engines in a sprint:

```bash
# Use agy (Gemini) for research and design thinking
zeoel agent run yahya-researcher "Survey RAG vs fine-tuning literature" --live --engine agy --model gemini-2.5-pro

# Use codex (GPT) for TypeScript/Node work
zeoel agent run bilal-systems "Write the WebSocket server in Go" --live --engine codex --model gpt-5.5

# Use qwen for cost-efficient boilerplate
zeoel agent run baqir-docs "Generate OpenAPI spec for the auth routes" --live --engine qwen --model qwen3-coder-flash
```

### Pinning a Model for the Whole Sprint

If you want to use one model for everything in a sprint, set it in `zeoel.config.json`:

```json
{
  "primary_engine": "claude",
  "available_engines": {
    "claude": {
      "path": "/Users/you/.local/bin/claude",
      "models": ["claude-opus-4-5"]
    }
  }
}
```

With only one model in the catalog, all tiers will resolve to it.

### Inspecting the Prompt Before Running

Always use `--dry-run` first to verify what will be sent:

```bash
zeoel agent run mustafa-visual "Create a 3D animated hero with Three.js" --dry-run
```

This prints the **full prompt** (system prompt + skills + memory + task) so you can tune it before spending tokens.

### Adding Custom Skills

1. Create a folder: `skills/my-custom-skill/`
2. Add `SKILL.md` with a YAML frontmatter header:

```markdown
---
name: my-custom-skill
description: A brief description of what this skill does
---

# My Custom Skill

[Your skill content here]
```

3. Reference it in an agent's `agent.yml`:

```yaml
skills:
  - my-custom-skill
```

### Adding Custom Agents

1. Create `agents/my-agent/agent.yml`:

```yaml
id: my-agent
name: My Agent
version: "1.0"
role: Custom Specialist
description: Does a very specific thing
default_model: auto
fallback_engines: []
preferred_engines: [claude, agy]
skills:
  - my-custom-skill
permissions:
  read_files: true
  write_files: true
  run_commands: false
  network_access: false
memory:
  scopes: [project]
supported_task_types: [code, analysis]
quality_gates: []
```

2. Create `agents/my-agent/SYSTEM.md` with the agent's system prompt.

3. Verify it loaded:

```bash
zeoel agent inspect my-agent
```

---

## 11. Contact & Support

- **GitHub**: [goharabbas321/zeoel](https://github.com/goharabbas321/zeoel)
- **NPM**: [zeoel](https://www.npmjs.com/package/zeoel)
- **Creator**: Gohar Abbas ([@goharabbas321](https://github.com/goharabbas321))
- **Telegram**: [@goharabbas786](https://t.me/goharabbas786)

---

*Built with ❤️ by the Zeoel team*
