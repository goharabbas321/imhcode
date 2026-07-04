# IMH-Code Project Guidelines

## Build Commands
- Initialize project: `imhcode`
- Smart planning: `imhcode plan`
- Run Sprint tasks: `imhcode execute [sprint-number]`
- Run testing sprint: `imhcode test`
- Compile typescript orchestrator: `npm run build`

## Codebase Architecture
- All frontend code goes into `frontend/` directory (Next.js, React, etc.)
- All backend code goes into `backend/` directory (Laravel, Python, etc.)
- All plan documents go into `docs/` directory
- Do not create application code files at the project root

## CLI Model Routing Config
- Stored in `imhcode.config.json`
- Maps tasks (frontend, backend, testing, etc.) to optimal LLMs based on available engines
- Override routing with: `--engine <engine>` and `-m/--model <model>` during manual runs

## Pipeline Workflow (6 Phases)
1. **Write**: User describes problem/feature requirements in `docs/start.md`.
2. **Plan**: Run `imhcode plan` to generate `docs/brainstorming.md`.
3. **Brainstorm**: Review recommended answers in `docs/brainstorming.md`, customize, and run `imhcode plan` again.
4. **Sprint Plan**: Sprints, tasks, and task script commands are auto-generated.
5. **Execute**: Run `imhcode execute N`. Respects configured `testing_mode` (fast/balanced/strict).
6. **Test**: Run `imhcode test` for final testing, security audits, SEO reports, and browser checks.
