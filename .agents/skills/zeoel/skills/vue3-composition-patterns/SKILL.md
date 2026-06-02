---
name: vue3-composition-patterns
description: >-
  Vue 3 Composition API patterns for composables, reactivity (ref, reactive,
  computed, watch), provide/inject, defineModel, Teleport, Suspense, async
  components, TypeScript integration, and performance optimization. Activate
  when building or architecting Vue 3 applications.
---

# Vue 3 Composition API Patterns

## Overview

The Composition API is Vue 3's primary API for building components. It replaces the Options API's rigid structure with composable functions, enabling better code organization, TypeScript inference, and logic reuse. This skill covers production-grade patterns for the Composition API, `<script setup>`, composables, and Vue 3.5+ features.

## When to Use

- Building or refactoring Vue 3 components with `<script setup>`
- Creating reusable composables (`use*` functions)
- Managing complex reactive state with `ref`, `reactive`, `computed`, `watch`
- Implementing dependency injection with `provide`/`inject`
- Using advanced features: Teleport, Suspense, async components
- Writing type-safe Vue components with TypeScript
- Optimizing Vue app performance

## Reactivity Fundamentals

### ref vs reactive vs shallowRef

```typescript
import { ref, reactive, shallowRef, triggerRef } from 'vue'

// ref — wraps ANY value (primitives + objects). Access via .value
const count = ref(0)
count.value++ // triggers reactivity

// reactive — deep reactive proxy for OBJECTS ONLY. No .value needed
const state = reactive({
  user: { name: 'Ali', email: 'ali@example.com' },
  items: [],
})
state.user.name = 'Hassan' // triggers reactivity

// shallowRef — only .value reassignment triggers updates (not deep mutations)
const heavyList = shallowRef<Item[]>([])
heavyList.value = [...heavyList.value, newItem] // triggers
heavyList.value.push(newItem) // does NOT trigger — use triggerRef(heavyList)
```

**When to use which:**

| Type | Use For | Gotcha |
|------|---------|--------|
| `ref` | Primitives, single values, template refs | Must use `.value` in script |
| `reactive` | Complex state objects with multiple fields | Cannot reassign root; destructuring loses reactivity |
| `shallowRef` | Large arrays/objects where deep tracking is expensive | Manual `triggerRef()` for mutations |

### Computed and Watchers

```typescript
import { ref, computed, watch, watchEffect, watchPostEffect } from 'vue'

// Computed — derived state (cached, lazy)
const firstName = ref('Ali')
const lastName = ref('Hassan')
const fullName = computed(() => `${firstName.value} ${lastName.value}`)

// Writable computed
const fullNameWritable = computed({
  get: () => `${firstName.value} ${lastName.value}`,
  set: (val: string) => {
    const [first, ...rest] = val.split(' ')
    firstName.value = first
    lastName.value = rest.join(' ')
  },
})

// watch — explicit source, old/new values, lazy by default
watch(count, (newVal, oldVal) => {
  console.log(`Changed from ${oldVal} to ${newVal}`)
})

// Watch multiple sources
watch([firstName, lastName], ([newFirst, newLast], [oldFirst, oldLast]) => {
  // fires when either changes
})

// Deep watch on reactive object
watch(() => state.user, (newUser) => {
  // fires on any nested change
}, { deep: true })

// watchEffect — auto-tracks dependencies, runs immediately
watchEffect(() => {
  document.title = `${count.value} items`
})

// watchPostEffect — runs after DOM updates
watchPostEffect(() => {
  // safe to read updated DOM here
})
```

## Composables Architecture

```typescript
// composables/useCounter.ts — Reusable stateful logic
import { ref, computed, type Ref } from 'vue'

interface UseCounterOptions {
  min?: number
  max?: number
  initial?: number
}

export function useCounter(options: UseCounterOptions = {}) {
  const { min = 0, max = Infinity, initial = 0 } = options
  const count = ref(initial)

  const increment = () => {
    if (count.value < max) count.value++
  }
  const decrement = () => {
    if (count.value > min) count.value--
  }
  const reset = () => { count.value = initial }

  const isMin = computed(() => count.value <= min)
  const isMax = computed(() => count.value >= max)

  return { count, increment, decrement, reset, isMin, isMax }
}
```

```typescript
// composables/useFetch.ts — Async data fetching composable
import { ref, shallowRef, watchEffect, type Ref } from 'vue'

interface UseFetchReturn<T> {
  data: Ref<T | null>
  error: Ref<Error | null>
  isLoading: Ref<boolean>
  refresh: () => Promise<void>
}

export function useFetch<T>(url: Ref<string> | string): UseFetchReturn<T> {
  const data = shallowRef<T | null>(null)
  const error = ref<Error | null>(null)
  const isLoading = ref(false)

  async function doFetch() {
    isLoading.value = true
    error.value = null
    try {
      const resolvedUrl = typeof url === 'string' ? url : url.value
      const response = await fetch(resolvedUrl)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      data.value = await response.json()
    } catch (e) {
      error.value = e instanceof Error ? e : new Error(String(e))
    } finally {
      isLoading.value = false
    }
  }

  // Auto-refetch when URL changes (if url is a ref)
  if (typeof url !== 'string') {
    watchEffect(() => { doFetch() })
  } else {
    doFetch()
  }

  return { data, error, isLoading, refresh: doFetch }
}
```

```vue
<!-- Usage in component -->
<script setup lang="ts">
import { ref } from 'vue'
import { useFetch } from '@/composables/useFetch'
import { useCounter } from '@/composables/useCounter'

const apiUrl = ref('/api/users')
const { data: users, isLoading, error } = useFetch<User[]>(apiUrl)
const { count, increment, decrement } = useCounter({ min: 0, max: 100 })
</script>
```

## Provide / Inject (Dependency Injection)

```typescript
// providers/theme.ts — Type-safe provide/inject
import { provide, inject, ref, type InjectionKey, type Ref } from 'vue'

interface ThemeContext {
  theme: Ref<'light' | 'dark'>
  toggleTheme: () => void
}

export const ThemeKey: InjectionKey<ThemeContext> = Symbol('theme')

export function provideTheme() {
  const theme = ref<'light' | 'dark'>('light')
  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }
  provide(ThemeKey, { theme, toggleTheme })
  return { theme, toggleTheme }
}

export function useTheme(): ThemeContext {
  const ctx = inject(ThemeKey)
  if (!ctx) throw new Error('useTheme() must be used within a ThemeProvider')
  return ctx
}
```

## defineModel (Vue 3.4+)

```vue
<!-- Two-way binding with defineModel -->
<script setup lang="ts">
// Parent passes v-model:title="pageTitle"
const title = defineModel<string>('title', { required: true })
const isOpen = defineModel<boolean>('open', { default: false })

// Computed transform on model
const titleUpperCase = computed({
  get: () => title.value.toUpperCase(),
  set: (val) => { title.value = val },
})
</script>

<template>
  <input v-model="title" />
  <p>{{ titleUpperCase }}</p>
</template>
```

## defineProps with TypeScript

```vue
<script setup lang="ts">
// Type-based props (preferred in TS projects)
interface Props {
  title: string
  count?: number
  items: string[]
  status: 'active' | 'inactive' | 'pending'
  onClick?: (id: string) => void
}

const props = withDefaults(defineProps<Props>(), {
  count: 0,
  status: 'active',
})

// Generic components (Vue 3.3+)
// <script setup lang="ts" generic="T extends { id: string }">
// const props = defineProps<{ items: T[]; selected?: T }>()
// const emit = defineEmits<{ select: [item: T] }>()
</script>
```

## Teleport, Suspense, and Async Components

```vue
<!-- Teleport — render content elsewhere in the DOM -->
<template>
  <Teleport to="body">
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <slot />
      </div>
    </div>
  </Teleport>
</template>

<!-- Suspense — handle async component loading -->
<template>
  <Suspense>
    <template #default>
      <AsyncDashboard />
    </template>
    <template #fallback>
      <LoadingSkeleton />
    </template>
  </Suspense>
</template>

<script setup>
import { defineAsyncComponent } from 'vue'

const AsyncDashboard = defineAsyncComponent({
  loader: () => import('./Dashboard.vue'),
  loadingComponent: LoadingSkeleton,
  errorComponent: ErrorFallback,
  delay: 200,
  timeout: 10000,
})
</script>
```

## Vue 3.5+ Features

```vue
<script setup lang="ts">
import { useTemplateRef, onMounted } from 'vue'

// useTemplateRef (3.5+) — type-safe template refs
const inputRef = useTemplateRef<HTMLInputElement>('emailInput')

onMounted(() => {
  inputRef.value?.focus()
})
</script>

<template>
  <input ref="emailInput" type="email" />
</template>
```

## Performance Optimization

```vue
<template>
  <!-- v-once — render once, never re-render -->
  <footer v-once>
    <p>© 2025 Company Name. All rights reserved.</p>
  </footer>

  <!-- v-memo — skip re-render unless dependencies change -->
  <div v-for="item in list" :key="item.id" v-memo="[item.id, item.selected]">
    <ExpensiveComponent :item="item" />
  </div>
</template>

<script setup>
import { shallowReactive, markRaw } from 'vue'

// shallowReactive — only root-level properties are reactive
const state = shallowReactive({
  config: markRaw(hugeConfigObject), // markRaw — never make this reactive
  items: [],
})
</script>
```

## Guidelines

1. **Use `<script setup>`** for all new components — less boilerplate, better TS inference
2. **Prefer `ref`** over `reactive` for most state — avoids destructuring pitfalls
3. **Name composables `use*`** and return reactive refs, not raw values
4. **Use `InjectionKey`** with provide/inject for type safety
5. **Use `shallowRef`** for large data structures that don't need deep tracking
6. **Use `defineModel`** instead of manual `emit('update:modelValue')` patterns
7. **Use `computed`** for derived state — never use `watch` to set another ref

## Anti-Patterns

- ❌ Destructuring `reactive()` objects — loses reactivity (`const { name } = reactive({...})`)
- ❌ Using `watch` to compute derived state that `computed` can handle
- ❌ Creating composables that return non-reactive values (return `ref`, not plain values)
- ❌ Using `ref()` for complex nested objects that need deep tracking (use `reactive`)
- ❌ Calling `inject()` outside of `setup()` or composable context
- ❌ Forgetting to handle the loading/error states with `Suspense`
- ❌ Using Options API (`data()`, `methods`, `computed`) in new Vue 3 components

## Related Skills

- `nuxt4-patterns` — SSR, data fetching, route rules for Nuxt 4
- `vite-patterns` — Build tool and dev server patterns for Vue/Vite
- `ui-to-vue` — Converting design screenshots to Vue 3 components
- `tailwindcss-v4` — Styling Vue components with Tailwind
