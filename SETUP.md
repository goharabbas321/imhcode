# IMH-Code Setup Guide — Step by Step

> **Imam Hussain Coding Harness Platform (IMH-Code)**
> A fast-first multi-agent AI coding harness with intelligent model routing.

---

## Installation & Initialization

1. Install the npm package globally:
   ```bash
   npm install -g imhcode
   ```
2. Initialize IMH-Code in your project workspace directory:
   ```bash
   imhcode
   ```
   During initialization, the CLI will:
   - Scan for local coding assistant CLI engines (Claude, OpenCode, Codex, Antigravity, QwenCode, MimoCode).
   - Prompt you to configure **intelligent model routing** per task category (frontend, backend, planning, testing, review, fast).
   - Save the configuration under `imhcode.config.json`.
   - Setup global configurations under `~/.imhcode/` and rule mappings in assistant directories.
   - Create local templates (`docs/start.md`).

---

## Project Structure

IMH-Code organizes your codebase into separated root folders:

```
your-project/
├── frontend/                  # Next.js / React / Vue web app code
├── backend/                   # Laravel / Python / Spring Boot API code
├── docs/                      # Sprints, plans, and testing audits
├── agents/                    # Manifests & SYSTEM prompts for 19 generic agents
├── skills/                    # Reusable skill files (SKILL.md)
├── PROJECT_BRIEF.md           # Master requirements brief (auto-generated)
└── imhcode.config.json        # Engine/Model routing configurations
```

---

## Building a Product (The 6-Phase Pipeline)

### Phase 1: Write requirements
Open `docs/start.md` and write your project description inside the `<!-- WRITE_PROMPT_HERE -->` markers.

### Phase 2: Analyze & Brainstorm
Run the plan command:
```bash
imhcode plan
```
This generates `docs/brainstorming.md` with questions and recommended answers customized to your prompt.

### Phase 3: Answer questions
Open `docs/brainstorming.md`. Review and edit the recommended answers. Select your testing strategy:
- **[A] Fast Mode (Default)** — Maximum speed, tests only in the final sprint.
- **[B] Balanced Mode** — Smoke tests per task, full suites at the end.
- **[C] Strict TDD** — Full TDD per task (slowest, highest safety).

Run the plan command again:
```bash
imhcode plan
```
This reads your answers, sets up config, writes `PROJECT_BRIEF.md`, and designs all sprints.

### Phase 4: Execute tasks
Run execution commands:
```bash
imhcode execute 1   # Run sprint 1 tasks
imhcode execute 2   # Run sprint 2 tasks
```
This runs the auto-generated task execution scripts using the routed model configurations.

### Phase 5: Test & Audit
Run the test command:
```bash
imhcode test
```
This executes the final testing sprint to run unit tests, integration tests, E2E browser tests, security audit, and SEO reports.
