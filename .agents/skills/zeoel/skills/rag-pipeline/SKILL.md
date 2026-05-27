---
name: rag-pipeline
description: >-
  Retrieval-Augmented Generation (RAG) pipeline patterns. Covers document
  ingestion, chunking, embeddings, vector search, and answer generation.
---

# RAG Pipeline Patterns

## Overview

Retrieval-Augmented Generation (RAG) combines retrieval of relevant documents with LLM generation to produce accurate, grounded answers. This skill covers the complete pipeline: document ingestion → chunking → embedding → vector storage → retrieval → generation.

## When to Use

- Building chatbots that answer questions about your documentation
- Creating search over private/proprietary data
- Reducing LLM hallucination by grounding responses in real data
- Knowledge bases, support bots, internal tools

## Pipeline Architecture

```
Documents → Chunking → Embedding → Vector DB → Retrieval → LLM → Answer
```

## Implementation

### 1. Document Ingestion & Chunking

```typescript
// Recursive character text splitter
function chunkDocument(text: string, options: { chunkSize: number; overlap: number }) {
  const { chunkSize, overlap } = options
  const chunks: string[] = []
  let start = 0

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length)
    // Find natural break point (paragraph, sentence)
    let breakPoint = end
    if (end < text.length) {
      const lastParagraph = text.lastIndexOf('\n\n', end)
      const lastSentence = text.lastIndexOf('. ', end)
      breakPoint = Math.max(lastParagraph, lastSentence, start + chunkSize / 2)
    }

    chunks.push(text.slice(start, breakPoint).trim())
    start = breakPoint - overlap
  }

  return chunks
}

// Usage
const chunks = chunkDocument(document, { chunkSize: 512, overlap: 50 })
```

### 2. Embedding & Storage

```typescript
import { OpenAI } from 'openai'

const openai = new OpenAI()

// Generate embeddings
async function embed(texts: string[]): Promise<number[][]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: texts,
  })
  return response.data.map(d => d.embedding)
}

// Store in Supabase (pgvector)
async function storeChunks(chunks: string[], metadata: any) {
  const embeddings = await embed(chunks)
  
  for (let i = 0; i < chunks.length; i++) {
    await supabase.from('documents').insert({
      content: chunks[i],
      embedding: embeddings[i],
      metadata: { ...metadata, chunkIndex: i },
    })
  }
}
```

### 3. Retrieval & Generation

```typescript
async function ragQuery(question: string, topK = 5) {
  // 1. Embed the question
  const [questionEmbedding] = await embed([question])

  // 2. Vector similarity search
  const { data: results } = await supabase.rpc('match_documents', {
    query_embedding: questionEmbedding,
    match_threshold: 0.7,
    match_count: topK,
  })

  // 3. Build context from retrieved chunks
  const context = results.map(r => r.content).join('\n\n---\n\n')

  // 4. Generate answer with context
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `Answer the user's question based ONLY on the following context. 
If the context doesn't contain the answer, say "I don't have information about that."

Context:
${context}`
      },
      { role: 'user', content: question },
    ],
  })

  return {
    answer: response.choices[0].message.content,
    sources: results.map(r => r.metadata),
  }
}
```

## Guidelines

1. **Chunk size matters** — 256-512 tokens is a good default, adjust based on content type
2. **Use overlap** (50-100 chars) to preserve context across chunk boundaries
3. **Include metadata** with each chunk (source URL, page number, section title)
4. **Use hybrid search** (vector + keyword) for better recall
5. **Cite sources** — return which documents were used to generate the answer
6. **Re-rank results** — use a cross-encoder to reorder retrieved chunks by relevance

## Anti-Patterns

- ❌ Chunking too aggressively (losing context)
- ❌ Not including metadata (can't cite sources)
- ❌ Stuffing entire documents into context (exceeds token limits)
- ❌ Skipping re-ranking (first retrieval results may not be the most relevant)
- ❌ Not handling "I don't know" cases (leads to hallucination)
