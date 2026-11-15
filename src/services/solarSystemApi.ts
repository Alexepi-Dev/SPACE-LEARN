import { z } from 'zod'
import { apiGet } from './api'

const orbitalElementsSchema = z.object({
  bodyId: z.string(),
  name: z.string(),
  kind: z.enum(['planet', 'moon']),
  parentId: z.string().optional(),
  semiMajorAxisAu: z.number().positive(),
  eccentricity: z.number().min(0).max(0.999999),
  inclinationDeg: z.number(),
  ascendingNodeDeg: z.number(),
  argumentPeriapsisDeg: z.number(),
  meanAnomalyDeg: z.number(),
  meanMotionDegPerDay: z.number().positive(),
}).strict()

const solarSystemSchema = z.object({
  source: z.literal('NASA/JPL Horizons'),
  epochTdb: z.string(),
  referenceFrame: z.literal('Ecliptic J2000.0'),
  units: z.object({
    distance: z.literal('au'),
    angle: z.literal('degree'),
    time: z.literal('day'),
  }).strict(),
  elements: z.array(orbitalElementsSchema),
  unavailable: z.array(z.object({
    bodyId: z.string(),
    name: z.string(),
  }).strict()),
}).strict()

export type OrbitalElements = z.infer<typeof orbitalElementsSchema>
export type SolarSystemEphemeris = z.infer<typeof solarSystemSchema>

export function getSolarSystemEphemeris(includeMoons: boolean, signal?: AbortSignal) {
  const query = new URLSearchParams({ include_moons: String(includeMoons) })
  return apiGet(`/api/space/solar-system?${query}`, solarSystemSchema, signal)
}
