# Copilot Instructions

This project uses the **Zeoel AI Agency** — a multi-agent framework for robust software development.

## Mandatory Rules (NO EXCEPTIONS)

1. **NEVER** write code without an approved `PROJECT_BRIEF.md`.
2. **ALWAYS** follow the pipeline: Brainstorm → Plan → Execute (Strict TDD) → Verify & Snapshot.
3. **ALWAYS** read the relevant agent's `.md` file AND load their ⭐ skills before specialized work.
4. **ALWAYS** create ALL mandatory documents at each phase boundary.
5. Code **MUST** live in `frontend/` or `backend/`. No other code directories.
6. When the user says "build X" → Start with Phase 1 (Brainstorm). Do NOT jump to code.
7. **ALWAYS** run graphify (`/graphify . --wiki`) for codebase mapping and strictly apply `caveman` guidelines (filler-free, concise replies) to save ~71.5x input and 75% output tokens.

## Framework Entry Point

Read `.agents/skills/zeoel/SKILL.md` at the start of every task.

## The Pipeline

| Phase | Read This Skill | Must Produce |
|-------|----------------|-------------|
| 1. Brainstorm | `.agents/skills/zeoel/skills/zeoel-brainstorm/SKILL.md` | `PROJECT_BRIEF.md`, `docs/brainstorm/summary.md` |
| 2. Sprint Plan | `.agents/skills/zeoel/skills/zeoel-sprint-planner/SKILL.md` | `docs/sprint-N/plan.md`, `docs/sprint-N/progress.md` |
| 3. Execute | `.agents/skills/zeoel/skills/zeoel-dispatch/SKILL.md` | Working code via Red-Green-Refactor TDD |
| 4. Verify & Snapshot| Dispatch QA + Security + SEO | Sign-off docs, `done.md`, and `.worktrees/sprint-N/` snapshot |

## Sub-Agent Dispatch Protocol

For ALL specialized work, you MUST:
1. **Read** the agent file: `.agents/skills/zeoel/agents/[name].md`
2. **Load** their ⭐ skill files: `.agents/skills/zeoel/skills/[skill]/SKILL.md`
3. **Announce**: "Acting as [Name] ([Role]). Skills: [list]. Task: [description]"
4. **Execute** using ONLY their bound skills enforcing **Strict TDD**
5. **Verify** the tests actually pass locally
6. **Track** in `docs/sprint-N/progress.md`
7. **Return**: "Returning to Gohar (CEO)"

## Agent Quick Reference (33 Agents)

| Task Type | Agent | File |
|-----------|-------|------|
| Next.js, React | **Karar** | `karar-frontend.md` |
| Bootstrap 5, SCSS | **Hassan** | `hassan-bootstrap.md` |
| shadcn/UI component variants | **Noor** | `noor-shadcn.md` |
| Pure React/Vite SPAs, Zustand | **Anas** | `anas-react.md` |
| Vue 3, Nuxt 4, Pinia | **Amina** | `amina-vue.md` |
| Container queries, modern CSS | **Hasan** | `hasan-css.md` |
| Laravel, API | **Tariq** | `tariq-backend.md` |
| UX design | **Mahdi** | `mahdi-designer.md` |
| 3D, animations | **Mustafa** | `mustafa-visual.md` |
| SEO, content | **Zara** | `zara-content.md` |
| Flutter, mobile | **Abdullah** | `abdullah-mobile.md` |
| React Native, Expo | **Zayd** | `zayd-react-native.md` |
| Python, Django | **Abbas** | `abbas-python.md` |
| Data, ML | **Fatima** | `fatima-data.md` |
| Go, Rust, C++ | **Bilal** | `bilal-systems.md` |
| iOS, Swift | **Layla** | `layla-ios.md` |
| Android, Kotlin | **Hamza** | `hamza-android.md` |
| Smart Contracts, DeFi | **Salman** | `salman-web3.md` |
| Red Team & Penetration Auditor | **Hamid** | `hamid-security.md` |
| Funnel CRO & Performance Marketer | **Farhan** | `farhan-marketing.md` |
| McKinsey PPT & Pitch Designer | **Taha** | `taha-presentation.md` |
| Parametric GIS Spatial Designer | **Sami** | `sami-computational.md` |
| Literature Synthesis & PhD Science | **Yahya** | `yahya-researcher.md` |
| Debugging, Performance | **Sajjad** | `sajjad-debugger.md` |
| Docs, OpenAPI | **Baqir** | `baqir-docs.md` |
| QA, Testing | **Muhammad** | `muhammad-qa.md` |
| CI/CD, DevOps | **Ali** | `ali-devops.md` |
| Multi-agent, MCP, Self-Evolution | **Ibrahim** | `ibrahim-ai.md` |
| Java, Spring | **Yusuf** | `yusuf-java.md` |
| Healthcare | **Khadija** | `khadija-healthcare.md` |
| SaaS Ops | **Maryam** | `maryam-ops.md` |
| Sprints, Backlog | **Zainab** | `zainab-pm.md` |

All agent files: `.agents/skills/zeoel/agents/`
All skill files: `.agents/skills/zeoel/skills/[name]/SKILL.md`
