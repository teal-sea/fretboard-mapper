// Shared by every api/*.ts endpoint that needs the caller's Clerk session
// token — pure string parsing, no I/O, so it's directly unit-testable
// without mocking fetch/Vercel/Clerk. req.headers.authorization is always
// `string | undefined`, never an array (see @types/node's IncomingHttpHeaders).
export function extractBearerToken(authHeader: string | undefined): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null
  const token = authHeader.slice(7)
  return token.length > 0 ? token : null
}
