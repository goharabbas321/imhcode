# 🕌 IMH-Code — Imam Hussain Coding Harness Platform

### A fast-first multi-agent AI coding harness with intelligent model routing, configurable testing, and token-saving optimizations for rapid SaaS MVP development.

<p align="center">
  <a href="https://www.npmjs.com/package/imhcode"><img src="https://img.shields.io/npm/v/imhcode?label=imhcode&style=for-the-badge&logo=npm&color=cb3837" alt="npm version"></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-22c55e.svg?style=for-the-badge" alt="License: MIT"></a>
  <a href="AGENTS.md"><img src="https://img.shields.io/badge/Agents-19%20Role--Based-a855f7?style=for-the-badge" alt="Agents"></a>
  <a href="skills/"><img src="https://img.shields.io/badge/Skills-450+%20Bindings-f97316?style=for-the-badge" alt="Skills"></a>
</p>

---

## ⚡ Quick Start

### 1. Install Globally
```bash
npm install -g imhcode
```

### 2. Initialize a Workspace
Navigate to your project directory and run the initialization wizard:
```bash
cd your-project
imhcode
```
This scans your system for local engines (Claude, OpenCode, Codex, Antigravity, QwenCode, MimoCode) and sets up the **Intelligent Model Routing** configurations inside `imhcode.config.json`.

---

## 🔄 The 6-Phase Pipeline

IMH-Code enforces a fast-first software delivery pipeline:

1. **Write**: Describe your product requirements in `docs/start.md`.
2. **Plan**: Run `imhcode plan` to generate `docs/brainstorming.md`.
3. **Brainstorm**: Review recommended answers in `docs/brainstorming.md` and run `imhcode plan` again.
4. **Sprint Plan**: Sprints, tasks, and shell execution scripts are generated.
5. **Execute**: Run `imhcode execute 1` (or specify sprint). Respects your selected testing mode.
6. **Test**: Run `imhcode test` to execute E2E browser tests, security audit, and SEO scans.

---

## 🔒 Configurable Testing Strategy

Unlike other frameworks that mandate slow TDD at every step, IMH-Code lets you choose:
- **Fast Mode (Default)**: No tests written during development sprints. A dedicated testing sprint is appended at the end to cover unit, integration, security, and browser tests. 3-5x faster development.
- **Balanced Mode**: Basic smoke tests per task, full test suites at the end.
- **Strict TDD**: Write failing tests first before coding on every task.

---

## 🤖 19 Generic Role-Based Agents

IMH-Code replaces individual persona names with generic agents routed to the best models:
- **planner**: Sprint coordination and architecture.
- **designer**: UI/UX design (prefer Mimo v2.5 Pro).
- **nextjs-executor**: Next.js full-stack (prefer Mimo v2.5 Pro).
- **laravel-executor**: Laravel backend (prefer DeepSeek V4 Pro).
- **tester**: Unit/Integration/E2E tests (prefer GPT-5.5).
- **security-auditor**: OWASP security scans (prefer GPT-5.5).
- **seo-optimizer**: SEO & sitemaps (prefer GPT-5.5).
- *(Run `imhcode agent list` to see all 19 agents)*
