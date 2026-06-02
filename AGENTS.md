# Agents

This project uses the **Zeoel AI Agency** — a multi-agent orchestration framework for SaaS development.

<HARD-GATE>
MANDATORY WORKFLOW — NO EXCEPTIONS:
1. When the user says "build X", "create X", or describes ANY project → Start with Phase 1 (Brainstorm). Do NOT write code.
2. You MUST follow the 4-phase pipeline: Brainstorm → Plan → Execute (Strict TDD) → Verify & Snapshot.
3. Code MUST live in `frontend/` or `backend/`. No other code directories.
4. You MUST dispatch sub-agents with their skill bindings loaded for ALL specialized work.
5. You MUST create ALL mandatory documents at each phase boundary.
</HARD-GATE>

## Framework

Read the full framework FIRST: `.agents/skills/zeoel/SKILL.md`

## The Pipeline

| Phase | Skill to Read | Deliverables |
|-------|--------------|-------------|
| 1. Brainstorm | `.agents/skills/zeoel/skills/zeoel-brainstorm/SKILL.md` | `PROJECT_BRIEF.md`, `docs/brainstorm/summary.md` |
| 2. Sprint Plan | `.agents/skills/zeoel/skills/zeoel-sprint-planner/SKILL.md` | `docs/sprint-N/plan.md`, `docs/sprint-N/progress.md` |
| 3. Execute | `.agents/skills/zeoel/skills/zeoel-dispatch/SKILL.md` | Working code via Red-Green-Refactor TDD |
| 4. Verify & Snapshot| Dispatch QA + Security + SEO | `done.md`, and `.worktrees/sprint-N/` snapshot |

## Agents (33)

All agent definitions are in `.agents/skills/zeoel/agents/`:

| Agent | File | When to Dispatch | Primary Skills (⭐) |
|-------|------|-----------------|---------------------|
| **Gohar** (CEO) | `gohar-ceo.md` | Sprint planning, snapshots | `zeoel`, `caveman`, `graphify` |
| **Mahdi** (Designer) | `mahdi-designer.md` | UX flows, accessibility | `frontend-design`, `seo` |
| **Mustafa** (Visual) | `mustafa-visual.md` | Three.js, GSAP, design tokens | `frontend-design`, `ui-ux-pro-max`, `threejs-webgl` |
| **Karar** (Frontend) | `karar-frontend.md` | Next.js, shadcn/ui, TDD | `nextjs-turbopack`, `test-driven-development` |
| **Hassan** (Bootstrap) | `hassan-bootstrap.md` | Bootstrap 5, SCSS, dashboards | `bootstrap-patterns`, `frontend-design` |
| **Noor** (shadcn/UI) | `noor-shadcn.md` | shadcn/ui components, Radix | `shadcn-ui-patterns`, `radix-ui-primitives` |
| **Anas** (React) | `anas-react.md` | Pure React/Vite SPAs, Zustand | `vite-patterns`, `frontend-design`, `caveman`, `graphify` |
| **Amina** (Vue/Nuxt) | `amina-vue.md` | Vue 3, Nuxt 4, Pinia, SSR | `vue3-composition-patterns`, `nuxt4-patterns` |
| **Hasan** (CSS Craftsman) | `hasan-css.md` | CSS Grid, Container queries | `css-container-queries`, `tailwindcss-v4` |
| **Tariq** (Backend) | `tariq-backend.md` | Laravel, PostgreSQL, APIs | `laravel-patterns`, `test-driven-development` |
| **Zara** (SEO) | `zara-content.md` | Technical SEO, JSON-LD | `seo`, `seo-growth` |
| **Abdullah** (Mobile) | `abdullah-mobile.md` | Flutter, Material 3 | `dart-flutter-patterns` |
| **Zayd** (React Native) | `zayd-react-native.md` | React Native, Expo | `react-native-best-practices` |
| **Fatima** (Data) | `fatima-data.md` | Postgres analytics, ML | `postgres-patterns`, `python-patterns` |
| **Abbas** (Python) | `abbas-python.md` | Python, Django, FastAPI | `python-patterns`, `test-driven-development` |
| **Bilal** (Systems) | `bilal-systems.md` | Go, Rust, C++ | `go-patterns` |
| **Layla** (iOS) | `layla-ios.md` | SwiftUI, Swift | `swift-patterns` |
| **Hamza** (Android) | `hamza-android.md` | Kotlin, Jetpack Compose | `kotlin-patterns` |
| **Salman** (Web3) | `salman-web3.md` | Smart Contracts, DeFi | `solidity-patterns`, `trailofbits-auditing` |
| **Hamid** (Security) | `hamid-security.md` | Red Team & Penetration Auditor | `claude-red`, `trailofbits-auditing` |
| **Farhan** (Growth) | `farhan-marketing.md` | Funnel CRO & Performance Marketer | `growth-marketing`, `seo-growth` |
| **Taha** (Slides) | `taha-presentation.md` | McKinsey PPT & Pitch Designer | `ppt-mckinsey`, `ckm:slides` |
| **Sami** (Spatial) | `sami-computational.md` | Parametric GIS Spatial Designer | `computational-architecture`, `postgres-patterns` |
| **Yahya** (PhD) | `yahya-researcher.md` | Literature Synthesis & PhD Science | `empirical-research`, `deep-research` |
| **Sajjad** (Debugger) | `sajjad-debugger.md` | Root cause analysis | `systematic-debugging`, `error-handling` |
| **Baqir** (Docs) | `baqir-docs.md` | Technical writing, OpenAPI | `zeoel-codebase-knowledge`, `api-design` |
| **Muhammad** (QA) | `muhammad-qa.md` | E2E testing, quality gates | `e2e-testing`, `test-driven-development` |
| **Ali** (DevOps) | `ali-devops.md` | CI/CD, Docker, Security | `deployment-patterns` |
| **Ibrahim** (AI Architect)| `ibrahim-ai.md` | MCP, multi-agent frameworks | `mcp-patterns`, `self-evolution` |
| **Yusuf** (Java) | `yusuf-java.md` | Spring Boot, Quarkus | `java-patterns` |
| **Khadija** (Healthcare)| `khadija-healthcare.md`| HIPAA, FHIR | `healthcare-compliance` |
| **Maryam** (Business) | `maryam-ops.md` | SaaS Ops, Metrics | `saas-ops` |
| **Zainab** (Product Manager) | `zainab-pm.md` | Agile sprints, backlogs | `project-flow-ops`, `product-lens` |

## Sub-Agent Dispatch Protocol

When executing ANY specialized task, you MUST:
1. **Read** the agent's `.md` file from `.agents/skills/zeoel/agents/`
2. **Load** their ⭐ skill SKILL.md files from `.agents/skills/zeoel/skills/`
3. **Announce** the dispatch: "I am now acting as [Name] ([Role]). Skills: [list]"
4. **Execute** using ONLY their bound skills. Enforce Strict TDD!
5. **Track** progress in `docs/sprint-N/progress.md` after every task.
6. **Verify** you actually ran the tests before completing the task.
7. **Drop** the persona: "Returning to Gohar (CEO)"
