# References & Attribution

> Zeoel stands on the shoulders of incredible open-source projects. We believe in transparency and giving proper credit to the communities and creators whose work inspired and shaped this framework.

---

## Core Inspirations

These projects fundamentally shaped Zeoel's architecture and methodology:

| Repository | Author | What We Learned | License |
|---|---|---|---|
| [obra/superpowers](https://github.com/obra/superpowers) | Jesse Vincent ([@obra](https://github.com/obra)) | Agentic skills framework methodology, structured development lifecycle (brainstorm → plan → execute → verify), subagent dispatch patterns, TDD-first enforcement | MIT |
| [obra/superpowers-marketplace](https://github.com/obra/superpowers-marketplace) | Jesse Vincent ([@obra](https://github.com/obra)) | Plugin marketplace architecture, skill discovery & distribution patterns | MIT |
| [ComposioHQ/awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills) | [ComposioHQ](https://github.com/ComposioHQ) | Skills catalog structure, community skill curation patterns | MIT |
| [VoltAgent/awesome-agent-skills](https://github.com/VoltAgent/awesome-agent-skills) | [VoltAgent](https://github.com/VoltAgent) | Cross-platform skill compatibility (Claude Code, Cursor, Gemini CLI), massive skills aggregation | MIT |
| [VoltAgent/awesome-claude-code-subagents](https://github.com/VoltAgent/awesome-claude-code-subagents) | [VoltAgent](https://github.com/VoltAgent) | Specialized subagent patterns, agent dispatch architecture | MIT |
| [anthropics/claude-code](https://github.com/anthropics/claude-code) | [Anthropic](https://github.com/anthropics) | CLAUDE.md conventions, skill format standards, MCP integration patterns | Apache-2.0 |

---

## Skill Sources by Category

### 🎨 Frontend & Design Skills

| Skill | Inspired By / Adapted From | Notes |
|---|---|---|
| `frontend-design` | Community best practices, [Awwwards](https://www.awwwards.com/), [Dribbble](https://dribbble.com/) | UI/UX design patterns |
| `frontend-patterns` | React/Next.js ecosystem conventions | Component architecture |
| `nextjs-turbopack` | [Vercel Next.js](https://github.com/vercel/next.js) docs | App Router, Turbopack, RSC |
| `gsap-scrolltrigger` | [GSAP](https://github.com/greensock/GSAP) official docs | Animation patterns |
| `threejs-webgl` | [Three.js](https://github.com/mrdoob/three.js/) docs | 3D web rendering |
| `react-three-fiber` | [pmndrs/react-three-fiber](https://github.com/pmndrs/react-three-fiber) | Declarative 3D in React |
| `motion-framer` | [Motion](https://github.com/motiondivision/motion) (formerly Framer Motion) | React animation library |
| `react-spring-physics` | [pmndrs/react-spring](https://github.com/pmndrs/react-spring) | Physics-based animations |
| `tailwindcss-v4` | [Tailwind CSS](https://github.com/tailwindlabs/tailwindcss) v4 docs | CSS-first configuration |
| `shadcn-ui-patterns` | [shadcn/ui](https://github.com/shadcn-ui/ui) | Component library patterns |
| `radix-ui-primitives` | [Radix UI](https://github.com/radix-ui/primitives) | Accessible headless components |
| `animated-component-libraries` | [Magic UI](https://magicui.design/), [React Bits](https://github.com/vasanthk/react-bits) | Pre-built animated components |
| `lottie-animations` | [lottie-web](https://github.com/airbnb/lottie-web) by Airbnb | After Effects → web animations |
| `locomotive-scroll` | [Locomotive Scroll](https://github.com/locomotivemtl/locomotive-scroll) | Smooth scrolling + parallax |
| `barba-js` | [Barba.js](https://github.com/barbajs/barba) | Page transitions |
| `pixijs-2d` | [PixiJS](https://github.com/pixijs/pixijs) | 2D WebGL rendering |
| `babylonjs-engine` | [Babylon.js](https://github.com/BabylonJS/Babylon.js) | 3D game engine |
| `spline-interactive` | [Spline](https://spline.design/) | No-code 3D design |
| `liquid-glass-design` | Apple WWDC 2025 design language | Glassmorphism + liquid effects |
| `modern-web-design` | Awwwards, SiteInspire, current design trends | Design trend patterns |
| `ui-ux-pro-max` | Community design systems | Design intelligence |
| `view-transitions-api` | [MDN View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API) | Native page transitions |
| `css-container-queries` | CSS specification | Modern responsive design |
| `design-tokens-system` | [Style Dictionary](https://github.com/amzn/style-dictionary), Tokens Studio | Cross-platform token architecture |
| `micro-interactions` | UX/design community best practices | Scroll, hover, loading patterns |

### 🔧 Backend & Infrastructure Skills

| Skill | Inspired By / Adapted From | Notes |
|---|---|---|
| `laravel-patterns` | [Laravel](https://github.com/laravel/laravel) docs & ecosystem | PHP framework patterns |
| `laravel-security` | OWASP, Laravel security best practices | Security hardening |
| `laravel-tdd` | Laravel testing docs, PHPUnit | Test-driven Laravel |
| `postgres-patterns` | PostgreSQL official docs | Database design patterns |
| `redis-patterns` | [Redis](https://github.com/redis/redis) docs | Caching & pub/sub |
| `nestjs-patterns` | [NestJS](https://github.com/nestjs/nest) docs | Node.js enterprise framework |
| `fastapi-patterns` | [FastAPI](https://github.com/tiangolo/fastapi) docs | Python async API framework |
| `django-patterns` | [Django](https://github.com/django/django) docs | Python web framework |
| `prisma-patterns` | [Prisma](https://github.com/prisma/prisma) docs | TypeScript ORM |
| `supabase-patterns` | [Supabase](https://github.com/supabase/supabase) docs | BaaS platform |
| `drizzle-orm-patterns` | [Drizzle ORM](https://github.com/drizzle-team/drizzle-orm) docs | TypeScript-first ORM |
| `trpc-patterns` | [tRPC](https://github.com/trpc/trpc) docs | End-to-end typesafe APIs |
| `stripe-billing-patterns` | [Stripe](https://stripe.com/docs) docs | Payment/billing integration |
| `graphql-patterns` | GraphQL specification | Schema design, resolvers |
| `queue-patterns` | BullMQ, Redis Queue patterns | Background job processing |
| `oauth2-auth-patterns` | OAuth 2.0 / OIDC specifications | Auth flow patterns |
| `rate-limiting-patterns` | OWASP, API security best practices | Throttling & protection |
| `websocket-realtime` | WebSocket protocol, Socket.io | Real-time communication |
| `springboot-patterns` | [Spring Boot](https://github.com/spring-projects/spring-boot) docs | Java enterprise framework |
| `docker-patterns` | Docker official docs | Containerization |
| `deployment-patterns` | Community DevOps practices | CI/CD patterns |

### 📱 Mobile Skills

| Skill | Inspired By / Adapted From | Notes |
|---|---|---|
| `dart-flutter-patterns` | [Flutter](https://github.com/flutter/flutter) docs | Cross-platform mobile |
| `kotlin-patterns` | [Kotlin](https://github.com/JetBrains/kotlin) docs | Android/JVM development |
| `swiftui-patterns` | Apple SwiftUI docs | iOS/macOS development |
| `compose-multiplatform-patterns` | [JetBrains Compose](https://github.com/JetBrains/compose-multiplatform) | KMP UI framework |

### 🤖 AI & Agent Skills

| Skill | Inspired By / Adapted From | Notes |
|---|---|---|
| `mcp-server-patterns` | [Anthropic MCP Specification](https://modelcontextprotocol.io/) | Model Context Protocol |
| `mcp-builder` | MCP ecosystem | Custom MCP server construction |
| `mcp-server-builder` | Anthropic MCP SDK | Building tool servers |
| `rag-pipeline` | LangChain, LlamaIndex patterns | Retrieval-Augmented Generation |
| `prompt-engineering` | Anthropic Cookbook, community patterns | Systematic prompt design |
| `vercel-ai-sdk` | [Vercel AI SDK](https://github.com/vercel/ai) | Streaming, tool calling |
| `pytorch-patterns` | [PyTorch](https://github.com/pytorch/pytorch) docs | ML framework patterns |

### 🔐 Security & Compliance

| Skill | Inspired By / Adapted From | Notes |
|---|---|---|
| `security-review` | OWASP Top 10, CWE database | Vulnerability detection |
| `security-scan` | Community SAST/DAST patterns | Automated scanning |
| `hipaa-compliance` | HHS HIPAA regulations | Healthcare compliance |
| `healthcare-phi-compliance` | NIST, HHS guidelines | PHI protection |

### 📊 Testing & Quality

| Skill | Inspired By / Adapted From | Notes |
|---|---|---|
| `test-driven-development` | Kent Beck's TDD methodology | Red-Green-Refactor |
| `e2e-testing` | [Playwright](https://github.com/microsoft/playwright), Cypress | Browser automation |
| `systematic-debugging` | Industry debugging methodologies | 4-phase root cause analysis |

---

## How Zeoel Uses Open Source

Zeoel curates and integrates skills from the open-source community. Each imported skill is:

1. **Adapted** to work within our 23-agent orchestration pipeline
2. **Enhanced** with TDD enforcement hooks and verification loops
3. **Tested** against our sprint execution framework
4. **Maintained** to stay current with upstream changes

We deeply respect the open-source community and encourage:
- ⭐ **Starring** the original repositories that inspired our skills
- 🔗 **Linking back** to original documentation when skills are derived
- 🤝 **Contributing** improvements back to upstream projects

---

## Want to Contribute?

If you've created a skill that you'd like to see integrated into Zeoel, please:
1. Open an issue with the `skill-submission` label
2. Include a link to your skill's repository or SKILL.md
3. We'll review, adapt, and credit you in this document

See [CONTRIBUTING.md](CONTRIBUTING.md) for more details.

---

*Last updated: May 2026*
