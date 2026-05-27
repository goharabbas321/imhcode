---
name: zeoel-dispatch
description: "Phase 3: Execute the sprint plan by dispatching specialized sub-agents with their curated skill packs. Mandatory skill loading, progress tracking, test enforcement, and QA review per task."
---

# Zeoel Phase 3: Execution Dispatcher

## Overview

Execute the sprint plan by dispatching the correct Zeoel sub-agent for each task. You (Gohar/CEO) act as the Orchestrator — reading the plan and spinning up the assigned agent with their full skill context.

<HARD-GATE>
REFUSE to execute unless ALL of the following are true:
1. `PROJECT_BRIEF.md` exists and is approved
2. `docs/sprint-N/plan.md` exists for the current sprint
3. `docs/sprint-N/progress.md` exists for the current sprint
4. `docs/sprint-N/deferred.md` exists for the current sprint

If any are missing, tell the user which phase is incomplete and redirect them.
</HARD-GATE>

---

## Mandatory Sub-Agent Dispatch Protocol

For EVERY task in `docs/sprint-N/plan.md`, follow this EXACT 8-step protocol:

<HARD-GATE>
ANTI-BYPASS SELF-CHECK: Before writing ANY code for ANY task, you MUST:

1. ✅ ASK YOURSELF: "Have I read the agent's .md file for this task?"
   → If NO, go read it NOW: `.agents/skills/zeoel/agents/[name].md`

2. ✅ ASK YOURSELF: "Have I loaded their ⭐ skill SKILL.md files?"
   → If NO, go read them NOW: `.agents/skills/zeoel/skills/[skill-name]/SKILL.md`

3. ✅ ASK YOURSELF: "Have I output the dispatch announcement banner?"
   → If NO, output it NOW using the format in Step 4.

4. ✅ ASK YOURSELF: "Am I currently in character as the assigned agent?"
   → If NO, STOP and re-enter the dispatch protocol from Step 1.

Executing a task as the generic LLM without dispatching the assigned agent is an
ANTI-PATTERN that produces low-quality code. The agent's skill files contain critical
patterns, constraints, and best practices that the generic LLM does not know.

This is NOT a suggestion. This is a MANDATORY gate.
</HARD-GATE>

### Step 1: Identify the Assigned Agent

Read the task table in `plan.md`. Note the assigned agent, their listed skills, and the **required tests** column.

**Parallel Dispatch Guidelines:** If multiple tasks are independent (e.g., Tariq building a backend API and Karar building a frontend UI component), Gohar may dispatch parallel sub-agents concurrently. Ensure independent tasks do not conflict in the same files.

### Step 2: Read the Agent Definition

Read the agent's persona file:

```
.agents/skills/zeoel/agents/[name].md
```

Extract:

- **Persona** — their personality, biases, and tendencies
- **Skill Bindings** — the complete list of skills they can use
- **Constraints & Anti-Patterns** — what they MUST and MUST NOT do
- **Output Format** — what files/format they should produce
- **Testing Protocol** — what tests they MUST produce

### Step 3: Load Primary (⭐) Skill SKILL.md Files

For each ⭐ (starred) skill in the agent's Skill Bindings:

```
.agents/skills/zeoel/skills/[skill-name]/SKILL.md
```

Load only the ⭐ skills by default. Load additional skills only if the specific task requires them.

### Step 4: Announce the Dispatch

Before writing any code, announce:

```
═══════════════════════════════════════════
  DISPATCHING: [Name] ([Role])
  Task: [Task # — Task description]
  Skills Loaded: [list of ⭐ skills]
  Required Tests: [what tests this task must produce]
═══════════════════════════════════════════
```

### Step 5: Execute the Task (with Mandatory Tests)

The agent completes the task using ONLY their bound skills.

- Stay in character — use the agent's persona, expertise, and constraints.
- Follow their Output Format specification.
- Do NOT use skills outside their bindings.

**TEST MANDATE — STRICT RED-GREEN-REFACTOR TDD:**
Read and follow `.agents/skills/zeoel/skills/test-driven-development/SKILL.md`.
You MUST:

1. **RED**: Write a failing test first. Verify it fails.
2. **GREEN**: Write minimal code to make it pass.
3. **REFACTOR**: Clean up the code.
   If you write implementation code before a failing test exists, you have failed the process.
   | Task Type | Required Tests | Agent |
   |-----------|---------------|-------|
   | React component | Component test (`.test.tsx`) using Vitest + Testing Library | Karar |
   | Next.js page/route | Integration test for the route + accessibility assertions | Karar |
   | Laravel controller/route | Feature Test (PHPUnit) for every endpoint | Tariq |
   | Laravel Service/Action | Unit Test for every public method | Tariq |
   | Auth/protected endpoint | Security test assertions (auth bypass, invalid tokens, RBAC) | Tariq |
   | Input validation | Validation boundary tests (XSS, SQL injection, oversized input) | Tariq |
   | Database migration | Migration rollback test | Tariq |
   | Tenant-scoped query | Tenant isolation verification test | Tariq |
   | Flutter widget | Widget test using WidgetTester | Abdullah |
   | React Native component | Jest / testing-library spec file | Zayd |
   | Python function/module | pytest test file | Gohar(Py)/Fatima |
   | CI/CD pipeline | Pipeline validation test | Ali |
   | API endpoint (any) | Request/response contract test | Tariq/Gohar(Py) |

**If a task produces code but NO tests, the task is NOT done. Go back and write the tests.**

### Step 6: Review, Track, and Return

**A. Two-Stage Review & Verification Before Completion:**

1. **Spec Compliance**: Does the code do EXACTLY what the task asked? No more, no less. (YAGNI)
2. **Code Quality**: Would Muhammad (QA) or Sajjad (Perf) flag any issues with this code?
3. **Test Review**: Do test files exist? Did you follow Red-Green-Refactor?
4. **Verification**: DO NOT GUESS. You must actually compile the code and run the tests to PROVE the task is complete. Never assume it works without verification.

**B. Update Progress Tracker:**
Update `docs/sprint-N/progress.md`:

- Mark the task status: ✅ Done, ❌ Blocked, or 🔨 In progress
- Record test files created in the Notes column
- Add timestamp of the update

**C. Drop the Persona:**

```
═══════════════════════════════════════════
  COMPLETED: Task [#] — [description]
  Tests Created: [list test files]
  Returning to Gohar (CEO)
═══════════════════════════════════════════
```

### Step 7: Post-Task Checkpoint (BLOCKING)

<HARD-GATE>
You MUST NOT move to the next task until ALL of the following are TRUE:

1. ✅ `docs/sprint-N/progress.md` has been updated with this task's status
2. ✅ Test files exist for all new code produced by this task
3. ✅ If any feature/scope was cut or deferred → logged in `docs/sprint-N/deferred.md`
4. ✅ If any bugs were discovered → logged in `progress.md` Bugs Found section

If ANY of these are false, complete them NOW before moving to the next task.
</HARD-GATE>

### Step 8: Incremental Audit Check (Every 3 Tasks)

After every 3 completed tasks, run a **mini audit cycle**:

1. **Muhammad (QA) Quick Review**:
   - Are all test files present for the last 3 tasks?
   - Do tests pass?
   - Append findings to `docs/qa/sprint-N-signoff.md` (create if first audit)

2. **Ali (Security) Quick Scan**:
   - Any hardcoded secrets in the last 3 tasks?
   - Any auth/validation gaps?
   - Append findings to `docs/security/sprint-N-audit.md` (create if first audit)

3. **Zara (SEO) Quick Check** (if any public pages were built):
   - Do new pages have metadata exports?
   - Is heading hierarchy correct?
   - Append findings to `docs/seo/sprint-N-audit.md` (create if first audit)

**The incremental audit ensures issues are caught early, not just at Phase 4.**

After the audit, **update `docs/sprint-N/progress.md`** with an audit checkpoint note:

```
### Audit Checkpoint (after Task #N)
- QA: [PASS/issues found]
- Security: [PASS/issues found]
- SEO: [PASS/N/A]
```

**Then move to the next task.**

---

## Agent Quick-Reference (Dispatch Table)

| If the task is...                | Dispatch...  | Read this agent file           | Load these ⭐ skills                                                                                 |
| -------------------------------- | ------------ | ------------------------------ | ---------------------------------------------------------------------------------------------------- |
| Next.js pages, components, React | **Karar**    | `agents/karar-frontend.md`     | `nextjs-turbopack`, `frontend-design`, `seo`, `ui-ux-pro-max`, `threejs-webgl`, `gsap-scrolltrigger` |
| Laravel API, auth, billing       | **Tariq**    | `agents/tariq-backend.md`      | `laravel-patterns`, `laravel-security`, `postgres-patterns`, `api-design`                            |
| UX design, wireframes            | **Mahdi**    | `agents/mahdi-designer.md`     | `frontend-design`, `seo`                                                                             |
| CSS, animations, 3D, visual      | **Mustafa**  | `agents/mustafa-visual.md`     | `frontend-design`, `ui-ux-pro-max`, `threejs-webgl`, `gsap-scrolltrigger`, `motion-framer`           |
| SEO, keywords, meta, content     | **Zara**     | `agents/zara-content.md`       | `seo`                                                                                                |
| Flutter mobile app               | **Abdullah** | `agents/abdullah-mobile.md`    | `dart-flutter-patterns`, `flutter-dart-code-review`, `mobile-app-design`                             |
| React Native mobile app          | **Zayd**     | `agents/zayd-react-native.md`  | `react-native-best-practices`, `react-native-brownfield-migration`, `upgrading-react-native`          |
| Data, analytics, ML              | **Fatima**   | `agents/fatima-data.md`        | `postgres-patterns`, `python-patterns`, `mle-workflow`                                               |
| Python, Django, FastAPI, ML      | **Abbas**    | `agents/abbas-python.md`       | `python-patterns`, `django-patterns`, `mle-workflow`, `django-celery`                                |
| Debugging, performance           | **Sajjad**   | `agents/sajjad-debugger.md`    | `agent-introspection-debugging`, `error-handling`, `benchmark`                                       |
| Documentation, API specs         | **Baqir**    | `agents/baqir-docs.md`         | `zeoel-codebase-knowledge`, `codebase-onboarding`, `api-design`                                      |
| Testing, QA, E2E                 | **Muhammad** | `agents/muhammad-qa.md`        | `e2e-testing`, `webapp-testing`                                                                      |
| Docker, CI/CD, security          | **Ali**      | `agents/ali-devops.md`         | `deployment-patterns`, `docker-patterns`, `security-review`, `zeoel-security`                        |
| AI agents, LLM orchestration     | **Ibrahim**  | `agents/ibrahim-ai.md`         | `agentic-engineering`, `agent-architecture-audit`, `mcp-server-patterns`                             |
| Enterprise Java, Spring Boot     | **Yusuf**    | `agents/yusuf-java.md`         | `springboot-patterns`, `springboot-security`, `java-coding-standards`                                |
| High-performance Go/Rust         | **Bilal**    | `agents/bilal-systems.md`      | `golang-patterns`, `rust-patterns`                                                                   |
| Native iOS, SwiftUI              | **Layla**    | `agents/layla-ios.md`          | `swiftui-patterns`, `swift-concurrency-6-2`                                                          |
| Native Android, Kotlin           | **Hamza**    | `agents/hamza-android.md`      | `kotlin-patterns`, `android-clean-architecture`                                                      |
| Healthcare, HIPAA compliance     | **Khadija**  | `agents/khadija-healthcare.md` | `healthcare-emr-patterns`, `hipaa-compliance`                                                        |
| Web3, Smart Contracts, DeFi      | **Salman**   | `agents/salman-web3.md`        | `defi-amm-security`                                                                                  |
| Business ops, logistics, billing | **Maryam**   | `agents/maryam-ops.md`         | `customer-billing-ops`                                                                               |

All agent files are at: `.agents/skills/zeoel/agents/`
All skill files are at: `.agents/skills/zeoel/skills/[skill-name]/SKILL.md`

---

## Status Handling

If a sub-agent reports:

- **DONE**: Proceed to the two-stage review, then the Post-Task Checkpoint (Step 7), then next task.
- **BLOCKED**: Step in as Gohar to assess. Break the task down further, or ask the user for help. Log the blocker in `progress.md`.
- **NEEDS_CONTEXT**: Provide the missing files/context to the agent and retry. Do NOT guess.
- **DEFERRED**: Log the deferred item in `docs/sprint-N/deferred.md` with reason and priority. Mark the task as ⏭️ Deferred in `progress.md`.

---

## Deferred Items Protocol

After EVERY task, check: **Was anything cut, simplified, or deferred?**

If YES, immediately update `docs/sprint-N/deferred.md`:

```markdown
| #   | Item                | Original Task | Reason | Priority | Target Sprint |
| --- | ------------------- | ------------- | ------ | -------- | ------------- |
| 1   | [what was deferred] | Task #N       | [why]  | P1/P2/P3 | Sprint N+1    |
```

Also update `docs/deferred/backlog.md` (the cumulative master list):

```markdown
| #   | Item   | Source Sprint | Reason | Priority | Status     |
| --- | ------ | ------------- | ------ | -------- | ---------- |
| 1   | [item] | Sprint N      | [why]  | P1       | ⬜ Pending |
```

**Deferred items MUST be reviewed at the start of the next sprint during Phase 2 planning.**

---

## Phase 4: Verify & Ship (End of Sprint)

When ALL sprint tasks are marked ✅ in `progress.md`, execute Phase 4 in this EXACT order:

### Step 1: QA Sign-Off

Dispatch **Muhammad (QA)** — Read `agents/muhammad-qa.md`, load `e2e-testing` + `webapp-testing`:

- Verify ALL task-level tests exist and pass
- Run E2E tests (Playwright) for all pages/flows
- Update `docs/tests/sprint-N-coverage.md` with coverage summary
- File bugs in `progress.md` under "Bugs Found"
- If bugs are blockers: dispatch the original agent to fix, then re-test
- **Finalize** `docs/qa/sprint-N-signoff.md` (merge incremental notes + final results)

### Step 2: Security Audit

Dispatch **Ali (DevOps)** — Read `agents/ali-devops.md`, load `zeoel-security` + `security-review`:

- Run OWASP ASI compliance check
- Verify all security tests pass (auth bypass, input validation, tenant isolation)
- **Finalize** `docs/security/sprint-N-audit.md` (merge incremental notes + full audit)

### Step 3: SEO Audit (if public pages exist)

Dispatch **Zara (SEO)** — Read `agents/zara-content.md`, load `seo`:

- Verify heading hierarchy, meta, JSON-LD, sitemap
- **Finalize** `docs/seo/sprint-N-audit.md` (merge incremental notes + full audit)

### Step 4: Sprint Handoff

<HARD-GATE>
You MUST NOT write `docs/sprint-N/done.md` until ALL of the following files exist AND are finalized:

1. ✅ `docs/qa/sprint-N-signoff.md` — exists and says PASS (or all blockers resolved)
2. ✅ `docs/security/sprint-N-audit.md` — exists and all critical issues resolved
3. ✅ `docs/seo/sprint-N-audit.md` — exists (or sprint had NO public pages — document this)
4. ✅ `docs/tests/sprint-N-coverage.md` — exists with test counts and coverage
5. ✅ `docs/sprint-N/deferred.md` — exists (even if empty — document "nothing deferred")
6. ✅ `docs/deferred/backlog.md` — updated with any new deferred items
7. ✅ All tasks in `docs/sprint-N/progress.md` are ✅ Done or ⏭️ Deferred (with logged reasons)

If ANY item is missing, STOP and complete it FIRST. Do NOT skip.
</HARD-GATE>

Gohar (CEO) then writes:

- `docs/sprint-N/done.md` — using the template from `references/sprint-plan-template.md`
- Updates `PROJECT_BRIEF.md` — sprint status section, current state section
- Updates `docs/deferred/backlog.md` — mark sprint items as reviewed

### Step 5: Worktree Snapshot Archive

After `done.md` is written, Gohar MUST commit the final state, merge to main, and create the snapshot worktree:
```bash
git add .
git commit -m "chore(sprint-N): finalize sprint docs"
git checkout main
git merge feature/sprint-N
git worktree add .worktrees/sprint-N feature/sprint-N
```
This creates a permanent, runnable snapshot of the sprint in `.worktrees/sprint-N` while the active `main` branch contains all merged code in the root `frontend/` and `backend/` folders.

---

## Phase 4 Document Creation — Step by Step

If any Phase 4 document is missing, create it NOW using this exact procedure.
**Do NOT skip any step. Do NOT assume a document exists — check explicitly.**

### Document 1: `docs/qa/sprint-N-signoff.md`

If missing:

1. Dispatch **Muhammad (QA)** — read `agents/muhammad-qa.md`, load `e2e-testing` + `webapp-testing`
2. Use the **QA Sign-off Template** from `references/sprint-plan-template.md`
3. Fill in incremental audit history + final results
4. Verify all test files exist for all tasks

### Document 2: `docs/security/sprint-N-audit.md`

If missing:

1. Dispatch **Ali (DevOps)** — read `agents/ali-devops.md`, load `zeoel-security` + `security-review`
2. Use the **Security Audit Template** from `references/sprint-plan-template.md`
3. Fill in OWASP checks + findings
4. Verify no hardcoded secrets exist

### Document 3: `docs/seo/sprint-N-audit.md`

If missing:

- **If sprint has public pages**: Dispatch **Zara (SEO)** — read `agents/zara-content.md`, load `seo`. Use the **SEO Audit Template** from `references/sprint-plan-template.md`.
- **If sprint has NO public pages**: Create the file with content: `# SEO Audit — Sprint N\n\nN/A — Sprint N had no public-facing pages.`

### Document 4: `docs/tests/sprint-N-coverage.md`

If missing:

1. Dispatch **Muhammad (QA)** — create test coverage summary
2. Use the **Test Coverage Tracker** template from `references/sprint-plan-template.md`
3. List every task and its corresponding test files

### Document 5: `docs/sprint-N/deferred.md`

If missing:

- Create with content: `# Sprint N — Deferred Items\n\nNo items were deferred during this sprint.`

### Document 6: `docs/deferred/backlog.md`

If missing:

- Create using the **Cumulative Deferred Backlog** template from `references/sprint-plan-template.md`

### Document 7: `docs/sprint-N/done.md` (CREATE LAST)

- Only create this AFTER ALL documents 1-6 exist and are finalized
- Use the **Done File** template from `references/sprint-plan-template.md`

### Document 8: `PROJECT_BRIEF.md`

- Update the sprint status section with the current sprint's outcome
- Update the "Current State" section

**After creating all documents, print the Phase 4 Completion Checklist from SKILL.md to verify everything is ✅.**

---

## Mandatory Phase 4 Checklist

Before declaring a sprint DONE, ALL of these MUST be true:

- [ ] All tasks in `docs/sprint-N/progress.md` are marked ✅ Done or ⏭️ Deferred
- [ ] Every task that produced code also produced corresponding test files
- [ ] `docs/tests/sprint-N-coverage.md` exists with test summary
- [ ] `docs/qa/sprint-N-signoff.md` exists and says PASS
- [ ] `docs/security/sprint-N-audit.md` exists and all criticals resolved
- [ ] `docs/seo/sprint-N-audit.md` exists (or documented as N/A with reason)
- [ ] `docs/sprint-N/deferred.md` exists (even if empty)
- [ ] `docs/deferred/backlog.md` is updated
- [ ] `docs/sprint-N/done.md` is written
- [ ] `PROJECT_BRIEF.md` sprint status is updated

**If ANY item is missing, the sprint is NOT done. Complete the missing items first.**
