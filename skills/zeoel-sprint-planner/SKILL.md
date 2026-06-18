---
name: zeoel-sprint-planner
description: "Guidelines for Phase 2 Sprint Planning. Gohar (CEO) plans all tasks at once in docs/sprint-N/plan.md, auto-selects engine CLI and model configurations, and generates execution script files."
---

# Zeoel Sprint Planner Skill (Phase 2)

This skill governs Phase 2: Sprint Planning.

## Task Decomposition and Documentation

1. **Full-Feature Coverage & Scaling**: Decompose the approved `PROJECT_BRIEF.md` into concrete, numbered tasks covering 100% of the features listed or implied. DO NOT limit scope to a bare-minimum MVP. Organize tasks across multiple consecutive sprints (Sprint 1, Sprint 2, ..., Sprint S) dynamically based on the project's real size. Do NOT arbitrarily limit the roadmap to 8 sprints or fewer if the project is large.
2. **Granular Task Decomposition**: High-level block tasks like "build guest panel frontend" or "build guest panel backend" are STRICTLY FORBIDDEN. Every feature MUST be broken down into highly detailed, bite-sized tasks that can be individually implemented and tested. Decompose into:
   - Specific UI page routes and component files (e.g. "Guest booking list layout component", "Guest booking form component", "Guest profile form").
   - Database migrations and seeder classes.
   - Eloquent models/schema constraints.
   - Specific API controller methods and endpoint routes.
   - Individual validation validation boundary tests and feature integration tests.
   **Each sprint MUST contain between 10 to 20 of these granular tasks and sub-tasks** to make the development system super beast and thorough.
3. **Large Roadmap Warning**: If the decomposed roadmap exceeds 8 sprints or 80 tasks overall, Gohar MUST print a warning message first before generating any files: `⚠️ WARNING: The generated roadmap contains [X] sprints and [Y] tasks. This exceeds standard single-run token output bounds. If you experience midway generation cutoffs, switch your primary assistant CLI (e.g., from 'opencode' to 'claude' or 'codex' for larger limits, or adjust max tokens) or split the task files creation.`
4. **Upfront Planning**: Forcefully plan all sprints immediately. Create the following documents under `docs/sprint-N/` for every sprint N (from 1 to S):
   - `plan.md` (the sprint plan table)
   - `progress.md` (progress tracker with all tasks marked `⬜`)
   - `deferred.md` (deferred tasks tracker, empty by default)
   - `docs/deferred/backlog.md` (if not already present)
5. For each task in `docs/sprint-N/plan.md` for all sprints, populate a "Run Command" column.
6. Forcefully generate the task script folder `docs/sprint-N/tasks/` containing bash scripts (`task_K.sh`) for all tasks across all sprints.

## Command, Engine & Model Resolution (from zeoel.config.json)

To ensure correct model routing and avoid using unavailable engines, Gohar CEO MUST read `zeoel.config.json` at the root of the project to find the available assistant CLIs, their available models, and the custom `model_mapping` settings:

1. **Verify Engine Availability**: Only choose assistant engines that are listed under `"available_engines"` and have a valid path configured in `zeoel.config.json`. Never select an engine that is not listed or has no path configured in `zeoel.config.json`.
2. **Prioritize Custom Model Mappings**: If `model_mapping` is configured in `zeoel.config.json`, Gohar MUST resolve the engine and model for each task by matching the executing agent's ID and the task description to the correct role key (using the 14 snake_case role keys: `primary_design_brain`, `design_polish_ux_review`, `design_fallback`, `frontend_builder`, `frontend_fallback`, `frontend_final_review`, `primary_architecture_reviewer`, `primary_security_reviewer`, `security_fallback`, `primary_backend_builder`, `backend_multi_file_builder`, `backend_fallback`, `fast_bug_fixing`, `external_final_audit`), and script the task execution script (`task_K.sh`) with the mapped engine (`--engine <engine>`) and model (`-m <model>`).
3. **Prioritize Primary Engine & Default Model**: If no custom `model_mapping` is found for a role, give strong preference to the default selected engine (`primary_engine`) and default model (`default_model`) configured in `zeoel.config.json`. If `default_model` is specified, it should be the default choice for Standard and Complex tasks of that engine.
4. **Cross-Engine Selection (Intelligence)**: 
   - If a specific task is highly suited for a specialized model in another *available* engine (for example, using a complex model like `claude-3-5-sonnet` via `claude` for complex layouts/design review, or `gpt-5.5` / `o1` via `codex` for complex logical debugging), and that engine has a valid path configured under `"available_engines"`, Gohar can choose that model/engine combination wisely.
   - You MUST pick the model exactly from the `"models"` list of that engine in `zeoel.config.json`. NEVER hardcode models (like `claude-3-5-sonnet` or `gemini-3.5-flash`) unless they are explicitly listed under that engine's `"models"` in `zeoel.config.json`. If no models are listed under an engine, default to standard models for that engine.
5. **Task Complexity Mapping (Fallback Guidelines if specific config is absent)**:
   - **🟢 Light Tasks**: Prioritize flash/mini models (e.g. `gemini-2.5-flash`, `gpt-5.4-mini`, `claude-4.5-haiku`, etc.) in the active engine.
   - **🟡 Standard Tasks**: Prioritize standard/pro models (e.g. `claude-4.6-sonnet`, `gemini-3.1-pro`, `gpt-5.4`, etc.) in the active engine.
   - **🔴 Complex Tasks**: Prioritize reasoning/flagship models (e.g. `deepseek-v4-pro`, `qwen3.7-max`, `claude-3-opus`, `gpt-5.5` / `o1`, etc.) in the active engine.

## Sequential Multi-Agent Execution

If a task involves multiple agents (e.g. a developer agent and a reviewer agent, such as "karar-frontend (with mahdi-designer for design review)" or "Karar + Mahdi"):
- Gohar CEO MUST generate sequential `zeoel agent run` execution commands in the task script `task_K.sh` for each agent involved.
- The script must first run the primary developer agent, and then run the reviewer agent to audit, review, or refine the code.
- You MUST write separate, consecutive execution blocks (using the node path fallback template) for each agent sequentially. Do NOT combine them into a single run command.
- Ensure each run block uses the node path fallback template. For example:
  ```bash
  # 1. Primary Development: Senior Frontend Engineer
  if command -v zeoel >/dev/null 2>&1; then
    zeoel agent run karar-frontend "<development task description>" --engine <resolved_engine> -m <resolved_model> --live
  else
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    if [ -f "$SCRIPT_DIR/../../../bin/zeoel.js" ]; then
      node "$SCRIPT_DIR/../../../bin/zeoel.js" agent run karar-frontend "<development task description>" --engine <resolved_engine> -m <resolved_model> --live
    elif [ -f "$HOME/.zeoel/bin/zeoel" ]; then
      "$HOME/.zeoel/bin/zeoel" agent run karar-frontend "<development task description>" --engine <resolved_engine> -m <resolved_model> --live
    else
      echo "❌ zeoel command or script not found!"
      exit 1
    fi
  fi

  # 2. Design Review: UX/UI Designer
  if command -v zeoel >/dev/null 2>&1; then
    zeoel agent run mahdi-designer "Review the design system & layout shell created by Karar. Verify layout, accessibility, and visual tokens." --engine <resolved_engine> -m <resolved_model> --live
  else
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    if [ -f "$SCRIPT_DIR/../../../bin/zeoel.js" ]; then
      node "$SCRIPT_DIR/../../../bin/zeoel.js" agent run mahdi-designer "Review the design system & layout shell created by Karar. Verify layout, accessibility, and visual tokens." --engine <resolved_engine> -m <resolved_model> --live
    elif [ -f "$HOME/.zeoel/bin/zeoel" ]; then
      "$HOME/.zeoel/bin/zeoel" agent run mahdi-designer "Review the design system & layout shell created by Karar. Verify layout, accessibility, and visual tokens." --engine <resolved_engine> -m <resolved_model> --live
    else
      echo "❌ zeoel command or script not found!"
      exit 1
    fi
  fi
  ```

## Shell Script Generation

For every task in the sprint plan, Gohar CEO must forcefully generate a shell script file under `docs/sprint-N/tasks/task_K.sh` (e.g. `docs/sprint-1/tasks/task_1.sh`). Additionally, Gohar CEO must forcefully generate a master sprint execution script named `run_all_tasks.sh` directly under `docs/sprint-N/run_all_tasks.sh` which executes all individual task scripts in the sprint sequentially without user prompts.

### Master Run-All Script Template (`docs/sprint-N/run_all_tasks.sh`):
```bash
#!/bin/bash
# Zeoel Master Sprint Execution Script - Sprint N
# Executes all tasks sequentially.

echo "🏁 Starting Master Execution for Sprint N..."
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Find and sort all task scripts under tasks/
tasks=($(find "$SCRIPT_DIR/tasks" -maxdepth 1 -name "task_*.sh" | sort -V))

if [ ${#tasks[@]} -eq 0 ]; then
  echo "❌ No task scripts found in $SCRIPT_DIR/tasks!"
  exit 1
fi

for task_script in "${tasks[@]}"; do
  task_name=$(basename "$task_script")
  echo "--------------------------------------------------------"
  echo "📋 Running task: $task_name"
  echo "--------------------------------------------------------"
  
  # Run the task script. If it fails, abort immediately to preserve harness integrity.
  bash "$task_script"
  if [ $? -ne 0 ]; then
    echo "❌ Error: $task_name failed! Aborting sprint execution."
    exit 1
  fi
done

echo ""
echo "🎉 All tasks in Sprint N executed successfully!"
```

The script file MUST contain the actual zeoel execution command(s) to run the task using the agent(s), NOT just descriptive comments or echo statements.

The script file MUST use this template structure (adapted for single or multiple agents):

### Single Agent Example:
```bash
#!/bin/bash
# Zeoel Task Execution Script - Sprint N, Task K
# Agent: <agent-id>
# Model: <resolved-model>
# Description: <task_description>

echo "🚀 Executing Task K: <task_description>..."
echo "👤 Agent: <agent-id>"
echo "🤖 Model: <resolved-model>"
echo ""

# Find framework command path or use node fallback
if command -v zeoel >/dev/null 2>&1; then
  zeoel agent run <agent-id> "<task_description>" --engine <resolved_engine> -m <resolved_model> --live
else
  SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  if [ -f "$SCRIPT_DIR/../../../bin/zeoel.js" ]; then
    node "$SCRIPT_DIR/../../../bin/zeoel.js" agent run <agent-id> "<task_description>" --engine <resolved_engine> -m <resolved_model> --live
  elif [ -f "$HOME/.zeoel/bin/zeoel" ]; then
    "$HOME/.zeoel/bin/zeoel" agent run <agent-id> "<task_description>" --engine <resolved_engine> -m <resolved_model> --live
  else
    echo "❌ zeoel command or script not found!"
    exit 1
  fi
fi
```

### Multi-Agent Example (e.g., Karar + Mahdi):
```bash
#!/bin/bash
# Zeoel Task Execution Script - Sprint N, Task K
# Agents: <agent-1> (primary), <agent-2> (reviewer)
# Model: <resolved-model>
# Description: <task_description>

echo "🚀 Executing Task K: <task_description>..."
echo "👤 Agents: <agent-1> + <agent-2>"
echo "🤖 Model: <resolved-model>"
echo ""

# 1. Primary Development
if command -v zeoel >/dev/null 2>&1; then
  zeoel agent run <agent-1> "<primary_development_task_description>" --engine <resolved_engine> -m <resolved_model> --live
else
  SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  if [ -f "$SCRIPT_DIR/../../../bin/zeoel.js" ]; then
    node "$SCRIPT_DIR/../../../bin/zeoel.js" agent run <agent-1> "<primary_development_task_description>" --engine <resolved_engine> -m <resolved_model> --live
  elif [ -f "$HOME/.zeoel/bin/zeoel" ]; then
    "$HOME/.zeoel/bin/zeoel" agent run <agent-1> "<primary_development_task_description>" --engine <resolved_engine> -m <resolved_model> --live
  else
    echo "❌ zeoel command or script not found!"
    exit 1
  fi
fi

# 2. Review / Audit / Polish
if command -v zeoel >/dev/null 2>&1; then
  zeoel agent run <agent-2> "Review and audit the work completed by <agent-1> for task K. Verify against requirements: <task_description>." --engine <resolved_engine> -m <resolved_model> --live
else
  SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  if [ -f "$SCRIPT_DIR/../../../bin/zeoel.js" ]; then
    node "$SCRIPT_DIR/../../../bin/zeoel.js" agent run <agent-2> "Review and audit the work completed by <agent-1> for task K. Verify against requirements: <task_description>." --engine <resolved_engine> -m <resolved_model> --live
  elif [ -f "$HOME/.zeoel/bin/zeoel" ]; then
    "$HOME/.zeoel/bin/zeoel" agent run <agent-2> "Review and audit the work completed by <agent-1> for task K. Verify against requirements: <task_description>." --engine <resolved_engine> -m <resolved_model> --live
  else
    echo "❌ zeoel command or script not found!"
    exit 1
  fi
fi
```
Do NOT omit or replace this command execution logic block.

In the `docs/sprint-N/plan.md` table, the "Run Command" column must contain a Markdown link to this script:
`[Run Task K (task_K.sh)](file:///absolute/path/to/docs/sprint-N/tasks/task_K.sh)`
And a block with the copy-pasteable command.
This allows the user to click the link to inspect the script, and run it directly in their terminal.
