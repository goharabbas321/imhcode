---
name: waza-habits
description: "Software engineering hygiene and clean code habits skill. Covers strict git commits, formatting rules, refactoring steps, and clean code principles."
---

# /waza-habits — Engineering Hygiene & Clean Coding Habits

**Waza-Habits** enforces world-class software engineering habits across code formatting, Git branch discipline, strict encapsulation, and documentation.

---

## 🥋 Engineering Habits

### 1. Clean Coding & Encapsulation
- **Single Responsibility Principle (SRP)**: Keep functions and classes tightly scoped. Refactor blocks exceeding 50 lines.
- **Explicit Naming**: Variable and function names must be highly self-descriptive. No cryptic shorthand.
- **Strict Linting & Cleanups**: Delete unused imports, dead blocks, and debug logs before proposing changes.

### 2. Git Branch & Commit Hygiene
- **Conventional Commits**: Enforce strict subject structures: `type(scope): message` (e.g. `feat(auth): add google signin`).
- **Bite-sized Commits**: Group code changes logically; prevent staging multi-feature monolithic changes.
- **Branch Protection**: Never commit directly to `main`; always merge via sprint-specific pull requests.
