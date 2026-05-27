---
name: view-transitions-api
description: >-
  Native browser View Transitions API for seamless page and state transitions.
  Covers same-document transitions, cross-document MPA transitions, and framework integration.
---

# View Transitions API

## Overview

The View Transitions API provides a native mechanism for creating animated transitions between different views (DOM states) in a web application. It works for both SPAs (same-document) and MPAs (cross-document), eliminating the need for JavaScript animation libraries for page transitions.

## When to Use

- Page-to-page transitions in Next.js, Nuxt, or any framework
- Animating between UI states (list ↔ detail, tabs, modal open/close)
- Creating smooth "shared element" transitions (image expanding to detail page)
- Replacing Barba.js or custom page transition code with native APIs

## Same-Document Transitions (SPA)

```javascript
// Basic transition
document.startViewTransition(() => {
  // Update the DOM
  updateContent(newContent);
});

// With async operations
document.startViewTransition(async () => {
  const data = await fetchNewPage(url);
  document.querySelector('#content').innerHTML = data;
});
```

### CSS for Transitions

```css
/* Default crossfade (works automatically) */
::view-transition-old(root) {
  animation: fade-out 0.3s ease-out;
}
::view-transition-new(root) {
  animation: fade-in 0.3s ease-in;
}

/* Named transitions for specific elements */
.hero-image {
  view-transition-name: hero;
}

::view-transition-old(hero) {
  animation: scale-down 0.4s ease-in-out;
}
::view-transition-new(hero) {
  animation: scale-up 0.4s ease-in-out;
}
```

## Cross-Document Transitions (MPA)

```css
/* Enable in CSS — no JavaScript needed */
@view-transition {
  navigation: auto;
}

/* Shared elements across pages */
.product-card img {
  view-transition-name: product-image;
}
.product-detail img {
  view-transition-name: product-image;
}
```

## Next.js Integration

```tsx
// app/layout.tsx
import { unstable_ViewTransition as ViewTransition } from 'react'

export default function Layout({ children }) {
  return (
    <html>
      <body>
        <ViewTransition>{children}</ViewTransition>
      </body>
    </html>
  )
}
```

## Guidelines

1. **Use `view-transition-name`** to create shared element transitions
2. **Each `view-transition-name` must be unique** on the page at transition time
3. **Respect `prefers-reduced-motion`** — disable animations for accessibility
4. **Use CSS for transition styling**, JavaScript for triggering
5. **Progressive enhancement** — transitions are purely visual, pages work without them

## Anti-Patterns

- ❌ Using duplicate `view-transition-name` values on the same page
- ❌ Ignoring `prefers-reduced-motion` media query
- ❌ Heavy JavaScript animations when CSS view transitions suffice
- ❌ Not providing fallback for unsupported browsers
