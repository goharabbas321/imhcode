---
name: vercel-ai-sdk
description: >-
  Vercel AI SDK patterns for streaming AI responses, tool calling, structured
  output, embeddings, and multi-provider support in Next.js applications.
---

# Vercel AI SDK

## Overview

The Vercel AI SDK (`ai` package) provides a unified API for building AI-powered features across multiple LLM providers. It handles streaming, tool calling, structured output, and React hooks for real-time UI updates.

## When to Use

- Building AI chat interfaces in Next.js
- Streaming LLM responses to the frontend
- Implementing tool/function calling in AI features
- Generating structured data from LLM responses
- Supporting multiple AI providers (OpenAI, Anthropic, Google, etc.)

## Streaming Chat (Next.js App Router)

```typescript
// app/api/chat/route.ts
import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'

export async function POST(req: Request) {
  const { messages } = await req.json()

  const result = streamText({
    model: openai('gpt-4o'),
    system: 'You are a helpful assistant.',
    messages,
    maxTokens: 1000,
  })

  return result.toDataStreamResponse()
}
```

```tsx
// app/chat/page.tsx
'use client'
import { useChat } from 'ai/react'

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat()

  return (
    <div>
      {messages.map(m => (
        <div key={m.id} className={m.role === 'user' ? 'text-right' : 'text-left'}>
          <p>{m.content}</p>
        </div>
      ))}
      <form onSubmit={handleSubmit}>
        <input value={input} onChange={handleInputChange} placeholder="Ask me anything..." />
        <button type="submit" disabled={isLoading}>Send</button>
      </form>
    </div>
  )
}
```

## Tool Calling

```typescript
import { openai } from '@ai-sdk/openai'
import { streamText, tool } from 'ai'
import { z } from 'zod'

const result = streamText({
  model: openai('gpt-4o'),
  messages,
  tools: {
    getWeather: tool({
      description: 'Get current weather for a city',
      parameters: z.object({
        city: z.string().describe('City name'),
        unit: z.enum(['celsius', 'fahrenheit']).default('celsius'),
      }),
      execute: async ({ city, unit }) => {
        const weather = await fetchWeather(city, unit)
        return { temperature: weather.temp, condition: weather.condition }
      },
    }),
    searchProducts: tool({
      description: 'Search the product catalog',
      parameters: z.object({
        query: z.string(),
        category: z.string().optional(),
        maxPrice: z.number().optional(),
      }),
      execute: async ({ query, category, maxPrice }) => {
        return await db.products.search({ query, category, maxPrice })
      },
    }),
  },
})
```

## Structured Output

```typescript
import { generateObject } from 'ai'
import { z } from 'zod'

const { object } = await generateObject({
  model: openai('gpt-4o'),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    tags: z.array(z.string()),
    sentiment: z.enum(['positive', 'negative', 'neutral']),
    confidence: z.number().min(0).max(1),
  }),
  prompt: `Analyze this article: ${articleText}`,
})

console.log(object.title) // Fully typed!
```

## Multi-Provider Support

```typescript
import { anthropic } from '@ai-sdk/anthropic'
import { google } from '@ai-sdk/google'
import { openai } from '@ai-sdk/openai'

// Same API, different providers
const result = await generateText({
  model: anthropic('claude-sonnet-4-20250514'), // or openai('gpt-4o') or google('gemini-pro')
  prompt: 'Explain quantum computing',
})
```

## Guidelines

1. **Use `streamText`** for chat interfaces — streaming is essential for UX
2. **Use `generateObject`** for structured data extraction — Zod schemas ensure type safety
3. **Define tools with clear descriptions** — the model uses these to decide when to call them
4. **Use `useChat` hook** in React for state management
5. **Handle errors** in tool execution — return error messages, don't throw
6. **Use the multi-provider API** to easily switch models for cost/quality optimization

## Anti-Patterns

- ❌ Not streaming responses (users stare at a blank screen)
- ❌ Parsing LLM output manually when `generateObject` exists
- ❌ Vague tool descriptions (model won't know when to use them)
- ❌ Hardcoding a single provider (limits flexibility)
- ❌ Not handling streaming errors in the client
