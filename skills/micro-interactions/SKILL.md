---
name: micro-interactions
description: >-
  Micro-interaction design patterns for scroll-driven animations, hover effects,
  loading states, feedback animations, and interactive UI polish.
---

# Micro-Interactions

## Overview

Micro-interactions are subtle, single-purpose animations that provide feedback, guide users, and make interfaces feel alive. They're the difference between a "good" UI and a "great" one. This skill covers scroll-driven animations, hover states, loading patterns, and interactive feedback.

## When to Use

- Adding polish and delight to UI components
- Providing visual feedback for user actions (clicks, hovers, submissions)
- Creating scroll-triggered reveal animations
- Building loading states and progress indicators
- Enhancing form validation with animated feedback

## CSS-Only Micro-Interactions

### Scroll-Driven Animations (Native CSS)

```css
/* Fade-in on scroll — no JavaScript needed */
@keyframes fade-in {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.reveal-on-scroll {
  animation: fade-in linear both;
  animation-timeline: view();
  animation-range: entry 0% entry 100%;
}
```

### Button Micro-Interactions

```css
.btn {
  position: relative;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

/* Scale + shadow on hover */
.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Press effect */
.btn:active {
  transform: translateY(0) scale(0.98);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

/* Ripple effect */
.btn::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle, rgba(255,255,255,0.3) 10%, transparent 10%);
  background-position: center;
  background-size: 0;
  transition: background-size 0.5s;
}

.btn:active::after {
  background-size: 1000%;
  transition: background-size 0s;
}
```

### Card Hover Effects

```css
.card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.15);
}

/* Image zoom inside card */
.card img {
  transition: transform 0.5s ease;
}
.card:hover img {
  transform: scale(1.05);
}
```

### Loading Skeleton

```css
.skeleton {
  background: linear-gradient(
    90deg,
    hsl(0 0% 93%) 25%,
    hsl(0 0% 97%) 50%,
    hsl(0 0% 93%) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### Toggle Switch

```css
.toggle {
  width: 44px; height: 24px;
  background: #d1d5db;
  border-radius: 12px;
  transition: background 0.2s;
  cursor: pointer;
}

.toggle::before {
  content: '';
  width: 20px; height: 20px;
  background: white;
  border-radius: 50%;
  margin: 2px;
  display: block;
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.toggle:checked {
  background: #6366f1;
}

.toggle:checked::before {
  transform: translateX(20px);
}
```

## Guidelines

1. **Keep it subtle** — micro-interactions should enhance, not distract
2. **Use `cubic-bezier` easing** — never use `linear` for UI animations
3. **Duration: 150-300ms** for most interactions, 300-500ms for reveals
4. **Respect `prefers-reduced-motion`** — always provide a reduced-motion fallback
5. **Use CSS where possible** — avoid JavaScript for simple hover/focus effects
6. **Consistent timing** — use the same easing curve throughout the app

## Accessibility Fallback

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Anti-Patterns

- ❌ Animations longer than 500ms for feedback (feels sluggish)
- ❌ Animations on page load that block content visibility
- ❌ Using `transform: scale()` on text (causes blurriness)
- ❌ Not testing with `prefers-reduced-motion`
- ❌ Overusing animations — too much motion causes "animation fatigue"
