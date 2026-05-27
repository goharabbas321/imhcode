---
name: responsive-email-templates
description: >-
  HTML email design patterns using React Email and MJML. Covers responsive layouts,
  dark mode support, cross-client compatibility, and transactional email design.
---

# Responsive Email Templates

## Overview

Email HTML is notoriously different from web HTML due to inconsistent client rendering engines. This skill covers modern approaches to email design using React Email and MJML, ensuring cross-client compatibility with Gmail, Outlook, Apple Mail, and mobile clients.

## When to Use

- Building transactional emails (welcome, password reset, receipts)
- Creating marketing email templates
- Setting up automated email pipelines with consistent branding
- Need responsive emails that work across all major email clients

## React Email (Recommended)

```tsx
import { Html, Head, Body, Container, Section, Text, Button, Img, Hr } from "@react-email/components"

export function WelcomeEmail({ name, ctaUrl }) {
  return (
    <Html>
      <Head />
      <Body style={body}>
        <Container style={container}>
          <Img src="https://example.com/logo.png" width={120} height={40} alt="Logo" />
          <Section style={section}>
            <Text style={heading}>Welcome, {name}!</Text>
            <Text style={paragraph}>
              Thanks for signing up. Get started by completing your profile.
            </Text>
            <Button style={button} href={ctaUrl}>
              Complete Profile
            </Button>
          </Section>
          <Hr style={divider} />
          <Text style={footer}>© 2026 Your Company. All rights reserved.</Text>
        </Container>
      </Body>
    </Html>
  )
}

const body = { backgroundColor: "#f6f9fc", fontFamily: "'Inter', Arial, sans-serif" }
const container = { maxWidth: "600px", margin: "0 auto", padding: "20px" }
const section = { backgroundColor: "#ffffff", borderRadius: "8px", padding: "32px" }
const heading = { fontSize: "24px", fontWeight: "700", color: "#1a1a2e" }
const paragraph = { fontSize: "16px", lineHeight: "1.6", color: "#4a5568" }
const button = { backgroundColor: "#6366f1", color: "#ffffff", padding: "12px 24px", borderRadius: "6px", textDecoration: "none", fontWeight: "600" }
const divider = { borderColor: "#e2e8f0", margin: "24px 0" }
const footer = { fontSize: "12px", color: "#9ca3af", textAlign: "center" }
```

### Preview & Send

```bash
# Install
npm install @react-email/components react-email

# Dev server with live preview
npx react-email dev

# Render to HTML string
import { render } from "@react-email/render"
const html = await render(<WelcomeEmail name="Gohar" ctaUrl="https://example.com" />)
```

## MJML Alternative

```xml
<mjml>
  <mj-body background-color="#f6f9fc">
    <mj-section background-color="#ffffff" border-radius="8px" padding="32px">
      <mj-column>
        <mj-image src="https://example.com/logo.png" width="120px" />
        <mj-text font-size="24px" font-weight="700">Welcome!</mj-text>
        <mj-text font-size="16px" line-height="1.6">
          Thanks for signing up.
        </mj-text>
        <mj-button background-color="#6366f1" border-radius="6px" href="https://example.com">
          Get Started
        </mj-button>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
```

## Guidelines

1. **Use React Email** for TypeScript projects — components are testable and type-safe
2. **Inline all styles** — most email clients strip `<style>` tags
3. **Max width 600px** — standard for email readability
4. **Use web-safe fonts** as fallbacks (Arial, Helvetica, Georgia)
5. **Test across clients** using Litmus or Email on Acid
6. **Dark mode support** — use `@media (prefers-color-scheme: dark)` where supported

## Anti-Patterns

- ❌ Using modern CSS (flexbox, grid, variables) in emails
- ❌ External stylesheets (most clients block them)
- ❌ Background images without VML fallback for Outlook
- ❌ Images without alt text
- ❌ Not testing in Outlook (it uses Word's rendering engine!)
