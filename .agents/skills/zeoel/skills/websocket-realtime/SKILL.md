---
name: websocket-realtime
description: >-
  WebSocket and Server-Sent Events (SSE) patterns for real-time features. Covers
  connection management, rooms, broadcasting, reconnection, and scaling strategies.
---

# WebSocket & Realtime Patterns

## Overview

Patterns for implementing real-time features using WebSockets and Server-Sent Events (SSE). Covers bidirectional communication, event broadcasting, room/channel management, reconnection strategies, and horizontal scaling.

## When to Use

- Chat applications, collaborative editing, live dashboards
- Real-time notifications and presence indicators
- Live data feeds (stock prices, sports scores, IoT)
- Server push for long-running operations (progress bars, build logs)

## WebSocket Server (Node.js)

```typescript
import { WebSocketServer, WebSocket } from 'ws'

const wss = new WebSocketServer({ port: 8080 })

// Room management
const rooms = new Map<string, Set<WebSocket>>()

wss.on('connection', (ws, req) => {
  const userId = authenticateFromHeaders(req.headers)

  ws.on('message', (data) => {
    const message = JSON.parse(data.toString())
    
    switch (message.type) {
      case 'join_room':
        joinRoom(message.room, ws)
        break
      case 'broadcast':
        broadcastToRoom(message.room, message.payload, ws)
        break
      case 'ping':
        ws.send(JSON.stringify({ type: 'pong' }))
        break
    }
  })

  ws.on('close', () => {
    removeFromAllRooms(ws)
  })
})

function joinRoom(room: string, ws: WebSocket) {
  if (!rooms.has(room)) rooms.set(room, new Set())
  rooms.get(room)!.add(ws)
}

function broadcastToRoom(room: string, payload: any, sender: WebSocket) {
  const clients = rooms.get(room)
  if (!clients) return
  const message = JSON.stringify({ type: 'message', payload })
  clients.forEach(client => {
    if (client !== sender && client.readyState === WebSocket.OPEN) {
      client.send(message)
    }
  })
}
```

## Server-Sent Events (SSE) — One-Way Push

```typescript
// Server (Next.js API route)
export async function GET(req: Request) {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()
      
      const sendEvent = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      // Send heartbeat every 30s
      const heartbeat = setInterval(() => sendEvent({ type: 'ping' }), 30000)

      // Subscribe to your event source
      const unsubscribe = eventEmitter.on('update', sendEvent)

      req.signal.addEventListener('abort', () => {
        clearInterval(heartbeat)
        unsubscribe()
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
```

```typescript
// Client
const source = new EventSource('/api/events')
source.onmessage = (event) => {
  const data = JSON.parse(event.data)
  handleUpdate(data)
}
source.onerror = () => {
  // EventSource auto-reconnects
}
```

## Client Reconnection Pattern

```typescript
class ReconnectingWebSocket {
  private ws: WebSocket | null = null
  private reconnectDelay = 1000
  private maxDelay = 30000

  connect(url: string) {
    this.ws = new WebSocket(url)
    
    this.ws.onopen = () => {
      this.reconnectDelay = 1000 // Reset on success
    }

    this.ws.onclose = () => {
      // Exponential backoff with jitter
      const jitter = Math.random() * 1000
      setTimeout(() => this.connect(url), this.reconnectDelay + jitter)
      this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxDelay)
    }
  }
}
```

## When to Use What

| Feature | WebSocket | SSE |
|---|---|---|
| Direction | Bidirectional | Server → Client only |
| Protocol | ws:// / wss:// | HTTP |
| Auto-reconnect | Manual | Built-in |
| Binary data | ✅ | ❌ (text only) |
| Use case | Chat, games, collaboration | Notifications, live feeds, progress |

## Guidelines

1. **Use SSE for one-way push** — simpler than WebSocket, auto-reconnects
2. **Use WebSocket for bidirectional** — chat, games, collaborative editing
3. **Implement heartbeats** to detect dead connections
4. **Use exponential backoff** with jitter for reconnection
5. **Authenticate on connection** — not on every message
6. **Use Redis pub/sub** for horizontal scaling across multiple servers

## Anti-Patterns

- ❌ Polling when WebSocket/SSE is appropriate
- ❌ Not implementing reconnection logic
- ❌ Sending auth tokens in every message (authenticate once on connect)
- ❌ Not handling backpressure (slow clients)
- ❌ Using WebSocket when SSE would suffice
