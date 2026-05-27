---
name: stripe-billing-patterns
description: >-
  Stripe integration patterns for SaaS billing. Covers Checkout, subscriptions,
  webhooks, customer portal, metered billing, and payment error handling.
---

# Stripe Billing Patterns

## Overview

Production patterns for integrating Stripe into SaaS applications. Covers the complete billing lifecycle: checkout → subscription management → usage billing → webhooks → customer portal.

## When to Use

- Implementing subscription billing in a SaaS product
- Processing one-time payments or donations
- Setting up metered/usage-based billing
- Managing customer billing portal and invoices

## Checkout Session

```typescript
// POST /api/checkout
import Stripe from 'stripe'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function createCheckout(userId: string, priceId: string) {
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer_email: user.email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${BASE_URL}/billing?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${BASE_URL}/pricing`,
    metadata: { userId },
    subscription_data: {
      trial_period_days: 14,
      metadata: { userId },
    },
  })
  return session.url
}
```

## Webhook Handler (Critical)

```typescript
// POST /api/webhooks/stripe
export async function handleWebhook(req: Request) {
  const sig = req.headers.get('stripe-signature')!
  const body = await req.text()
  
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    return new Response('Invalid signature', { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      await db.update(users).set({
        stripeCustomerId: session.customer as string,
        subscriptionId: session.subscription as string,
        plan: 'pro',
      }).where(eq(users.id, session.metadata!.userId))
      break
    }
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      await db.update(users).set({
        plan: sub.items.data[0].price.lookup_key ?? 'free',
        subscriptionStatus: sub.status,
      }).where(eq(users.stripeCustomerId, sub.customer as string))
      break
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      await db.update(users).set({
        plan: 'free',
        subscriptionStatus: 'canceled',
      }).where(eq(users.stripeCustomerId, sub.customer as string))
      break
    }
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      // Send dunning email, update UI to show payment issue
      await notifyPaymentFailed(invoice.customer as string)
      break
    }
  }

  return new Response('OK', { status: 200 })
}
```

## Customer Portal

```typescript
// Let customers manage their own billing
const portalSession = await stripe.billingPortal.sessions.create({
  customer: user.stripeCustomerId,
  return_url: `${BASE_URL}/settings/billing`,
})
// Redirect to portalSession.url
```

## Guidelines

1. **Webhooks are the source of truth** — never rely on client-side session data alone
2. **Always verify webhook signatures** — never process unverified events
3. **Use idempotency keys** for all create operations
4. **Store `stripeCustomerId`** on your user model — never re-create customers
5. **Use `lookup_key`** on prices instead of hardcoding price IDs
6. **Handle `invoice.payment_failed`** — implement dunning emails

## Anti-Patterns

- ❌ Trusting the client to report successful payments (always use webhooks)
- ❌ Not verifying webhook signatures
- ❌ Hardcoding price IDs (use lookup keys)
- ❌ Not handling subscription cancellation gracefully
- ❌ Forgetting to handle trial expirations
- ❌ Skipping idempotency keys for create operations
