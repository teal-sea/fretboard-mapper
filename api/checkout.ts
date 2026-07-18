// Vercel serverless function: creates a Polar checkout session for the
// logged-in Clerk user and returns the hosted checkout URL to redirect to.
// The secret Polar access token never reaches the browser — see the golden
// rule in CLAUDE.md about keys staying server-side.

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
    const checkout = await polar.checkouts.create({
      products: [process.env.POLAR_PRODUCT_ID!],
      externalCustomerId: clerkUserId,
      successUrl: `${process.env.APP_ORIGIN}/?upgraded=1`,
    })
    res.status(200).json({ url: checkout.url })
  } catch (err) {
    console.error('Polar checkout creation failed', err)
    res.status(502).json({ error: 'Could not create checkout session' })
  }
}
