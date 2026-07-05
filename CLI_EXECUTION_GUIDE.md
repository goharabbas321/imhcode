# IMH-Code CLI Guide

A quick reference for all `imhcode` commands.

---

## Commands

### Setup & Framework
```bash
imhcode                    # Initialize/update framework and config routing
imhcode --version          # Print version
imhcode --help             # Print help
```

### The Pipeline
```bash
imhcode plan               # Analyze start.md → generate brainstorming.md OR generate sprint plans
imhcode execute [N]        # Execute Sprint N tasks (runs run_all_tasks.sh)
imhcode test               # Run final testing, security, and SEO sprint
```

### Agent Commands
```bash
imhcode agent list                              # List all 19 registered generic agents
imhcode agent inspect <id>                      # Show agent manifest + skills + routing
imhcode agent run <id> "<task>"                 # Dry-run (build & preview prompt)
imhcode agent run <id> "<task>" --live          # Live execution via routed local CLI
imhcode agent run <id> "<task>" --live \
  --engine <engine> \
  -m <model> \
  --criteria "<acceptance criteria>" \
  --output <path>
```

### Usability Upgrades (v2.0)
```bash
imhcode modify "task"                               # Modify codebase in-place (auto-select agent)
imhcode modify "task" --agent laravel-executor --live # Run live modification with specific agent
imhcode feature "description"                       # Plan a targeted 1-3 task mini-sprint for a new feature
imhcode execute-feature [N]                         # Run planned feature sprint N
imhcode scan [path]                                 # Deep scan layout and framework stack
imhcode import [path]                               # Import existing project and generate context
imhcode gui                                         # Launch interactive terminal TUI control center
```

---

## How Agent Execution Works

```
Agent Registry (YAML + MD)
        │
        ▼
  Prompt Builder  →  Compiled Category Prompt
                               │
                               ▼
                     Routed Engine CLI (claude / opencode / codex / agy / qwen / mimo)
                               │
                               ▼
                     Captured Output → Session Log
```

1. **Prompt Compilation**: Resolves `agent.yml`, `SYSTEM.md`, skill `SKILL.md` files, and memory into a single Markdown prompt.
2. **Model Routing**: Resolved dynamically using the category-to-model mapping in `imhcode.config.json`.
3. **Execution**: Spawns the CLI binary and pipes the prompt to `stdin`.
4. **Output Capture**: Captured output is logged to `sessions/{timestamp}-{agent-id}/`.
