# Copilot Instructions

This project uses the **Zeoel AI Agency** — a multi-agent framework for robust software development.

## Mandatory Rules (NO EXCEPTIONS)

1. **NEVER** write code without an approved `PROJECT_BRIEF.md`.
2. **ALWAYS** follow the pipeline: Brainstorm → Plan → Execute (Strict TDD) → Verify & Snapshot.
3. **ALWAYS** read the relevant agent's `.md` file AND load their ⭐ skills before specialized work.
4. **ALWAYS** create ALL mandatory documents at each phase boundary.
5. Code **MUST** live in `frontend/` or `backend/`. No other code directories.
6. When the user says "build X" → Start with Phase 1 (Brainstorm). Do NOT jump to code.

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

## Agent Quick Reference (23 Agents)

| Task Type | Agent | File |
|-----------|-------|------|
| Next.js, React | **Karar** | `karar-frontend.md` |
| Laravel, API | **Tariq** | `tariq-backend.md` |
| UX design | **Mahdi** | `mahdi-designer.md` |
| 3D, animations | **Mustafa** | `mustafa-visual.md` |
| SEO, content | **Zara** | `zara-content.md` |
| Flutter, mobile | **Abdullah** | `abdullah-mobile.md` |
| Python, Django | **Abbas** | `abbas-python.md` |
| QA, Testing | **Muhammad** | `muhammad-qa.md` |
| CI/CD, DevOps | **Ali** | `ali-devops.md` |
| Debugging | **Sajjad** | `sajjad-debugger.md` |
| Docs, OpenAPI | **Baqir** | `baqir-docs.md` |
| Data, ML | **Fatima** | `fatima-data.md` |
| Multi-agent | **Ibrahim** | `ibrahim-ai.md` |
| Java, Spring | **Yusuf** | `yusuf-java.md` |
| Go, Rust, C++ | **Bilal** | `bilal-systems.md` |
| iOS, Swift | **Layla** | `layla-ios.md` |
| Android, Kotlin | **Hamza** | `hamza-android.md` |
| Healthcare | **Khadija** | `khadija-healthcare.md` |
| Web3, Solidity | **Salman** | `salman-web3.md` |
| SaaS Ops | **Maryam** | `maryam-ops.md` |
| React Native, Expo | **Zayd** | `zayd-react-native.md` |

All agent files: `.agents/skills/zeoel/agents/`
All skill files: `.agents/skills/zeoel/skills/[name]/SKILL.md`
