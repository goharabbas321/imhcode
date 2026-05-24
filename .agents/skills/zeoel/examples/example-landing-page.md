# Example Workflow: Landing Page

> This example demonstrates how the Zeoel framework orchestrates the building of a modern landing page.

## Phase 1: Brainstorming (`zeoel-brainstorm`)

**User**: "I want a modern landing page for my new AI SaaS product called 'MindFlow'."

**Gohar**: "Let's align the team. What's the core vibe and technical constraint?"
**Mahdi**: "It needs to feel effortless. Let's use the 'Glassmorphism' design anchor with fluid scroll animations."
**Karar**: "Glassmorphism can be heavy on performance if we overdo CSS filters. Let's ensure we use Tailwind efficiently and test on low-end devices."
**Mustafa**: "I'll use Framer Motion for the scroll reveals, but keep the backdrop-filters limited to just the navbar and hero cards."
**Gohar**: "Great compromise. User, does a Glassmorphism theme with high-performance Framer Motion sound good?"

*(Produces `PROJECT_BRIEF.md`)*

## Phase 2: Sprint Planning (`zeoel-sprint-planner`)

Gohar creates `docs/sprint-1/plan.md`:

| # | Task   | Assigned Agent                | Est | Description              |
|---|--------|-------------------------------|-----|--------------------------|
| 1 | Setup  | Karar (Frontend)              | 30m | Scaffold Next.js + Tailwind |
| 2 | Design | Mahdi (Product Designer)      | 1h  | Define color palette & tokens |
| 3 | Styling| Mustafa (Art/Visual)          | 1h  | Build global CSS & animations|
| 4 | Hero   | Karar (Frontend)              | 1h  | Build Hero component       |
| 5 | QA     | Muhammad (QA Engineer)        | 30m | Test responsiveness        |

## Phase 3: Execution (`zeoel-dispatch`)

The orchestrator reads the sprint plan and dispatches agents:

1. **Dispatch Karar**: Reads `karar-frontend.md`, loads `nextjs-turbopack` skill. Scaffolds the app.
2. **Dispatch Mahdi**: Reads `mahdi-designer.md`, loads `frontend-design` skill. Outputs `theme.ts` with Glassmorphism tokens.
3. **Dispatch Mustafa**: Reads `mustafa-visual.md`, loads `motion-patterns`. Builds the `FramerMotion` wrapper components.
4. **Dispatch Karar**: Builds the Hero section using Mahdi's tokens and Mustafa's wrappers.

## Phase 4: Verify & Ship

1. **Dispatch Muhammad**: Loads `browser-qa`. Verifies Lighthouse score is >90.
2. **Dispatch Ali**: Loads `github-ops`. Sets up Vercel deployment action.
3. **Gohar**: Writes `docs/sprint-1/done.md` and hands back to the user.
