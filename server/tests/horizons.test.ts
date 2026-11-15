import assert from 'node:assert/strict'
import { once } from 'node:events'
import type { AddressInfo } from 'node:net'
import { test } from 'node:test'
import { createApp } from '../src/app.js'
import { ApiError } from '../src/middleware/apiError.js'
import { createHorizonsService, type SolarSystemEphemeris } from '../src/services/horizons.service.js'

const now = () => new Date('2026-02-03T12:34:30.000Z')

function horizonsResponse() {
  return {
    result: [
      'JPL Horizons test response',
      '$$SOE',
      '2460000.5, A.D. 2026-Feb-03 12:35:00.0000, 1.600000000000000E-02, 9.800000000000000E-01, 2.000000000000000E+00, 3.000000000000000E+01, 4.000000000000000E+01, 2460000.5, 9.800000000000000E-01, 1.000000000000000E+01, 1.100000000000000E+01, 1.000000000000000E+00, 1.020000000000000E+00, 3.650000000000000E+02,',
      '$$EOE',
    ].join('\n'),
  }
}

test('parses and caches JPL elements, then loads major moon elements relative to their planets', async () => {
  const requests: URL[] = []
  const fetcher: typeof fetch = async (input) => {
    requests.push(new URL(String(input)))
    return Response.json(horizonsResponse())
  }
  const service = createHorizonsService(fetcher, now)

  const planets = await service.getEphemeris()
  assert.equal(planets.source, 'NASA/JPL Horizons')
  assert.equal(planets.epochTdb, '2026-02-03 12:35 TDB')
  assert.equal(requests[0].searchParams.get('TLIST'), "'2026-02-03 12:35'")
  assert.equal(requests[0].searchParams.get('TIME_TYPE'), "'TDB'")
  assert.equal(planets.referenceFrame, 'Ecliptic J2000.0')
  assert.equal(planets.elements.length, 8)
  assert.equal(planets.elements.find((body) => body.bodyId === 'earth')?.semiMajorAxisAu, 1)
  assert.equal(requests[0].searchParams.get('EPHEM_TYPE'), "'ELEMENTS'")
  assert.equal(requests[0].searchParams.get('OUT_UNITS'), "'AU-D'")
  assert.equal(requests[0].searchParams.get('REF_PLANE'), "'ECLIPTIC'")

  const cachedPlanets = await service.getEphemeris()
  assert.equal(cachedPlanets.elements.length, 8)
  assert.equal(requests.length, 8)

  const withMoons = await service.getEphemeris(true)
  const moon = withMoons.elements.find((body) => body.bodyId === 'moon')
  assert.equal(withMoons.elements.length, 18)
  assert.equal(moon?.parentId, 'earth')
  assert.equal(moon?.kind, 'moon')
  assert.equal(requests.length, 18)
  assert.equal(
    requests.find((url) => url.searchParams.get('COMMAND') === "'301'")?.searchParams.get('CENTER'),
    "'500@399'",
  )
})

test('reports individual unavailable targets and fails when JPL provides no elements', async () => {
  const secondEpoch = () => new Date('2041-02-03T12:37:00.000Z')
  const partial = createHorizonsService(async (input) => {
    const url = new URL(String(input))
    return url.searchParams.get('COMMAND') === "'199'"
      ? new Response('Unavailable', { status: 503 })
      : Response.json(horizonsResponse())
  }, secondEpoch)
  const result = await partial.getEphemeris()
  assert.equal(result.elements.length, 7)
  assert.deepEqual(result.unavailable, [{ bodyId: 'mercury', name: 'Mercury' }])

  const unavailable = createHorizonsService(async () => new Response('Unavailable', { status: 503 }), () => new Date('2042-02-03T12:37:00.000Z'))
  await assert.rejects(
    unavailable.getEphemeris(),
    (error: unknown) => error instanceof ApiError && error.code === 'JPL_UNAVAILABLE',
  )
})

test('validates the moon query and returns the JPL ephemeris through the space API', async () => {
  let includeMoonsRequested = false
  const ephemeris: SolarSystemEphemeris = {
    source: 'NASA/JPL Horizons',
    epochTdb: '2026-02-03 12:35 TDB',
    referenceFrame: 'Ecliptic J2000.0',
    units: { distance: 'au', angle: 'degree', time: 'day' },
    elements: [],
    unavailable: [],
  }
  const serverApp = createApp(
    { allowedOrigins: ['https://space-learn.example'] },
    undefined,
    {
      async getEphemeris(includeMoons) {
        includeMoonsRequested = includeMoons
        return ephemeris
      },
    },
  )
  const server = serverApp.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const address = server.address() as AddressInfo

  try {
    const invalid = await fetch(`http://127.0.0.1:${address.port}/api/space/solar-system?include_moons=yes`)
    assert.equal(invalid.status, 400)

    const response = await fetch(`http://127.0.0.1:${address.port}/api/space/solar-system?include_moons=true`)
    assert.equal(response.status, 200)
    assert.deepEqual(await response.json(), ephemeris)
    assert.equal(includeMoonsRequested, true)
  } finally {
    server.close()
    await once(server, 'close')
  }
})
