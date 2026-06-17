# Zeoel CLI-Driven Agent Execution Guide

This document explains how the Zeoel framework runs agents using your local developer CLI tools (**Claude Code, OpenCode, Codex, and Antigravity IDE**) instead of direct API calls.

---

## How It Works Under the Hood

The `zeoel agent run` command follows a decoupled architecture:

```
┌─────────────────┐       ┌─────────────────┐       ┌────────────────────────┐
│  Agent Registry │ ────> │  Prompt Builder │ ────> │ Resolved Prompt String │
│  (YAML + MD)    │       │                 │       │ (System+Skills+Memory) │
└─────────────────┘       └─────────────────┘       └────────────────────────┘
                                                                 │
                                                                 ▼
┌─────────────────┐       ┌─────────────────┐       ┌────────────────────────┐
│ Captured Output │ <──── │   CLI Adapter   │ <──── │  Spawn Local CLI Tool  │
│  (Session Log)  │       │  (Stdin Piped)  │       │ (claude/opencode/etc.) │
└─────────────────┘       └─────────────────┘       └────────────────────────┘
```

1. **Prompt Compilation**: The orchestrator resolves the agent manifest (`agent.yml`), loads its system instructions (`SYSTEM.md`), aggregates all referenced skills (`SKILL.md` files), loads workspace memory files, and formats the user's task and acceptance criteria into a single Markdown prompt.
2. **Engine Selection**: The orchestrator determines which local CLI tool to run based on the `--engine` flag, manifest preferences, or automatic path discovery.
3. **Execution**: The orchestrator spawns the CLI binary as a subprocess and writes the compiled prompt directly into its standard input (`stdin`). This avoids terminal argument size limit errors and provides clean input formatting.
4. **Output Capture**: The tool's stdout is captured, cleaned of CLI metadata/progress indicators, and logged to a session folder under `sessions/{timestamp}-{agent-id}/`.

---

## Commands & Usage

### 1. List Available Agents
Scan all manifests inside `agents/` and list them:
```bash
zeoel agent list
```

### 2. Inspect an Agent
Print full manifest information, resolved permissions, memory scopes, and a preview of loaded skills and system prompts:
```bash
zeoel agent inspect premium-ui-designer
```

### 3. Run an Agent (Dry-Run by Default)
Build and format the prompt, print a preview of the prompt, and save it to the session log directory without calling any external CLI tool:
```bash
zeoel agent run premium-ui-designer "Create a beautiful contact form component"
```

### 4. Run an Agent Live
Execute the agent against one of your local coding assistants:
```bash
zeoel agent run premium-ui-designer "Create a beautiful contact form component" --live
```

---

## Supported Engine CLI Tools

### Claude Code CLI (`claude`)
- **CLI Command**: Runs `claude -p` (print mode) with optional `--model <override>`.
- **Input/Output**: Pipes prompt to `stdin` and captures standard output.
- **Example**:
  ```bash
  zeoel agent run premium-ui-designer "Audit this page" --live --engine claude
  ```

### OpenCode CLI (`opencode`)
- **CLI Command**: Runs `opencode run --dangerously-skip-permissions` with optional `-m <model>`.
- **Input/Output**: Pipes prompt to `stdin` and filters out terminal progress labels (like `> build ·`).
- **Example**:
  ```bash
  zeoel agent run premium-ui-designer "Build hero section" --live --engine opencode
  ```

### OpenAI Codex CLI (`codex`)
- **CLI Command**: Runs `codex --dangerously-bypass-approvals-and-sandbox exec - -o <temp_file>` with optional `-m <model>`.
- **Input/Output**: Pipes prompt to stdin (`-`) and extracts clean output from the temporary output file.
- **Example**:
  ```bash
  zeoel agent run premium-ui-designer "Build auth middleware" --live --engine codex
  ```

### Antigravity CLI (`antigravity-ide`)
- **CLI Command**: Runs `antigravity-ide chat -`.
- **Input/Output**: Pipes prompt to stdin which focuses the chat GUI panel inside your open Antigravity IDE window, letting you inspect and interact with the agent visually.
- **Example**:
  ```bash
  zeoel agent run premium-ui-designer "Plan landing page layout" --live --engine antigravity
  ```

---

## Engine Selection Logic

When you run `zeoel agent run --live`, the orchestrator uses the following priority order to select which CLI tool to execute:

1. **Explicit Override**: If you pass `--engine <cli>` (e.g. `--engine claude` or `--engine opencode`), that adapter is used.
2. **Model Association**: If you specify a model name (e.g. `--engine claude-3-5-sonnet` or `--engine google/gemini-3.5-flash`), the system maps the model prefix to its corresponding tool (Claude Code for `claude-*`, Codex for `gpt-*`/`o3*`, OpenCode for `gemini-*`/`deepseek-*`) and configures that model on the CLI.
3. **Auto-Detection**: If no engine is specified, the framework scans your environment path and home profile directories for installed tools in the following order:
   - `opencode`
   - `claude`
   - `codex`
   - `antigravity-ide`
   The first available tool detected will be used.
