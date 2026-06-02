<div align="center">

# 🤖 Zeoel — AI Agency Multi-Agent Framework

### The 33-Agent AI Development Team That Builds Your Software

[![NPM Version](https://img.shields.io/npm/v/zeoel-framework.svg?style=for-the-badge&color=0ea5e9)](https://www.npmjs.com/package/zeoel-framework)
[![License: MIT](https://img.shields.io/badge/License-MIT-22c55e.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Agents](https://img.shields.io/badge/Agents-33-a855f7?style=for-the-badge)](AGENTS.md)
[![Skills](https://img.shields.io/badge/Skills-450+-f97316?style=for-the-badge)](REFERENCES.md)
[![Claude Code](https://img.shields.io/badge/Claude_Code-Ready-6366f1?style=for-the-badge&logo=anthropic)](CLAUDE.md)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](CONTRIBUTING.md)

**A production-grade multi-agent orchestration framework for Claude Code, Cursor, and Gemini CLI** that replaces monolithic AI prompts with a team of 33 specialized AI agents — each with curated skills, strict TDD enforcement, and sprint-based project management. Stop vibe-coding. Start shipping.

Works with **Claude Code** · **Cursor** · **Gemini CLI** · **GitHub Copilot** · **Antigravity** · and more

[Quick Start](#-quick-start) · [How It Works](#-how-it-works) · [The 33 Agents](#-the-33-specialized-agents) · [450+ Skills](#-450-curated-skills) · [Contributing](CONTRIBUTING.md)

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

Most AI coding tools use a single monolithic prompt. You tell them to "build a SaaS app" and they dump out untested, unstructured code — that's **vibe-coding**. **Zeoel is different.**

| Feature | Plain AI Tool | Zeoel Framework |
|---|:---:|:---:|
| Structured 4-phase pipeline | ❌ | ✅ |
| 33 specialized agents (frontend, backend, QA, DevOps...) | ❌ | ✅ |
| 🧠 Smart Config Inference (reads your prompt, skips questions) | ❌ | ✅ |
| 💡 Intelligent Model Routing (auto-selects cheapest LLM per task) | ❌ | ✅ |
| 🪓 Caveman & Graphify token compression (save up to 75% output and 71.5x input tokens) | ❌ | ✅ |
| Cybersecurity, Growth Marketing, McKinsey Slides & PhD Research | ❌ | ✅ |
| Strict TDD enforcement (Red-Green-Refactor) | ❌ | ✅ |
| Sprint planning with progress tracking | ❌ | ✅ |
| Automatic code containment (`frontend/` + `backend/`) | ❌ | ✅ |
| Git worktree snapshots per sprint | ❌ | ✅ |
| 450+ curated skills library | ❌ | ✅ |
| Security audits + SEO audits built-in | ❌ | ✅ |
| Cross-platform (Claude Code, Cursor, Gemini CLI, Copilot, Antigravity) | ❌ | ✅ |

---

## 🔄 How It Works

Zeoel follows a disciplined 4-phase pipeline — no shortcuts, no vibe-coding. Works natively with **Claude Code sub-agents**, **Cursor**, **Gemini CLI**, and **GitHub Copilot**:

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  BRAINSTORM  │───▶│    PLAN     │───▶│   EXECUTE   │───▶│   VERIFY    │
│              │    │             │    │             │    │             │
│ CEO debates  │    │ Sprint      │    │ Agents      │    │ QA tests    │
│ with all     │    │ decomp,     │    │ dispatched   │    │ Security    │
│ 33 agents    │    │ task cards  │    │ with TDD    │    │ SEO audit   │
│              │    │ feature     │    │ Red-Green-  │    │ Worktree    │
│ PROJECT_     │    │ branch      │    │ Refactor    │    │ snapshot    │
│ BRIEF.md     │    │ created     │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

### Phase 1: Brainstorm — with Smart Config Inference
**Gohar (CEO)** reads your prompt and **auto-detects** your stack preferences (framework, database, testing style) — no 20-question surveys. He asks only what he can't figure out, then leads a debate between all agents to define scope. Produces `PROJECT_BRIEF.md`.

### Phase 2: Sprint Planning — with Graphify Codebase Context Mapping
Decomposes the brief into actionable sprints. **At the start of Phase 2, Gohar runs `/graphify . --wiki` to build/update the codebase's semantic knowledge map**, creating a 71.5x input token reduction. Gohar assigns each task to a specific sub-agent with its recommended model tier.

### Phase 3: Execution — with Caveman Prompt Compression
Each agent is dispatched to complete its task. **To save up to 75% on output tokens, all agents strictly follow `/caveman` prompting rules**, writing in technical, telegraphic style. Strict TDD is enforced — tests first, then logic in `frontend/` and `backend/` only. After edits, `/graphify . --update` updates the codebase map.

### Phase 4: Verification & Snapshot
QA tests, security audits, SEO audits, and final code reviews are run by QA, Security, and SEO specialists. Once passed, the branch merges to `main` and the sprint is archived to `.worktrees/sprint-N/`.

---

## 🧠 Smart Config Inference

Most frameworks ask you a dozen setup questions before you even start. **Zeoel reads your prompt and figures it out.**

```
You: "Build me a SaaS dashboard with auth and Stripe billing"

Gohar: 
═══════════════════════════════════════════
  🔍 SMART CONFIG — Auto-detected from your prompt
═══════════════════════════════════════════
  ✅ Stack:     Full-stack (detected: "auth and billing")
  ✅ Frontend:  Next.js (detected: "SaaS dashboard")
  ✅ Backend:   Laravel (detected: "billing" → SaaS default)
  ✅ Database:  PostgreSQL (detected: "SaaS" → multi-tenant)
  ✅ Testing:   Strict TDD (default)
  ✅ Snapshots: Yes (default)
  ❓ Mobile:    Not mentioned — do you need one?
═══════════════════════════════════════════
```

**One prompt. Zero friction. Full control.** If Gohar gets something wrong, just tell him to change it.

---

## 💡 Intelligent Model Routing

Why burn Opus/o3 tokens on a README update? Zeoel assigns a **complexity tier** to every task and recommends the cheapest model that can do the job:

| Tier | When | Example Models | Cost |
|------|------|---------------|------|
| 🟢 **Light** | Docs, config, boilerplate, simple tests | `claude-3.5-haiku`, `gpt-4o-mini`, `gemini-flash` | 💰 |
| 🟡 **Standard** | Components, APIs, CRUD, UI, unit tests | `claude-sonnet-4`, `gpt-4o`, `gemini-2.5-pro` | 💰💰 |
| 🔴 **Complex** | Architecture, security, debugging, 3D, ML | `claude-opus-4`, `o3`, `gemini-2.5-pro` (thinking) | 💰💰💰 |

Every task in the sprint plan includes its tier, so you know exactly where your tokens are going:

```
═══════════════════════════════════════════
  DISPATCHING: Karar (Sr. Frontend Engineer)
  Task: #4 — Build the pricing page
  Skills: nextjs-turbopack, frontend-design
  Tests: Component test + route test
  Model Tier: 🟡 Standard
  Recommended: claude-sonnet-4
═══════════════════════════════════════════
```

**Result**: Up to 60% fewer tokens on a typical sprint by routing simple tasks to fast, cheap models.

---

## 👥 The 33 Specialized Agents

Each agent has a distinct persona, curated skill pack, and defined responsibility:

| | Role | Name | Specialty & Tech Stack |
|---|---|---|---|
| 👑 | CEO & Orchestrator | **Gohar** | Sprint planning, agent dispatch, worktree snapshots, caveman, graphify |
| 🎨 | Product Designer | **Mahdi** | UX flows, accessibility, SEO-first design, frontend-design |
| 🖌 | Visual Director | **Mustafa** | Three.js, GSAP, premium styling, Framer Motion, design tokens |
| ⚛️ | Sr. Frontend Engineer | **Karar** | Next.js App Router, shadcn/ui, 3D, GSAP, SEO, Tailwind, TDD |
| 🥾 | Bootstrap UI Architect | **Hassan** | Bootstrap 5, SCSS, responsive grid, dashboard layouts |
| 💠 | shadcn/UI Specialist | **Noor** | shadcn/ui, Radix, Tailwind v4, custom design tokens, CVA |
| ⚛️ | React UI Craftsman | **Anas** | React 19, Vite SPAs, Zustand, Jotai, TanStack Query, GSAP |
| 🟢 | Vue/Nuxt Architect | **Amina** | Vue 3 Composition API, Nuxt 4, Pinia, SSR, Vite, dynamic forms |
| 🎨 | Pixel-Perfect CSS Eng | **Hasan** | CSS Grid/Subgrid, Container queries, View Transitions, OkLCH |
| 🔧 | Backend Engineer | **Tariq** | Laravel, PostgreSQL, SaaS billing, REST/GraphQL APIs |
| 📝 | Content & SEO | **Zara** | Technical SEO, keyword strategy, JSON-LD, content marketing |
| 📱 | Mobile Developer | **Abdullah** | Flutter, Material 3, Riverpod, Kotlin, Swift |
| 🌐 | React Native Specialist | **Zayd** | React Native, Expo, native integration, performance |
| 📊 | Data & ML Engineer | **Fatima** | Postgres analytics, ML pipelines, ClickHouse, Python |
| 🐍 | Python Engineer | **Abbas** | Python, Django, FastAPI, Scikit-learn, Celery |
| ⚙️ | Systems Engineer | **Bilal** | Go, Rust, C++, high-performance networking |
| 🍏 | iOS Developer | **Layla** | SwiftUI, Swift concurrency, CoreData |
| 🤖 | Android Developer | **Hamza** | Kotlin, Jetpack Compose, clean architecture |
| 🏥 | Healthcare Engineer | **Khadija** | HIPAA compliance, EMR integration, FHIR |
| ⛓️ | Web3 Engineer | **Salman** | Smart contracts, DeFi, AMM security, Solidity, OpenZeppelin |
| 🛡️ | Cybersecurity Expert | **Hamid** | Offensive security, red teaming, pen testing, EVM static analysis, cryptography |
| 📈 | Growth Hacker | **Farhan** | Conversion rate optimization (CRO), high-persuasion copywriting, local geo-SEO |
| 📊 | Slide Deck Designer | **Taha** | McKinsey PowerPoint design, MECE presentation Outlines, Chart.js slides |
| 📐 | Comput. Spatial Expert | **Sami** | Parametric CAD algorithms, GeoJSON geometry bounds, spatial-GIS coordinates |
| 🔬 | Principal PhD Researcher | **Yahya** | Google Scholar paper mappings, academic literature matrices, LaTeX/APA reports |
| 🔍 | Debugger & Performance | **Sajjad** | Systematic 4-phase debugging, performance profiling, error-handling |
| 📚 | Docs & API Writer | **Baqir** | Technical writing, OpenAPI specs, developer experience |
| 🧪 | QA Engineer | **Muhammad** | Playwright, Cypress, strict TDD enforcement |
| 🛡️ | DevOps & Security | **Ali** | Docker, GitHub Actions, OWASP, CI/CD pipelines |
| 🧠 | AI Architect | **Ibrahim** | Multi-agent setups, MCP servers, LLM evaluations, self-evolution |
| ☕ | Enterprise Java | **Yusuf** | Spring Boot, Quarkus, enterprise patterns |
| 💼 | Business Operations | **Maryam** | SaaS billing ops, logistics, startup metrics |
| 📋 | Product Manager | **Zainab** | Agile sprint management, user story mapping, backlog grooming |

*All agent names are inspired by Ahle Bait (a.s.) and the Zeoel team.*

---

## 📚 450+ Curated Skills

Zeoel ships with **450+ production-ready skills** covering every aspect of modern software development:

<details>
<summary><strong>🎨 Frontend & Design (75+ skills)</strong></summary>

`nextjs-turbopack` · `tailwindcss-v4` · `shadcn-ui-patterns` · `radix-ui-primitives` · `gsap-scrolltrigger` · `threejs-webgl` · `react-three-fiber` · `motion-framer` · `react-spring-physics` · `lottie-animations` · `animated-component-libraries` · `barba-js` · `locomotive-scroll` · `pixijs-2d` · `babylonjs-engine` · `spline-interactive` · `view-transitions-api` · `css-container-queries` · `design-tokens-system` · `micro-interactions` · `liquid-glass-design` · `modern-web-design` · `ui-ux-pro-max` · `frontend-design` · `frontend-patterns` · `figma-to-code` · `responsive-email-templates` · `vite-patterns` · `nuxt4-patterns` · `angular-developer` · `motion-design` · `material-3-skill` · `swiss-design-skill` · `taste-skill` · `transitions.dev` · and more...
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
<summary><strong>🤖 AI & Agents (25+ skills)</strong></summary>

`mcp-server-patterns` · `mcp-builder` · `mcp-server-builder` · `rag-pipeline` · `prompt-engineering` · `vercel-ai-sdk` · `pytorch-patterns` · `agentic-engineering` · `autonomous-loops` · `agent-teams` · `cost-aware-llm-pipeline` · `self-evolution` · `memento-skills` · and more...
</details>

<details>
<summary><strong>🔐 Security & Testing (35+ skills)</strong></summary>

`test-driven-development` · `e2e-testing` · `security-review` · `security-scan` · `hipaa-compliance` · `systematic-debugging` · `error-handling` · `webapp-testing` · `claude-red` · `trailofbits-auditing` · `waza-habits` · and more...
</details>

<details>
<summary><strong>📐 Computational & Technical Sciences (10+ skills)</strong></summary>

`computational-architecture` · `postgres-patterns` · `python-patterns` · and more...
</details>

<details>
<summary><strong>📊 Data & DevOps (30+ skills)</strong></summary>

`postgres-patterns` · `clickhouse-io` · `redis-patterns` · `docker-patterns` · `deployment-patterns` · `git-workflow` · `github-ops` · and more...
</details>

<details>
<summary><strong>💼 Business & Operations (50+ skills)</strong></summary>

`seo` · `content-engine` · `market-research` · `investor-materials` · `finance-billing-ops` · `customer-billing-ops` · `email-ops` · `growth-marketing` · `seo-growth` · `ppt-mckinsey` · `empirical-research` · `deep-research` · and more...
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
       all 23 agents to define scope..."
       
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

> **Why "Zeoel"?** The name honors the legacy of knowledge and justice. All 23 agent names are inspired by Ahle Bait (a.s.) and the Zeoel development team.

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
