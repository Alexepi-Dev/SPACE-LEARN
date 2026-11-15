import assert from 'node:assert/strict'
import { once } from 'node:events'
import type { AddressInfo } from 'node:net'
import { test } from 'node:test'
import { createApp } from '../src/app.js'
import { createAdminToken } from '../src/services/adminAuth.js'

async function withServer(
  config: Parameters<typeof createApp>[0],
  run: (baseUrl: string) => Promise<void>,
) {
  const server = createApp(config).listen(0, '127.0.0.1')
  await once(server, 'listening')
  const address = server.address() as AddressInfo
  try {
    await run(`http://127.0.0.1:${address.port}`)
  } finally {
    server.close()
    await once(server, 'close')
  }
}

test('admin endpoints require a signed session and incomplete bootstrap config is explicit', async () => {
  const secret = 'a-session-secret-with-more-than-thirty-two-bytes'
  await withServer({ allowedOrigins: [], adminSessionSecret: secret }, async (baseUrl) => {
    const denied = await fetch(`${baseUrl}/api/admin/overview`)
    assert.equal(denied.status, 401)
    assert.equal((await denied.json()).error.code, 'ADMIN_UNAUTHORIZED')

    const login = await fetch(`${baseUrl}/api/admin/session`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.org', password: 'a-long-password' }),
    })
    assert.equal(login.status, 503)
    assert.equal((await login.json()).error.code, 'ADMIN_NOT_CONFIGURED')
  })
})

test('a valid super-admin token fails closed when persistent audit storage is unavailable', async () => {
  const secret = 'a-session-secret-with-more-than-thirty-two-bytes'
  const token = createAdminToken({ email: 'admin@example.org', role: 'superadmin' }, secret).token

  await withServer({ allowedOrigins: [], adminSessionSecret: secret }, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/admin/overview`, {
      headers: { authorization: `Bearer ${token}` },
    })
    assert.equal(response.status, 503)
    assert.equal((await response.json()).error.code, 'ADMIN_AUDIT_UNAVAILABLE')
  })
})
