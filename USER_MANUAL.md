# IMH-Code Framework — User Manual

> **Imam Hussain Coding Harness Platform (IMH-Code)**
> Full CLI reference, workflow guide, troubleshooting, and advanced usage.

---

## 1. Installation & Setup

### Install IMH-Code
```bash
npm install -g imhcode
```

### Initialize in Workspace
```bash
imhcode
```
This scans your system for local engines and sets up `imhcode.config.json` with model routing.

---

## 2. The 6-Phase Pipeline

### Phase 1: Write
Open `docs/start.md` and write your project description inside the prompt markers.

### Phase 2: Plan
Run `imhcode plan` to generate `docs/brainstorming.md`.

### Phase 3: Brainstorm
Open `docs/brainstorming.md`, customize answers, choose testing mode (Fast, Balanced, or Strict TDD), and run `imhcode plan` again.

### Phase 4: Sprint Planning
Sprints are generated under `docs/sprint-1/`, `docs/sprint-2/`, etc.

### Phase 5: Execute
Run `imhcode execute 1` (or specify sprint number). Runs individual task scripts in order.

### Phase 6: Test & Audit
Run `imhcode test` to execute E2E browser tests, API tests, security scans, and SEO audit.

---

## 3. CLI Commands Reference

```bash
imhcode                      # Initialize/reconfigure workspace
imhcode plan                 # Smart plan command (brainstorm & sprint-plan)
imhcode execute [N]          # Execute sprint N
imhcode test                 # Execute final testing/audit sprint
imhcode agent list           # List all 19 generic agents
imhcode agent inspect <id>   # Inspect agent manifest and skills
imhcode agent run <id> "task" # Run a specific agent directly
  --live                     # Run with live LLM (dry-run by default)
  --engine <engine>          # Override engine
  --model <model>            # Override model

# Usability Upgrades (v2.0)
imhcode modify "task"        # Quick in-place codebase modification
imhcode feature "desc"       # Generate a targeted mini-sprint for a new feature
imhcode execute-feature [N]  # Execute planned feature sprint N
imhcode fix "bug desc"       # Targeted bug fix (alias for modify)
imhcode scan [path]          # Scan local stack and project configuration
imhcode import [path]        # Import existing codebase and generate context
imhcode gui [--port N]       # Start the Laravel GUI Control Center web server
```

---

## 4. Model Routing

Model routing is defined under `model_routing` in `imhcode.config.json`:
- **frontend**: Mimo VL v2.5 Pro (Primary)
- **backend**: DeepSeek V4 Pro (Primary)
- **planning**: Claude Opus 4.6 (Primary)
- **testing**: GPT-5.5 (Primary)
- **review**: GPT-5.5 (Primary)
- **fast**: DeepSeek V4 Flash (Primary)

---

## 5. Codebase Scanning & Importing (v2.0)

You can bring existing projects (Next.js, Laravel, React, etc.) under the IMH-Code multi-agent framework:
- Run `imhcode scan /path/to/project` to inspect the project layout and dependencies.
- Run `imhcode import /path/to/project` to generate the `.imhcode/import-map.json` mapping, `PROJECT_BRIEF.md`, and `.imhcode/context.md` project configurations automatically.

## 6. Targeted Codebase Modifications

Instead of starting greenfield projects, you can modify existing code bases in-place:
- Run `imhcode modify "Add a contact form to the page"` to auto-detect the best agent, compile a dynamic context-aware prompt, and run in-place code edits.
- Run `imhcode feature "Add Stripe checkout"` to plan a targeted mini-sprint of 1-3 tasks for a new feature addition. Run `imhcode execute-feature {N}` to execute.

## 7. Laravel GUI Control Center

Run `imhcode gui` to launch a beautiful dark-mode web console (Laravel 12 + Livewire 3 + Tailwind CSS v4) to manage your projects, sprints, and code modifications via a simple graphical user interface.
- Scaffolded automatically under `~/.imhcode/gui/`.
- Manage projects, visual kanbans, trigger executes, and run quick modifications directly from the web browser.
