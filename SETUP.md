# Zeoel Setup Guide — Step by Step

> How to install and use the Zeoel multi-agent framework across **GitHub Copilot**, **OpenAI Codex**, **Claude Code**, and **Antigravity**.

---

## Prerequisites

- Your project repository should be initialized with Git.
- The `.agents/` directory containing the Zeoel framework should be at the root of your repository.

### File Structure Required

```
your-project/
├── frontend/                  # Your frontend codebase (Next.js, React)
├── backend/                   # Your backend codebase (Laravel, Django)
├── docs/                      # Sprint orchestration artifacts
├── .worktrees/                # Sprint snapshots (created automatically)
├── .agents/
│   └── skills/
│       └── zeoel/             # ← The entire Zeoel framework
│           ├── SKILL.md
│           ├── agents/
│           ├── skills/
│           ├── references/
│           └── examples/
├── PROJECT_BRIEF.md           # Master requirements document
├── .gitignore                 # Auto-generated
├── package.json               # (or composer.json, pubspec.yaml, etc.)
└── README.md
```

---

## 1. GitHub Copilot (VS Code / JetBrains)

### Installation

1. Copy the `.agents/` folder to the **root** of your project.
2. Create a `.github/copilot-instructions.md` file at the root:

```markdown
# Copilot Instructions

When working on this project, always read and follow the Zeoel framework at `.agents/skills/zeoel/SKILL.md`.

## Key Rules

1. Before starting any feature, run the brainstorm phase: read `.agents/skills/zeoel/skills/zeoel-brainstorm/SKILL.md`.
2. Use the agent personas defined in `.agents/skills/zeoel/agents/` for specialized tasks.
3. For SaaS projects, always load `.agents/skills/zeoel/skills/zeoel-saas-architect/SKILL.md` during planning.
4. Never write code without a PROJECT_BRIEF.md approved by the user.
5. Follow the 4-phase pipeline: Brainstorm → Plan → Execute → Verify.
```

### Usage

1. Open your project in VS Code with Copilot Chat.
2. In Copilot Chat, type: _"Read .agents/skills/zeoel/SKILL.md and help me build a SaaS for [your idea]"_
3. Copilot will follow the Zeoel orchestration pipeline.

### Tips for Copilot

- Use **Copilot Chat Participants**: `@workspace` to give Copilot full repo context.
- Reference agent files directly: _"Act as Karar (read `.agents/skills/zeoel/agents/karar-frontend.md`) and build the pricing page"_.
- Use `#file` references to point Copilot to specific agent definitions.

---

## 2. OpenAI Codex (CLI)

### Installation

1. Copy the `.agents/` folder to the **root** of your project.
2. Create a `AGENTS.md` file at the project root:

```markdown
# Agents

This project uses the Zeoel multi-agent framework.

## Setup

- Framework location: `.agents/skills/zeoel/SKILL.md`
- Agent definitions: `.agents/skills/zeoel/agents/`
- Skills: `.agents/skills/zeoel/skills/`

## Workflow

1. Always read SKILL.md before starting any work.
2. Follow the 4-phase pipeline: Brainstorm → Plan → Execute → Verify.
3. Use specific agent personas for specialized tasks.
4. Generate PROJECT_BRIEF.md before writing any code.
```

3. Create a `codex.md` (or `INSTRUCTIONS.md`) at the project root:

```markdown
When starting any task:

1. Read `.agents/skills/zeoel/SKILL.md` to understand the framework.
2. For SaaS projects, also read `.agents/skills/zeoel/skills/zeoel-saas-architect/SKILL.md`.
3. Follow the agent dispatch pattern in `.agents/skills/zeoel/skills/zeoel-dispatch/SKILL.md`.
4. Always create a PROJECT_BRIEF.md first.
```

### Usage

```bash
# Start Codex CLI and point it to the framework
codex "Read .agents/skills/zeoel/SKILL.md. I want to build a SaaS for [your idea]. Start with Phase 1 brainstorming."
```

### Tips for Codex

- Codex works well with file-system context. Keep `PROJECT_BRIEF.md` and sprint docs updated.
- Use `codex --full-auto` mode for sprint execution after the plan is approved.
- Point to specific agents: _"Act as Tariq (read .agents/skills/zeoel/agents/tariq-backend.md) and build the auth API"_.

---

## 3. Claude Code (CLI)

### Installation

1. Copy the `.agents/` folder to the **root** of your project.
2. Create a `CLAUDE.md` file at the project root:

```markdown
# Claude Code Instructions

## Zeoel Framework

This project uses the Zeoel multi-agent AI agency framework for structured development.

### Mandatory First Steps

1. Read `.agents/skills/zeoel/SKILL.md` at the start of every session.
2. Before any creative work, invoke the brainstorm skill: `.agents/skills/zeoel/skills/zeoel-brainstorm/SKILL.md`.
3. For SaaS projects, load the blueprint: `.agents/skills/zeoel/skills/zeoel-saas-architect/SKILL.md`.

### Agent Dispatch

When executing specialized tasks, load the relevant agent's persona file from `.agents/skills/zeoel/agents/`:

- Frontend (Next.js): `karar-frontend.md`
- Backend (Laravel): `tariq-backend.md`
- SEO: `zara-content.md`
- Mobile (Flutter): `abdullah-mobile.md`
- React Native: `zayd-react-native.md`
- Testing: `muhammad-qa.md`
- Debugging: `sajjad-debugger.md`
- Docs: `baqir-docs.md`
- DevOps: `ali-devops.md`

### Key Rules

- NEVER write code without an approved PROJECT_BRIEF.md.
- ALWAYS follow the 4-phase pipeline.
- Code MUST live in `frontend/` or `backend/`. Do NOT create other code directories.
- Sprint snapshots are saved in `.worktrees/`.
- Use sprint documents (`docs/sprint-N/`) for context survival.
- One commit per task.

### Sub-Agent Pattern

Claude Code supports sub-agents natively. You can dispatch sub-agents using the Task tool:

- Each sub-agent gets a fresh context with only the relevant agent persona and task description.
- Sub-agents must update `docs/sprint-N/progress.md` when done.
```

### Usage

```bash
# Start Claude Code
claude

# In the session:
> Read .agents/skills/zeoel/SKILL.md. I want to build a SaaS for [your idea].

# Claude will follow the pipeline automatically.
```

### Tips for Claude Code

- Claude Code's sub-agent (Task) tool maps perfectly to Zeoel's dispatch pattern.
- Use `CLAUDE.md` to ensure the framework is loaded every session.
- Claude Code reads the full project structure — keep `docs/` and `PROJECT_BRIEF.md` updated for context survival.
- Use TodoWrite for sprint task tracking during execution.

---

## 4. Antigravity IDE

### Installation

1. Copy the `.agents/` folder to the **root** of your project (your workspace).
2. Antigravity automatically detects skills in `.agents/skills/`.

### Usage

1. Open your project workspace in Antigravity.
2. Tell the agent: _"I want to build a SaaS for [your idea]"_
3. Antigravity will automatically load the Zeoel skill and follow the pipeline.

### Tips for Antigravity

- Antigravity's planning mode aligns perfectly with Zeoel's Phase 1-2. It will create implementation plans and request approval.
- Use `@file` references to point to specific agent definitions during execution.
- Antigravity's artifact system works well for PROJECT_BRIEF.md and sprint documentation.
- For long-running projects, use the `/goal` command for thorough execution.

---

## Universal Usage Patterns

### Starting a New SaaS Project

In any tool, say:

```
I want to build a SaaS for [your idea]. Use the Zeoel framework.
Start with Phase 1 brainstorming.
```

### Dispatching a Specific Agent

```
Act as Karar (read .agents/skills/zeoel/agents/karar-frontend.md).
Build the pricing page for Sprint 2.
Reference the PROJECT_BRIEF.md for requirements.
```

### Running a Sprint

```
Read docs/sprint-2/plan.md and execute all tasks.
Dispatch each agent according to the plan.
Update docs/sprint-2/progress.md after each task.
```

### Debugging an Issue

```
Act as Sajjad (read .agents/skills/zeoel/agents/sajjad-debugger.md).
The checkout flow is returning a 500 error.
Start by reproducing the bug with a failing test.
```

### Running a Security Audit

```
Act as Ali (read .agents/skills/zeoel/agents/ali-devops.md).
Run the OWASP ASI compliance check from .agents/skills/zeoel/skills/zeoel-security/SKILL.md.
Generate a security report at docs/security/sprint-3-audit.md.
```

---

## Context Survival Across Sessions

LLM context windows are finite. Zeoel uses **file-system-based memory**:

| What                         | Where                             | Who Updates   |
| ---------------------------- | --------------------------------- | ------------- |
| Project scope & requirements | `PROJECT_BRIEF.md`                | Gohar (CEO)   |
| Sprint tasks                 | `docs/sprint-N/plan.md`           | Gohar (CEO)   |
| Progress tracking            | `docs/sprint-N/progress.md`       | All agents    |
| QA results                   | `docs/qa/sprint-N-signoff.md`     | Muhammad (QA) |
| Security audits              | `docs/security/sprint-N-audit.md` | Ali (DevOps)  |
| SEO audits                   | `docs/seo/sprint-N-audit.md`      | Zara (SEO)    |
| Architecture docs            | `docs/codebase/`                  | Baqir (Docs)  |

When starting a new session, always say:

```
Read PROJECT_BRIEF.md and docs/sprint-N/progress.md to understand the current state.
```

---

## Troubleshooting

| Problem                              | Solution                                                                                          |
| ------------------------------------ | ------------------------------------------------------------------------------------------------- |
| Agent not following persona          | Explicitly reference the agent's `.md` file: `read .agents/skills/zeoel/agents/karar-frontend.md` |
| Tool skipping brainstorm             | Add to instructions: "NEVER write code without an approved PROJECT_BRIEF.md"                      |
| Context getting lost                 | Check that `progress.md` is up to date. Start new sessions by reading it.                         |
| Agent writing code outside its scope | Remind it of constraints: "You are Tariq. You ONLY write backend code."                           |
