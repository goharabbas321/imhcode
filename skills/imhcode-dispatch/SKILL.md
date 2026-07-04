---
name: imhcode-dispatch
description: "Guidelines for Phase 5 Execution. Handles execution flow, updates progress logs, writes to PROJECT_BRIEF.md log, and respects testing modes (fast, balanced, strict)."
---

# IMH-Code Dispatch & Execution Skill (Phase 5)

This skill governs Phase 5: Execution.

## Testing Mode Protocol

Before writing any code, the executor agent reads the `testing_mode` inside `imhcode.config.json`:

1. **"fast" (Default)**: Do NOT write any tests. Focus entirely on building correct, working application code to speed up MVP velocity. Testing will be handled in the final dedicated testing sprint.
2. **"balanced"**: Add basic smoke tests (endpoint responds 200, frontend route renders without crashing).
3. **"strict"**: Follow strict Test-Driven Development (TDD) cycle: write failing test, implement code, pass test, refactor.

## Post-Task Checkpoint

After completing a task:
1. Update `docs/sprint-N/progress.md` with:
   - Status: `✅ Done`
   - Timestamp
2. Update relevant sections of `PROJECT_BRIEF.md` to reflect implementation details (database tables, routes, pages).
3. Append a technical note to the bottom of `PROJECT_BRIEF.md` under the `## Centralized Agent Messaging & Findings Log`:
   ```markdown
   #### [Agent ID] - Task K [Timestamp]
   - **Task**: [Task name / description]
   - **Changes/Findings**: [Brief summary of the changes and files modified]
   ```
4. Update the compact project context file `.imhcode/context.md` with the new completed status.
