# Zeoel Framework — User Manual

Welcome to the Zeoel AI Agency! This manual will guide you through the process of interacting with Zeoel, understanding its 4-phase pipeline, and getting the most out of your 23-agent specialized team.

## Overview

Zeoel is not a simple "prompt-to-code" tool. It is a **multi-agent orchestration framework** designed for **Claude Code**, **Cursor**, **Gemini CLI**, and **GitHub Copilot**. When you interact with Zeoel, you are acting as the Product Owner communicating with Gohar (the CEO and Lead Orchestrator), who then delegates tasks to 22 other specialized agents.

## 1. Initializing Zeoel

To add Zeoel to your project, run:
```bash
npx zeoel-framework init
```
This copies the `.agents/skills/zeoel` directory into your workspace, instantly equipping your AI coding assistant (Claude Code, Cursor, Copilot, Gemini CLI, etc.) with Zeoel's instructions.

## 2. Starting a Project

Simply open a chat with your AI assistant and say:
> "I want to build a [describe your app/SaaS/feature]"

### Step 0: Project Configuration (NEW)
Before brainstorming begins, **Gohar (CEO) will ask you key configuration questions** to tailor the entire development process to your needs:

1. **Stack scope** — Frontend only (with mock data), full-stack, or backend only?
2. **Frontend framework** — Next.js, Vite + React, Nuxt, or other?
3. **Backend framework** — Laravel, Django, FastAPI, NestJS, Spring Boot, or none?
4. **Database** — PostgreSQL, MySQL, MongoDB, SQLite, or none?
5. **Mobile** — Do you need a companion app? (Flutter / React Native / None)
6. **Worktree snapshots** — Should Zeoel archive each sprint to `.worktrees/sprint-N/`? (Yes/No)
7. **Testing strictness** — Strict TDD (Red-Green-Refactor, mandatory) or Relaxed (tests after code)?

Your answers are saved in `PROJECT_BRIEF.md` and control which agents get dispatched.

### Phase 1: Brainstorming
Zeoel will NOT write code immediately.
- Gohar will simulate a debate between relevant agents (e.g., Mahdi for Design, Tariq for Backend, Ali for DevOps).
- They will ask you clarifying questions about your goals, stack, and constraints.
- Once you align, Gohar will write the `PROJECT_BRIEF.md`.

### Phase 2: Sprint Planning
- Gohar will decompose the `PROJECT_BRIEF.md` into actionable Sprints.
- He will write `docs/sprint-1/plan.md` and present it to you for approval.
- **Your Action**: Review the plan. If you agree, say "Approved, execute Sprint 1."

## 3. Execution & Codebase Structure

### Codebase Containment Rules
Zeoel strictly enforces codebase hygiene. All code must reside within the root of the repository:
- `frontend/` (Next.js, React, etc.)
- `backend/` (Laravel, Django, etc.)

No application code will be created at the project root or in unapproved directories.

### Phase 2.5: Environment Isolation
When you approve execution, Zeoel creates a new branch (`feature/sprint-1`) in the root directory. All active development happens right in front of you in the main `frontend/` and `backend/` folders. Your `main` branch is untouched until the sprint is complete.

### Phase 3: Execution (Strict TDD)
- Gohar dispatches individual agents (like Karar for frontend or Abbas for Python).
- **Strict Red-Green-Refactor TDD** is enforced (unless you chose Relaxed mode). The agent MUST write a failing test first, then write the code to make it pass.
- After every task, they update `docs/sprint-1/progress.md`.

### Phase 4: Verification & Snapshot
When all tasks are done, Zeoel runs an automated sign-off process:
1. **Muhammad (QA)** verifies all tests pass.
2. **Ali (DevOps)** runs a security audit.
3. **Zara (SEO)** checks headings and meta tags (if applicable).

Once all audits pass, Gohar generates `docs/sprint-1/done.md`, merges the branch to `main`, and (if you enabled snapshots) creates a **Sprint Snapshot** at `.worktrees/sprint-1/` — a permanent, browsable, and runnable milestone of the sprint deliverables.

- **Your Action**: You can test the app locally. If it looks good, you are ready to plan Sprint 2!

## Troubleshooting & Debugging

If something goes wrong during execution, **Sajjad (Debugger & Perf)** steps in.
Zeoel forbids "shotgun debugging" (randomly changing code to fix an error). Sajjad will use a systematic 4-phase root cause process:
1. Reproduce the bug in a failing test.
2. Isolate the exact file/commit.
3. Trace the root cause.
4. Apply a minimal fix.

**Common Issues:**
- **Context Loss**: If the AI forgets what it was doing, tell it: *"Run the Context Recovery Protocol from SKILL.md"*.
- **Code outside directories**: If an agent tries to create files at the root, remind it: *"Follow the Codebase Containment Rules."*

## Managing the Backlog

If a task is too complex or out of scope for the current sprint, Gohar will defer it.
- Deferred items are logged in `docs/sprint-N/deferred.md`.
- They roll up into the master `docs/deferred/backlog.md`.
- You can review these at the start of your next sprint.

## Contact & Support
- **Author**: Gohar Abbas (@goharabbas321)
- **Telegram**: [@goharabbas786](https://t.me/goharabbas786)
- **GitHub**: [zeoel-framework](https://github.com/goharabbas321/zeoel-framework)
