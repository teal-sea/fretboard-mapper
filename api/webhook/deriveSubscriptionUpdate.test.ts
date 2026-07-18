import { describe, it, expect } from 'vitest'
import { deriveSubscriptionUpdate } from './deriveSubscriptionUpdate'

// No default value for externalId: a default parameter silently substitutes
// for an explicitly-passed `undefined`, which would make the "missing
// externalId" tests below accidentally pass a real id instead.
const event = (type: string, externalId: string | null | undefined) => ({
  type,
  data: { id: 'sub_abc', customer: { externalId } },
})
const eventWithId = (type: string) => event(type, 'user_clerk123')

describe('deriveSubscriptionUpdate', () => {
  it.each(['subscription.active', 'subscription.created', 'subscription.uncanceled'])(
    'marks subscribed=true on %s',
    (type) => {
      const result = deriveSubscriptionUpdate(eventWithId(type))
      expect(result).toEqual({
        kind: 'update',
        update: { clerkUserId: 'user_clerk123', subscribed: true, polarSubscriptionId: 'sub_abc' },
      })
    },
  )

  it.each(['subscription.canceled', 'subscription.revoked'])('marks subscribed=false on %s', (type) => {
    const result = deriveSubscriptionUpdate(eventWithId(type))
    expect(result).toEqual({
      kind: 'update',
      update: { clerkUserId: 'user_clerk123', subscribed: false, polarSubscriptionId: 'sub_abc' },
    })
  })

  it('ignores event types this endpoint has no business acting on', () => {
    expect(deriveSubscriptionUpdate(eventWithId('order.paid'))).toEqual({ kind: 'ignored' })
    expect(deriveSubscriptionUpdate(eventWithId('subscription.updated'))).toEqual({ kind: 'ignored' })
    expect(deriveSubscriptionUpdate(eventWithId('product.created'))).toEqual({ kind: 'ignored' })
  })

  it('flags a relevant event with no externalId instead of silently dropping it', () => {
    expect(deriveSubscriptionUpdate(event('subscription.active', null))).toEqual({
      kind: 'missingExternalId',
      eventType: 'subscription.active',
    })
    expect(deriveSubscriptionUpdate(event('subscription.active', undefined))).toEqual({
      kind: 'missingExternalId',
      eventType: 'subscription.active',
    })
  })

  it('never treats a missing externalId on an ignored event type as an error', () => {
    expect(deriveSubscriptionUpdate(event('order.paid', null))).toEqual({ kind: 'ignored' })
  })
})
