# Contributing to Zeoel Framework

Thank you for your interest in contributing to Zeoel! Whether you're fixing a typo, adding a new skill, or proposing a new agent — we welcome it all.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
  - [Adding a New Skill](#adding-a-new-skill)
  - [Adding a New Agent](#adding-a-new-agent)
  - [Improving Existing Skills](#improving-existing-skills)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Features](#suggesting-features)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Style Guide](#style-guide)

---

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment. Be kind, be constructive, and help others learn.

---

## How Can I Contribute?

### Adding a New Skill

Skills are the core of Zeoel. Each skill is a structured SKILL.md file that teaches an AI agent how to perform a specific task.

**Steps:**

1. **Fork** the repository
2. **Create** your skill directory:
   ```
   .agents/skills/zeoel/skills/your-skill-name/SKILL.md
   ```
3. **Follow** the SKILL.md format:
   ```markdown
   ---
   name: your-skill-name
   description: >-
     One-line description of what this skill does.
   ---

   # Your Skill Name

   ## Overview
   What this skill enables and when to use it.

   ## Guidelines
   Step-by-step instructions the agent should follow.

   ## Examples
   Real-world usage examples.

   ## Anti-Patterns
   Common mistakes to avoid.
   ```
4. **Mirror** your skill to `all-skills/your-skill-name/SKILL.md`
5. **Submit** a PR with the `new-skill` label

**Skill Quality Checklist:**
- [ ] Has a clear, descriptive name (use hyphens, lowercase)
- [ ] YAML frontmatter includes `name` and `description`
- [ ] Provides actionable instructions (not just documentation links)
- [ ] Includes at least 2 real examples
- [ ] Lists anti-patterns or common mistakes
- [ ] Works within the Zeoel agent dispatch protocol

### Adding a New Agent

Agents are specialized personas with curated skill bindings.

**Steps:**

1. Create the agent file in `.agents/skills/zeoel/agents/your-agent-name.md`
2. Follow the agent template in `.agents/skills/zeoel/agents/_template.md`
3. Define:
   - **Name & Role** — The agent's persona
   - **Primary Skills (⭐)** — Which skills this agent must load
   - **Secondary Skills** — Optional supporting skills
   - **Constraints** — What this agent should NOT do
4. Update `AGENTS.md` with the new agent entry
5. Submit a PR with the `new-agent` label

### Improving Existing Skills

Found a skill that's outdated or could be better? We love improvements!

1. Check the skill's current content in `.agents/skills/zeoel/skills/[name]/SKILL.md`
2. Make your improvements (update patterns, add examples, fix errors)
3. Submit a PR explaining what you changed and why

### Reporting Bugs

Use the [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.md) and include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Your environment (OS, AI tool used, version)

### Suggesting Features

Use the [Feature Request template](.github/ISSUE_TEMPLATE/feature_request.md) and describe:
- What problem the feature solves
- Your proposed solution
- Any alternatives you've considered

---

## Development Setup

```bash
# Clone the repo
git clone https://github.com/goharabbas321/zeoel-framework.git
cd zeoel-framework

# Test the init command locally
node bin/zeoel.js init

# Make your changes in .agents/skills/zeoel/
```

No build step is required — Zeoel is a file-based framework.

---

## Pull Request Process

1. **Branch** from `main` with a descriptive name: `skill/tailwindcss-v4` or `fix/readme-typo`
2. **Commit** with clear messages: `feat(skill): add tailwindcss-v4 patterns`
3. **Test** that `npx zeoel-framework init` still works
4. **Fill out** the PR template completely
5. **Wait** for review — we aim to respond within 48 hours

### Commit Message Format

```
type(scope): description

feat(skill): add supabase-patterns skill
fix(agent): correct karar-frontend skill bindings  
docs(readme): update quick start instructions
```

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

---

## Style Guide

### SKILL.md Files
- Use title case for headings
- Use code blocks with language tags for all code examples
- Keep instructions actionable ("Do X" not "X could be done")
- Maximum 500 lines per SKILL.md (split into sub-files if larger)

### Agent Files
- Use the established persona format
- Always define primary (⭐) and secondary skills
- Include constraints and anti-patterns

### General
- Markdown files should pass basic linting
- Use relative links within the repo
- Keep line lengths reasonable (< 120 chars for prose)

---

## Recognition

All contributors are credited in [REFERENCES.md](REFERENCES.md). When your PR is merged, we'll add your attribution to the relevant section.

Thank you for making Zeoel better! 🚀
