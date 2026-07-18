// Vercel serverless function: receives Polar subscription webhooks and
// flips the subscriber flag on the matching Clerk user's publicMetadata.
// This endpoint is the ONLY writer of publicMetadata.subscribed — the
// frontend never sets it directly, so a user can't fake a subscription by
// editing client state.
//
// Body parsing is disabled because signature verification needs the exact
// raw request bytes Polar signed, not a re-serialized JSON.parse() round trip.

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { validateEvent, WebhookVerificationError } from '@polar-sh/sdk/webhooks'
import { createClerkClient } from '@clerk/backend'
import { deriveSubscriptionUpdate } from './deriveSubscriptionUpdate'

export const config = { api: { bodyParser: false } }

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! })

async function readRawBody(req: VercelRequest): Promise<string> {
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  return Buffer.concat(chunks).toString('utf8')
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const rawBody = await readRawBody(req)

  let event
  try {
    event = validateEvent(rawBody, req.headers as Record<string, string>, process.env.POLAR_WEBHOOK_SECRET!)
  } catch (err) {
    if (err instanceof WebhookVerificationError) {
      res.status(403).json({ error: 'Invalid webhook signature' })
      return
    }
    throw err
  }

  // Every subscription.* payload shape carries `data.{id,customer}`; other
  // event types (order.*, product.*, ...) don't, but deriveSubscriptionUpdate
  // checks event.type before touching those fields, so the cast is safe.
  const result = deriveSubscriptionUpdate(event as { type: string; data: { id: string; customer: { externalId?: string | null } } })

  if (result.kind === 'missingExternalId') {
    console.error('Polar webhook: subscription has no externalId, cannot map to a Clerk user', result.eventType)
    res.status(200).json({ received: true, warning: 'no externalId on customer' })
    return
  }

  if (result.kind === 'update') {
    await clerk.users.updateUserMetadata(result.update.clerkUserId, {
      publicMetadata: { subscribed: result.update.subscribed, polarSubscriptionId: result.update.polarSubscriptionId },
    })
  }

  res.status(200).json({ received: true })
}
