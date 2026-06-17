---
name: bootstrap-patterns
description: >-
  Bootstrap 5 patterns for responsive grid layouts, utility API, SCSS theming,
  component customization, dark mode, and performance optimization. Activate when
  building Bootstrap-based UIs, admin dashboards, or rapid-prototyping with Bootstrap.
---

# Bootstrap 5 Patterns

## Overview

Bootstrap 5 is a mature, utility-rich CSS framework with a 12-column grid, extensive component library, and deep SCSS customization. Unlike utility-first frameworks (Tailwind), Bootstrap provides opinionated, pre-styled components that can be deeply customized via SCSS variables and the utility API.

## When to Use

- Building admin dashboards, internal tools, or enterprise UIs
- Rapid prototyping with pre-built components
- Projects requiring broad browser support and accessibility out of the box
- Teams familiar with Bootstrap's class naming conventions
- Landing pages, marketing sites, or multi-page applications
- Projects where you need a component library without React/Vue dependency

## Installation

```bash
# npm
npm install bootstrap @popperjs/core

# With SCSS customization (recommended)
npm install bootstrap sass

# CDN (quick prototyping only)
# <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
# <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
```

## Key Patterns

### Grid System

```html
<!-- Responsive 12-column grid -->
<div class="container">
  <div class="row g-4">
    <div class="col-12 col-md-8 col-lg-6">Main content</div>
    <div class="col-12 col-md-4 col-lg-6">Sidebar</div>
  </div>
</div>

<!-- Container variants -->
<div class="container"><!-- max-width at breakpoints --></div>
<div class="container-fluid"><!-- full width always --></div>
<div class="container-lg"><!-- full width until lg breakpoint --></div>

<!-- Auto-layout columns -->
<div class="row">
  <div class="col">Equal</div>
  <div class="col">Equal</div>
  <div class="col">Equal</div>
</div>

<!-- Offset and ordering -->
<div class="row">
  <div class="col-md-4 offset-md-4">Centered column</div>
  <div class="col order-md-2">Appears second on md+</div>
  <div class="col order-md-1">Appears first on md+</div>
</div>
```

### SCSS Theming

```scss
// custom.scss — Import BEFORE bootstrap to override defaults
// 1. Override variables
$primary: #6366f1;
$secondary: #8b5cf6;
$success: #10b981;
$danger: #ef4444;
$warning: #f59e0b;
$info: #06b6d4;

$body-bg: #0f172a;
$body-color: #e2e8f0;

$font-family-base: 'Inter', system-ui, sans-serif;
$font-size-base: 1rem;
$border-radius: 0.75rem;
$border-radius-lg: 1rem;

$enable-dark-mode: true;
$enable-shadows: true;
$enable-gradients: false;
$enable-negative-margins: true;

// 2. Import Bootstrap
@import "bootstrap/scss/bootstrap";

// 3. Custom component overrides AFTER import
.btn-primary {
  --bs-btn-bg: #{$primary};
  --bs-btn-border-color: #{$primary};
  --bs-btn-hover-bg: #{darken($primary, 8%)};
  --bs-btn-hover-border-color: #{darken($primary, 10%)};
}
```

### CSS Variable Overrides (No SCSS)

```css
/* Override Bootstrap's CSS variables directly */
[data-bs-theme="light"] {
  --bs-primary: #6366f1;
  --bs-primary-rgb: 99, 102, 241;
  --bs-body-font-family: 'Inter', system-ui, sans-serif;
  --bs-border-radius: 0.75rem;
}

[data-bs-theme="dark"] {
  --bs-body-bg: #0f172a;
  --bs-body-color: #e2e8f0;
  --bs-primary: #818cf8;
  --bs-primary-rgb: 129, 140, 248;
}
```

### Dark Mode

```html
<!-- Set theme at document level -->
<html data-bs-theme="dark">

<!-- Per-component theme -->
<div data-bs-theme="light" class="card">
  <div class="card-body">This card is always light</div>
</div>
```

```javascript
// Toggle dark mode programmatically
function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute('data-bs-theme');
  html.setAttribute('data-bs-theme', current === 'dark' ? 'light' : 'dark');
}

// Respect system preference
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
document.documentElement.setAttribute('data-bs-theme', prefersDark ? 'dark' : 'light');
```

### Utility API (Custom Utilities)

```scss
// Generate custom utilities via the utility API
$utilities: map-merge(
  $utilities,
  (
    "custom-opacity": (
      property: opacity,
      class: o,
      values: (
        10: .1,
        25: .25,
        50: .5,
        75: .75,
        100: 1,
      ),
    ),
    "backdrop-blur": (
      property: backdrop-filter,
      class: blur,
      values: (
        sm: blur(4px),
        md: blur(8px),
        lg: blur(16px),
        xl: blur(24px),
      ),
    ),
  )
);
```

### Component Customization

```html
<!-- Card with glassmorphism -->
<div class="card border-0" style="
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
">
  <div class="card-body">
    <h5 class="card-title">Premium Card</h5>
    <p class="card-text text-body-secondary">Glass effect panel</p>
  </div>
</div>

<!-- Modal with custom animation -->
<div class="modal fade" id="premiumModal" tabindex="-1">
  <div class="modal-dialog modal-dialog-centered modal-lg">
    <div class="modal-content border-0 shadow-lg">
      <div class="modal-header border-bottom-0">
        <h5 class="modal-title">Title</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body">Content</div>
    </div>
  </div>
</div>

<!-- Offcanvas sidebar -->
<div class="offcanvas offcanvas-start" tabindex="-1" id="sidebar">
  <div class="offcanvas-header">
    <h5 class="offcanvas-title">Navigation</h5>
    <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
  </div>
  <div class="offcanvas-body">
    <nav class="nav flex-column">
      <a class="nav-link active" href="#">Dashboard</a>
      <a class="nav-link" href="#">Analytics</a>
      <a class="nav-link" href="#">Settings</a>
    </nav>
  </div>
</div>
```

### JavaScript API

```javascript
// Programmatic component initialization
import { Modal, Toast, Tooltip, Popover, Collapse } from 'bootstrap';

// Initialize all tooltips
document.querySelectorAll('[data-bs-toggle="tooltip"]')
  .forEach(el => new Tooltip(el));

// Modal control
const modal = Modal.getOrCreateInstance('#myModal');
modal.show();
modal.hide();

// Toast notifications
const toast = new Toast(document.getElementById('liveToast'));
toast.show();

// Listen for Bootstrap events
document.getElementById('myModal').addEventListener('shown.bs.modal', () => {
  // Focus first input when modal opens
  document.querySelector('#myModal input')?.focus();
});
```

### Performance Optimization

```scss
// Import only what you need (tree-shaking via SCSS)
// Instead of: @import "bootstrap/scss/bootstrap";

@import "bootstrap/scss/functions";
@import "bootstrap/scss/variables";
@import "bootstrap/scss/variables-dark";
@import "bootstrap/scss/maps";
@import "bootstrap/scss/mixins";
@import "bootstrap/scss/utilities";
@import "bootstrap/scss/root";
@import "bootstrap/scss/reboot";

// Only the components you use
@import "bootstrap/scss/type";
@import "bootstrap/scss/containers";
@import "bootstrap/scss/grid";
@import "bootstrap/scss/buttons";
@import "bootstrap/scss/card";
@import "bootstrap/scss/modal";
@import "bootstrap/scss/nav";
@import "bootstrap/scss/navbar";

// Generate only needed utilities
@import "bootstrap/scss/utilities/api";
```

```javascript
// Import only needed JS components
import Modal from 'bootstrap/js/dist/modal';
import Toast from 'bootstrap/js/dist/toast';
// NOT: import 'bootstrap'; // imports everything
```

## Guidelines

1. **Always use SCSS** for production — override variables before importing Bootstrap
2. **Use CSS variables** for runtime theming (dark mode, brand switching)
3. **Use the utility API** to generate project-specific utilities, not custom CSS
4. **Use `data-bs-theme`** for dark mode — never toggle classes manually
5. **Import selectively** — only the SCSS partials and JS modules you need
6. **Use `g-*` gutter classes** instead of padding/margin hacks on rows/columns
7. **Use responsive breakpoint suffixes** consistently (`-sm`, `-md`, `-lg`, `-xl`, `-xxl`)

## Anti-Patterns

- ❌ Overriding Bootstrap classes with `!important` — use SCSS variable overrides instead
- ❌ Using CDN links in production without SRI hashes
- ❌ Importing the full `bootstrap.bundle.min.js` when you only need Modal
- ❌ Mixing Bootstrap grid with custom float-based layouts
- ❌ Using inline styles to override Bootstrap's design tokens
- ❌ Ignoring `data-bs-theme` and rolling custom dark mode toggles
- ❌ Nesting `.container` inside `.container` (use `.container-fluid` inside `.container` if needed)
- ❌ Using Bootstrap's JS API without checking for existing instances (`getOrCreateInstance`)

## Related Skills

- `tailwindcss-v4` — utility-first CSS alternative
- `frontend-design` — design anchor selection
- `ui-ux-pro-max` — color palettes, typography, and UX guidelines
- `accessibility` — ARIA and keyboard navigation beyond Bootstrap defaults
