import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createDeepLTranslator } from '../src/services/deepl.service.js'
import { HttpCache } from '../src/services/httpCache.js'

test('sends DeepL credentials on the server and caches successful translations', async () => {
  let fetchCount = 0
  let authorization = ''
  let body: URLSearchParams | undefined
  const translator = createDeepLTranslator(
    { authKey: 'server-only-key' },
    async (_input, init) => {
      fetchCount += 1
      authorization = new Headers(init?.headers).get('authorization') ?? ''
      body = new URLSearchParams(init?.body as URLSearchParams)
      return new Response(JSON.stringify({
        translations: body.getAll('text').map((text) => ({ text: `FR: ${text}` })),
      }), { status: 200, headers: { 'content-type': 'application/json' } })
    },
    new HttpCache(60_000),
  )

  const first = await translator.translate(['A star', 'A planet'])
  const second = await translator.translate(['A star', 'A planet'])

  assert.deepEqual(first, ['FR: A star', 'FR: A planet'])
  assert.deepEqual(second, first)
  assert.equal(authorization, 'DeepL-Auth-Key server-only-key')
  assert.equal(body?.get('target_lang'), 'FR')
  assert.equal(fetchCount, 1)
})

test('splits requests at DeepL item limits and fails explicitly when unconfigured', async () => {
  let requestCount = 0
  const translator = createDeepLTranslator(
    { authKey: 'server-only-key' },
    async (_input, init) => {
      requestCount += 1
      const body = new URLSearchParams(init?.body as URLSearchParams)
      return new Response(JSON.stringify({
        translations: body.getAll('text').map((text) => ({ text: `FR: ${text}` })),
      }), { status: 200, headers: { 'content-type': 'application/json' } })
    },
    new HttpCache(60_000),
  )

  const translations = await translator.translate(Array.from({ length: 51 }, (_, index) => `Text ${index}`))
  assert.equal(translations.length, 51)
  assert.equal(requestCount, 2)

  await assert.rejects(
    createDeepLTranslator({}).translate(['A star']),
    { code: 'DEEPL_NOT_CONFIGURED' },
  )
})
