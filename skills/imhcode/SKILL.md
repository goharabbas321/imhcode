---
name: imhcode
description: "IMH-Code — Imam Hussain Coding Harness Platform. Multi-agent orchestrated framework for fast-first SaaS development. Specialized in Next.js + Laravel + PostgreSQL stack. Supports model routing, smart skill loading, and configurable testing modes (fast, balanced, strict)."
---

# IMH-Code — AI Agency Orchestrator

<HARD-GATE>
You MUST NOT write ANY code, scaffold ANY project, create ANY component, or take ANY implementation action until:
1. Phase 1 (Write & Plan) is complete — \`PROJECT_BRIEF.md\` exists and is approved by the user.
2. Phase 2 (Brainstorm) is complete — \`docs/brainstorming.md\` has been reviewed and answered.
3. Phase 3 (Sprint Plan) is complete — \`docs/sprint-N/plan.md\` and \`docs/sprint-N/progress.md\` exist.
4. You are executing Phase 4 with the correct executor agent dispatched and their skill bindings loaded.

If the user says "build X" or "create X" — you start with Phase 1. NO EXCEPTIONS.
</HARD-GATE>

## Overview

IMH-Code is a production-grade multi-agent orchestration framework specialized for **SaaS development** using the **Next.js + Laravel + PostgreSQL** stack. It replaces monolithic prompts with a **6-Phase Pipeline** where specialized generic role-based agents (each with curated skill packs) are dispatched to complete specific tasks.

As the orchestrator (Planner), your job is to guide the user through this pipeline — **in order, with no skipping**.

---

## Context Recovery Protocol (MANDATORY for Non-Fresh-Start Requests)

<HARD-GATE>
When the user says "continue", "resume", "keep going", "continue development", or ANY variant that implies work-in-progress — you MUST NOT start planning or coding immediately.

Instead, follow this EXACT recovery sequence:

### Step 1: Read Context Files

Read these files IN ORDER. If a file doesn't exist, note it as MISSING:

1. \`PROJECT_BRIEF.md\` — What is the project? What sprint are we on?
2. \`docs/sprint-N/plan.md\` — What are the tasks for the current sprint?
3. \`docs/sprint-N/progress.md\` — Which tasks are done? Which are in progress?
4. \`.imhcode/context.md\` — Compact context summary

### Step 2: Determine Current Phase

Based on what exists and what's missing, determine the current phase:

| If this is true...                                       | You are in... | Next action                                 |
| -------------------------------------------------------- | ------------- | ------------------------------------------- |
| No \`PROJECT_BRIEF.md\`                                    | Phase 1       | Run plan command to generate brainstorming  |
| \`PROJECT_BRIEF.md\` exists but no \`docs/sprint-N/plan.md\` | Phase 3       | Run plan command to generate sprint plan    |
| \`plan.md\` exists but tasks are ⬜/🔨 in \`progress.md\`    | Phase 4       | Continue execute command from next task    |
| All tasks ✅/⏭️ but no final testing reports             | Phase 5       | Run test command to execute test sprint     |

### Step 3: Run Document Existence Check

Before doing ANYTHING else, verify ALL mandatory documents exist for the current sprint.
Print this checklist with ✅ or ❌ for each:

\`\`\`
═══════════════════════════════════════════
  DOCUMENT EXISTENCE CHECK — Sprint N
  [ ] PROJECT_BRIEF.md
  [ ] docs/sprint-N/plan.md
  [ ] docs/sprint-N/progress.md
  [ ] docs/sprint-N/deferred.md
  [ ] .imhcode/context.md
  [ ] imhcode.config.json
═══════════════════════════════════════════
\`\`\`

If ANY document is ❌ MISSING, CREATE IT NOW before proceeding to execution.

### Step 4: Report Status to User

Tell the user:
- What phase you're in
- What's done so far
- What's next
- Any missing documents you just created

Then proceed.
</HARD-GATE>

---

## The 6-Phase Pipeline

### Phase 1: Write
User writes their initial prompt or problem description inside \`docs/start.md\`.

### Phase 2: Plan (brainstorming generation)
Run \`imhcode plan\`. The planner agent reads \`docs/start.md\` and generates \`docs/brainstorming.md\` containing:
- Categorized questions about the frontend, backend, deployment, and stack.
- Smart auto-recommended answers based on keywords in the prompt.
- Testing strategy options: Fast (default), Balanced, or Strict TDD.

### Phase 3: Brainstorm (answering questions)
The user reviews \`docs/brainstorming.md\` and modifies any recommended answers if needed. Once done, the user runs \`imhcode plan\` again.

### Phase 4: Sprint Planning (sprint generation)
The planner agent reads the completed \`docs/brainstorming.md\`, writes configurations (like \`testing_mode\`) to \`imhcode.config.json\`, generates \`PROJECT_BRIEF.md\`, and generates all sprints:
- \`docs/sprint-N/plan.md\`
- \`docs/sprint-N/progress.md\`
- \`docs/sprint-N/deferred.md\`
- \`docs/sprint-N/tasks/task_*.sh\`
- If Fast or Balanced mode was selected, a final testing sprint is automatically appended to the roadmap.

### Phase 5: Execution
Run \`imhcode execute N\`. This runs the task execution harness sequentially. Each task is executed by the appropriate executor agent (e.g., \`nextjs-executor\`, \`laravel-executor\`).
- **Smart Skill Loading**: The agent only loads core skills (3-5 max). Extended skills are matched on-demand based on keywords in the task description.
- **Compact Context**: The agent reads \`.imhcode/context.md\` instead of raw files to save tokens.
- **Model Routing**: The agent uses the routed model from \`imhcode.config.json\`'s \`model_routing\` based on the agent's category.

### Phase 6: Testing & Audit
Run \`imhcode test\` to run the final testing sprint:
- Generates backend unit tests, frontend component tests, and E2E Playwright tests.
- Performs security audit (OWASP Top 10) using \`security-auditor\`.
- Performs SEO and accessibility audit using \`seo-optimizer\`.
- Outputs final reports and coverage.

---

## Generic Agent Architecture (19 Agents)

Instead of named persona agents, the framework uses 19 generic, role-based agents. When executing a task, check \`imhcode.config.json\` model routing for model mapping.

| ID | Role | Category | Core Skills |
|---|---|---|---|
| \`planner\` | Project Planner & Coordinator | planning | imhcode, imhcode-brainstorm, imhcode-sprint-planner |
| \`designer\` | UX/UI Designer | frontend | frontend-design, ui-ux-pro-max, modern-web-design |
| \`nextjs-executor\` | Next.js Full-Stack | frontend | nextjs-turbopack, shadcn-ui, tailwindcss-v4 |
| \`react-executor\` | React/Vite SPA | frontend | vite-patterns, frontend-design |
| \`vue-executor\` | Vue/Nuxt | frontend | vue3-composition, nuxt4-patterns |
| \`laravel-executor\` | Laravel Full-Stack | backend | laravel-patterns, backend-patterns |
| \`python-executor\` | Python/FastAPI/Django | backend | python-patterns, fastapi-patterns |
| \`java-executor\` | Java/Spring Boot | backend | java-patterns, springboot-patterns |
| \`flutter-executor\` | Flutter/Dart Mobile | backend | dart-flutter-patterns |
| \`react-native-executor\` | React Native/Expo | backend | react-native-best-practices |
| \`ios-executor\` | iOS/SwiftUI | backend | swiftui-patterns |
| \`android-executor\` | Android/Kotlin | backend | kotlin-patterns |
| \`systems-executor\` | Systems (Go/Rust/C++) | backend | golang-patterns, rust-patterns |
| \`web3-executor\` | Web3/Smart Contracts | backend | solidity-patterns |
| \`tester\` | QA & Testing | testing | e2e-testing, webapp-testing |
| \`security-auditor\` | Security Auditor | testing | imhcode-security, security-scan |
| \`seo-optimizer\` | SEO & Content | review | seo, seo-growth |
| \`devops-executor\` | DevOps & Deployment | backend | deployment-patterns, docker-patterns |
| \`debugger\` | Debugging Agent | review | systematic-debugging, error-handling |

---

## Sub-Agent Dispatch Protocol

When dispatching ANY agent during Phase 5 execution:

\`\`\`
1. Announce: "I am now acting as [Agent ID] ([Role]). Skills: [core skills] + matched [extended skills]"
2. Read imhcode.config.json to identify routed model.
3. Read .imhcode/context.md for project context.
4. Execute using ONLY bound skills for the category.
5. Drop persona: "Returning to Planner."
\`\`\`

---

## Codebase Structure Rules (MANDATORY)

<HARD-GATE>
ALL application code MUST live inside the project's designated code directories at the root of the repository.

\`\`\`
your-project/
├── frontend/          ← ALL frontend code (Next.js, React, etc.)
├── backend/           ← ALL backend code (Laravel, Django, etc.)
├── agents/            ← IMH-Code agent definitions (manifests + prompts)
├── skills/            ← IMH-Code skills library (SKILL.md files)
├── PROJECT_BRIEF.md   ← Master requirements document
└── imhcode.config.json ← Routing and configuration
\`\`\`

RULES:
1. Frontend code goes in \`frontend/\` ONLY.
2. Backend code goes in \`backend/\` ONLY.
3. NEVER create application code files at the project root.
</HARD-GATE>
