# PROJECT_BRIEF.md Template

Copy this template to your project root and fill in every section. **Do not abbreviate sections 12-14** — they are critical for cross-chat context survival.

---

```markdown
# PROJECT_BRIEF.md — [Project Name]

> Last updated: [date] | Sprint [N] | Status: [In Progress / Complete]

## 0. Project Configuration

> These settings were chosen by the Product Owner during the onboarding questionnaire (Step 0).

| Setting | Choice |
|---------|--------|
| **Stack Scope** | [Frontend Only / Full-Stack / Backend Only] |
| **Frontend Framework** | [Next.js / Vite + React / Nuxt / Other / None] |
| **Backend Framework** | [Laravel / Django / FastAPI / NestJS / Spring Boot / None] |
| **Database** | [PostgreSQL / MySQL / MongoDB / SQLite / None] |
| **Mobile Companion** | [Flutter / React Native / None] |
| **Worktree Snapshots** | [Yes / No] |
| **Testing Strictness** | [Strict TDD / Relaxed] |

## 1. Project Overview

[3-4 sentences describing what the project is, who it's for, and the core goal.]

## 2. Concept / Product Description

[Detailed description of the product — user flows, key features, narrative if applicable.]

## 3. Tech Stack

- **Frontend:** [framework, language, key libraries]
- **Backend:** [runtime, framework, database]
- **Hosting:** [platform, CDN, storage]
- **Testing:** [test framework, E2E tool]
- **CI/CD:** [pipeline tool]

## 4. Architecture
```

┌─────────────────────────────────────────┐
│ Frontend │
│ [Main Component] → [Sub Components] │
└──────────────┬──────────────────────────┘
│ HTTPS
┌──────────────▼──────────────────────────┐
│ Backend API │
│ [Endpoints and their purpose] │
└──────────────┬──────────────────────────┘
│
┌──────────────▼──────────────────────────┐
│ Storage / Database │
│ [Tables, collections, env vars] │
└─────────────────────────────────────────┘

````

## 5. Key Files Map

| Area | Path | Contents |
|------|------|----------|
| Entry point | `src/main.tsx` | App bootstrap |
| API | `api/src/` | Server-side logic |
| Config | `api/src/config/` | Server-only configuration |
| Tests | `tests/` | E2E and API tests |
| Sprint docs | `docs/sprint-N/` | Plans, progress, done |

## 6. Team Assignments (Zeoel Agents)

| Agent | Name | Role | Assigned For |
|-------|------|------|--------------|
| CEO | Gohar | Sprint plans, dispatch, reviews | Phase 1 & 2 orchestration |
| Product | Mahdi | UX design, SEO-first layout, accessibility | [UX tasks] |
| Art/CSS | Mustafa | Visual design, animations, polish | [Styling tasks] |
| Frontend | Karar | Next.js App Router, Server Components, SEO | [Frontend tasks] |
| Backend | Tariq | Laravel API, Cashier/Stripe, PostgreSQL | [Backend tasks] |
| Content/SEO | Zara | Keyword strategy, meta, JSON-LD, copy | [SEO & content tasks] |
| Mobile | Abdullah | Flutter companion app | [Mobile tasks] |
| React Native | Zayd | React Native companion app | [React Native tasks] |
| Data/ML | Fatima | Postgres analytics, ML pipelines | [Analytics tasks] |
| DevOps | Ali | CI/CD, Docker, security audit | [Infrastructure] |
| QA | Muhammad | Playwright E2E tests, bug filing | [Verification] |

## 6.5. SEO Strategy

> **This section is mandatory for all SaaS projects.** Zara defines this during Phase 1.

**Primary Keywords**: [List 3-5 primary keywords for the product]
**URL Structure**: [Reference the URL architecture from zeoel-saas-architect]

| Page | URL | Primary Keyword | H1 |
|------|-----|-----------------|-----|
| Homepage | `/` | [keyword] | [h1 text] |
| Features | `/features` | [keyword] | [h1 text] |
| Pricing | `/pricing` | [keyword] | [h1 text] |
| Blog Index | `/blog` | [keyword] | [h1 text] |

**Structured Data Plan**: [Which JSON-LD schemas will be implemented? Organization, Product, Article, FAQ, BreadcrumbList]

## 7. Sprint Status

| Sprint | Name | Status | Scope |
|--------|------|--------|-------|
| 0 | Architecture | ✅ Done | Tech stack, project structure, design guide |
| 1 | Core Features | 🔨 In Progress | [scope description] |

## 8. Current State (rewrite every sprint)

**What works:**
- [List of working features]

**What doesn't work yet:**
- [Known issues]

**What's next:**
- [Next sprint goals]

## 9. Security Rules

1. Secrets live in environment variables only — never in code or git.
2. [Auth approach]
3. [Additional security rules]

## 10. How to Run Locally

```bash
npm install
cd api && npm install
cp api/local.settings.json.example api/local.settings.json
npm run dev:all
````

## 11. How to Deploy

[Pipeline description, env var locations, deployment steps]

## 12. Context Preservation Protocol

The LLM context window is finite. When executing Phase 3 (Execution), context is preserved via the file system:

1. `docs/sprint-N/progress.md` must be updated after EVERY task.
2. When dispatching a sub-agent (e.g. Karar), give it ONLY the context it needs (the task spec and specific files). Do not pass the entire chat history.
3. Commit after every completed task: `git commit -m "feat(module): task description"`

## 13. Bug & QA Tracking

Bugs are tracked in `docs/sprint-N/progress.md` under the Bugs Found section, or as GitHub Issues.

**For QA (Muhammad):** Do not fix bugs yourself. File them clearly, then return control to the Orchestrator to dispatch the appropriate engineer (Karar/Tariq) to fix them. Write `docs/qa/sprint-N-signoff.md` when clear.

## 14. Dispatch Protocol

We do not use multiple VS Code windows anymore. The Orchestrator (Gohar) runs in a single session and dispatches sub-agents consecutively:

1. `zeoel-dispatch` reads the sprint plan.
2. It assumes the persona of the assigned agent (e.g., Karar).
3. Executes the code.
4. Drops the persona, becomes Gohar again, checks off the task, and moves to the next.

**Branch strategy:** Feature branches → PR → regular merge to main. Never push directly to main. Never squash. Never rebase feature branches (causes commit loss).

```

```
