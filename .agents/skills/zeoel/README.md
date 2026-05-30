# Zeoel — AI Agency Multi-Agent Framework

> A production-grade multi-agent orchestration framework for building SaaS products with **Next.js + Laravel + PostgreSQL**. Specialized for SEO-first architecture with premium 3D/GSAP/shadcn design.

## What is Zeoel?

Zeoel is an AI-powered software development agency that replaces monolithic prompts with a **23-agent pipeline**. Each agent has a distinct persona, curated skill pack, and specific responsibility. When you say "I want to build a SaaS product", Zeoel doesn't just start coding — it **brainstorms**, **plans sprints**, **delegates to specialists**, and **verifies quality** before shipping.

### The 4-Phase Pipeline

```
Phase 1: BRAINSTORM → Phase 2: PLAN → Phase 3: EXECUTE → Phase 4: VERIFY & SNAPSHOT
```

1. **Brainstorm** — Gohar (CEO) leads a debate between all agents to define scope, SEO strategy, and architecture.
2. **Sprint Planning** — Decompose the brief into sprints and assign tasks to specialized agents.
3. **Execution** — Each agent is dispatched with its curated skills to complete its task in the `frontend/` or `backend/` directories.
4. **Verification & Snapshot** — QA tests, security audit, SEO audit, and a full backup of the sprint to `.worktrees/sprint-N/`.

## The 23 Agents

| Agent | Name | Specialty |
|-------|------|-----------|
| 👑 CEO | **Gohar** | Orchestration, Sprint Planning, Project Management |
| 🎨 Product Designer | **Mahdi** | UX Flows, Accessibility, SEO-First Design |
| 🖌️ Visual Director | **Mustafa** | Three.js, GSAP, Premium Styling, Design Tokens |
| ⚛️ Sr. Frontend Eng | **Karar** | Next.js App Router, shadcn/ui, 3D, GSAP, SEO |
| 🔧 Backend Engineer | **Tariq** | Laravel, PostgreSQL, SaaS Billing, Multi-Tenancy |
| 📝 Content & SEO | **Zara** | Technical SEO, Keyword Strategy, JSON-LD |
| 📱 Mobile Developer | **Abdullah** | Flutter, Material 3, Riverpod, Dart |
| 📊 Data & ML | **Fatima** | Postgres Analytics, ML Pipelines, SaaS Metrics |
| 🐍 Python Engineer | **Abbas** | Python, Django, FastAPI, Scikit-learn, Celery |
| 🔍 Debugger & Perf | **Sajjad** | Root Cause Analysis, Performance Profiling |
| 📚 Docs & API | **Baqir** | Technical Writing, OpenAPI, Developer Experience |
| 🧪 QA Engineer | **Muhammad** | E2E Testing, Bug Filing, Quality Assurance |
| 🛡️ DevOps & Security | **Ali** | CI/CD, Docker, OWASP ASI, Security Auditing |
| 🧠 AI Architect | **Ibrahim** | Multi-agent setups, MCP servers, LLM evaluations |
| ☕ Enterprise Java | **Yusuf** | Spring Boot, Quarkus, enterprise patterns |
| ⚙️ Systems Engineer | **Bilal** | Go, Rust, C++, high-performance networking |
| 🍏 iOS Developer | **Layla** | SwiftUI, Swift concurrency, CoreData |
| 🤖 Android Developer | **Hamza** | Kotlin, Jetpack Compose, clean architecture |
| 🏥 Healthcare Engineer | **Khadija** | HIPAA compliance, EMR integration, FHIR |
| ⛓️ Web3 Engineer | **Salman** | Smart contracts, DeFi, AMM security, Solidity |
| 💼 Business Operations | **Maryam** | SaaS billing ops, logistics, startup metrics |
| 🌐 React Native Specialist | **Zayd** | React Native, Expo, Native Integration |

> All agent names are from **Ahle Bait (a.s.)** and the Zeoel team.

## Tech Stack

| Layer | Technology | Agent |
|-------|-----------|-------|
| Frontend | Next.js 14+ (App Router), TypeScript, Tailwind, shadcn/ui | Karar |
| 3D/Animation | Three.js, React Three Fiber, GSAP, Framer Motion | Karar + Mustafa |
| Backend | Laravel 11+ (PHP 8.3), Sanctum, Cashier | Tariq |
| Database | PostgreSQL 16+, Redis | Tariq + Fatima |
| Mobile | Flutter 3.x, Dart, Riverpod, Material 3 | Abdullah |
| React Native | React Native, Expo, Native Bridging | Zayd |
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
.agents/skills/zeoel/                     # The framework
├── SKILL.md                              # Main orchestrator (entry point)
├── README.md                             # This file
├── SETUP.md                              # Platform setup guide
├── agents/                               # 23 specialized sub-agents
│   ├── gohar-ceo.md                      # CEO & Coordinator
│   ├── mahdi-designer.md                 # Product Designer (SEO-first)
│   ├── mustafa-visual.md                 # Visual Director (3D, GSAP)
│   ├── karar-frontend.md                 # Senior Frontend (Next.js, shadcn, 3D)
│   ├── tariq-backend.md                  # Backend (Laravel, PostgreSQL)
│   ├── zara-content.md                   # Content & SEO Specialist
│   ├── abdullah-mobile.md                # Mobile (Flutter)
│   ├── fatima-data.md                    # Data & ML Engineer
│   ├── abbas-python.md                  # Python Engineer
│   ├── sajjad-debugger.md                # Debugger & Performance
│   ├── baqir-docs.md                     # Documentation & API
│   ├── muhammad-qa.md                    # QA & Testing
│   ├── ali-devops.md                     # DevOps & Security
│   ├── zayd-react-native.md              # React Native Specialist
│   ├── ibrahim-ai.md                     # AI Architect
│   ├── yusuf-java.md                     # Enterprise Java
│   ├── bilal-systems.md                  # Systems (Go, Rust, C++)
│   ├── layla-ios.md                      # iOS (SwiftUI)
│   ├── hamza-android.md                  # Android (Kotlin)
│   ├── khadija-healthcare.md             # Healthcare (HIPAA)
│   ├── salman-web3.md                    # Web3 (Solidity)
│   ├── maryam-ops.md                     # Business Operations
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

MIT License — Zeoel AI Agency © Gohar Abbas
