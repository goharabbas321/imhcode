---
name: queue-patterns
description: >-
  Background job processing patterns with BullMQ, Redis queues, dead letter
  handling, retry strategies, and worker architecture.
---

# Queue & Background Job Patterns

## Overview

Patterns for reliable background job processing. Covers job queue architecture, retry strategies, dead letter queues, priority queues, and horizontal scaling with BullMQ (Node.js) and general patterns applicable to any queue system.

## When to Use

- Sending emails, SMS, or push notifications
- Processing uploads (images, videos, documents)
- Long-running computations (report generation, data exports)
- Webhook delivery with retry logic
- Scheduled tasks (cron-like recurring jobs)

## BullMQ (Node.js + Redis)

```typescript
import { Queue, Worker, QueueScheduler } from 'bullmq'
import Redis from 'ioredis'

const connection = new Redis({ host: 'localhost', port: 6379 })

// Define queue
const emailQueue = new Queue('email', { connection })

// Add jobs
await emailQueue.add('welcome-email', {
  to: 'user@example.com',
  template: 'welcome',
  data: { name: 'Gohar' },
}, {
  attempts: 3,
  backoff: { type: 'exponential', delay: 1000 },
  removeOnComplete: { count: 1000 },
  removeOnFail: { count: 5000 },
})

// Delayed job
await emailQueue.add('trial-expiry', { userId: '123' }, {
  delay: 14 * 24 * 60 * 60 * 1000, // 14 days
})

// Recurring job
await emailQueue.add('daily-digest', {}, {
  repeat: { pattern: '0 9 * * *' }, // Every day at 9 AM
})
```

### Worker

```typescript
const worker = new Worker('email', async (job) => {
  switch (job.name) {
    case 'welcome-email':
      await sendEmail(job.data.to, job.data.template, job.data.data)
      break
    case 'trial-expiry':
      await handleTrialExpiry(job.data.userId)
      break
    case 'daily-digest':
      await generateAndSendDigest()
      break
  }
}, {
  connection,
  concurrency: 5,
  limiter: { max: 10, duration: 1000 }, // Rate limit: 10 jobs/second
})

// Error handling
worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err.message)
  if (job?.attemptsMade === job?.opts.attempts) {
    // All retries exhausted — move to dead letter queue
    deadLetterQueue.add('failed-email', { originalJob: job.data, error: err.message })
  }
})

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`)
})
```

## Job Patterns

### Priority Queue

```typescript
// Higher priority = processed first
await queue.add('urgent', data, { priority: 1 })  // Highest
await queue.add('normal', data, { priority: 5 })   // Normal
await queue.add('low', data, { priority: 10 })     // Lowest
```

### Job Dependencies (Flow)

```typescript
import { FlowProducer } from 'bullmq'

const flow = new FlowProducer({ connection })
await flow.add({
  name: 'send-report',
  queueName: 'email',
  data: { type: 'weekly-report' },
  children: [
    { name: 'generate-pdf', queueName: 'reports', data: { format: 'pdf' } },
    { name: 'aggregate-data', queueName: 'analytics', data: { period: 'week' } },
  ],
})
```

## Guidelines

1. **Always set `attempts` and `backoff`** — jobs will fail, plan for retries
2. **Use exponential backoff** to avoid thundering herd problems
3. **Set `removeOnComplete`** to prevent Redis memory from growing unbounded
4. **Use dead letter queues** for jobs that exhaust all retries
5. **Idempotent workers** — jobs may be processed more than once (at-least-once delivery)
6. **Monitor queue depth** — alert when queues grow faster than they drain

## Anti-Patterns

- ❌ Processing jobs synchronously in the API request path
- ❌ Not setting retry limits (infinite retry loops)
- ❌ Non-idempotent workers (duplicate processing causes data corruption)
- ❌ Storing large payloads in the job (store a reference, fetch in worker)
- ❌ Not monitoring queue health and backlog
