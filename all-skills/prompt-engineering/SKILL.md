---
name: prompt-engineering
description: >-
  Systematic prompt design patterns. Covers system prompts, few-shot examples,
  chain-of-thought, structured output, and evaluation strategies.
---

# Prompt Engineering

## Overview

Systematic approach to designing effective prompts for LLMs. Covers proven patterns for instruction clarity, output formatting, reasoning elicitation, and quality evaluation.

## When to Use

- Designing system prompts for AI features in your application
- Improving LLM output quality and consistency
- Building structured data extraction pipelines
- Creating evaluation frameworks for prompt quality

## Core Patterns

### System Prompt Template

```
You are a [ROLE] that [PRIMARY_FUNCTION].

## Rules
- [CONSTRAINT_1]
- [CONSTRAINT_2]
- [CONSTRAINT_3]

## Output Format
[STRUCTURED_FORMAT_SPECIFICATION]

## Examples
[FEW_SHOT_EXAMPLES]
```

### Few-Shot Prompting

```
Extract product details from the following descriptions.

Input: "The Nike Air Max 90 in Cloud White, size 10, retails for $130"
Output: {"brand": "Nike", "model": "Air Max 90", "color": "Cloud White", "size": "10", "price": 130}

Input: "Adidas Ultraboost 22, Core Black, size 9.5, $190 MSRP"
Output: {"brand": "Adidas", "model": "Ultraboost 22", "color": "Core Black", "size": "9.5", "price": 190}

Input: "[USER_INPUT]"
Output:
```

### Chain-of-Thought (CoT)

```
Analyze this code for security vulnerabilities.

Think through this step by step:
1. First, identify all user inputs and data sources
2. Then, trace how each input flows through the code
3. Check each flow for common vulnerability patterns (SQL injection, XSS, CSRF)
4. For each vulnerability found, assess severity (Critical/High/Medium/Low)
5. Finally, provide a remediation for each issue

Code:
[CODE_BLOCK]
```

### Structured Output with JSON Schema

```
Extract meeting details from the text below. 
Respond ONLY with valid JSON matching this schema:

{
  "date": "ISO 8601 date string",
  "time": "HH:MM format, 24-hour",
  "duration_minutes": "integer",
  "attendees": ["array of names"],
  "action_items": [{"owner": "name", "task": "description", "due": "date"}],
  "summary": "1-2 sentence summary"
}

Text: [INPUT]
```

### Guardrails & Safety

```
You are a customer support agent for [COMPANY].

## Boundaries
- ONLY answer questions about [COMPANY] products and services
- NEVER provide medical, legal, or financial advice
- NEVER share internal company information
- If asked about competitors, redirect to [COMPANY]'s features
- If you don't know the answer, say "Let me connect you with a specialist"

## Tone
- Professional but friendly
- Empathetic to customer frustration
- Concise — aim for 2-3 sentences unless detail is requested
```

## Evaluation Strategy

```typescript
// Simple automated evaluation
async function evaluatePrompt(prompt: string, testCases: TestCase[]) {
  const results = await Promise.all(
    testCases.map(async (tc) => {
      const response = await llm.generate(prompt + tc.input)
      return {
        input: tc.input,
        expected: tc.expected,
        actual: response,
        passed: tc.validator(response),
      }
    })
  )

  return {
    total: results.length,
    passed: results.filter(r => r.passed).length,
    accuracy: results.filter(r => r.passed).length / results.length,
    failures: results.filter(r => !r.passed),
  }
}
```

## Guidelines

1. **Be specific** — vague prompts produce vague outputs
2. **Show, don't tell** — few-shot examples > lengthy instructions
3. **Specify output format** — JSON schema, markdown, etc.
4. **Use delimiters** — separate instructions from content with `---` or XML tags
5. **Iterate systematically** — change one thing at a time, measure results
6. **Test edge cases** — empty inputs, adversarial inputs, ambiguous inputs

## Anti-Patterns

- ❌ "Be helpful and accurate" (too vague to be actionable)
- ❌ Contradictory instructions in the same prompt
- ❌ No examples when format matters
- ❌ Not testing with adversarial inputs
- ❌ Over-engineering prompts (simpler often works better)
