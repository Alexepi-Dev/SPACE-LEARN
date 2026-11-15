import { ApiError } from '../middleware/apiError.js'
import { HttpCache } from './httpCache.js'

const HORIZONS_ENDPOINT = 'https://ssd.jpl.nasa.gov/api/horizons.api'
const REQUEST_TIMEOUT_MS = 6_000
const CACHE_TTL_MS = 15 * 60 * 1000

interface TargetDefinition {
  bodyId: string
  name: string
  command: string
  center: string
  kind: 'planet' | 'moon'
  parentId?: string
}

export interface OrbitalElements {
  bodyId: string
  name: string
  kind: 'planet' | 'moon'
  parentId?: string
  semiMajorAxisAu: number
  eccentricity: number
  inclinationDeg: number
  ascendingNodeDeg: number
  argumentPeriapsisDeg: number
  meanAnomalyDeg: number
  meanMotionDegPerDay: number
}

export interface UnavailableTarget {
  bodyId: string
  name: string
}

export interface SolarSystemEphemeris {
  source: 'NASA/JPL Horizons'
  epochTdb: string
  referenceFrame: 'Ecliptic J2000.0'
  units: {
    distance: 'au'
    angle: 'degree'
    time: 'day'
  }
  elements: OrbitalElements[]
  unavailable: UnavailableTarget[]
}

export interface HorizonsService {
  getEphemeris: (includeMoons?: boolean) => Promise<SolarSystemEphemeris>
}

const PLANETS: TargetDefinition[] = [
  { bodyId: 'mercury', name: 'Mercury', command: '199', center: '500@10', kind: 'planet' },
  { bodyId: 'venus', name: 'Venus', command: '299', center: '500@10', kind: 'planet' },
  { bodyId: 'earth', name: 'Earth', command: '399', center: '500@10', kind: 'planet' },
  { bodyId: 'mars', name: 'Mars', command: '499', center: '500@10', kind: 'planet' },
  { bodyId: 'jupiter', name: 'Jupiter', command: '599', center: '500@10', kind: 'planet' },
  { bodyId: 'saturn', name: 'Saturn', command: '699', center: '500@10', kind: 'planet' },
  { bodyId: 'uranus', name: 'Uranus', command: '799', center: '500@10', kind: 'planet' },
  { bodyId: 'neptune', name: 'Neptune', command: '899', center: '500@10', kind: 'planet' },
]

const MOONS: TargetDefinition[] = [
  { bodyId: 'moon', name: 'Moon', command: '301', center: '500@399', kind: 'moon', parentId: 'earth' },
  { bodyId: 'phobos', name: 'Phobos', command: '401', center: '500@499', kind: 'moon', parentId: 'mars' },
  { bodyId: 'deimos', name: 'Deimos', command: '402', center: '500@499', kind: 'moon', parentId: 'mars' },
  { bodyId: 'io', name: 'Io', command: '501', center: '500@599', kind: 'moon', parentId: 'jupiter' },
  { bodyId: 'europa', name: 'Europa', command: '502', center: '500@599', kind: 'moon', parentId: 'jupiter' },
  { bodyId: 'ganymede', name: 'Ganymede', command: '503', center: '500@599', kind: 'moon', parentId: 'jupiter' },
  { bodyId: 'callisto', name: 'Callisto', command: '504', center: '500@599', kind: 'moon', parentId: 'jupiter' },
  { bodyId: 'enceladus', name: 'Enceladus', command: '602', center: '500@699', kind: 'moon', parentId: 'saturn' },
  { bodyId: 'titan', name: 'Titan', command: '606', center: '500@699', kind: 'moon', parentId: 'saturn' },
  { bodyId: 'triton', name: 'Triton', command: '801', center: '500@899', kind: 'moon', parentId: 'neptune' },
]

const elementCache = new HttpCache<OrbitalElements>(CACHE_TTL_MS, 100)

function getEpochTdb(now: Date): string {
  // TT-UTC is 69.184s at the current 37 leap seconds; update if another is added.
  const ttMilliseconds = now.getTime() + 69_184
  const julianDateTt = ttMilliseconds / 86_400_000 + 2_440_587.5
  const meanAnomaly = (357.53 + 0.9856003 * (julianDateTt - 2_451_545)) * Math.PI / 180
  const tdbMinusTtSeconds = 0.001657 * Math.sin(meanAnomaly) + 0.000022 * Math.sin(2 * meanAnomaly)
  const tdb = new Date(ttMilliseconds + tdbMinusTtSeconds * 1_000)
  const minute = Math.floor(tdb.getUTCMinutes() / 5) * 5
  const epoch = new Date(Date.UTC(
    tdb.getUTCFullYear(),
    tdb.getUTCMonth(),
    tdb.getUTCDate(),
    tdb.getUTCHours(),
    minute,
  ))
  const hour = String(epoch.getUTCHours()).padStart(2, '0')
  const month = String(epoch.getUTCMonth() + 1).padStart(2, '0')
  const day = String(epoch.getUTCDate()).padStart(2, '0')
  return `${epoch.getUTCFullYear()}-${month}-${day} ${hour}:${String(minute).padStart(2, '0')}`
}

function parseElements(responseText: string, target: TargetDefinition): OrbitalElements {
  const dataSection = responseText.split('$$SOE')[1]?.split('$$EOE')[0]
  const row = dataSection?.trim().split(/\r?\n/)[0]
  if (!row) {
    throw new ApiError(502, 'JPL_INVALID_RESPONSE', 'JPL returned no orbital elements for a target.')
  }

  const columns = row.split(',').map((column) => column.trim())
  const valueAt = (index: number) => Number(columns[index])
  const semiMajorAxisAu = valueAt(11)
  const eccentricity = valueAt(2)
  const inclinationDeg = valueAt(4)
  const ascendingNodeDeg = valueAt(5)
  const argumentPeriapsisDeg = valueAt(6)
  const meanMotionDegPerDay = valueAt(8)
  const meanAnomalyDeg = valueAt(9)
  const values = [
    semiMajorAxisAu,
    eccentricity,
    inclinationDeg,
    ascendingNodeDeg,
    argumentPeriapsisDeg,
    meanMotionDegPerDay,
    meanAnomalyDeg,
  ]

  if (
    values.some((value) => !Number.isFinite(value))
    || semiMajorAxisAu <= 0
    || eccentricity < 0
    || eccentricity >= 1
    || meanMotionDegPerDay <= 0
  ) {
    throw new ApiError(502, 'JPL_INVALID_RESPONSE', 'JPL returned invalid orbital elements for a target.')
  }

  return {
    bodyId: target.bodyId,
    name: target.name,
    kind: target.kind,
    ...(target.parentId ? { parentId: target.parentId } : {}),
    semiMajorAxisAu,
    eccentricity,
    inclinationDeg,
    ascendingNodeDeg,
    argumentPeriapsisDeg,
    meanAnomalyDeg,
    meanMotionDegPerDay,
  }
}

async function fetchTargetElements(
  target: TargetDefinition,
  epochTdb: string,
  fetcher: typeof fetch,
): Promise<OrbitalElements> {
  const cacheKey = `${target.bodyId}:${epochTdb}`
  return elementCache.get(cacheKey, async () => {
    const url = new URL(HORIZONS_ENDPOINT)
    const parameters = new URLSearchParams({
      format: 'json',
      COMMAND: `'${target.command}'`,
      OBJ_DATA: "'NO'",
      MAKE_EPHEM: "'YES'",
      EPHEM_TYPE: "'ELEMENTS'",
      CENTER: `'${target.center}'`,
      TLIST: `'${epochTdb}'`,
      TLIST_TYPE: "'CAL'",
      TIME_TYPE: "'TDB'",
      OUT_UNITS: "'AU-D'",
      REF_PLANE: "'ECLIPTIC'",
      CSV_FORMAT: "'YES'",
    })
    url.search = parameters.toString()

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    try {
      const response = await fetcher(url, {
        headers: { accept: 'application/json' },
        signal: controller.signal,
      })
      if (!response.ok) {
        throw new ApiError(502, 'JPL_UPSTREAM_ERROR', 'NASA/JPL Horizons is temporarily unavailable.')
      }

      const payload: unknown = await response.json()
      if (
        !payload
        || typeof payload !== 'object'
        || !('result' in payload)
        || typeof payload.result !== 'string'
        || ('error' in payload && typeof payload.error === 'string')
      ) {
        throw new ApiError(502, 'JPL_INVALID_RESPONSE', 'NASA/JPL Horizons returned an unexpected response.')
      }

      return parseElements(payload.result, target)
    } catch (error) {
      if (error instanceof ApiError) throw error
      if (controller.signal.aborted) {
        throw new ApiError(504, 'JPL_TIMEOUT', 'NASA/JPL Horizons took too long to respond.')
      }
      throw new ApiError(502, 'JPL_UNAVAILABLE', 'NASA/JPL Horizons is temporarily unavailable.')
    } finally {
      clearTimeout(timeout)
    }
  })
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length)
  let nextIndex = 0

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (nextIndex < items.length) {
      const index = nextIndex
      nextIndex += 1
      results[index] = await mapper(items[index])
    }
  }))

  return results
}

export function createHorizonsService(
  fetcher: typeof fetch = fetch,
  now: () => Date = () => new Date(),
): HorizonsService {
  return {
    async getEphemeris(includeMoons = false): Promise<SolarSystemEphemeris> {
      const epochTdb = getEpochTdb(now())
      const targets = includeMoons ? [...PLANETS, ...MOONS] : PLANETS
      const results = await mapWithConcurrency(targets, 2, async (target) => {
        try {
          return { target, elements: await fetchTargetElements(target, epochTdb, fetcher) }
        } catch {
          return { target, elements: null }
        }
      })
      const elements = results.flatMap((result) => result.elements ? [result.elements] : [])
      const unavailable = results
        .filter((result) => result.elements === null)
        .map(({ target }) => ({ bodyId: target.bodyId, name: target.name }))

      if (elements.length === 0) {
        throw new ApiError(502, 'JPL_UNAVAILABLE', 'NASA/JPL orbital data is temporarily unavailable.')
      }

      return {
        source: 'NASA/JPL Horizons',
        epochTdb: `${epochTdb} TDB`,
        referenceFrame: 'Ecliptic J2000.0',
        units: {
          distance: 'au',
          angle: 'degree',
          time: 'day',
        },
        elements,
        unavailable,
      }
    },
  }
}

export const horizonsService = createHorizonsService()
