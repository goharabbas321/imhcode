---
name: imhcode-sprint-planner
description: "Guidelines for Phase 4 Sprint Planning. The planner agent generates all sprint directories, plan.md files, task trackers, and execution scripts with routed model configurations."
---

# IMH-Code Sprint Planner Skill (Phase 4)

This skill governs Phase 4: Sprint Planning.

## Task Decomposition and Planning

1. **Sprint Directory Structure**: Create directories and files under `docs/sprint-N/` for every sprint:
   - `plan.md` — The sprint plan table.
   - `progress.md` — Progress tracker.
   - `deferred.md` — Deferred tasks tracker.
   - `docs/deferred/backlog.md` — Cumulative deferred backlog.
2. **Granular Task Decomposition**: Breakdown tasks into bite-sized, concrete deliverables. Each sprint MUST contain between 5 to 15 granular tasks.
3. **Execution Scripts**: For every task, generate a shell script file under `docs/sprint-N/tasks/task_K.sh`.
4. **Master Script**: Generate `docs/sprint-N/run_all_tasks.sh` which executes all individual task scripts sequentially.

## Model Routing (from imhcode.config.json)

1. **Verify Mapped Models**: The planner agent reads `imhcode.config.json`'s `model_routing` key.
2. **Assign Routed Models**: Generate `task_K.sh` with the corresponding mapped engine and model flags for the executing agent's category.
3. **Complexity Tier Fallback**: If task is tier "light", use the "fast" routed model.

## Task Script Template (`docs/sprint-N/tasks/task_K.sh`):

```sh
#!/bin/bash
# IMH-Code — Sprint N Task K
CWD="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$CWD/../../../.."

TASK="Task description here"

if command -v imhcode >/dev/null 2>&1; then
  imhcode agent run [agent-id] "$TASK" --live
else
  node "$(npm root -g)/imhcode/bin/imhcode.js" agent run [agent-id] "$TASK" --live
fi
```
