# Zeoel Framework — User Manual

Welcome to the Zeoel AI Agency! This manual will guide you through the process of interacting with Zeoel, understanding its 4-phase pipeline, and getting the most out of your 22-agent specialized team.

## Overview

Zeoel is not a simple "prompt-to-code" tool. It is a **multi-agent orchestration framework**. When you interact with Zeoel, you are acting as the Product Owner communicating with Gohar (the CEO and Lead Orchestrator), who then delegates tasks to 21 other specialized agents.

## 1. Initializing Zeoel

To add Zeoel to your project, run:
```bash
npx zeoel-framework init
```
This copies the `.agents/skills/zeoel` directory into your workspace, instantly equipping your AI coding assistant (Cursor, Copilot, Claude Code, etc.) with Zeoel's instructions.

## 2. Starting a Project

Simply open a chat with your AI assistant and say:
> "I want to build a [describe your app/SaaS/feature]"

### Phase 1: Brainstorming
Zeoel will NOT write code immediately.
- Gohar will simulate a debate between relevant agents (e.g., Mahdi for Design, Tariq for Backend, Ali for DevOps).
- They will ask you clarifying questions about your goals, stack, and constraints.
- Once you align, Gohar will write the `PROJECT_BRIEF.md`.

### Phase 2: Sprint Planning
- Gohar will decompose the `PROJECT_BRIEF.md` into actionable Sprints.
- He will write `docs/sprint-1/plan.md` and present it to you for approval.
- **Your Action**: Review the plan. If you agree, say "Approved, execute Sprint 1."

## 3. Execution & Safety

### Phase 2.5: Git Worktrees
When you approve execution, Zeoel uses a "Superpowers" methodology to keep your project safe:
- It will create a **Git Worktree** (e.g., a new branch named `feature/sprint-1` checked out into a `../sprint-1` directory).
- All work happens in this isolated directory. Your `main` branch is untouched.

### Phase 3: Execution (Strict TDD)
- Gohar dispatches individual agents (like Karar for frontend or Abbas for Python).
- **Strict Red-Green-Refactor TDD** is enforced. The agent MUST write a failing test first, then write the code to make it pass.
- After every task, they update `docs/sprint-1/progress.md`.

### Phase 4: Verification
When all tasks are done, Zeoel runs an automated sign-off process:
1. **Muhammad (QA)** verifies all tests pass.
2. **Ali (DevOps)** runs a security audit.
3. **Zara (SEO)** runs a metadata/SEO audit (if applicable).

Once all audits pass, Gohar will present the completed worktree to you.
- **Your Action**: You can test the app locally. If it looks good, tell Gohar to merge the branch to main and clean up the worktree.

## Troubleshooting & Debugging

If something goes wrong during execution, **Sajjad (Debugger & Perf)** steps in.
Zeoel forbids "shotgun debugging" (randomly changing code to fix an error). Sajjad will use a systematic 4-phase root cause process:
1. Reproduce the bug in a failing test.
2. Isolate the exact file/commit.
3. Trace the root cause.
4. Apply a minimal fix.

## Managing the Backlog

If a task is too complex or out of scope for the current sprint, Gohar will defer it.
- Deferred items are logged in `docs/sprint-N/deferred.md`.
- They roll up into the master `docs/deferred/backlog.md`.
- You can review these at the start of your next sprint.
