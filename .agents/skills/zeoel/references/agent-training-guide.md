# Zeoel Agent Training Guide

> This guide explains how to add new specialized sub-agents to the Zeoel Orchestration framework.

## Why Add New Agents?

While the default 7 agents cover standard web development, you may want to scale the system for specialized tasks. Examples:
- **Copywriter Agent**: For marketing sites, writing persuasive copy.
- **Data Scientist**: For Jupyter notebooks, pandas, and data visualization.
- **Mobile Developer**: For Flutter or React Native apps.

## Step 1: Define the Persona

Create a new file in `.agents/skills/zeoel/agents/[name]-[role].md`.
Start with the frontmatter and persona definition.

```markdown
---
name: [agent-name]
description: [One-line description of what this agent does]
---

# [Name] — [Role Title]

**Persona**: [2-3 sentences about personality, biases, and tendencies.]
**Expertise**: [Comma-separated list of domains]
```

*Tip*: Give them strong opinions. An agent that says "I can do anything" produces bland output. An agent that says "I refuse to use Redux, I only use Zustand" produces highly opinionated, consistent code.

## Step 2: Curate the Skill Pack

Look through your 285+ skills library (`/Volumes/Mac/myskill/skills/`). 
Pick 5-10 skills that define this agent's technical boundaries.

```markdown
## Skill Bindings

- `primary-skill` ⭐ (Core behavior)
- `secondary-skill`
- `tertiary-skill`
```

*Note*: The `zeoel-dispatch` skill reads these bindings automatically. You do not need to wire them up anywhere else.

## Step 3: Define Constraints & Outputs

What should this agent absolutely NEVER do? What format should their output take?

```markdown
## Constraints & Anti-Patterns

- **Never**: [What should this agent NEVER do?]
- **Always**: [What must this agent ALWAYS do?]

## Output Format

[Describe exactly what files or text this agent should output]
```

## Step 4: Register the Agent

1. Open `.agents/skills/zeoel/SKILL.md`.
2. Add the new agent to the `The Sub-Agents` table.
3. Open `.agents/skills/zeoel/references/project-brief-template.md` and add them to the Team Assignments table.
4. Open `.agents/skills/zeoel/references/skill-mapping-reference.md` and add their skill bindings for global reference.

## Step 5: Test the Agent

1. Create a dummy `sprint-plan.md`.
2. Assign a task to the new agent.
3. Run `zeoel-dispatch`.
4. Check the agent's output. Did they use their skills correctly? Did they break character? Adjust the `.md` file accordingly.
