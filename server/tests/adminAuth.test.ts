import assert from 'node:assert/strict'
import test from 'node:test'
import { ApiError } from '../src/middleware/apiError.js'
import { createAdminToken, createPasswordHash, verifyAdminToken, verifyPassword } from '../src/services/adminAuth.js'

test('administrator password hashes verify without storing plaintext', async () => {
  const hash = await createPasswordHash('a-long-administrator-password')

  assert.notEqual(hash, 'a-long-administrator-password')
  assert.equal(await verifyPassword('a-long-administrator-password', hash), true)
  assert.equal(await verifyPassword('incorrect-password', hash), false)
  assert.equal(await verifyPassword('password', 'invalid'), false)
})

test('administrator tokens are signed and expire after fifteen minutes', () => {
  const now = Date.UTC(2026, 0, 1)
  const session = createAdminToken(
    { email: 'admin@example.org', role: 'superadmin' },
    'a-session-secret-with-more-than-thirty-two-bytes',
    now,
  )

  assert.deepEqual(
    verifyAdminToken(session.token, 'a-session-secret-with-more-than-thirty-two-bytes', now),
    { email: 'admin@example.org', role: 'superadmin' },
  )
  assert.throws(
    () => verifyAdminToken(session.token, 'wrong-session-secret-with-more-than-thirty-two-bytes', now),
    ApiError,
  )
  assert.throws(
    () => verifyAdminToken(session.token, 'a-session-secret-with-more-than-thirty-two-bytes', now + 16 * 60 * 1000),
    ApiError,
  )
})
