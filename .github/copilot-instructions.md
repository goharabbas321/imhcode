# Copilot Instructions

This project uses the **IMH-Code** framework (Imam Hussain Coding Harness Platform) for multi-agent software development.

## Mandatory Rules (NO EXCEPTIONS)

1. **NEVER** write code without an approved `PROJECT_BRIEF.md`.
2. **ALWAYS** follow the pipeline: Write (start.md) → Plan (brainstorming.md) → Sprint Plan (plan.md) → Execute → Test.
3. **ALWAYS** read the relevant agent's manifest and loaded skills before specialized work.
4. Code **MUST** live in `frontend/` or `backend/`. No other code directories.
5. When the user says "build X" → Start with Phase 1 (Write & Plan). Do NOT jump to code.
6. Respect the configured `testing_mode` inside `imhcode.config.json` (fast, balanced, strict).

## Framework Entry Point

Read `skills/imhcode/SKILL.md` at the start of every task.

## Generic Role-Based Agents (19)

| ID | Role | Category |
|---|---|---|
| `planner` | Project Planner & Coordinator | planning |
| `designer` | UX/UI Designer | frontend |
| `nextjs-executor` | Next.js Full-Stack Developer | frontend |
| `react-executor` | React/Vite Developer | frontend |
| `vue-executor` | Vue 3 / Nuxt 4 Developer | frontend |
| `laravel-executor` | Laravel Backend Developer | backend |
| `python-executor` | Python Backend (FastAPI/Django) | backend |
| `java-executor` | Java Backend (Spring Boot) | backend |
| `flutter-executor` | Flutter Mobile Developer | backend |
| `react-native-executor` | React Native Mobile Developer | backend |
| `ios-executor` | iOS Native Developer | backend |
| `android-executor` | Android Native Developer | backend |
| `systems-executor` | Systems Developer (Go/Rust/C++) | backend |
| `web3-executor` | Web3 & Smart Contracts Developer | backend |
| `tester` | QA & Testing Specialist | testing |
| `security-auditor` | Cybersecurity Audit Specialist | testing |
| `seo-optimizer` | SEO Technical Specialist | review |
| `devops-executor` | DevOps & Cloud Engineer | backend |
| `debugger` | Systematic Debugging Specialist | review |

All agent files: `agents/[id]/agent.yml` and `SYSTEM.md`.
All skill files: `skills/[id]/SKILL.md`.
