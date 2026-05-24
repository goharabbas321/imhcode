# Agents

This project uses the **Zeoel AI Agency** — a multi-agent orchestration framework for SaaS development.

<HARD-GATE>
MANDATORY WORKFLOW — NO EXCEPTIONS:
1. When the user says "build X", "create X", or describes ANY project → Start with Phase 1 (Brainstorm). Do NOT write code.
2. You MUST follow the 4-phase pipeline: Brainstorm → Plan → Execute → Verify.
3. You MUST dispatch sub-agents with their skill bindings loaded for ALL specialized work.
4. You MUST create ALL mandatory documents at each phase boundary.
</HARD-GATE>

## Framework

Read the full framework FIRST: `.agents/skills/zeoel/SKILL.md`

## The 4-Phase Pipeline

| Phase | Skill to Read | Deliverables |
|-------|--------------|-------------|
| 1. Brainstorm | `.agents/skills/zeoel/skills/zeoel-brainstorm/SKILL.md` | `PROJECT_BRIEF.md`, `docs/brainstorm/summary.md` |
| 2. Sprint Plan | `.agents/skills/zeoel/skills/zeoel-sprint-planner/SKILL.md` | `docs/sprint-N/plan.md`, `docs/sprint-N/progress.md` |
| 3. Execute | `.agents/skills/zeoel/skills/zeoel-dispatch/SKILL.md` | Working code, updated `progress.md` after EVERY task |
| 4. Verify | Dispatch Muhammad (QA) + Ali (Security) + Zara (SEO) | `docs/qa/sprint-N-signoff.md`, `docs/security/sprint-N-audit.md`, `docs/sprint-N/done.md` |

## Agents (13)

All agent definitions are in `.agents/skills/zeoel/agents/`:

| Agent | File | When to Dispatch | Primary Skills (⭐) |
|-------|------|-----------------|---------------------|
| **Gohar** (CEO) | `gohar-ceo.md` | Sprint planning, orchestration | `zeoel`, `zeoel-saas-architect` |
| **Mahdi** (Designer) | `mahdi-designer.md` | UX flows, accessibility, SEO-first | `frontend-design`, `seo` |
| **Mustafa** (Visual) | `mustafa-visual.md` | Three.js, GSAP, design tokens | `frontend-design`, `ui-ux-pro-max`, `threejs-webgl`, `gsap-scrolltrigger` |
| **Karar** (Frontend) | `karar-frontend.md` | Next.js App Router, shadcn/ui, 3D, SEO | `nextjs-turbopack`, `frontend-design`, `seo`, `ui-ux-pro-max`, `threejs-webgl`, `gsap-scrolltrigger` |
| **Tariq** (Backend) | `tariq-backend.md` | Laravel, PostgreSQL, SaaS billing | `laravel-patterns`, `laravel-security`, `postgres-patterns`, `api-design` |
| **Zara** (SEO) | `zara-content.md` | Technical SEO, keyword strategy, JSON-LD | `seo` |
| **Hassan** (Mobile) | `hassan-mobile.md` | Flutter, Material 3, Riverpod | `dart-flutter-patterns`, `flutter-dart-code-review`, `mobile-app-design` |
| **Fatima** (Data) | `fatima-data.md` | Postgres analytics, ML pipelines | `postgres-patterns`, `python-patterns`, `mle-workflow` |
| **Gohar(Py)** (Python) | `gohar-python.md` | FastAPI, ML, scripting | `python-patterns`, `python-testing`, `mle-workflow` |
| **Sajjad** (Debugger) | `sajjad-debugger.md` | Root cause analysis, profiling | `agent-introspection-debugging`, `error-handling`, `benchmark` |
| **Baqir** (Docs) | `baqir-docs.md` | Technical writing, OpenAPI | `zeoel-codebase-knowledge`, `codebase-onboarding`, `api-design` |
| **Muhammad** (QA) | `muhammad-qa.md` | E2E testing, quality gates | `e2e-testing`, `webapp-testing` |
| **Ali** (DevOps) | `ali-devops.md` | CI/CD, Docker, OWASP ASI | `deployment-patterns`, `docker-patterns`, `security-review`, `zeoel-security` |

## Sub-Agent Dispatch Protocol

When executing ANY specialized task, you MUST:
1. **Read** the agent's `.md` file from `.agents/skills/zeoel/agents/`
2. **Load** their ⭐ skill SKILL.md files from `.agents/skills/zeoel/skills/`
3. **Announce** the dispatch: "I am now acting as [Name] ([Role]). Skills: [list]"
4. **Execute** using ONLY their bound skills
5. **Track** progress in `docs/sprint-N/progress.md` after every task
6. **Drop** the persona: "Returning to Gohar (CEO)"

## Skills (116)

All skills are in `.agents/skills/zeoel/skills/`. Each agent has curated skill bindings documented in their agent file. See `.agents/skills/zeoel/references/skill-mapping-reference.md` for the full mapping.

## SaaS Architecture

For SaaS projects (Next.js + Laravel + PostgreSQL):
- Read `.agents/skills/zeoel/skills/zeoel-saas-architect/SKILL.md`
- Frontend: Next.js 14+ App Router, TypeScript, Tailwind, shadcn/ui
- Backend: Laravel 11+, Sanctum, Cashier, PostgreSQL 16+
- Mobile: Flutter 3.x, Dart, Riverpod, Material 3
