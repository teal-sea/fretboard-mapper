// Pure decision logic for api/webhook/polar.ts, split out so it's directly
// unit-testable without mocking the Polar/Clerk SDKs or HTTP plumbing —
// same pattern as src/utils/webmcp.ts's registerWebMcpTools.

const ACTIVE_TYPES = new Set(['subscription.active', 'subscription.created', 'subscription.uncanceled'])
const INACTIVE_TYPES = new Set(['subscription.canceled', 'subscription.revoked'])

export interface SubscriptionUpdate {
  clerkUserId: string
  subscribed: boolean
  polarSubscriptionId: string
}

// Three-way result so the caller can log the "should have mapped to a Clerk
// user but couldn't" case distinctly from "this event just isn't ours to
// act on" — a plain `T | null` return would collapse both into the same
// value and silently drop that distinction.
export type SubscriptionUpdateResult =
  | { kind: 'update'; update: SubscriptionUpdate }
  | { kind: 'missingExternalId'; eventType: string }
  | { kind: 'ignored' }

// Deliberately loose input type: only the two fields this function reads,
// so tests can pass minimal fixtures instead of a full Polar webhook payload.
export function deriveSubscriptionUpdate(event: {
  type: string
  data: { id: string; customer: { externalId?: string | null } }
}): SubscriptionUpdateResult {
  if (!ACTIVE_TYPES.has(event.type) && !INACTIVE_TYPES.has(event.type)) return { kind: 'ignored' }

  const clerkUserId = event.data.customer.externalId
  if (!clerkUserId) return { kind: 'missingExternalId', eventType: event.type }

  return {
    kind: 'update',
    update: {
      clerkUserId,
      subscribed: ACTIVE_TYPES.has(event.type),
      polarSubscriptionId: event.data.id,
    },
  }
}
