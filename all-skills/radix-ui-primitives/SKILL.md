---
name: radix-ui-primitives
description: >-
  Radix UI headless primitives for accessible, unstyled UI components. Covers
  Dialog, Dropdown, Popover, Tooltip, Tabs, Accordion, and custom compositions.
---

# Radix UI Primitives

## Overview

Radix Primitives are unstyled, accessible UI component building blocks. They handle complex interactions (focus management, keyboard navigation, ARIA attributes) so you can focus on styling and composition.

## When to Use

- Building custom design systems from scratch
- Needing WAI-ARIA compliant components without opinions on styling
- Creating complex interactive patterns (modals, dropdown menus, comboboxes)
- Working alongside Tailwind CSS or any CSS framework

## Core Primitives

### Dialog (Modal)

```tsx
import * as Dialog from "@radix-ui/react-dialog"

export function Modal({ children, trigger }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 shadow-xl">
          <Dialog.Title className="text-lg font-semibold">Title</Dialog.Title>
          <Dialog.Description className="text-sm text-gray-500">Description</Dialog.Description>
          {children}
          <Dialog.Close asChild>
            <button aria-label="Close">×</button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
```

### Dropdown Menu

```tsx
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"

<DropdownMenu.Root>
  <DropdownMenu.Trigger asChild>
    <button>Options</button>
  </DropdownMenu.Trigger>
  <DropdownMenu.Portal>
    <DropdownMenu.Content sideOffset={5} className="bg-white rounded-md shadow-lg p-1">
      <DropdownMenu.Item className="cursor-pointer px-2 py-1.5 rounded hover:bg-gray-100">
        Edit
      </DropdownMenu.Item>
      <DropdownMenu.Separator className="h-px bg-gray-200 my-1" />
      <DropdownMenu.Item className="cursor-pointer px-2 py-1.5 rounded text-red-600 hover:bg-red-50">
        Delete
      </DropdownMenu.Item>
    </DropdownMenu.Content>
  </DropdownMenu.Portal>
</DropdownMenu.Root>
```

## Guidelines

1. **Always use `asChild`** when wrapping custom trigger elements
2. **Always include `Dialog.Title`** for screen reader accessibility
3. **Use `Portal`** for overlays to avoid z-index stacking issues
4. **Handle focus trapping** — Radix does this automatically, don't override
5. **Compose primitives** — combine Popover + Command for Combobox patterns
6. **Style with data attributes** — Radix exposes `data-state`, `data-side`, `data-orientation`

## Anti-Patterns

- ❌ Removing `Dialog.Title` (breaks screen readers)
- ❌ Not using `Portal` for floating elements
- ❌ Overriding Radix's built-in focus management
- ❌ Using `onClick` on `Trigger` instead of Radix's built-in toggle
- ❌ Nesting Dialogs without proper scope management
