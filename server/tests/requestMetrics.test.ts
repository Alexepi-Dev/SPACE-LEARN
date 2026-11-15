import assert from 'node:assert/strict'
import { once } from 'node:events'
import type { AddressInfo } from 'node:net'
import express from 'express'
import { test } from 'node:test'
import { createRequestMetrics } from '../src/services/requestMetrics.js'

test('request metrics count actual requests and HTTP errors in a rolling hour', async () => {
  let now = Date.UTC(2026, 0, 1, 12)
  const metrics = createRequestMetrics(() => now)
  const app = express()
  app.use(metrics.middleware)
  app.get('/api/ok', (_request, response) => response.sendStatus(200))
  app.get('/api/failure', (_request, response) => response.sendStatus(500))

  const server = app.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const address = server.address() as AddressInfo
  const baseUrl = `http://127.0.0.1:${address.port}`

  try {
    await fetch(`${baseUrl}/api/ok`)
    await fetch(`${baseUrl}/api/missing`)
    await fetch(`${baseUrl}/api/failure`)

    const snapshot = metrics.snapshot()
    assert.equal(snapshot.windowMinutes, 60)
    assert.equal(snapshot.totals.requests, 3)
    assert.equal(snapshot.totals.clientErrors, 1)
    assert.equal(snapshot.totals.serverErrors, 1)
    assert.equal(snapshot.series.reduce((count, bucket) => count + bucket.requests, 0), 3)

    now += 60 * 60 * 1000
    assert.equal(metrics.snapshot().totals.requests, 0)
  } finally {
    server.close()
    await once(server, 'close')
  }
})
