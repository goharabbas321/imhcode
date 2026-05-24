# Copilot Instructions

This project uses the **Zeoel AI Agency** — a multi-agent framework for SaaS development (Next.js + Laravel + PostgreSQL).

## Mandatory Rules (NO EXCEPTIONS)

1. **NEVER** write code without an approved `PROJECT_BRIEF.md`.
2. **ALWAYS** follow the 4-phase pipeline: Brainstorm → Plan → Execute → Verify.
3. **ALWAYS** read the relevant agent's `.md` file AND load their ⭐ skills before specialized work.
4. **ALWAYS** create ALL mandatory documents at each phase boundary.
5. When the user says "build X" → Start with Phase 1 (Brainstorm). Do NOT jump to code.

## Framework Entry Point

Read `.agents/skills/zeoel/SKILL.md` at the start of every task.

## The 4-Phase Pipeline

| Phase | Read This Skill | Must Produce |
|-------|----------------|-------------|
| 1. Brainstorm | `.agents/skills/zeoel/skills/zeoel-brainstorm/SKILL.md` | `PROJECT_BRIEF.md`, `docs/brainstorm/summary.md` |
| 2. Sprint Plan | `.agents/skills/zeoel/skills/zeoel-sprint-planner/SKILL.md` | `docs/sprint-N/plan.md`, `docs/sprint-N/progress.md` |
| 3. Execute | `.agents/skills/zeoel/skills/zeoel-dispatch/SKILL.md` | Working code, updated `progress.md` |
| 4. Verify | Dispatch QA + Security + SEO | Sign-off docs, `done.md` |

## Sub-Agent Dispatch Protocol

For ALL specialized work, you MUST:
1. **Read** the agent file: `.agents/skills/zeoel/agents/[name].md`
2. **Load** their ⭐ skill files: `.agents/skills/zeoel/skills/[skill]/SKILL.md`
3. **Announce**: "Acting as [Name] ([Role]). Skills: [list]. Task: [description]"
4. **Execute** using ONLY their bound skills
5. **Track** in `docs/sprint-N/progress.md`
6. **Return**: "Returning to Gohar (CEO)"

## Agent Quick Reference

| Task Type | Agent | File | Primary Skills |
|-----------|-------|------|---------------|
| Next.js, React, frontend | **Karar** | `karar-frontend.md` | `nextjs-turbopack`, `frontend-design`, `seo`, `ui-ux-pro-max`, `threejs-webgl`, `gsap-scrolltrigger` |
| Laravel, API, backend | **Tariq** | `tariq-backend.md` | `laravel-patterns`, `laravel-security`, `postgres-patterns`, `api-design` |
| UX design, wireframes | **Mahdi** | `mahdi-designer.md` | `frontend-design`, `seo` |
| CSS, 3D, animations | **Mustafa** | `mustafa-visual.md` | `frontend-design`, `ui-ux-pro-max`, `threejs-webgl`, `gsap-scrolltrigger` |
| SEO, meta, content | **Zara** | `zara-content.md` | `seo` |
| Flutter, mobile | **Hassan** | `hassan-mobile.md` | `dart-flutter-patterns`, `flutter-dart-code-review`, `mobile-app-design` |
| Testing, QA | **Muhammad** | `muhammad-qa.md` | `e2e-testing`, `webapp-testing` |
| DevOps, CI/CD | **Ali** | `ali-devops.md` | `deployment-patterns`, `docker-patterns`, `zeoel-security` |
| Debugging | **Sajjad** | `sajjad-debugger.md` | `agent-introspection-debugging`, `benchmark` |
| Documentation | **Baqir** | `baqir-docs.md` | `zeoel-codebase-knowledge`, `api-design` |
| Data, ML | **Fatima** | `fatima-data.md` | `postgres-patterns`, `python-patterns`, `mle-workflow` |
| Python, automation | **Gohar(Py)** | `gohar-python.md` | `python-patterns`, `mle-workflow` |

All agent files: `.agents/skills/zeoel/agents/`
All skill files: `.agents/skills/zeoel/skills/[name]/SKILL.md`

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind, shadcn/ui
- **Backend**: Laravel 11+ (PHP 8.3), Sanctum, Cashier
- **Database**: PostgreSQL 16+, Redis
- **Mobile**: Flutter 3.x, Dart, Riverpod, Material 3
- **3D/Animation**: Three.js, React Three Fiber, GSAP, Framer Motion
- **DevOps**: Docker, GitHub Actions, Laravel Sail
