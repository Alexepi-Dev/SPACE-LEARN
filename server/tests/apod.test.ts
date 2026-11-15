import assert from 'node:assert/strict'
import { once } from 'node:events'
import type { AddressInfo } from 'node:net'
import { test } from 'node:test'
import { createApp } from '../src/app.js'
import { ApiError } from '../src/middleware/apiError.js'
import { createApodService, normalizeApodRecord } from '../src/services/apod.service.js'
import { HttpCache } from '../src/services/httpCache.js'

const imageRecord = {
  date: '2026-11-15',
  title: 'A Sample Astronomy Picture',
  media_type: 'image',
  explanation: '<strong>Explanation:</strong> A distant nebula.<br><br><script>alert(1)</script>',
  permalink: 'https://science.nasa.gov/image-article/sample/',
  url: 'https://science.nasa.gov/image-article/sample/',
  hdurl: 'https://assets.science.nasa.gov/apod/sample.jpg',
  credit: '<a href="javascript:alert(1)">A. Astronomer</a>',
  copyright: 'A. Astronomer',
  alt: 'A nebula against a dark background.',
}

async function withServer(run: (baseUrl: string) => Promise<void>, service: { getPage: () => Promise<unknown> }) {
  const app = createApp({ allowedOrigins: ['https://space-learn.example'] }, service)
  const server = app.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const address = server.address() as AddressInfo

  try {
    await run(`http://127.0.0.1:${address.port}`)
  } finally {
    server.close()
    await once(server, 'close')
  }
}

test('normalizes APOD records, strips markup, extracts video and caches pages', async () => {
  const video = normalizeApodRecord({
    ...imageRecord,
    media_type: 'video',
    hdurl: 'https://assets.science.nasa.gov/apod/poster.jpg',
    basic_html: '<video><source src="https://assets.science.nasa.gov/apod/clip.mp4" type="video/mp4"></video>',
  })

  assert.equal(video.mediaType, 'video')
  assert.equal(video.mediaUrl, 'https://assets.science.nasa.gov/apod/clip.mp4')
  assert.equal(video.previewImageUrl, 'https://assets.science.nasa.gov/apod/poster.jpg')

  let fetchCount = 0
  let requestUrl = ''
  const fetcher: typeof fetch = async (input) => {
    fetchCount += 1
    requestUrl = String(input)
    return new Response(JSON.stringify([imageRecord]), {
      status: 200,
      headers: {
        'content-type': 'application/json',
        'x-wp-total': '9',
        'x-wp-totalpages': '5',
      },
    })
  }
  const service = createApodService(fetcher, new HttpCache(60_000))

  const first = await service.getPage({ page: 2, perPage: 2 })
  const second = await service.getPage({ page: 2, perPage: 2 })

  assert.equal(fetchCount, 1)
  assert.match(requestUrl, /page=2/)
  assert.match(requestUrl, /per_page=2/)
  assert.equal(first.pagination.totalItems, 9)
  assert.equal(first.pagination.totalPages, 5)
  assert.equal(first.pagination.hasPreviousPage, true)
  assert.equal(first.pagination.hasNextPage, true)
  assert.equal(second.items[0].explanation.includes('<script>'), false)
  assert.equal(second.items[0].credit, 'A. Astronomer')
})

test('validates APOD pagination and returns a safe upstream error with CORS restricted', async () => {
  const service = {
    async getPage() {
      throw new ApiError(502, 'NASA_UNAVAILABLE', 'NASA APOD is temporarily unavailable.')
    },
  }

  await withServer(async (baseUrl) => {
    const invalid = await fetch(`${baseUrl}/api/space/apod?page=0`, {
      headers: { origin: 'https://space-learn.example' },
    })
    assert.equal(invalid.status, 400)
    assert.equal(invalid.headers.get('access-control-allow-origin'), 'https://space-learn.example')

    const upstreamFailure = await fetch(`${baseUrl}/api/space/apod?page=1`, {
      headers: { origin: 'https://space-learn.example' },
    })
    assert.equal(upstreamFailure.status, 502)
    assert.deepEqual(await upstreamFailure.json(), {
      error: {
        code: 'NASA_UNAVAILABLE',
        message: 'NASA APOD is temporarily unavailable.',
      },
    })

    const rejectedOrigin = await fetch(`${baseUrl}/api/health`, {
      headers: { origin: 'https://not-allowed.example' },
    })
    assert.equal(rejectedOrigin.headers.get('access-control-allow-origin'), null)
  }, service)
})
