---
name: zeoel-dispatch
description: "Guidelines for Phase 3 Execution. Dispatches sub-agents for specialized tasks, enforces strict Red-Green-Refactor TDD, updates progress files, and handles recovery protocols."
---

# Zeoel Dispatch & Execution Skill (Phase 3)

This skill governs Phase 3: Execution.

## Red-Green-Refactor TDD Workflow

Sub-agents must strictly follow Test-Driven Development (TDD) for all tasks containing application code:

1. **Red Phase**: Write the failing test first, referencing the specifications.
2. **Green Phase**: Write the minimal application code in `frontend/` or `backend/` to make the test pass.
3. **Refactor Phase**: Clean up, deduplicate, and document the code.

## Post-Task Checkpoint

After completing a task:
1. Update `docs/sprint-N/progress.md` with:
   - Status: `✅ Done`
   - Test files: list of created test files
   - Timestamp
2. Run `/graphify . --update` to update the codebase semantic relationship graph.
3. Update `docs/sprint-N/deferred.md` if any scope was deferred.
4. Update relevant sections of `PROJECT_BRIEF.md` directly (such as Database Schema, API Specification, UI Layout Map) to reflect the exact implementation details.
5. Append a message describing the completed task, code note findings, new API routes/endpoints, database schema changes, and important design details to the `## Centralized Agent Messaging & Findings Log` section at the end of `PROJECT_BRIEF.md`. This log serves as the shared message board for the CEO and sub-agents. Format your entry as follows:
   ```markdown
   #### [Agent Name/Role] Findings - Task K [Timestamp]
   - **Task**: [Task name / description]
   - **Changes/Findings**: [Brief summary of the changes and findings]
   - **Dependency/Messaging Alert**: [Important notes for next tasks or dependent agents]
   ```
