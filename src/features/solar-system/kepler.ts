import type { OrbitalElements } from '../../services/solarSystemApi'
import type { ScaleMode } from './types'

const DEGREES_TO_RADIANS = Math.PI / 180
const AU_TO_KILOMETERS = 149_597_870.7
const SCIENTIFIC_AU_SCALE = 3

export interface Vector3Tuple {
  x: number
  y: number
  z: number
}

export function getPositionAu(elements: OrbitalElements, elapsedDays: number): Vector3Tuple {
  const meanAnomaly = ((elements.meanAnomalyDeg + elements.meanMotionDegPerDay * elapsedDays) % 360)
    * DEGREES_TO_RADIANS
  let eccentricAnomaly = meanAnomaly

  for (let iteration = 0; iteration < 8; iteration += 1) {
    const correction = (eccentricAnomaly - elements.eccentricity * Math.sin(eccentricAnomaly) - meanAnomaly)
      / (1 - elements.eccentricity * Math.cos(eccentricAnomaly))
    eccentricAnomaly -= correction
  }

  const xOrbit = elements.semiMajorAxisAu * (Math.cos(eccentricAnomaly) - elements.eccentricity)
  const yOrbit = elements.semiMajorAxisAu
    * Math.sqrt(1 - elements.eccentricity ** 2)
    * Math.sin(eccentricAnomaly)
  const argument = elements.argumentPeriapsisDeg * DEGREES_TO_RADIANS
  const inclination = elements.inclinationDeg * DEGREES_TO_RADIANS
  const ascendingNode = elements.ascendingNodeDeg * DEGREES_TO_RADIANS
  const xPeriapsis = Math.cos(argument) * xOrbit - Math.sin(argument) * yOrbit
  const yPeriapsis = Math.sin(argument) * xOrbit + Math.cos(argument) * yOrbit
  const yInclined = Math.cos(inclination) * yPeriapsis
  const zInclined = Math.sin(inclination) * yPeriapsis

  return {
    x: Math.cos(ascendingNode) * xPeriapsis - Math.sin(ascendingNode) * yInclined,
    y: Math.sin(ascendingNode) * xPeriapsis + Math.cos(ascendingNode) * yInclined,
    z: zInclined,
  }
}

export function toWorldCoordinates(position: Vector3Tuple): Vector3Tuple {
  return { x: position.x, y: position.z, z: -position.y }
}

export function planetScenePosition(
  elements: OrbitalElements,
  elapsedDays: number,
  scaleMode: ScaleMode,
): Vector3Tuple {
  const world = toWorldCoordinates(getPositionAu(elements, elapsedDays))
  if (scaleMode === 'scientific') {
    return {
      x: world.x * SCIENTIFIC_AU_SCALE,
      y: world.y * SCIENTIFIC_AU_SCALE,
      z: world.z * SCIENTIFIC_AU_SCALE,
    }
  }

  const radius = Math.hypot(world.x, world.y, world.z)
  const compressedRadius = Math.log1p(radius) * 2.1
  const compression = radius === 0 ? 0 : compressedRadius / radius
  return {
    x: world.x * compression,
    y: world.y * compression,
    z: world.z * compression,
  }
}

export function moonScenePosition(
  elements: OrbitalElements,
  elapsedDays: number,
  scaleMode: ScaleMode,
  parentPosition: Vector3Tuple,
  parentRadius: number,
): Vector3Tuple {
  const offset = toWorldCoordinates(getPositionAu(elements, elapsedDays))

  if (scaleMode === 'scientific') {
    return {
      x: parentPosition.x + offset.x * SCIENTIFIC_AU_SCALE,
      y: parentPosition.y + offset.y * SCIENTIFIC_AU_SCALE,
      z: parentPosition.z + offset.z * SCIENTIFIC_AU_SCALE,
    }
  }

  const actualRadius = Math.hypot(offset.x, offset.y, offset.z) * 180
  const displayRadius = Math.max(actualRadius, parentRadius * 2.2)
  const ratio = actualRadius === 0 ? 0 : displayRadius / actualRadius
  return {
    x: parentPosition.x + offset.x * 180 * ratio,
    y: parentPosition.y + offset.y * 180 * ratio,
    z: parentPosition.z + offset.z * 180 * ratio,
  }
}

export function bodySceneRadius(
  radiusKm: number,
  scaleMode: ScaleMode,
  isSun = false,
): number {
  if (scaleMode === 'scientific') {
    return (radiusKm / AU_TO_KILOMETERS) * SCIENTIFIC_AU_SCALE
  }
  if (isSun) return 0.31
  const earthRadiusRatio = radiusKm / 6_378.1366
  return Math.max(0.035, 0.105 * Math.pow(earthRadiusRatio, 0.36))
}

export function getOrbitPoints(
  elements: OrbitalElements,
  scaleMode: ScaleMode,
  parentPosition?: Vector3Tuple,
  parentRadius = 0,
): Vector3Tuple[] {
  return Array.from({ length: 129 }, (_, index) => {
    const anomalyOffset = (index / 128) * 360 - elements.meanAnomalyDeg
    const days = anomalyOffset / elements.meanMotionDegPerDay
    if (!parentPosition) return planetScenePosition(elements, days, scaleMode)
    return moonScenePosition(elements, days, scaleMode, parentPosition, parentRadius)
  })
}
