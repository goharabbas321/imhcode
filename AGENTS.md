# Agents

This project uses the **IMH-Code** (Imam Hussain Coding Harness Platform) — a multi-agent orchestration framework for SaaS development.

<HARD-GATE>
MANDATORY WORKFLOW — NO EXCEPTIONS:
1. When the user says "build X", "create X", or describes ANY project → Start with Phase 1 (Write) and Phase 2 (Plan). Do NOT write code.
2. You MUST follow the 6-phase pipeline: Write → Plan → Brainstorm → Sprint Plan → Execute → Test.
3. Code MUST live in `frontend/` or `backend/`. No other code directories.
4. You MUST dispatch generic executor agents with their core skill bindings loaded.
5. You MUST update context.md and PROJECT_BRIEF.md after completing each task.
</HARD-GATE>

## The Pipeline

| Phase | Description | Deliverables | CLI |
|-------|-------------|--------------|-----|
| 1. Write | User inputs requirements | `docs/start.md` | — |
| 2. Plan | System generates brainstorming questions | `docs/brainstorming.md` | `imhcode plan` |
| 3. Brainstorm | User answers/reviews recommended answers | `docs/brainstorming.md` (edited) | — |
| 4. Sprint Plan | System plans roadmaps and task scripts | `PROJECT_BRIEF.md`, `docs/sprint-*/plan.md` | `imhcode plan` |
| 5. Execute | Sprints executed with intelligent model routing | Working application code | `imhcode execute N` |
| 6. Test | System audits code, security, SEO, and browser tests | Test reports, security audit, SEO checks | `imhcode test` or final sprint |

## Generic Role-Based Agents (19)

Instead of individual persona names, IMH-Code runs generic agents configured with intelligent model routing:

| Agent ID | Role | Task Category | Primary Skills |
|---|---|---|---|
| `planner` | Project Planner & Coordinator | planning | imhcode-core, imhcode-brainstorm, imhcode-sprint-planner |
| `designer` | UX/UI Designer | frontend | frontend-design, ui-ux-pro-max, modern-web-design |
| `nextjs-executor` | Next.js Full-Stack Developer | frontend | nextjs-turbopack, shadcn-ui, tailwindcss-v4 |
| `react-executor` | React/Vite SPA Developer | frontend | vite-patterns, frontend-design |
| `vue-executor` | Vue 3 / Nuxt 4 Developer | frontend | vue3-composition, nuxt4-patterns |
| `laravel-executor` | Laravel Backend Developer | backend | laravel-patterns, backend-patterns |
| `python-executor` | Python Backend (FastAPI/Django) | backend | python-patterns, fastapi-patterns |
| `java-executor` | Java Backend (Spring Boot) | backend | java-patterns, springboot-patterns |
| `flutter-executor` | Flutter Mobile Developer | backend | dart-flutter-patterns |
| `react-native-executor` | React Native Mobile Developer | backend | react-native-best-practices |
| `ios-executor` | iOS Native Developer | backend | swiftui-patterns |
| `android-executor` | Android Native Developer | backend | kotlin-patterns |
| `systems-executor` | Systems Developer (Go/Rust/C++) | backend | golang-patterns, rust-patterns |
| `web3-executor` | Web3 & Smart Contracts Developer | backend | solidity-patterns |
| `tester` | QA & Testing Specialist | testing | e2e-testing, webapp-testing |
| `security-auditor` | Cybersecurity Audit Specialist | testing | imhcode-security, security-scan |
| `seo-optimizer` | SEO Technical Specialist | review | seo, seo-growth |
| `devops-executor` | DevOps & Cloud Engineer | backend | deployment-patterns, docker-patterns |
| `debugger` | Systematic Debugging Specialist | review | systematic-debugging, error-handling |

## Model Routing Matrix

Model routing maps agent categories to primary/fallback models in `imhcode.config.json`:

- **frontend**: Mimo VL v2.5 Pro (Primary) / GPT-5.5 / Claude Sonnet
- **backend**: DeepSeek V4 Pro (Primary) / GPT-5.5 / Qwen Coder
- **planning**: Claude Opus 4.6 (Primary) / GPT-5.5
- **testing**: GPT-5.5 (Primary) / Claude Opus
- **review**: GPT-5.5 (Primary) / Claude Sonnet
- **fast**: DeepSeek V4 Flash (Primary) / Gemini Flash

## Sub-Agent Dispatch Protocol

When executing a task:
1. **Announce** dispatch: "I am now acting as [Agent ID] ([Role])."
2. **Execute** using bound skills. No TDD by default unless testing_mode is "strict".
3. **Log** results to `docs/sprint-N/progress.md`.
4. **Update** `.imhcode/context.md` and `PROJECT_BRIEF.md`.
5. **Drop** persona: "Returning to Planner."