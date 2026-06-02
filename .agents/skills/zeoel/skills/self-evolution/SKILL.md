---
name: self-evolution
description: "Agent self-evolution skill. Covers runtime skill learning, code self-refactoring, and memento skills logging."
---

# /self-evolution — Agent Skill Learning & Self-Evolution

**Self-Evolution** equips agents with the meta-capability to analyze their own execution performance, record lessons, and rewrite/expand skill directories to adapt to novel tasks.

---

## 🌀 Evolution Cycle

### 1. Performance Diagnostics
- Audit execution runs for API bottlenecks, logic failures, or context inefficiencies.
- Record structured error mementos inside `.agents/skills/zeoel/skills/self-evolution/logs/` detailing lessons.

### 2. Runtime Skill Generation
- Dynamically build or update skill folders using the `skill-creator` guidelines.
- Modify agent definitions (`.agents/skills/zeoel/agents/[name].md`) to bind newly learned capabilities during executions.

### 3. Loop Self-Tuning
- Update codebase prompts to adjust for context-window budgets and token spending.
