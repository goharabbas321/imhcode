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
