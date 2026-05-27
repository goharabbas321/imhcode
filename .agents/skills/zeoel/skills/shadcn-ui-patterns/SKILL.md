---
name: shadcn-ui-patterns
description: >-
  shadcn/ui component patterns built on Radix UI + Tailwind CSS. Covers theming,
  dark mode, accessible forms, data tables, and custom component creation.
---

# shadcn/ui Patterns

## Overview

shadcn/ui is a collection of beautifully designed, accessible, and customizable components built on top of Radix UI and Tailwind CSS. Unlike traditional component libraries, you own the code — components are copied into your project and fully customizable.

## When to Use

- Building modern React/Next.js UIs with high design quality
- Needing accessible, ARIA-compliant components out of the box
- Wanting full control over component styling and behavior
- Implementing dark mode, theming, or design systems

## Installation

```bash
# Initialize shadcn/ui in your project
npx shadcn@latest init

# Add individual components
npx shadcn@latest add button card dialog table form
```

## Key Patterns

### Theming with CSS Variables

```css
/* globals.css */
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
  }
}
```

### Accessible Form Pattern

```tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export function LoginForm() {
  const form = useForm({ resolver: zodResolver(formSchema) })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <Button type="submit">Sign In</Button>
      </form>
    </Form>
  )
}
```

### Data Table with Sorting & Filtering

```tsx
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"

const columns: ColumnDef<Payment>[] = [
  { accessorKey: "status", header: "Status" },
  { accessorKey: "amount", header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"))
      return <div className="text-right font-medium">${amount.toFixed(2)}</div>
    }
  },
]
```

## Guidelines

1. **Always use the CLI** to add components — don't copy-paste from docs
2. **Customize via CSS variables** in `globals.css`, not by modifying component files directly
3. **Use `cn()` utility** for conditional class merging (built on clsx + tailwind-merge)
4. **Compose from Radix primitives** when building custom components
5. **Follow the Form pattern** with react-hook-form + zod for all forms
6. **Dark mode first** — always test both light and dark themes

## Anti-Patterns

- ❌ Overriding Radix styles with `!important`
- ❌ Removing accessibility attributes from components
- ❌ Using inline styles instead of CSS variables for theming
- ❌ Creating forms without zod validation
- ❌ Ignoring keyboard navigation in custom components
