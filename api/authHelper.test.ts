import { describe, it, expect } from 'vitest'
import { extractBearerToken } from './authHelper'

describe('extractBearerToken', () => {
  it('extracts the token from a well-formed Bearer header', () => {
    expect(extractBearerToken('Bearer abc123')).toBe('abc123')
  })

  it('returns null when the header is missing', () => {
    expect(extractBearerToken(undefined)).toBeNull()
  })

  it('returns null when the header lacks the Bearer prefix', () => {
    expect(extractBearerToken('abc123')).toBeNull()
    expect(extractBearerToken('Basic abc123')).toBeNull()
  })

  it('returns null for "Bearer " with no token after it', () => {
    expect(extractBearerToken('Bearer ')).toBeNull()
  })

  it('is case-sensitive on the Bearer prefix, matching the HTTP spec', () => {
    expect(extractBearerToken('bearer abc123')).toBeNull()
  })
})
