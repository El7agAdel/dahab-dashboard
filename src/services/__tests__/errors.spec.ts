import { expect, it } from 'vitest'

import { parseErrorBody } from '@/services/errors'

it('reads the backend error body', () => {
  const error = parseErrorBody(400, {
    success: false,
    message: 'Validation failed',
    error: { code: 'VALIDATION_FAILED', details: { email: ['email must be an email'] } },
    path: '/api/v1/users',
    timestamp: '2026-10-22T10:00:00.000Z',
    requestId: 'req-1',
  })

  expect(error.status).toBe(400)
  expect(error.code).toBe('VALIDATION_FAILED')
  expect(error.message).toBe('Validation failed')
  expect(error.details).toEqual({ email: ['email must be an email'] })
  expect(error.requestId).toBe('req-1')
})

it('survives a non-JSON body', () => {
  const error = parseErrorBody(502, '<html>Bad gateway</html>')

  expect(error.status).toBe(502)
  expect(error.code).toBe('UNKNOWN_ERROR')
})

it('reads Retry-After seconds', () => {
  expect(parseErrorBody(429, {}, '600').retryAfterSeconds).toBe(600)
})
