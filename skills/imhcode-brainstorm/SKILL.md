---
name: imhcode-brainstorm
description: "Guidelines for Phase 2-3 Brainstorming. The planner agent reads docs/start.md, generates docs/brainstorming.md with smart recommended answers, and reads user answers to configure testing strategy and model routing."
---

# IMH-Code Brainstorming Skill (Phase 2-3)

This skill governs Phase 2 (Plan) and Phase 3 (Brainstorm) of the IMH-Code workflow.

## File-Based Interactive Brainstorming Protocol

To keep the development fast and simple, brainstorming operates via structured markdown documents in the `docs/` folder:

### Step 1: Generate Brainstorming Document (Phase 2)
- **Trigger**: User runs `imhcode plan` when `docs/start.md` exists but `docs/brainstorming.md` does not.
- **Actions**:
  1. The planner agent reads the user's project description from the `<!-- WRITE_PROMPT_HERE -->` section of `docs/start.md`.
  2. The agent auto-detects stack requirements (frontend, backend, database, mobile).
  3. The agent generates `docs/brainstorming.md` containing:
     - Clear, categorized questions about stack choices, features, deployment, and testing strategy.
     - **Auto-Recommended Answers** parsed from keywords in the prompt to minimize typing for the user.
     - **Testing Strategy Question**: Standardizing on **Fast Mode** (no tests per sprint, final testing sprint only) as the default recommendation for maximum speed.
  4. The planner outputs a guide in the chat:
     `✅ Brainstorming document created: docs/brainstorming.md. Please review/edit the recommended answers and run "imhcode plan" again to generate sprints.`

### Step 2: Read Brainstorming Answers & Generate Sprints (Phase 4)
- **Trigger**: User runs `imhcode plan` when `docs/brainstorming.md` exists.
- **Actions**:
  1. The planner agent reads the answers from `docs/brainstorming.md`.
  2. **Testing Mode Configuration**: Parses Q24 (Testing Strategy) and writes `"testing_mode": "fast" | "balanced" | "strict"` to `imhcode.config.json`.
  3. **Model Routing Confirmation**: Saves the confirmed routing map to `imhcode.config.json`.
  4. **Deliverables Generation**:
     - Generates `PROJECT_BRIEF.md` at the project root summarizing requirements, stack, and sprint status.
     - Generates `docs/sprint-1/`, `docs/sprint-2/`, etc. plans, trackers, and bash scripts.
     - **Auto-Generated Testing Sprint**: If Fast or Balanced mode is selected, the final sprint (e.g. Sprint 3) is automatically generated containing QA, security, SEO, and browser tests.
  5. The planner outputs a completion message in the chat:
     `✅ Sprint plans generated successfully! Run "imhcode execute 1" to start Sprint 1.`
