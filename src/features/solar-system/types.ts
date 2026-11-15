import type { OrbitalElements } from '../../services/solarSystemApi'

export type LanguageCopy = {
  fr: string
  en: string
}

export interface CelestialProfile {
  id: string
  name: LanguageCopy
  category: 'star' | 'planet' | 'moon'
  diameterKm: number
  massKg?: number
  rotationPeriodDays?: number
  orbitalPeriodDays?: number
  axialTiltDeg?: number
  moonCount?: number
  moonCountNote?: LanguageCopy
  temperature?: LanguageCopy
  atmosphere: LanguageCopy
  highlight: LanguageCopy
  sourceUrl: string
  texture?: string
  textureColor?: string
  parentId?: string
  physicalRadiusKm: number
}

export interface RenderedBody {
  profile: CelestialProfile
  elements?: OrbitalElements
}

export type ScaleMode = 'pedagogical' | 'scientific'
