---
name: oauth2-auth-patterns
description: >-
  OAuth 2.0 and OpenID Connect authentication patterns. Covers authorization code
  flow, PKCE, JWT, session management, and provider integration.
---

# OAuth2 & Authentication Patterns

## Overview

Production patterns for implementing authentication using OAuth 2.0, OpenID Connect, JWT, and session-based auth. Covers social login integration, token management, and security best practices.

## When to Use

- Implementing "Sign in with Google/GitHub/Apple"
- Building custom auth with JWT + refresh tokens
- Session-based authentication for server-rendered apps
- Multi-tenant applications with SSO

## Authorization Code Flow with PKCE

```typescript
// 1. Generate PKCE challenge
function generatePKCE() {
  const verifier = crypto.randomBytes(32).toString('base64url')
  const challenge = crypto.createHash('sha256').update(verifier).digest('base64url')
  return { verifier, challenge }
}

// 2. Redirect to provider
app.get('/auth/login', (req, res) => {
  const { verifier, challenge } = generatePKCE()
  req.session.codeVerifier = verifier

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: 'openid profile email',
    state: crypto.randomBytes(16).toString('hex'),
    code_challenge: challenge,
    code_challenge_method: 'S256',
  })

  res.redirect(`https://provider.com/authorize?${params}`)
})

// 3. Handle callback
app.get('/auth/callback', async (req, res) => {
  const { code, state } = req.query

  // Exchange code for tokens
  const tokenResponse = await fetch('https://provider.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: code as string,
      redirect_uri: REDIRECT_URI,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code_verifier: req.session.codeVerifier,
    }),
  })

  const { access_token, id_token, refresh_token } = await tokenResponse.json()
  // Verify id_token, create session, store refresh_token securely
})
```

## JWT Pattern

```typescript
import jwt from 'jsonwebtoken'

// Create tokens
function createTokens(userId: string) {
  const accessToken = jwt.sign(
    { sub: userId, type: 'access' },
    process.env.JWT_SECRET!,
    { expiresIn: '15m' }
  )
  
  const refreshToken = jwt.sign(
    { sub: userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: '7d' }
  )

  return { accessToken, refreshToken }
}

// Verify middleware
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'No token' })

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!)
    req.user = payload
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

// Refresh endpoint
app.post('/auth/refresh', async (req, res) => {
  const { refreshToken } = req.body
  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!)
    // Check if refresh token is revoked (stored in DB or Redis)
    const isRevoked = await checkRevoked(refreshToken)
    if (isRevoked) return res.status(401).json({ error: 'Token revoked' })

    const tokens = createTokens(payload.sub)
    // Rotate: revoke old refresh token
    await revokeToken(refreshToken)
    res.json(tokens)
  } catch {
    return res.status(401).json({ error: 'Invalid refresh token' })
  }
})
```

## Guidelines

1. **Always use PKCE** for authorization code flow (even for confidential clients)
2. **Short-lived access tokens** (15 min), long-lived refresh tokens (7 days)
3. **Rotate refresh tokens** — revoke the old one when issuing a new one
4. **Store refresh tokens server-side** (database or Redis), never in localStorage
5. **Use `httpOnly`, `secure`, `sameSite` cookies** for web session tokens
6. **Verify `id_token` signature** before trusting claims

## Anti-Patterns

- ❌ Storing JWTs in localStorage (XSS vulnerable)
- ❌ Long-lived access tokens (use refresh tokens instead)
- ❌ Not rotating refresh tokens (allows stolen tokens to persist)
- ❌ Skipping PKCE ("my app is server-side so I don't need it")
- ❌ Putting sensitive data in JWT payload (it's base64, not encrypted)
