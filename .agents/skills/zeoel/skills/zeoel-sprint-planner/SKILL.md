---
name: zeoel-sprint-planner
description: "Phase 2: Use this after a PROJECT_BRIEF.md is approved. Gohar decomposes the brief into sprints and assigns tasks to specialized Zeoel agents with their skill bindings."
---

# Zeoel Phase 2: Sprint Planning

## Overview

Translate the `PROJECT_BRIEF.md` into actionable sprints. Gohar (CEO) breaks down the work into bite-sized tasks and assigns each task to the most appropriate Zeoel sub-agent **with their skill bindings explicitly listed**.

<HARD-GATE>
REFUSE to plan unless ALL of the following are true:
1. `PROJECT_BRIEF.md` exists in the project root
2. The user has explicitly approved the PROJECT_BRIEF.md
3. `docs/brainstorm/summary.md` exists (Phase 1 was completed properly)

If any are missing, tell the user: "Phase 1 is incomplete. I need to run the brainstorm first."
Then invoke `zeoel-brainstorm`.
</HARD-GATE>

## References

Read these before planning:
- **Sprint plan template**: `.agents/skills/zeoel/references/sprint-plan-template.md`
- **Skill mapping**: `.agents/skills/zeoel/references/skill-mapping-reference.md` — maps all 116 skills to agents
- **SaaS architect** (if SaaS): `.agents/skills/zeoel/skills/zeoel-saas-architect/SKILL.md`

## The Process (Follow in Order)

### Step 1: Read PROJECT_BRIEF.md
Understand the scope, architecture, tech stack, and team assignments.

### Step 2: Decompose into Sprints
Break the project into 1-5 sprints. Rules:
- Each sprint MUST deliver working, testable software.
- Sprint 0 is MANDATORY for SaaS projects (scaffold, auth, base DB, SEO infrastructure).
- Keep sprints focused: 5-10 tasks max per sprint.

### Step 3: Task Breakdown
Within each sprint, define tasks. Rules:
- Tasks MUST be small (15-30 mins of work each).
- **No placeholders**: Do not write "implement backend". Write "Create `UserController.php` with `store` and `index` methods."
- **TDD focus**: Sequence tests BEFORE implementation in the task list.
- **Clear boundaries**: Ensure two agents aren't modifying the same file.
- **Required Tests column is MANDATORY**: Every code-producing task must specify what tests are expected (e.g., "Component test + accessibility test", "Feature test + auth bypass test"). Design/coordination tasks can use "—".

### Step 4: Agent Assignment with Skill Bindings
For EVERY task, explicitly assign an agent AND list the skills they will use:

| Task Type | Assign To | Primary Skills (⭐) to Load |
|-----------|-----------|----------------------------|
| UI/UX Design, wireframes | **Mahdi** (Designer) | `frontend-design`, `seo` |
| CSS, animations, 3D, visual polish | **Mustafa** (Visual) | `frontend-design`, `ui-ux-pro-max`, `threejs-webgl`, `gsap-scrolltrigger` |
| Next.js pages, components, React | **Karar** (Frontend) | `nextjs-turbopack`, `frontend-design`, `seo`, `ui-ux-pro-max`, `threejs-webgl`, `gsap-scrolltrigger` |
| Laravel API, auth, billing, backend | **Tariq** (Backend) | `laravel-patterns`, `laravel-security`, `postgres-patterns`, `api-design` |
| SEO strategy, keywords, meta, content | **Zara** (SEO) | `seo` |
| Flutter mobile app | **Hassan** (Mobile) | `dart-flutter-patterns`, `flutter-dart-code-review`, `mobile-app-design` |
| Data analytics, ML, DB optimization | **Fatima** (Data) | `postgres-patterns`, `python-patterns`, `mle-workflow` |
| Python scripts, FastAPI, automation | **Gohar(Py)** (Python) | `python-patterns`, `python-testing`, `mle-workflow` |
| Debugging, performance profiling | **Sajjad** (Debugger) | `agent-introspection-debugging`, `error-handling`, `benchmark` |
| Documentation, API specs | **Baqir** (Docs) | `zeoel-codebase-knowledge`, `codebase-onboarding`, `api-design` |
| Testing, QA, E2E | **Muhammad** (QA) | `e2e-testing`, `webapp-testing` |
| Docker, CI/CD, security, deployment | **Ali** (DevOps) | `deployment-patterns`, `docker-patterns`, `security-review`, `zeoel-security` |

**The plan.md MUST include the "Skills to Load" column in the task table.**

### Step 5: Team Consilium (Mandatory)
Before finalizing the plan, run a team consilium where each relevant agent reviews from their perspective:
- **Gohar**: Timeline realistic? What to cut?
- **Karar**: Technically feasible? Scope risks?
- **Tariq**: Security concerns? API design issues?
- **Zara**: SEO coverage? Missing pages or meta?
- **Muhammad**: Testable? Edge cases?
- **Ali**: Deployment feasibility? Infrastructure needs?

Flag issues and revise the plan before presenting to the user.

### Step 6: Write Sprint Documents
Create ALL of these files:

**`docs/sprint-N/plan.md`** — Using the template from `references/sprint-plan-template.md`:
- Sprint goal and branch name
- Prioritized task list with Agent + Skills + **Required Tests** columns
- Work schedule with phases
- Success criteria (testable checkboxes)
- What's NOT in this sprint
- Execution dispatch instructions

**`docs/sprint-N/progress.md`** — Using the template from `references/sprint-plan-template.md` (Progress Tracker section):
- Task status table (all tasks start as ⬜ Not started)
- Audit Checkpoints section (empty, filled during Phase 3)
- Bugs Found section (empty)
- Notes section (empty)

**`docs/sprint-N/deferred.md`** — Using the template from `references/sprint-plan-template.md` (Deferred Items Tracker section):
- Deferred Items table (empty or pre-populated from plan's "What's NOT in This Sprint")
- Simplifications Made table (empty)

**`docs/deferred/backlog.md`** — Using the template from `references/sprint-plan-template.md` (Cumulative Deferred Backlog section):
- Create once (first sprint), then update for subsequent sprints
- Review any pending items from previous sprints

**Pre-create audit doc stubs** (empty, to be filled during Phase 3 incremental audits):
- `docs/qa/sprint-N-signoff.md` — empty with header
- `docs/security/sprint-N-audit.md` — empty with header
- `docs/seo/sprint-N-audit.md` — empty with header (if sprint has public pages)

### Step 7: User Review
Present the sprint plan to the user. They MUST approve before execution begins.

### Step 8: Transition to Phase 3
Once approved, invoke `zeoel-dispatch` for Phase 3 (Execution).
- Read `.agents/skills/zeoel/skills/zeoel-dispatch/SKILL.md`.

## Mandatory Outputs

At the end of Phase 2, these files MUST exist FOR EACH planned sprint:

| File | Description |
|------|-------------|
| `docs/sprint-N/plan.md` | Sprint plan with tasks, agents, skill bindings, and **required tests** |
| `docs/sprint-N/progress.md` | Progress tracker with audit checkpoints (created empty, updated during Phase 3) |
| `docs/sprint-N/deferred.md` | Deferred items tracker (created empty, updated when scope is cut) |
| `docs/deferred/backlog.md` | Cumulative deferred backlog (created once, updated every sprint) |
| `docs/qa/sprint-N-signoff.md` | QA sign-off stub (created empty, filled during Phase 3+4) |
| `docs/security/sprint-N-audit.md` | Security audit stub (created empty, filled during Phase 3+4) |
| `docs/seo/sprint-N-audit.md` | SEO audit stub (created empty if public pages, filled during Phase 3+4) |

**If any file is missing, Phase 2 is NOT complete. Do NOT proceed to Phase 3.**

## Critical Rules for Plans

- **No placeholders**: Do not write "implement backend". Write "Create `UserController.php` with `store` and `index` methods."
- **TDD focus**: Always sequence tests *before* implementation in the task list.
- **Clear boundaries**: Ensure Karar and Tariq aren't trying to modify the same file in parallel.
- **Skills column is mandatory**: Every task MUST list which skills the assigned agent will use.
- **Required Tests column is mandatory**: Every code-producing task MUST specify what tests are expected.
- **Sprint 0 for SaaS**: Always start with a foundation sprint for SaaS projects.
- **Deferred.md is mandatory**: Even if nothing is deferred, create the file with "No items deferred."
- **Audit doc stubs are mandatory**: Pre-create empty audit docs so incremental audits can append to them during Phase 3.
