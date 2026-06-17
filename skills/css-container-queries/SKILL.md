---
name: css-container-queries
description: >-
  CSS Container Queries for component-level responsive design. Covers @container,
  container-type, container query units, and style queries.
---

# CSS Container Queries

## Overview

Container Queries allow components to adapt their styling based on the size of their containing element rather than the viewport. This enables truly reusable, context-aware components that respond to their available space.

## When to Use

- Building reusable components that work in different layout contexts
- Card components that adapt between sidebar and main content
- Design systems where components must be layout-agnostic
- Replacing JavaScript-based resize observers for responsive components

## Core Patterns

### Basic Container Query

```css
/* Define a containment context */
.card-container {
  container-type: inline-size;
  container-name: card;
}

/* Query the container's size */
@container card (min-width: 400px) {
  .card {
    display: grid;
    grid-template-columns: 200px 1fr;
    gap: 1rem;
  }
}

@container card (max-width: 399px) {
  .card {
    display: flex;
    flex-direction: column;
  }
}
```

### Container Query Units

```css
/* cqw = 1% of container width */
/* cqh = 1% of container height */
/* cqi = 1% of container inline size */
/* cqb = 1% of container block size */
/* cqmin = min(cqi, cqb) */
/* cqmax = max(cqi, cqb) */

.card-title {
  font-size: clamp(1rem, 3cqi, 2rem);
}

.card-image {
  height: 40cqb;
}
```

### Style Queries (Experimental)

```css
/* Query custom property values */
@container style(--theme: dark) {
  .card {
    background: #1a1a2e;
    color: #eee;
  }
}

@container style(--variant: compact) {
  .card {
    padding: 0.5rem;
  }
}
```

### Nested Containers

```css
.sidebar {
  container-type: inline-size;
  container-name: sidebar;
}

.sidebar .widget {
  container-type: inline-size;
  container-name: widget;
}

@container sidebar (max-width: 300px) {
  .sidebar-nav { flex-direction: column; }
}

@container widget (min-width: 200px) {
  .widget-content { display: grid; grid-template-columns: 1fr 1fr; }
}
```

## Tailwind CSS v4 Integration

```html
<!-- Tailwind v4 has native container query support -->
<div class="@container">
  <div class="flex flex-col @sm:flex-row @md:grid @md:grid-cols-3">
    <p class="text-sm @lg:text-base">Responsive to container</p>
  </div>
</div>
```

## Guidelines

1. **Use `container-type: inline-size`** for most use cases (width-based queries)
2. **Name your containers** with `container-name` for clarity in nested contexts
3. **Use container query units** (`cqi`, `cqw`) for fluid typography and spacing
4. **Combine with `@media`** — use container queries for components, media queries for layout
5. **Progressive enhancement** — provide reasonable defaults for non-supporting browsers

## Anti-Patterns

- ❌ Using `container-type: size` when only inline-size is needed (causes unnecessary layout containment)
- ❌ Nesting containers without naming them (ambiguous query targets)
- ❌ Replacing all media queries with container queries (they serve different purposes)
- ❌ Forgetting that `container-type` creates a new stacking context
