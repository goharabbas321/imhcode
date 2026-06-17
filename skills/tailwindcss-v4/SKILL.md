---
name: tailwindcss-v4
description: >-
  Tailwind CSS v4 patterns with CSS-first configuration, new engine architecture,
  container queries, and modern utility patterns. Use for all Tailwind-based styling.
---

# Tailwind CSS v4 Patterns

## Overview

Tailwind CSS v4 introduces a fundamentally new architecture with CSS-first configuration, a new high-performance engine (Oxide), and native support for modern CSS features. This skill covers v4-specific patterns and migration from v3.

## When to Use

- Building or styling any frontend with Tailwind CSS
- Migrating from Tailwind v3 to v4
- Setting up design tokens with CSS custom properties
- Using container queries, `@starting-style`, or cascade layers

## Key Changes in v4

### CSS-First Configuration

```css
/* app.css — No more tailwind.config.js */
@import "tailwindcss";

@theme {
  --color-primary: oklch(0.6 0.2 260);
  --color-secondary: oklch(0.7 0.15 180);
  --font-display: "Inter", sans-serif;
  --breakpoint-3xl: 1920px;
}
```

### Design Tokens via `@theme`

```css
@theme {
  /* Spacing scale */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;

  /* Colors using OKLCH for perceptual uniformity */
  --color-brand-50: oklch(0.97 0.01 260);
  --color-brand-500: oklch(0.6 0.2 260);
  --color-brand-900: oklch(0.25 0.1 260);

  /* Typography */
  --font-sans: "Inter", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", monospace;
  --text-base: 1rem;
  --leading-normal: 1.5;
}
```

### Container Queries (Native)

```html
<div class="@container">
  <div class="flex flex-col @md:flex-row @lg:grid @lg:grid-cols-3">
    <!-- Responsive to container, not viewport -->
  </div>
</div>
```

### Composable Variants

```html
<div class="group-hover:not-disabled:opacity-100">
  <!-- Chainable variant composition -->
</div>
```

## Guidelines

1. **Always use `@theme`** for design tokens — never hardcode colors or spacing
2. **Use OKLCH color space** for perceptually uniform color palettes
3. **Prefer `@container`** over media queries for component-level responsiveness
4. **Use CSS-first config** — avoid JavaScript config files in v4
5. **Leverage cascade layers** for third-party style integration
6. **Use `@source`** directive to explicitly include content paths

## Anti-Patterns

- ❌ Using `tailwind.config.js` in v4 (use `@theme` in CSS instead)
- ❌ Hardcoding hex/rgb colors (use OKLCH for consistency)
- ❌ Over-nesting `@apply` rules (defeats utility-first purpose)
- ❌ Using viewport-based breakpoints when container queries are more appropriate
- ❌ Ignoring the new `@variant` directive for custom variants

## Migration from v3

```bash
# Automatic migration
npx @tailwindcss/upgrade
```

Key changes to watch:
- `tailwind.config.js` → `@theme` in CSS
- `@tailwind base/components/utilities` → `@import "tailwindcss"`
- Custom plugins → CSS `@plugin` directive
- `theme.extend` → `@theme` with `--` prefixed tokens
