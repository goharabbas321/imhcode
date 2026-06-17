---
name: zeoel-saas-architect
description: "SaaS Project Architecture Skill: Use when a user says 'build a SaaS'. Provides the blueprint for scaffolding a Next.js + Laravel + PostgreSQL project with SEO-first structure."
---

# Zeoel SaaS Architect

## Overview

This skill provides Gohar (CEO) with a concrete blueprint for architecting a SaaS project using the Zeoel standard stack: **Next.js (App Router) + Laravel (API) + PostgreSQL**.

When a user describes a SaaS idea, Gohar uses this skill during Phase 2 (Sprint Planning) to ensure the project starts with the correct foundation.

## The Standard SaaS Stack

```
┌────────────────────────────────────────────────────────────┐
│                    FRONTEND (Karar)                        │
│  Next.js 14+ (App Router, TypeScript, Tailwind, shadcn)   │
│  ├── Server Components (data fetching, SEO)               │
│  ├── Client Components (interactivity)                    │
│  ├── Server Actions (mutations)                           │
│  └── Middleware (auth redirect, tenant detection)          │
└───────────────────────┬────────────────────────────────────┘
                        │ REST API (JSON)
                        │ Auth: Laravel Sanctum
┌───────────────────────▼────────────────────────────────────┐
│                    BACKEND (Tariq)                          │
│  Laravel 11+ (PHP 8.3, Sanctum, Cashier, Horizon)          │
│  ├── Controllers (thin, validation only)                   │
│  ├── Services/Actions (business logic)                     │
│  ├── Form Requests (input validation)                      │
│  ├── Policies (authorization)                              │
│  ├── Queues via Horizon (emails, webhooks, heavy jobs)     │
│  └── Webhooks (Stripe events)                              │
└───────────────────────┬────────────────────────────────────┘
                        │
┌───────────────────────▼────────────────────────────────────┐
│                    DATABASE (Tariq + Fatima)                │
│  PostgreSQL 16+                                            │
│  ├── Core tables (users, teams, plans, subscriptions)      │
│  ├── Tenant-scoped data (global scopes)                    │
│  ├── Analytics tables (events, metrics)                    │
│  └── Redis (sessions, cache, rate limiting, queues)        │
└────────────────────────────────────────────────────────────┘
```

## SEO-First URL Architecture (Zara)

Every SaaS project MUST define its URL structure before any code is written:

### Marketing/Public Pages (SSR, fully crawlable)
```
/                           → Homepage (Server Component, full SEO)
/features                   → Features overview
/features/[slug]            → Individual feature page
/pricing                    → Pricing page with plan comparison
/blog                       → Blog index (paginated)
/blog/[category]            → Category index
/blog/[category]/[slug]     → Blog post
/about                      → About page
/contact                    → Contact form
/changelog                  → Product changelog
/docs                       → Documentation index
/docs/[...slug]             → Nested documentation pages
```

### App Pages (Auth-gated, NOT indexed)
```
/dashboard                  → Main dashboard
/dashboard/settings         → User/team settings
/dashboard/billing          → Subscription management
/dashboard/[feature]        → Feature-specific pages
/onboarding                 → First-time user setup
/onboarding/[step]          → Onboarding steps
```

### SEO Infrastructure Files
```
/sitemap.ts                 → Dynamic sitemap generation
/robots.ts                  → Robots rules (block /dashboard/*)
/manifest.ts                → PWA manifest
/opengraph-image.tsx        → Dynamic OG image generation
```

## Sprint 0: Foundation (Always First)

Every SaaS project starts with Sprint 0. This is non-negotiable.

### Sprint 0 Task List

| # | Task | Agent | Description |
|---|------|-------|-------------|
| 1 | SEO Blueprint | Zara | Define URL structure, keyword map, heading hierarchy |
| 2 | Design System | Mahdi + Mustafa | Choose design anchor, define tokens, build base components |
| 3 | Next.js Scaffold | Karar | `create-next-app`, Tailwind, shadcn/ui, folder structure, sitemap.ts, robots.ts |
| 4 | Laravel Scaffold | Tariq | `laravel new`, Sanctum, Cashier, PostgreSQL config, base migrations |
| 5 | Database Schema | Tariq + Fatima | Core tables (users, teams, plans, subscriptions), indexes |
| 6 | Auth Flow | Karar + Tariq | Login/Register/Forgot Password (Sanctum cookie auth) |
| 7 | CI/CD Setup | Ali | Docker Compose (dev), GitHub Actions (test + deploy) |
| 8 | Smoke Test | Muhammad | Verify: app loads, auth works, API responds, no console errors |

### Next.js Project Structure (Karar)
```
src/
├── app/
│   ├── (marketing)/           # Public pages group
│   │   ├── layout.tsx         # Marketing layout with nav + footer
│   │   ├── page.tsx           # Homepage
│   │   ├── features/
│   │   ├── pricing/
│   │   └── blog/
│   ├── (app)/                 # Authenticated app group
│   │   ├── layout.tsx         # Dashboard layout with sidebar
│   │   ├── dashboard/
│   │   └── onboarding/
│   ├── (auth)/                # Auth pages group
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── sitemap.ts
│   ├── robots.ts
│   └── layout.tsx             # Root layout (metadata, fonts)
├── components/
│   ├── ui/                    # shadcn/ui base components
│   ├── marketing/             # Marketing-specific components
│   └── dashboard/             # Dashboard-specific components
├── lib/
│   ├── api.ts                 # Laravel API client
│   ├── auth.ts                # Auth utilities
│   └── seo.ts                 # JSON-LD helpers, metadata factories
└── types/
    └── index.ts               # Shared TypeScript types
```

### Laravel Project Structure (Tariq)
```
app/
├── Http/
│   ├── Controllers/Api/V1/    # Versioned API controllers
│   ├── Middleware/             # Tenant, auth, rate limiting
│   └── Requests/              # Form Request validation
├── Models/                    # Eloquent models
├── Services/                  # Business logic
├── Actions/                   # Single-purpose actions
├── Policies/                  # Authorization
├── Events/                    # Domain events
├── Listeners/                 # Event handlers
└── Jobs/                      # Queued jobs
database/
├── migrations/                # Timestamped migrations
├── seeders/                   # Dev data seeders
└── factories/                 # Test factories
routes/
├── api.php                    # API routes (versioned)
└── web.php                    # Webhook routes only
```

## Required JSON-LD Schemas (Zara → Karar)

Every SaaS marketing site must include these structured data schemas:

```typescript
// Homepage
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "[Product Name]",
  "url": "[URL]",
  "logo": "[Logo URL]",
  "sameAs": ["[social links]"]
};

// Pricing Page
const productSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "[Product Name]",
  "applicationCategory": "BusinessApplication",
  "offers": [
    {
      "@type": "Offer",
      "name": "[Plan Name]",
      "price": "[Price]",
      "priceCurrency": "USD"
    }
  ]
};

// Blog Posts
const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "[Title]",
  "author": { "@type": "Person", "name": "[Author]" },
  "datePublished": "[Date]",
  "image": "[Image URL]"
};
```

## Gohar's Decision Framework

When planning sprints, use this to assign tasks:

| Task Type | Primary Agent | Support Agent |
|-----------|---------------|---------------|
| URL structure, keywords, meta | Zara | Mahdi |
| UX flows, wireframes | Mahdi | Zara (SEO check) |
| CSS, animations, visual polish | Mustafa | Mahdi |
| Next.js pages, components | Karar | Zara (metadata) |
| Laravel API, auth, billing | Tariq | Fatima (schema) |
| Database optimization, analytics | Fatima | Tariq |
| Mobile app screens | Abdullah / Zayd | Karar (shared patterns) |
| E2E tests, QA playthrough | Muhammad | — |
| Docker, CI/CD, security audit | Ali | Muhammad |
