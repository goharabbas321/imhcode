---
name: design-tokens-system
description: >-
  Cross-platform design token architecture using Style Dictionary, Tokens Studio,
  and CSS custom properties. Three-layer token system (primitive→semantic→component).
---

# Design Tokens System

## Overview

Design tokens are the single source of truth for design decisions (colors, typography, spacing, shadows). This skill covers a three-layer token architecture that ensures consistency across web, mobile, and design tools.

## When to Use

- Building or maintaining a design system
- Ensuring consistency between Figma designs and code
- Supporting multiple themes (light/dark, brand variants)
- Creating cross-platform token pipelines (web + iOS + Android)

## Three-Layer Token Architecture

```
┌──────────────────────────┐
│   Component Tokens       │  ← button-bg, card-shadow, input-border
│   (Context-specific)     │
├──────────────────────────┤
│   Semantic Tokens        │  ← color-primary, color-danger, spacing-md
│   (Meaning-based)        │
├──────────────────────────┤
│   Primitive Tokens       │  ← blue-500, gray-100, 16px, 700
│   (Raw values)           │
└──────────────────────────┘
```

### Layer 1: Primitive Tokens

```css
:root {
  /* Colors — raw palette values */
  --primitive-blue-50: oklch(0.97 0.01 250);
  --primitive-blue-500: oklch(0.6 0.2 260);
  --primitive-blue-900: oklch(0.25 0.1 260);
  --primitive-gray-50: oklch(0.98 0 0);
  --primitive-gray-900: oklch(0.15 0 0);

  /* Spacing — raw scale */
  --primitive-space-1: 0.25rem;  /* 4px */
  --primitive-space-2: 0.5rem;   /* 8px */
  --primitive-space-4: 1rem;     /* 16px */
  --primitive-space-6: 1.5rem;   /* 24px */
  --primitive-space-8: 2rem;     /* 32px */

  /* Typography — raw values */
  --primitive-font-sans: 'Inter', system-ui, sans-serif;
  --primitive-font-mono: 'JetBrains Mono', monospace;
  --primitive-weight-regular: 400;
  --primitive-weight-semibold: 600;
  --primitive-weight-bold: 700;
}
```

### Layer 2: Semantic Tokens

```css
:root {
  /* Intent-based colors */
  --color-primary: var(--primitive-blue-500);
  --color-on-primary: white;
  --color-surface: var(--primitive-gray-50);
  --color-on-surface: var(--primitive-gray-900);
  --color-danger: oklch(0.6 0.2 25);
  --color-success: oklch(0.65 0.2 145);

  /* Semantic spacing */
  --spacing-xs: var(--primitive-space-1);
  --spacing-sm: var(--primitive-space-2);
  --spacing-md: var(--primitive-space-4);
  --spacing-lg: var(--primitive-space-6);
  --spacing-xl: var(--primitive-space-8);

  /* Semantic typography */
  --font-heading: var(--primitive-font-sans);
  --font-body: var(--primitive-font-sans);
}

/* Dark theme overrides ONLY semantic tokens */
.dark {
  --color-primary: var(--primitive-blue-400);
  --color-surface: var(--primitive-gray-900);
  --color-on-surface: var(--primitive-gray-50);
}
```

### Layer 3: Component Tokens

```css
:root {
  /* Button tokens */
  --button-bg: var(--color-primary);
  --button-text: var(--color-on-primary);
  --button-padding-x: var(--spacing-md);
  --button-padding-y: var(--spacing-sm);
  --button-radius: 0.5rem;

  /* Card tokens */
  --card-bg: var(--color-surface);
  --card-padding: var(--spacing-lg);
  --card-radius: 0.75rem;
  --card-shadow: 0 1px 3px rgba(0,0,0,0.1);

  /* Input tokens */
  --input-bg: var(--color-surface);
  --input-border: var(--primitive-gray-300);
  --input-focus-ring: var(--color-primary);
  --input-padding: var(--spacing-sm) var(--spacing-md);
}
```

## Style Dictionary Pipeline

```json
// config.json
{
  "source": ["tokens/**/*.json"],
  "platforms": {
    "css": {
      "transformGroup": "css",
      "buildPath": "build/css/",
      "files": [{ "destination": "tokens.css", "format": "css/variables" }]
    },
    "ios": {
      "transformGroup": "ios-swift",
      "buildPath": "build/ios/",
      "files": [{ "destination": "Tokens.swift", "format": "ios-swift/class.swift" }]
    }
  }
}
```

## Guidelines

1. **Never skip layers** — always go Primitive → Semantic → Component
2. **Theme at the semantic layer** — dark mode overrides semantic tokens, not primitives
3. **Use OKLCH** for perceptually uniform color manipulation
4. **Name tokens by intent**, not by value (`color-danger`, not `color-red`)
5. **Automate token sync** between Figma (Tokens Studio) and code (Style Dictionary)
6. **Document every token** with its purpose and usage context

## Anti-Patterns

- ❌ Component tokens referencing primitive tokens directly (skip semantic layer)
- ❌ Naming tokens by color value (`--blue-button`) instead of intent (`--button-primary`)
- ❌ Hardcoding values in components instead of using tokens
- ❌ Having separate token files for light/dark — use CSS custom property overrides
- ❌ Over-tokenizing — not every CSS value needs to be a token
