---
name: rate-limiting-patterns
description: >-
  API rate limiting and throttling patterns. Covers token bucket, sliding window,
  Redis-based limiters, tiered limits, and DDoS protection strategies.
---

# Rate Limiting Patterns

## Overview

Rate limiting protects your API from abuse, ensures fair usage, and prevents cascading failures. This skill covers algorithm selection, implementation patterns, and tiered limiting for SaaS applications.

## When to Use

- Protecting public APIs from abuse
- Implementing fair-use policies for SaaS tiers (free vs. pro vs. enterprise)
- Preventing DDoS and brute-force attacks
- Rate limiting webhook deliveries or email sends

## Algorithms

### Token Bucket (Recommended)

```typescript
// Redis-based token bucket
import Redis from 'ioredis'
const redis = new Redis()

async function tokenBucket(key: string, maxTokens: number, refillRate: number): Promise<boolean> {
  const now = Date.now()
  const script = `
    local key = KEYS[1]
    local maxTokens = tonumber(ARGV[1])
    local refillRate = tonumber(ARGV[2])
    local now = tonumber(ARGV[3])

    local data = redis.call('HMGET', key, 'tokens', 'lastRefill')
    local tokens = tonumber(data[1]) or maxTokens
    local lastRefill = tonumber(data[2]) or now

    -- Refill tokens
    local elapsed = (now - lastRefill) / 1000
    tokens = math.min(maxTokens, tokens + elapsed * refillRate)

    if tokens >= 1 then
      tokens = tokens - 1
      redis.call('HMSET', key, 'tokens', tokens, 'lastRefill', now)
      redis.call('EXPIRE', key, 3600)
      return 1
    else
      redis.call('HMSET', key, 'tokens', tokens, 'lastRefill', now)
      redis.call('EXPIRE', key, 3600)
      return 0
    end
  `
  const allowed = await redis.eval(script, 1, key, maxTokens, refillRate, now)
  return allowed === 1
}
```

### Sliding Window

```typescript
async function slidingWindow(key: string, limit: number, windowMs: number): Promise<boolean> {
  const now = Date.now()
  const windowStart = now - windowMs

  const pipeline = redis.pipeline()
  pipeline.zremrangebyscore(key, 0, windowStart) // Remove old entries
  pipeline.zadd(key, now, `${now}-${Math.random()}`) // Add current request
  pipeline.zcard(key) // Count entries in window
  pipeline.expire(key, Math.ceil(windowMs / 1000))

  const results = await pipeline.exec()
  const count = results![2][1] as number
  
  if (count > limit) {
    // Remove the entry we just added
    await redis.zremrangebyscore(key, now, now)
    return false
  }
  return true
}
```

## Express Middleware

```typescript
import rateLimit from 'express-rate-limit'
import RedisStore from 'rate-limit-redis'

// Tiered rate limiting for SaaS
const createLimiter = (tier: 'free' | 'pro' | 'enterprise') => {
  const limits = { free: 100, pro: 1000, enterprise: 10000 }
  return rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: limits[tier],
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    store: new RedisStore({ sendCommand: (...args) => redis.call(...args) }),
    keyGenerator: (req) => req.user?.id || req.ip,
    handler: (req, res) => {
      res.status(429).json({
        error: 'Too many requests',
        retryAfter: res.getHeader('Retry-After'),
      })
    },
  })
}
```

## Response Headers (RFC 6585 / draft-7)

```
HTTP/1.1 429 Too Many Requests
Retry-After: 30
RateLimit-Limit: 100
RateLimit-Remaining: 0
RateLimit-Reset: 1685000000
```

## Guidelines

1. **Use Token Bucket** for most APIs — it allows bursts while maintaining average rate
2. **Use Redis** for distributed rate limiting across multiple servers
3. **Set `Retry-After` header** on 429 responses
4. **Tier your limits** by plan (free/pro/enterprise) and endpoint sensitivity
5. **Rate limit by user ID** (authenticated) or IP (unauthenticated)
6. **Apply stricter limits** to auth endpoints (login, password reset)

## Anti-Patterns

- ❌ In-memory rate limiting in multi-server deployments (not shared)
- ❌ Not returning `Retry-After` header on 429 responses
- ❌ Same rate limit for all endpoints (auth endpoints need stricter limits)
- ❌ Rate limiting only by IP (shared IPs, NAT, proxies)
- ❌ Not whitelisting health check endpoints from rate limiting
