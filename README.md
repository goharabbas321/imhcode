<div align="center">

# 🤖 Zeoel — AI Agency Multi-Agent Framework

### The 22-Agent AI Development Team That Builds Your Software

[![NPM Version](https://img.shields.io/npm/v/zeoel-framework.svg?style=for-the-badge&color=0ea5e9)](https://www.npmjs.com/package/zeoel-framework)
[![License: MIT](https://img.shields.io/badge/License-MIT-22c55e.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Agents](https://img.shields.io/badge/Agents-22-a855f7?style=for-the-badge)](https://github.com/goharabbas321/zeoel-framework)
[![Skills](https://img.shields.io/badge/Skills-420+-f97316?style=for-the-badge)](https://github.com/goharabbas321/zeoel-framework)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](CONTRIBUTING.md)

**A production-grade multi-agent orchestration framework** that replaces monolithic AI prompts with a team of 22 specialized AI agents — each with curated skills, strict TDD enforcement, and sprint-based project management.

Works with **Claude Code** · **Cursor** · **Gemini CLI** · **GitHub Copilot** · **Antigravity** · and more

[Quick Start](#-quick-start) · [How It Works](#-how-it-works) · [The 22 Agents](#-the-22-specialized-agents) · [420+ Skills](#-420-curated-skills) · [Contributing](CONTRIBUTING.md)

</div>

---

## ⚡ Quick Start

```bash
# Initialize Zeoel in any project directory
npx zeoel-framework init

# Open your AI coding tool and start building
# "I want to build a SaaS dashboard with auth and billing"
```

That's it. Zeoel takes over — brainstorming, planning sprints, dispatching specialized agents, writing tests first, and verifying quality before shipping.

> 📖 See **[USER_MANUAL.md](USER_MANUAL.md)** for the full guide and **[SETUP.md](SETUP.md)** for platform-specific setup.

---

## 🤔 Why Zeoel?

Most AI coding tools use a single monolithic prompt. You tell them to "build a SaaS app" and they dump out untested, unstructured code. **Zeoel is different.**

| Feature | Plain AI Tool | Zeoel Framework |
|---|:---:|:---:|
| Structured 4-phase pipeline | ❌ | ✅ |
| 22 specialized agents (frontend, backend, QA, DevOps...) | ❌ | ✅ |
| Strict TDD enforcement (Red-Green-Refactor) | ❌ | ✅ |
| Sprint planning with progress tracking | ❌ | ✅ |
| Automatic code containment (`frontend/` + `backend/`) | ❌ | ✅ |
| Git worktree snapshots per sprint | ❌ | ✅ |
| 420+ curated skills library | ❌ | ✅ |
| Security audits + SEO audits built-in | ❌ | ✅ |
| Cross-platform (Claude Code, Cursor, Gemini CLI, Copilot) | ❌ | ✅ |

---

## 🔄 How It Works

Zeoel follows a disciplined 4-phase pipeline — no shortcuts, no vibe-coding:

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  BRAINSTORM  │───▶│    PLAN     │───▶│   EXECUTE   │───▶│   VERIFY    │
│              │    │             │    │             │    │             │
│ CEO debates  │    │ Sprint      │    │ Agents      │    │ QA tests    │
│ with all     │    │ decomp,     │    │ dispatched   │    │ Security    │
│ 22 agents    │    │ task cards  │    │ with TDD    │    │ SEO audit   │
│              │    │ feature     │    │ Red-Green-  │    │ Worktree    │
│ PROJECT_     │    │ branch      │    │ Refactor    │    │ snapshot    │
│ BRIEF.md     │    │ created     │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

### Phase 1: Brainstorm
**Gohar (CEO)** leads a debate between all agents to define scope, architecture, and constraints. Produces `PROJECT_BRIEF.md`.

### Phase 2: Sprint Planning
Decomposes the brief into actionable sprints. Creates a feature branch (`feature/sprint-N`) so `main` is never touched directly.

### Phase 3: Execution
Each agent is dispatched with its curated skills to complete its task. **Strict Red-Green-Refactor TDD** — tests are always written first. All code lives in `frontend/` and `backend/` only.

### Phase 4: Verification & Snapshot
QA tests, security audits, SEO audits, and a final code review. Once passed, the branch merges to `main` and the sprint is archived to `.worktrees/sprint-N/`.

---

## 👥 The 23 Specialized Agents

Each agent has a distinct persona, curated skill pack, and defined responsibility:

| | Role | Name | Specialty & Tech Stack |
|---|---|---|---|
| 👑 | CEO & Orchestrator | **Gohar** | Sprint planning, agent dispatch, worktree snapshots |
| 🎨 | Product Designer | **Mahdi** | UX flows, accessibility, SEO-first design |
| 🖌️ | Visual Director | **Mustafa** | Three.js, GSAP, premium styling, Framer Motion, design tokens |
| ⚛️ | Sr. Frontend Engineer | **Karar** | Next.js App Router, shadcn/ui, 3D, GSAP, SEO, Tailwind |
| 🔧 | Backend Engineer | **Tariq** | Laravel, PostgreSQL, SaaS billing, REST/GraphQL APIs |
| 📝 | Content & SEO | **Zara** | Technical SEO, keyword strategy, JSON-LD, content marketing |
| 📱 | Mobile Developer | **Abdullah** | Flutter, Material 3, Riverpod, Kotlin, Swift |
| 📊 | Data & ML Engineer | **Fatima** | Postgres analytics, ML pipelines, ClickHouse, Python |
| 🐍 | Python Engineer | **Abbas** | Python, Django, FastAPI, Scikit-learn, Celery |
| 🔍 | Debugger & Performance | **Sajjad** | Systematic 4-phase debugging, performance profiling |
| 📚 | Docs & API Writer | **Baqir** | Technical writing, OpenAPI specs, developer experience |
| 🧪 | QA Engineer | **Muhammad** | Playwright, Cypress, strict TDD enforcement |
| 🛡️ | DevOps & Security | **Ali** | Docker, GitHub Actions, OWASP, CI/CD pipelines |
| 🧠 | AI Architect | **Ibrahim** | Multi-agent setups, MCP servers, LLM evaluations |
| ☕ | Enterprise Java | **Yusuf** | Spring Boot, Quarkus, enterprise patterns |
| ⚙️ | Systems Engineer | **Bilal** | Go, Rust, C++, high-performance networking |
| 🍏 | iOS Developer | **Layla** | SwiftUI, Swift concurrency, CoreData |
| 🤖 | Android Developer | **Hamza** | Kotlin, Jetpack Compose, clean architecture |
| 🏥 | Healthcare Engineer | **Khadija** | HIPAA compliance, EMR integration, FHIR |
| ⛓️ | Web3 Engineer | **Salman** | Smart contracts, DeFi, AMM security, Solidity |
| 💼 | Business Operations | **Maryam** | SaaS billing ops, logistics, startup metrics |
| 🌐 | React Native Specialist | **Zayd** | React Native, Expo, native integration, performance |

*All agent names are inspired by Ahle Bait (a.s.) and the Zeoel team.*

---

## 📚 420+ Curated Skills

Zeoel ships with **420+ production-ready skills** covering every aspect of modern software development:

<details>
<summary><strong>🎨 Frontend & Design (50+ skills)</strong></summary>

`nextjs-turbopack` · `tailwindcss-v4` · `shadcn-ui-patterns` · `radix-ui-primitives` · `gsap-scrolltrigger` · `threejs-webgl` · `react-three-fiber` · `motion-framer` · `react-spring-physics` · `lottie-animations` · `animated-component-libraries` · `barba-js` · `locomotive-scroll` · `pixijs-2d` · `babylonjs-engine` · `spline-interactive` · `view-transitions-api` · `css-container-queries` · `design-tokens-system` · `micro-interactions` · `liquid-glass-design` · `modern-web-design` · `ui-ux-pro-max` · `frontend-design` · `frontend-patterns` · `figma-to-code` · `responsive-email-templates` · `vite-patterns` · `nuxt4-patterns` · `angular-developer` · and more...
</details>

<details>
<summary><strong>🔧 Backend & Infrastructure (60+ skills)</strong></summary>

`laravel-patterns` · `laravel-security` · `laravel-tdd` · `nestjs-patterns` · `fastapi-patterns` · `django-patterns` · `springboot-patterns` · `postgres-patterns` · `redis-patterns` · `prisma-patterns` · `supabase-patterns` · `drizzle-orm-patterns` · `trpc-patterns` · `graphql-patterns` · `stripe-billing-patterns` · `oauth2-auth-patterns` · `rate-limiting-patterns` · `websocket-realtime` · `queue-patterns` · `docker-patterns` · `deployment-patterns` · `mysql-patterns` · and more...
</details>

<details>
<summary><strong>📱 Mobile (15+ skills)</strong></summary>

`dart-flutter-patterns` · `kotlin-patterns` · `kotlin-coroutines-flows` · `swiftui-patterns` · `swiftui-pro` · `compose-multiplatform-patterns` · `android-clean-architecture` · `mobile-app-design` · `mobile-app-ui-design` · and more...
</details>

<details>
<summary><strong>🤖 AI & Agents (20+ skills)</strong></summary>

`mcp-server-patterns` · `mcp-builder` · `mcp-server-builder` · `rag-pipeline` · `prompt-engineering` · `vercel-ai-sdk` · `pytorch-patterns` · `agentic-engineering` · `autonomous-loops` · `agent-teams` · `cost-aware-llm-pipeline` · and more...
</details>

<details>
<summary><strong>🔐 Security & Testing (25+ skills)</strong></summary>

`test-driven-development` · `e2e-testing` · `security-review` · `security-scan` · `hipaa-compliance` · `systematic-debugging` · `error-handling` · `webapp-testing` · and more...
</details>

<details>
<summary><strong>📊 Data & DevOps (30+ skills)</strong></summary>

`postgres-patterns` · `clickhouse-io` · `redis-patterns` · `docker-patterns` · `deployment-patterns` · `git-workflow` · `github-ops` · and more...
</details>

<details>
<summary><strong>💼 Business & Operations (40+ skills)</strong></summary>

`seo` · `content-engine` · `market-research` · `investor-materials` · `finance-billing-ops` · `customer-billing-ops` · `email-ops` · and more...
</details>

> 📂 Browse all skills: [`all-skills/`](all-skills/) or [`.agents/skills/zeoel/skills/`](.agents/skills/zeoel/skills/)

---

## 🏗️ Architecture & Codebase Containment

Zeoel enforces strict directory structure for clean, maintainable projects:

```
your-project/
├── frontend/              # All frontend code (Next.js, React, etc.)
├── backend/               # All backend code (Laravel, APIs, etc.)
├── .worktrees/            # Runnable snapshots of completed sprints
│   ├── sprint-1/
│   └── sprint-2/
├── docs/
│   ├── brainstorm/        # Phase 1 outputs
│   └── sprint-N/          # Sprint plans & progress trackers
├── PROJECT_BRIEF.md       # Master requirements document
├── .agents/               # Zeoel framework (agents, skills, config)
├── AGENTS.md              # Agent quick reference
└── CLAUDE.md              # AI tool instructions
```

---

## 🔌 Platform Compatibility

Zeoel works seamlessly with all major AI coding tools:

| Platform | Status | Setup |
|---|---|---|
| **Claude Code** | ✅ Full support | `CLAUDE.md` auto-detected |
| **Cursor** | ✅ Full support | `.cursorrules` auto-generated |
| **Gemini CLI** | ✅ Full support | `GEMINI.md` auto-generated |
| **GitHub Copilot** | ✅ Full support | `.github/copilot-instructions.md` |
| **Antigravity** | ✅ Full support | `AGENTS.md` auto-detected |
| **Windsurf** | ✅ Full support | `.windsurfrules` auto-generated |

---

## 📝 How to Interact

```
You: "I want to build a SaaS dashboard with auth and billing"

Zeoel: [Phase 1] "I'm starting the brainstorm. Let me debate with 
       all 22 agents to define scope..."
       
       [Phase 2] "Here's the sprint plan with 12 tasks. Approve?"
       
       [Phase 3] "Dispatching Karar (Frontend) for the dashboard UI...
                  Dispatching Tariq (Backend) for the API layer...
                  Running TDD: 47 tests written, 47 passing ✅"
       
       [Phase 4] "QA passed. Security audit clean. SEO score 98.
                  Sprint archived to .worktrees/sprint-1/"
```

---

## 🤝 Contributing

We welcome contributions! Whether it's a new skill, a new agent, bug fixes, or documentation improvements.

See **[CONTRIBUTING.md](CONTRIBUTING.md)** for guidelines on:
- 🆕 Adding new skills
- 🤖 Adding new agents  
- 🐛 Reporting bugs
- ✨ Suggesting features

---

## 🙏 Credits & Inspiration

Zeoel stands on the shoulders of incredible open-source projects. We believe in transparency and proper attribution.

See **[REFERENCES.md](REFERENCES.md)** for the full list of projects that inspired our skills and methodology, including:
- [obra/superpowers](https://github.com/obra/superpowers) — Agentic skills methodology
- [Anthropic Claude Code](https://github.com/anthropics/claude-code) — CLAUDE.md conventions
- [VoltAgent](https://github.com/VoltAgent) — Skills aggregation patterns
- And many more...

---

## 📬 Links & Contact

- **NPM**: [zeoel-framework](https://www.npmjs.com/package/zeoel-framework)
- **GitHub**: [goharabbas321/zeoel-framework](https://github.com/goharabbas321/zeoel-framework)
- **Creator**: Gohar Abbas ([@goharabbas321](https://github.com/goharabbas321))
- **Telegram**: [@goharabbas786](https://t.me/goharabbas786)

---

## 📄 License

MIT © [Gohar Abbas](https://github.com/goharabbas321)

---

<div align="center">

**If Zeoel saves you time, consider giving it a ⭐**

Built with ❤️ by the Zeoel team

</div>
