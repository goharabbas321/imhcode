---
name: zeoel-brainstorm
description: "Guidelines for Phase 1 Brainstorming. Gohar (CEO) simulates debates, asks clarifying questions step-by-step in the active session, and forcefully generates PROJECT_BRIEF.md and docs/brainstorm/summary.md once aligned."
---

# Zeoel Brainstorming Skill (Phase 1)

This skill governs Phase 1: Brainstorming.

## File-Based Interactive Brainstorming Protocol

To make the workflow easy for the user, Phase 1 operates as a two-step file-based process:

### Step 1: Submit Project Idea
- **Trigger**: User starts the brainstorming (runs the `.zeoel/commands/start.sh` or `.zeoel/commands/start.cmd` script, which passes `Brainstorming project: <idea>`), or provides a general project task when `PROJECT_BRIEF.md` does not exist.
- **Actions**:
  1. Gohar (CEO) simulates a comprehensive debate between all relevant agent specialists (referencing the 33-agent registry, e.g., Mahdi for UX/UI, Tariq for database/backend, Zara for SEO, Karar for frontend, Ali for DevOps, Hamid for security, Ibrahim for AI, Maryam for business logic, etc.) about the product requirements.
  2. **Capability Check & Honesty**: Each agent MUST perform a strict capability/resource review of the requirements. If they detect that the team lacks specific agents, skills, or compute/API resources to perform a task properly, they MUST honestly state: `⚠️ CAPABILITY GAP: We are not capable of implementing [X] directly because we lack [particular requirements/agent members/skills].`
  3. **Plan B Alternative Architecture**: If a capability gap is flagged (or as a general architectural guide), Gohar-CEO MUST propose a **Plan B (Alternative Architecture / Best Possible Local System)** in a dedicated section. This suggestion outlines how to build the best possible system using available local agents, skills, and open-source libraries.
  4. Gohar MUST write the simulated debate transcript, the capability check warnings, and the Plan B suggestions directly to `.zeoel/questions/debate.md`.
  5. Gohar MUST write the clarifying questions directly to `.zeoel/questions/questions.md`. **Gohar MUST always include a standalone, explicit clarifying question specifically asking about the user's preferred technology stack (e.g., "What is your preferred frontend framework, backend framework, database, and other key technologies or integrations?"). This question MUST be a direct, separate question so we get a clean answer from the user about exactly what they want.**
  6. **Model Routing Clarification**: Gohar MUST include a dedicated clarifying question asking the user to choose their preferred model and engine routing mappings. Gohar must list all scanned assistant CLI engines and models configured in `zeoel.config.json` and present the recommended mapping for the 14 conceptual roles:
     - `PRIMARY DESIGN BRAIN` (Recommended: Claude Opus via Antigravity/agy)
     - `DESIGN POLISH / UX REVIEW` (Recommended: Claude Sonnet 4.6 via Antigravity/agy)
     - `DESIGN FALLBACK` (Recommended: GLM-5.2 or Qwen3.7 Max via OpenCode Go/opencode)
     - `FRONTEND BUILDER` (Recommended: MiMo-V2.5-Pro via OpenCode Go/opencode)
     - `FRONTEND FALLBACK` (Recommended: Qwen3.7 Plus via OpenCode Go/opencode)
     - `FRONTEND FINAL REVIEW` (Recommended: GPT-5.5 via Codex/codex)
     - `PRIMARY ARCHITECTURE REVIEWER` (Recommended: GPT-5.5 via Codex/codex)
     - `PRIMARY SECURITY REVIEWER` (Recommended: GPT-5.5 via Codex/codex)
     - `SECURITY FALLBACK / LARAVEL SECURITY REVIEW` (Recommended: DeepSeek V4 Pro via OpenCode Go/opencode)
     - `PRIMARY BACKEND BUILDER` (Recommended: DeepSeek V4 Pro via direct DeepSeek API/opencode)
     - `BACKEND MULTI-FILE BUILDER` (Recommended: Kimi K2.7 Code via OpenCode Go/opencode)
     - `BACKEND FALLBACK` (Recommended: DeepSeek V4 Pro via OpenCode Go/opencode)
     - `FAST BUG FIXING` (Recommended: DeepSeek V4 Flash via OpenCode Go/opencode)
     - `EXTERNAL FINAL AUDIT` (Recommended: OpenCode Zen/opencode)
     Prompt the user to customize or approve these recommendations.
  7. Gohar must also ask the user how they wish to address any flagged capability gaps or if they prefer Plan B.
  8. Gohar MUST write a template answers sheet directly to `.zeoel/answers/answers.md`. **Gohar MUST include an explicit clarifying question asking the user if they need auto task execution or they will execute manually (with Auto as the recommended default).**
  9. **File Format for `.zeoel/questions/debate.md`**:
     ```markdown
     # Phase 1: Simulated Specialist Debate & Capability Review

     <Debate transcript between Mahdi, Tariq, Zara, Karar, Ali, Hamid, Ibrahim, etc. addressing SaaS scalability, caching, queues, background workers, security, etc.>

     ## Capability Gap Analysis
     - **Flagged Gaps**: [List any capability gaps honestly flagged by the agents, or state "None - fully capable"]
     - **Requirements/Skills/Agents Needed**: [List what is missing to perform the original feature list in the best way]

     ## Plan B: Alternative Architecture & Best Possible System
     - **Proposal**: [Plan suggestion using only available agents, skills, and open-source packages]
     - **Recommended Sources**: [Recommended libraries, third-party APIs, or services to bridge the capability gap]
     ```
  6. **File Format for `.zeoel/questions/questions.md`**:
     ```markdown
     # Phase 1: Clarifying Questions

     Read the full specialist agent debate in [debate.md](./debate.md) first to understand context and considerations.

     Please review the questions below. Write your answers inside the answer sheet at [.zeoel/answers/answers.md](../answers/answers.md).

     1. [Question 1]
     2. [Question 2]
     3. [Question 3]
     ...
     ```
  7. **File Format for `.zeoel/answers/answers.md`**:
     ```markdown
     # Phase 1: Brainstorming Answers

     Refer to the clarifying questions in [questions.md](../questions/questions.md) and the debate transcript in [debate.md](../questions/debate.md) to answer.

     Please write your answers directly under each question:

     1. [Question 1]
     Write your answer here:
     > 

     2. [Question 2]
     Write your answer here:
     > 

     3. [Question 3]
     Write your answer here:
     > 

     ...

     ---

     ## Submit Answers

     Once you have written your answers above, submit them to Gohar (CEO) by running the block below:

     ### Mac / Linux
     ```bash
     .zeoel/commands/submit_answers.sh
     ```
     Or click here: [Submit Answers](../commands/submit_answers.sh)

     ### Windows
     ```cmd
     .zeoel\commands\submit_answers.cmd
     ```
     Or click here: [Submit Answers](../commands/submit_answers.cmd)
     ```
  8. Gohar prints a clean terminal/chat message:
     "✅ Specialist debate has been written to .zeoel/questions/debate.md, clarifying questions written to .zeoel/questions/questions.md, and answers sheet created in .zeoel/answers/answers.md. Please open .zeoel/answers/answers.md, type your answers, and run `.zeoel/commands/submit_answers.sh` or click the Submit link to continue."

### Step 2: Submit Answers
- **Trigger**: User runs `.zeoel/commands/submit_answers.sh` or `.zeoel/commands/submit_answers.cmd` (which passes `Brainstorming answers: <answers>`).
- **Actions**:
  1. Gohar reads the answers from the input.
  2. **Save Model Mapping Configuration**: Gohar parses the chosen model mappings from the user's answers. Gohar writes these mappings directly to `zeoel.config.json` under the key `"model_mapping"` in the format `{ "model_mapping": { "role_key": { "engine": "engine_name", "model": "model_name" } } }`. If the user does not specify custom overrides or leaves it blank, Gohar saves the recommended default role-to-model/engine mappings. **Gohar also parses the chosen execution mode (auto vs manual) and writes `"execution_mode": "auto" | "manual"` directly to `zeoel.config.json` (defaulting to `"auto"` if unspecified).**
  3. Gohar MUST forcefully generate the final deliverables at the project root and `docs/`:
     - `PROJECT_BRIEF.md` (fully detailed requirements brief, including every feature requested or implied in the prompt with 100% completeness. It MUST end with a dedicated `## Centralized Agent Messaging & Findings Log` section where agents append findings and dependency messages).
     - `docs/brainstorm/summary.md` (summary of debate, decisions, and stack choice)
  4. Gohar immediately proceeds to **Phase 2 (Sprint Planning)** to plan the entire roadmap at once. Gohar MUST plan ALL required sprints (Sprint 1 to Sprint S) up front, creating plans, progress files, deferred logs, and generating task execution shell scripts under `docs/sprint-N/tasks/task_*.sh` for all sprints N from 1 to S. Ensure task execution shell scripts are generated using the resolved mapped engine and model flags for each task.
  4. Gohar prints a clean terminal/chat message:
     "✅ Brainstorming aligned and all sprints (Sprint 1 to Sprint S) planned successfully! Sprints and execution scripts have been created under docs/sprint-1/, docs/sprint-2/, etc. You can start running tasks by executing the script commands in the sprint plans."
