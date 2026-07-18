// Vercel serverless function: creates a Polar customer session and returns
// the hosted "manage subscription" portal URL for the logged-in Clerk user.

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { Polar } from '@polar-sh/sdk'
import { verifyToken } from '@clerk/backend'
import { extractBearerToken } from './authHelper'

const polar = new Polar({ accessToken: process.env.POLAR_ACCESS_TOKEN! })

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

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

  try {
    const session = await polar.customerSessions.create({ externalCustomerId: clerkUserId })
    res.status(200).json({ url: session.customerPortalUrl })
  } catch (err) {
    console.error('Polar customer session creation failed', err)
    res.status(502).json({ error: 'Could not create customer portal session. Do you have an active subscription?' })
  }
}
