# Zeoel — AI Agency Multi-Agent Framework

> A production-grade multi-agent orchestration framework for building SaaS products with **Next.js + Laravel + PostgreSQL**. Specialized for SEO-first architecture with premium 3D/GSAP/shadcn design.

## What is Zeoel?

Zeoel is an AI-powered software development agency that replaces monolithic prompts with a **13-agent pipeline**. Each agent has a distinct persona, curated skill pack, and specific responsibility. When you say "I want to build a SaaS product", Zeoel doesn't just start coding — it **brainstorms**, **plans sprints**, **delegates to specialists**, and **verifies quality** before shipping.

### The 4-Phase Pipeline

```
Phase 1: BRAINSTORM → Phase 2: PLAN → Phase 3: EXECUTE → Phase 4: VERIFY
```

1. **Brainstorm** — Gohar (CEO) leads a debate between all 13 agents to define scope, SEO strategy, and architecture.
2. **Sprint Planning** — Decompose the brief into sprints and assign tasks to specialized agents.
3. **Execution** — Each agent is dispatched with its curated skills to complete its task.
4. **Verification** — QA tests, security audit, SEO audit, and performance review before shipping.

## The 13 Agents

| Agent | Name | Specialty |
|-------|------|-----------|
| 👑 CEO | **Gohar** | Orchestration, Sprint Planning, Project Management |
| 🎨 Product Designer | **Mahdi** | UX Flows, Accessibility, SEO-First Design |
| 🖌️ Visual Director | **Mustafa** | Three.js, GSAP, Premium Styling, Design Tokens |
| ⚛️ Sr. Frontend Eng | **Karar** | Next.js App Router, shadcn/ui, 3D, GSAP, SEO |
| 🔧 Backend Engineer | **Tariq** | Laravel, PostgreSQL, SaaS Billing, Multi-Tenancy |
| 📝 Content & SEO | **Zara** | Technical SEO, Keyword Strategy, JSON-LD |
| 📱 Mobile Developer | **Hassan** | Flutter, Material 3, Riverpod, Dart |
| 📊 Data & ML | **Fatima** | Postgres Analytics, ML Pipelines, SaaS Metrics |
| 🐍 Python & Auto | **Gohar(Py)** | Python, FastAPI, ML, Automation Scripts |
| 🔍 Debugger & Perf | **Sajjad** | Root Cause Analysis, Performance Profiling |
| 📚 Docs & API | **Baqir** | Technical Writing, OpenAPI, Developer Experience |
| 🧪 QA Engineer | **Muhammad** | E2E Testing, Bug Filing, Quality Assurance |
| 🛡️ DevOps & Security | **Ali** | CI/CD, Docker, OWASP ASI, Security Auditing |

> All agent names are from **Ahle Bait (a.s.)** and the Zeoel team.

## Tech Stack

| Layer | Technology | Agent |
|-------|-----------|-------|
| Frontend | Next.js 14+ (App Router), TypeScript, Tailwind, shadcn/ui | Karar |
| 3D/Animation | Three.js, React Three Fiber, GSAP, Framer Motion | Karar + Mustafa |
| Backend | Laravel 11+ (PHP 8.3), Sanctum, Cashier | Tariq |
| Database | PostgreSQL 16+, Redis | Tariq + Fatima |
| Mobile | Flutter 3.x, Dart, Riverpod, Material 3 | Hassan |
| SEO | JSON-LD, Sitemap, Meta API, Structured Data | Zara + Karar |
| DevOps | Docker, GitHub Actions, Laravel Sail | Ali |

## Quick Start

See **[SETUP.md](SETUP.md)** for step-by-step installation on GitHub Copilot, Codex, Claude Code, and Antigravity.

### Basic Usage

1. Open your AI coding tool
2. Tell it: *"I want to build a SaaS for [your idea]"*
3. Zeoel will automatically:
   - Run **Phase 1 (Brainstorm)** — debate your idea with the team
   - Ask you clarifying questions
   - Generate a `PROJECT_BRIEF.md`
   - Plan sprints and start execution

## Project Structure

```
.agents/skills/zeoel/                     # 1.9MB — fully self-contained
├── SKILL.md                              # Main orchestrator (entry point)
├── README.md                             # This file
├── SETUP.md                              # Platform setup guide
├── agents/                               # 13 specialized sub-agents
│   ├── gohar-ceo.md                      # CEO & Coordinator
│   ├── mahdi-designer.md                 # Product Designer (SEO-first)
│   ├── mustafa-visual.md                 # Visual Director (3D, GSAP)
│   ├── karar-frontend.md                 # Senior Frontend (Next.js, shadcn, 3D)
│   ├── tariq-backend.md                  # Backend (Laravel, PostgreSQL)
│   ├── zara-content.md                   # Content & SEO Specialist
│   ├── hassan-mobile.md                  # Mobile (Flutter)
│   ├── fatima-data.md                    # Data & ML Engineer
│   ├── gohar-python.md                   # Python & Automation
│   ├── sajjad-debugger.md                # Debugger & Performance
│   ├── baqir-docs.md                     # Documentation & API
│   ├── muhammad-qa.md                    # QA & Testing
│   ├── ali-devops.md                     # DevOps & Security
│   └── _template.md                      # Template for adding new agents
├── skills/                               # 116 skills (6 orchestration + 110 library)
│   ├── zeoel-brainstorm/                 # Phase 1: Ideation & Debate
│   ├── zeoel-sprint-planner/             # Phase 2: Sprint Decomposition
│   ├── zeoel-dispatch/                   # Phase 3: Agent Task Execution
│   ├── zeoel-saas-architect/             # SaaS Blueprint (Next.js+Laravel+PG)
│   ├── zeoel-security/                   # OWASP ASI Compliance Check
│   ├── zeoel-codebase-knowledge/         # Codebase Mapping & Documentation
│   ├── ui-ux-pro-max/                    # Design system with search scripts
│   ├── laravel-patterns/                 # Laravel development patterns
│   ├── nextjs-turbopack/                 # Next.js development patterns
│   ├── dart-flutter-patterns/            # Flutter/Dart patterns
│   ├── gsap-scrolltrigger/               # GSAP animation patterns
│   ├── threejs-webgl/                    # Three.js 3D patterns
│   └── ...                               # 100+ more skills
├── references/                           # Templates & guides
│   ├── project-brief-template.md
│   ├── sprint-plan-template.md
│   ├── brainstorm-format.md
│   ├── agent-training-guide.md
│   ├── skill-mapping-reference.md
│   └── anti-patterns.md
└── examples/
    └── example-landing-page.md
```

## Adding New Agents

See `agents/_template.md` for the agent creation template and `references/agent-training-guide.md` for the full guide.

## License

Proprietary — Zeoel AI Agency © Gohar Abbas
