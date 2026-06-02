# Zeoel AI Agency Framework

> Read this file at the start of every session. This is a multi-agent SaaS development framework.

<HARD-GATE>
MANDATORY RULES — ZERO EXCEPTIONS:
1. NEVER write code without an approved `PROJECT_BRIEF.md`.
2. ALWAYS follow the pipeline: Brainstorm → Plan → Execute (Strict TDD) → Verify & Snapshot.
3. ALWAYS read the relevant agent's `.md` file AND load their ⭐ skill bindings before specialized work.
4. ALWAYS create ALL mandatory documents at each phase boundary.
5. Code MUST live in `frontend/` or `backend/`. No other code directories.
6. When the user says "build X" or "create X" → Start with Phase 1 (Brainstorm). Do NOT jump to code.
7. ALWAYS run graphify (`/graphify . --wiki`) for codebase context mapping and apply `caveman` rules to cut conversational filler, saving up to 71.5x input and 75% output tokens.
</HARD-GATE>

## Framework Location

The complete Zeoel framework is at `.agents/skills/zeoel/SKILL.md`. **Read it now.**

## The Pipeline

| Phase | What to Read | Mandatory Deliverables |
|-------|-------------|----------------------|
| **1. Brainstorm** | `.agents/skills/zeoel/skills/zeoel-brainstorm/SKILL.md` | `PROJECT_BRIEF.md` (user approved), `docs/brainstorm/summary.md` |
| **2. Sprint Plan** | `.agents/skills/zeoel/skills/zeoel-sprint-planner/SKILL.md` | `docs/sprint-N/plan.md`, `docs/sprint-N/progress.md` |
| **3. Execute** | `.agents/skills/zeoel/skills/zeoel-dispatch/SKILL.md` | Working code (Red-Green-Refactor TDD), `progress.md` updated |
| **4. Verify & Snapshot** | Dispatch QA + Security + SEO agents | `docs/qa/`, `docs/security/`, `docs/sprint-N/done.md`, and `.worktrees/sprint-N/` snapshot |

**Phase Gates**: You CANNOT enter Phase N+1 without Phase N deliverables existing as files.

## Agent Roster (33 Agents)

| Agent | File | Dispatch For | Primary Skills (⭐) |
|-------|------|-------------|---------------------|
| **Gohar** (CEO) | `gohar-ceo.md` | Sprint planning, snapshots | `zeoel`, `caveman`, `graphify` |
| **Mahdi** (Designer) | `mahdi-designer.md` | UX flows, accessibility | `frontend-design`, `seo` |
| **Mustafa** (Visual) | `mustafa-visual.md` | 3D, GSAP, design tokens | `frontend-design`, `ui-ux-pro-max` |
| **Karar** (Frontend) | `karar-frontend.md` | Next.js, shadcn, TDD | `nextjs-turbopack`, `test-driven-development` |
| **Hassan** (Bootstrap) | `hassan-bootstrap.md` | Bootstrap 5, SCSS, Dashboards | `bootstrap-patterns`, `frontend-design` |
| **Noor** (shadcn/UI) | `noor-shadcn.md` | Component Variant Architecture | `shadcn-ui-patterns`, `radix-ui-primitives` |
| **Anas** (React) | `anas-react.md` | Pure React/Vite SPAs, Zustand | `vite-patterns`, `frontend-design`, `caveman`, `graphify` |
| **Amina** (Vue/Nuxt) | `amina-vue.md` | Vue 3, Nuxt 4, Pinia, SSR | `vue3-composition-patterns`, `nuxt4-patterns` |
| **Hasan** (CSS Craftsman) | `hasan-css.md` | Container queries, Transitions | `css-container-queries`, `tailwindcss-v4` |
| **Tariq** (Backend) | `tariq-backend.md` | Laravel, PostgreSQL, APIs | `laravel-patterns`, `test-driven-development` |
| **Zara** (SEO) | `zara-content.md` | Technical SEO, JSON-LD | `seo`, `seo-growth` |
| **Abdullah** (Mobile) | `abdullah-mobile.md` | Flutter, Material 3 | `dart-flutter-patterns` |
| **Zayd** (React Native) | `zayd-react-native.md` | React Native, Expo | `react-native-best-practices` |
| **Fatima** (Data) | `fatima-data.md` | Analytics, ML | `postgres-patterns`, `python-patterns` |
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
| **Ibrahim** (AI Architect)| `ibrahim-ai.md` | MCP, Multi-agent | `mcp-patterns`, `self-evolution` |
| **Yusuf** (Java) | `yusuf-java.md` | Spring Boot, Quarkus | `java-patterns` |
| **Khadija** (Healthcare)| `khadija-healthcare.md`| HIPAA, FHIR | `healthcare-compliance` |
| **Maryam** (Business) | `maryam-ops.md` | SaaS Ops, Metrics | `saas-ops` |
| **Zainab** (Product Manager) | `zainab-pm.md` | Sprints, Agile Backlog | `project-flow-ops`, `product-lens` |

All agent files are in `.agents/skills/zeoel/agents/`.

## Sub-Agent Dispatch Protocol (Mandatory)

When executing ANY specialized task, follow this EXACT protocol:

```
1. READ     → .agents/skills/zeoel/agents/[name].md
2. LOAD     → Their ⭐ skill SKILL.md files from .agents/skills/zeoel/skills/ (including caveman & graphify)
3. QUERY    → Run '/graphify query "[domain]"' or check 'graphify-out/wiki/' for targeted context (71.5x input saving)
4. ANNOUNCE → "I am acting as [Name] ([Role]). Skills: [list ⭐ skills]. Task: [description]" (caveman concise style)
5. EXECUTE  → Using ONLY their bound skills via Strict TDD. Follow caveman output rules (~75% output saving).
6. TRACK    → Update docs/sprint-N/progress.md after the task
7. VERIFY   → Prove the tests pass.
8. DROP     → "Returning to Gohar (CEO)."
```

### Claude Code / Antigravity Sub-Agent Pattern

Claude Code and Antigravity support sub-agents natively. Dispatch using the Task tool:
```
Task: Read .agents/skills/zeoel/agents/karar-frontend.md.
Load skills: nextjs-turbopack, test-driven-development.
Build the pricing page for Sprint 2 using Strict TDD.
Reference PROJECT_BRIEF.md for requirements.
Context: [provide relevant files and constraints]
```
