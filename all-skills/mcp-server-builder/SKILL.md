---
name: mcp-server-builder
description: >-
  Build custom MCP (Model Context Protocol) servers for AI tool integration.
  Covers server architecture, tool definitions, resource providers, and deployment.
---

# MCP Server Builder

## Overview

The Model Context Protocol (MCP) allows AI agents to use external tools and data sources. This skill covers building custom MCP servers that expose your APIs, databases, and services as tools that AI agents can call.

## When to Use

- Exposing your API as tools for Claude Code, Cursor, or other AI agents
- Creating custom integrations (database queries, file operations, API calls)
- Building internal developer tools accessible from AI coding assistants
- Connecting AI agents to proprietary data sources

## Server Architecture

```typescript
// server.ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js"

const server = new Server(
  { name: "my-mcp-server", version: "1.0.0" },
  { capabilities: { tools: {} } }
)

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "query_database",
      description: "Execute a read-only SQL query against the application database",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string", description: "SQL SELECT query to execute" },
          limit: { type: "number", description: "Max rows to return", default: 100 },
        },
        required: ["query"],
      },
    },
    {
      name: "search_docs",
      description: "Search the documentation for relevant articles",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search query" },
          category: { type: "string", enum: ["api", "guides", "faq"] },
        },
        required: ["query"],
      },
    },
  ],
}))

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params

  switch (name) {
    case "query_database": {
      // Validate it's a SELECT query only
      if (!args.query.trim().toUpperCase().startsWith("SELECT")) {
        return { content: [{ type: "text", text: "Error: Only SELECT queries allowed" }] }
      }
      const results = await db.query(args.query, { limit: args.limit || 100 })
      return { content: [{ type: "text", text: JSON.stringify(results, null, 2) }] }
    }
    case "search_docs": {
      const results = await searchEngine.search(args.query, args.category)
      return { content: [{ type: "text", text: JSON.stringify(results, null, 2) }] }
    }
    default:
      throw new Error(`Unknown tool: ${name}`)
  }
})

// Start server
const transport = new StdioServerTransport()
await server.connect(transport)
```

## Configuration

```json
// claude_desktop_config.json
{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["path/to/server.js"],
      "env": {
        "DATABASE_URL": "postgresql://...",
        "API_KEY": "..."
      }
    }
  }
}
```

## Resource Provider Pattern

```typescript
import { ListResourcesRequestSchema, ReadResourceRequestSchema } from "@modelcontextprotocol/sdk/types.js"

server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    {
      uri: "docs://api/endpoints",
      name: "API Endpoints Documentation",
      mimeType: "text/markdown",
    },
  ],
}))

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params
  if (uri === "docs://api/endpoints") {
    const content = await fs.readFile("docs/api-endpoints.md", "utf-8")
    return { contents: [{ uri, mimeType: "text/markdown", text: content }] }
  }
  throw new Error(`Resource not found: ${uri}`)
})
```

## Guidelines

1. **Define clear tool descriptions** — the AI uses these to decide when to call your tool
2. **Validate all inputs** — never trust tool arguments
3. **Read-only by default** — require explicit confirmation for write operations
4. **Return structured data** — JSON is easier for AI to parse than prose
5. **Handle errors gracefully** — return error messages, don't crash the server
6. **Use environment variables** for secrets — never hardcode

## Anti-Patterns

- ❌ Exposing write/delete operations without safeguards
- ❌ Vague tool descriptions (AI won't know when to use them)
- ❌ Returning huge payloads (keep responses under 10KB)
- ❌ Not validating inputs (SQL injection via tool arguments)
- ❌ Synchronous operations that block the server
