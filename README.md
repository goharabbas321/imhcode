# Zeoel — AI Agency Multi-Agent Framework

> A production-grade multi-agent orchestration framework for building enterprise-grade products. Powered by **22 highly specialized AI agents**, isolated Git Worktrees, strict Red-Green-Refactor TDD, and rigorous multi-stage verification.

## What is Zeoel?

Zeoel is an AI-powered software development agency that replaces monolithic prompts with a **22-agent pipeline**. Each agent has a distinct persona, curated skill pack, and specific responsibility. When you say "I want to build a SaaS product", Zeoel doesn't just start coding — it **brainstorms**, **plans sprints**, **delegates to specialists**, and **verifies quality** before shipping.

With integrated **Superpowers methodologies**, Zeoel protects your codebase by running all tasks in isolated Git worktrees and enforces strict verification loops.

## The 4-Phase Pipeline

```text
Phase 1: BRAINSTORM → Phase 2: PLAN → Phase 3: EXECUTE → Phase 4: VERIFY
```

1. **Brainstorm** — Gohar (CEO) leads a debate between all agents to define scope, architecture, and constraints.
2. **Sprint Planning & Isolation** — Decomposes the brief into sprints. Gohar creates an isolated **Git Worktree** (`sprint-N`) so the main branch is never touched directly.
3. **Execution** — Each agent is dispatched with its curated skills to complete its task using **Strict Red-Green-Refactor TDD**.
4. **Verification** — QA tests, security audits, SEO audits, and a final code review before deciding to merge the worktree into `main` or open a PR.

## The 22 Specialized Agents

Zeoel boasts a massive roster of specialized engineers, designers, and domain experts:

| Role | Name | Specialty & Tech Stack |
|------|------|------------------------|
| 👑 CEO | **Gohar** | Orchestration, Sprint Planning, Git Worktrees |
| 🎨 Product Designer | **Mahdi** | UX Flows, Accessibility, SEO-First Design |
| 🖌️ Visual Director | **Mustafa** | Three.js, GSAP, Premium Styling, Framer Motion |
| ⚛️ Sr. Frontend Eng | **Karar** | Next.js App Router, shadcn/ui, 3D, GSAP, SEO |
| 🔧 Backend Engineer | **Tariq** | Laravel, PostgreSQL, SaaS Billing, APIs |
| 📝 Content & SEO | **Zara** | Technical SEO, Keyword Strategy, Content |
| 📱 Mobile Developer | **Hassan** | Flutter, Material 3, Riverpod, Kotlin/Swift |
| 📊 Data & ML | **Fatima** | Postgres Analytics, ML Pipelines, ClickHouse |
| 🐍 Python & ML Eng | **Abbas** | Python, Django, FastAPI, Scikit, Celery |
| 🔍 Debugger & Perf | **Sajjad** | Systematic Debugging (4-phase root cause), Perf Profiling |
| 📚 Docs & API | **Baqir** | Technical Writing, OpenAPI, DX |
| 🧪 QA Engineer | **Muhammad** | Playwright, Cypress, Strict TDD Enforcement |
| 🛡️ DevOps & Sec | **Ali** | Docker, GitHub Actions, OWASP ASI |
| 🧠 AI Architect | **Ibrahim** | Multi-agent setups, MCP servers, LLM Evals |
| ☕ Enterprise Java | **Yusuf** | Spring Boot, Quarkus, Enterprise Patterns |
| ⚙️ Systems Engineer| **Bilal** | Go, Rust, C++, High-performance Networking |
| 🍏 iOS Developer | **Layla** | SwiftUI, Swift Concurrency, CoreData |
| 🤖 Android Dev | **Hamza** | Kotlin, Jetpack Compose, Clean Architecture |
| 🏥 Healthcare | **Khadija** | HIPAA Compliance, EMR Integration, FHIR |
| ⛓️ Web3 Engineer | **Salman** | Smart Contracts, DeFi, AMM Security |
| 💼 Business Ops | **Maryam** | SaaS Billing ops, Logistics, Startup metrics |

*All agent names are inspired by Ahle Bait (a.s.) and the Zeoel team.*

## Quick Start (NPM / NPX)

You can easily initialize Zeoel into any project directory using `npx`.

```bash
# 1. Initialize Zeoel in your project
npx zeoel-framework init

# 2. Open your AI coding tool (Claude Code, Cursor, Copilot, Antigravity)
# 3. Tell it what you want to build
```

See **[USER_MANUAL.md](USER_MANUAL.md)** for a comprehensive guide on how to interact with the agency and **[SETUP.md](SETUP.md)** for detailed platform integrations.

## How to Interact

1. **Start the conversation**: *"I want to build a [your idea]"*
2. **Follow the flow**: Zeoel will automatically run Phase 1 (Brainstorm) and ask clarifying questions.
3. **Approve the Plan**: After generating `docs/sprint-N/plan.md`, Zeoel will wait for your approval.
4. **Watch it Work**: Zeoel will spin up an isolated Git Worktree, write tests, execute the code, and run audits autonomously.
5. **Ship**: Review the final results and merge the worktree branch!

## Architecture

Zeoel heavily relies on the file system for shared memory:
- `PROJECT_BRIEF.md`: The master requirements document.
- `docs/sprint-N/plan.md`: The current sprint plan.
- `docs/sprint-N/progress.md`: Real-time task tracker updated after every task.
- `docs/sprint-N/deferred.md`: Items pushed to the backlog.

## License

Proprietary — Zeoel AI Agency © Gohar Abbas
