---
name: imhcode-saas-architect
description: "SaaS Project Architecture Skill: Use when a user says 'build a SaaS'. Provides the blueprint for scaffolding a Next.js + Laravel + PostgreSQL project with SEO-first structure."
---

# IMH-Code SaaS Architect

This skill provides the planner agent with a concrete blueprint for architecting a SaaS project using the IMH-Code standard stack: **Next.js (App Router) + Laravel (API) + PostgreSQL**.

## The Standard SaaS Stack

```
┌────────────────────────────────────────────────────────────┐
│                    FRONTEND (nextjs-executor)              │
│  Next.js 15+ (App Router, TypeScript, Tailwind, shadcn)    │
│  ├── Server Components (data fetching, SEO)               │
│  ├── Client Components (interactivity)                    │
│  └── Server Actions                                       │
└───────────────────────┬────────────────────────────────────┘
                        │ REST API (JSON)
                        │ Auth: Laravel Sanctum
┌───────────────────────▼────────────────────────────────────┐
│                    BACKEND (laravel-executor)              │
│  Laravel 11+ (PHP 8.3, Sanctum, Cashier)                   │
│  ├── Controllers (thin, validation only)                   │
│  ├── Services/Actions (business logic)                     │
│  └── Form Requests (input validation)                      │
└───────────────────────┬────────────────────────────────────┘
                        │
┌───────────────────────▼────────────────────────────────────┐
│                    DATABASE (laravel-executor)             │
│  PostgreSQL 16+                                            │
│  ├── Core tables (users, teams, plans, subscriptions)      │
│  └── Redis (sessions, cache, rate limiting, queues)        │
└────────────────────────────────────────────────────────────┘
```

## SEO-First URL Architecture

Marketing/Public Pages (SSR, fully crawlable)
- `/` - Homepage
- `/pricing` - Pricing
- `/changelog` - Product changelog

App Pages (Auth-gated, NOT indexed)
- `/dashboard` - Main dashboard
- `/dashboard/billing` - Subscription management

## Sprint 1: Foundation (Setup)

Every SaaS project starts with a Foundation Sprint:
1. **Scaffold**: Next.js scaffold + Laravel API setup.
2. **Database**: PostgreSQL schema + migrations (users, teams, plans).
3. **Auth**: Sanctum-based Login/Register API and UI forms.
4. **CI/CD**: Docker containerization.
