---
name: figma-to-code
description: >-
  Figma design-to-code pipeline patterns. Covers Dev Mode, CSS extraction,
  component mapping, design token export, and maintaining design-code parity.
---

# Figma to Code Pipeline

## Overview

Systematic approach to translating Figma designs into production code while maintaining design fidelity. Covers Figma Dev Mode, automated token extraction, component mapping strategies, and ongoing design-code synchronization.

## When to Use

- Receiving Figma designs from designers for implementation
- Setting up design-to-code workflows for a team
- Extracting design tokens (colors, typography, spacing) from Figma
- Mapping Figma components to React/Vue/HTML components

## Design Token Extraction

### From Figma Variables to CSS

```css
/* Extracted from Figma Variables → CSS Custom Properties */
:root {
  /* Colors (from Figma color styles) */
  --color-primary: #6366f1;
  --color-primary-hover: #4f46e5;
  --color-surface: #ffffff;
  --color-surface-elevated: #f8fafc;

  /* Typography (from Figma text styles) */
  --font-heading: 'Inter', sans-serif;
  --font-body: 'Inter', sans-serif;
  --text-h1: 700 2.25rem/1.2 var(--font-heading);
  --text-body: 400 1rem/1.5 var(--font-body);

  /* Spacing (from Figma auto-layout) */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;

  /* Border radius (from Figma corner radius) */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;

  /* Shadows (from Figma drop shadows) */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1);
}
```

### Using Tokens Studio (Figma Plugin)

```json
// tokens.json exported from Tokens Studio
{
  "global": {
    "colors": {
      "primary": { "value": "{colors.indigo.500}", "type": "color" },
      "background": { "value": "#ffffff", "type": "color" }
    },
    "spacing": {
      "xs": { "value": "4", "type": "spacing" },
      "sm": { "value": "8", "type": "spacing" }
    }
  }
}
```

## Component Mapping Strategy

### Figma Component → React Component

| Figma Element | CSS/React Equivalent |
|---|---|
| Auto Layout (horizontal) | `display: flex; flex-direction: row` |
| Auto Layout (vertical) | `display: flex; flex-direction: column` |
| Fill Container | `flex: 1` or `width: 100%` |
| Hug Contents | `width: fit-content` |
| Fixed width/height | Explicit `width`/`height` values |
| Absolute positioned | `position: absolute` |
| Component variants | Props or CSS classes |
| Component instances | React component instances |

## Guidelines

1. **Extract tokens FIRST** before writing any component code
2. **Map Figma Auto Layout** directly to Flexbox/Grid
3. **Use Figma's Dev Mode** inspect panel for exact values
4. **Match Figma's naming convention** in component names
5. **Use component variants** as component props
6. **Verify responsive behavior** — Figma is static, code must be responsive

## Anti-Patterns

- ❌ Pixel-perfect reproduction without understanding the design system
- ❌ Hardcoding values instead of using design tokens
- ❌ Ignoring Figma's component structure when building React components
- ❌ Not communicating back to designers when designs don't translate well
- ❌ Skipping responsive breakpoints that weren't in the Figma mock
