// Vercel serverless function: cross-device sync of favorites/streak/prefs
// for subscribed users only. GET returns the saved state (or {} if none
// yet); POST upserts it. The subscribed flag is read from Clerk — never
// trust a client-supplied "am I subscribed" claim.

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { verifyToken, createClerkClient } from '@clerk/backend'
import { neon } from '@neondatabase/serverless'
import { extractBearerToken } from './_auth'

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! })
const sql = neon(process.env.DATABASE_URL!)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const token = extractBearerToken(req.headers.authorization)
  if (!token) {
    res.status(401).json({ error: 'Missing session token' })
    return
  }

  let clerkUserId: string
  try {
    const claims = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY! })
    clerkUserId = claims.sub
  } catch {
    res.status(401).json({ error: 'Invalid session token' })
    return
  }

  const user = await clerk.users.getUser(clerkUserId)
  if (user.publicMetadata?.subscribed !== true) {
    res.status(403).json({ error: 'Sync is a subscriber feature' })
    return
  }

  if (req.method === 'GET') {
    const rows = await sql`select app_state from user_data where clerk_user_id = ${clerkUserId}`
    res.status(200).json({ appState: rows[0]?.app_state ?? null })
    return
  }

  if (req.method === 'POST') {
    const body = req.body as unknown
    if (typeof body !== 'object' || body === null) {
      res.status(400).json({ error: 'Body must be a JSON object' })
      return
    }
    await sql`
      insert into user_data (clerk_user_id, app_state)
      values (${clerkUserId}, ${JSON.stringify(body)})
      on conflict (clerk_user_id)
      do update set app_state = excluded.app_state
    `
    res.status(200).json({ ok: true })
    return
  }

  res.status(405).json({ error: 'Method not allowed' })
}
