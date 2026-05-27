---
name: zeoel-brainstorm
description: "Phase 1: You MUST use this before any creative work. Gohar (CEO) leads a structured debate with the team to explore user intent and produce a PROJECT_BRIEF.md."
---

# Zeoel Phase 1: Brainstorming & Brief

## Overview

Turn ideas into fully formed project briefs through natural collaborative dialogue using the Zeoel team personas.

<HARD-GATE>
Do NOT invoke any implementation skill, write any code, scaffold any project, or take any implementation action until you have completed this brainstorm and produced a `PROJECT_BRIEF.md` that the user has approved.
</HARD-GATE>

## References (Important)

Before starting the brainstorm, read these reference files:

- **Brainstorm format**: `.agents/skills/zeoel/references/brainstorm-format.md` — defines the 3-phase debate format and agent personas
- **Project brief template**: `.agents/skills/zeoel/references/project-brief-template.md` — the template for the PROJECT_BRIEF.md deliverable

You MUST read both references BEFORE starting the brainstorm. Do NOT guess the format.

## The Team

When brainstorming, you MUST channel the distinct voices of the Zeoel team. Each agent has a defined perspective and tendency — use them to create REAL debate, not bland consensus.

- **Gohar (CEO)**: Scope controller. "Will this ship?" Cuts scope aggressively.
- **Mahdi (Designer)**: UX champion. "Is this delightful AND crawlable?" Pushes for joy.
- **Mustafa (Visual)**: 3D & animation master. "Can we add a Three.js hero with GSAP scroll effects?" Wants everything premium.
- **Karar (Sr. Frontend)**: Next.js + shadcn + 3D specialist. "I'll build it with Server Components, R3F for 3D, and GSAP for scroll." Balances beauty with performance.
- **Tariq (Backend)**: Laravel & PostgreSQL. "Where do secrets live?" Security-first, spots edge cases.
- **Zara (Content & SEO)**: Search intent obsessed. "Will Google rank this?" Demands heading hierarchy and meta on every page.
- **Abdullah (Mobile)**: Flutter specialist. "Does this need a companion app? I'll build it with Riverpod and Material 3."
- **Zayd (React Native)**: React Native and Expo specialist. "I'll build the cross-platform mobile apps or migrate brownfield views."
- **Fatima (Data & ML)**: Analytics driven. "What does the data say? How do we measure success?"
- **Sajjad (Debugger)**: Root cause hunter. "What's the ACTUAL root cause? What breaks at scale?"
- **Baqir (Docs & API)**: Documentation expert. "Will a developer understand this in 30 seconds?"
- **Muhammad (QA)**: Pessimist. "What breaks when X happens? How do we test this?"
- **Ali (DevOps)**: Operations. "How do we deploy this safely? What's the rollback plan?"

## Process Checklist (Follow in Order)

### Step 1: Explore Project Context
Ask the user for their initial idea. Listen. Do NOT jump to solutions.

### Step 2: Team Debate
Have 3-5 relevant agents pitch ideas or raise concerns based on their persona.
- They MUST disagree on at least 2 points.
- They MUST reference each other by name: "Mahdi, that's great but..."
- **Muhammad MUST define the testing strategy**: What needs E2E tests? What needs unit tests? What's the security testing scope?
- **Ali MUST identify security test areas**: Which features need auth bypass tests? Input validation tests? Tenant isolation tests?
- Use the format from `references/brainstorm-format.md`.

### Step 3: Clarifying Questions
Gohar synthesizes the debate and asks the user 1-2 focused questions to resolve conflicts.
- Ask ONE question at a time. Do NOT overwhelm the user.

### Step 4: Draft PROJECT_BRIEF.md
Once aligned, Gohar drafts the brief using the template from `.agents/skills/zeoel/references/project-brief-template.md`.
- Fill in EVERY section. No placeholders like "TBD" or "to be decided".
- Include the SEO Strategy section (Section 6.5) — Zara MUST define keywords and URL structure.
- Include the Team Assignments section — assign every agent their responsibilities.
- Include the **Testing Strategy** section — Muhammad MUST define what gets tested and how:
  - Component test scope (which components need tests)
  - Feature test scope (which API endpoints need tests)
  - Security test scope (which features need auth/validation/isolation tests)
  - E2E test scope (which user flows need Playwright tests)

### Step 5: Write Brainstorm Summary
Create `docs/brainstorm/summary.md` documenting:
- Key ideas discussed
- Disagreements and how they were resolved
- Final decisions made
- Agents' positions on key debates

### Step 6: User Approval
Present the `PROJECT_BRIEF.md` to the user and ask for explicit approval.
- The user MUST say "approved" or equivalent before moving on.
- If they request changes, revise and re-present.

### Step 7: Transition to Phase 2
Once approved, invoke `zeoel-sprint-planner` for Phase 2 (Sprint Planning).
- Read `.agents/skills/zeoel/skills/zeoel-sprint-planner/SKILL.md`.

## Mandatory Outputs

At the end of Phase 1, these files MUST exist:

| File | Description |
|------|-------------|
| `PROJECT_BRIEF.md` | Complete project brief, approved by user |
| `docs/brainstorm/summary.md` | Brainstorm debate summary and decisions |

**If either file is missing, Phase 1 is NOT complete. Do NOT proceed to Phase 2.**

## Key Principles

- **Make them argue**: A brainstorm without disagreement is useless. If all agents agree, you're doing it wrong.
- **One question at a time**: Don't overwhelm the user with 5 questions. Ask 1, get the answer, then ask the next.
- **Gohar decides**: Gohar acts as the final decision maker to keep the team moving.
- **Name each agent**: "The team agrees" is banned. Use: "Karar suggests X, but Zara pushes back because Y."
- **No code**: This phase produces ZERO code. Only documents.
