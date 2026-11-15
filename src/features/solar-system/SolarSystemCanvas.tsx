import { Html, Line, OrbitControls, Stars, useTexture } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Component, Suspense, useMemo, useRef, type MutableRefObject, type ReactNode, type RefObject } from 'react'
import { DoubleSide, SRGBColorSpace, type Group, type Mesh } from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import type { OrbitalElements } from '../../services/solarSystemApi'
import { bodySceneRadius, getOrbitPoints, moonScenePosition, planetScenePosition } from './kepler'
import type { CelestialProfile, RenderedBody, ScaleMode } from './types'

interface SolarSystemCanvasProps {
  planets: RenderedBody[]
  moons: RenderedBody[]
  sun: CelestialProfile
  selectedId: string
  scaleMode: ScaleMode
  paused: boolean
  speed: number
  showOrbits: boolean
  focusRequest: number
  resetRequest: number
  language: 'fr' | 'en'
  onElapsedDaysChange: (days: number) => void
  onSelect: (id: string) => void
  fallbackMessage: string
}

interface SceneProps extends SolarSystemCanvasProps {
  elapsedDaysRef: MutableRefObject<number>
}

const ORIGIN = { x: 0, y: 0, z: 0 }

export function SolarSystemCanvas(props: SolarSystemCanvasProps) {
  const elapsedDaysRef = useRef(0)

  return (
    <SceneErrorBoundary fallbackMessage={props.fallbackMessage}>
      <Canvas
        className="!absolute inset-0"
        camera={{ position: [0, 7, 17], fov: 42, near: 0.00001, far: 2_000 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, powerPreference: 'low-power' }}
        fallback={<div className="absolute inset-0 grid place-items-center p-6 text-center text-sm text-slate-200">{props.fallbackMessage}</div>}
      >
        <Suspense fallback={null}>
          <SceneContents {...props} elapsedDaysRef={elapsedDaysRef} />
        </Suspense>
      </Canvas>
    </SceneErrorBoundary>
  )
}

class SceneErrorBoundary extends Component<
  { fallbackMessage: string; children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    console.error('[simulator] 3D scene failed to render', { name: error.name })
  }

  render() {
    if (this.state.hasError) {
      return <div className="absolute inset-0 grid place-items-center p-6 text-center text-sm text-slate-200">{this.props.fallbackMessage}</div>
    }
    return this.props.children
  }
}

function SceneContents({
  planets,
  moons,
  sun,
  selectedId,
  scaleMode,
  paused,
  speed,
  showOrbits,
  focusRequest,
  resetRequest,
  language,
  onElapsedDaysChange,
  onSelect,
  elapsedDaysRef,
}: SceneProps) {
  const controlsRef = useRef<OrbitControlsImpl | null>(null)
  const lastReportedAt = useRef(0)
  const lastFocusKey = useRef('')
  const initialPositions = useMemo(() => {
    const result = new Map<string, { x: number; y: number; z: number }>([['sun', ORIGIN]])
    for (const body of planets) {
      if (body.elements) result.set(body.profile.id, planetScenePosition(body.elements, 0, scaleMode))
    }
    for (const body of moons) {
      if (!body.elements || !body.profile.parentId) continue
      const parent = planets.find((planet) => planet.profile.id === body.profile.parentId)
      const parentPosition = result.get(body.profile.parentId)
      if (!parent || !parentPosition) continue
      result.set(
        body.profile.id,
        moonScenePosition(
          body.elements,
          0,
          scaleMode,
          parentPosition,
          bodySceneRadius(parent.profile.physicalRadiusKm, scaleMode),
        ),
      )
    }
    return result
  }, [planets, moons, scaleMode])
  const positions = useRef(initialPositions)
  const { camera } = useThree()

  useFrame((state, delta) => {
    if (!paused) elapsedDaysRef.current += Math.min(delta, 0.1) * speed

    const elapsedDays = elapsedDaysRef.current
    const nextPositions = new Map<string, { x: number; y: number; z: number }>()
    nextPositions.set('sun', { x: 0, y: 0, z: 0 })

    for (const body of planets) {
      if (body.elements) {
        nextPositions.set(body.profile.id, planetScenePosition(body.elements, elapsedDays, scaleMode))
      }
    }

    for (const body of moons) {
      if (!body.elements || !body.profile.parentId) continue
      const parent = planets.find((planet) => planet.profile.id === body.profile.parentId)
      const parentPosition = nextPositions.get(body.profile.parentId)
      if (!parent || !parentPosition) continue
      const parentRadius = bodySceneRadius(parent.profile.physicalRadiusKm, scaleMode)
      nextPositions.set(
        body.profile.id,
        moonScenePosition(body.elements, elapsedDays, scaleMode, parentPosition, parentRadius),
      )
    }
    positions.current = nextPositions

    const focusKey = `${selectedId}:${scaleMode}:${focusRequest}`
    if (selectedId && focusKey !== lastFocusKey.current) {
      const position = nextPositions.get(selectedId)
      const profile = [...planets, ...moons].find((body) => body.profile.id === selectedId)?.profile
      if (position && profile && controlsRef.current) {
        const radius = bodySceneRadius(profile.physicalRadiusKm, scaleMode, profile.category === 'star')
        const distance = scaleMode === 'scientific' ? Math.max(radius * 18, 0.002) : Math.max(radius * 9, 1.1)
        controlsRef.current.target.set(position.x, position.y, position.z)
        camera.position.set(position.x + distance * 0.55, position.y + distance * 0.45, position.z + distance)
        camera.updateProjectionMatrix()
        lastFocusKey.current = focusKey
      }
    }

    if (state.clock.elapsedTime - lastReportedAt.current > 0.25) {
      lastReportedAt.current = state.clock.elapsedTime
      onElapsedDaysChange(elapsedDays)
    }
  })

  return (
    <>
      <color attach="background" args={['#0B1833']} />
      <ambientLight intensity={0.6} />
      <pointLight position={[0, 0, 0]} intensity={180} distance={0} decay={1.4} />
      <Stars radius={180} depth={100} count={500} factor={3.5} saturation={0} fade speed={0.12} />
      <SunBody profile={sun} scaleMode={scaleMode} selected={selectedId === 'sun'} language={language} onSelect={onSelect} />

      {planets.map((body) => {
        const profile = body.profile
        const position = initialPositions.get(profile.id) ?? ORIGIN
        const radius = bodySceneRadius(profile.physicalRadiusKm, scaleMode)
        return (
          <group key={profile.id}>
            {showOrbits && body.elements && (
              <OrbitPath elements={body.elements} scaleMode={scaleMode} color={profile.textureColor ?? '#ffffff'} selected={selectedId === profile.id} />
            )}
            {body.elements && (
              <AnimatedBody
                body={body}
                position={position}
                radius={radius}
                selected={selectedId === profile.id}
                scaleMode={scaleMode}
                elapsedDaysRef={elapsedDaysRef}
                positionsRef={positions}
                showLabel={scaleMode === 'pedagogical'}
                language={language}
                onSelect={onSelect}
              />
            )}
          </group>
        )
      })}

      {moons.map((body) => {
        const profile = body.profile
        const position = initialPositions.get(profile.id)
        const parent = planets.find((planet) => planet.profile.id === profile.parentId)
        const parentRadius = parent ? bodySceneRadius(parent.profile.physicalRadiusKm, scaleMode) : 0
        const radius = bodySceneRadius(profile.physicalRadiusKm, scaleMode)
        if (!body.elements || !position) return null

        return (
          <group key={profile.id}>
            {showOrbits && (
              <OrbitPath
                elements={body.elements}
                scaleMode={scaleMode}
                color={profile.textureColor ?? '#ffffff'}
                selected={selectedId === profile.id}
                parentId={profile.parentId}
                positionsRef={positions}
                parentRadius={parentRadius}
              />
            )}
            <AnimatedBody
              body={body}
              position={position}
              radius={radius}
              selected={selectedId === profile.id}
              scaleMode={scaleMode}
              elapsedDaysRef={elapsedDaysRef}
              positionsRef={positions}
              showLabel={selectedId === profile.id}
              language={language}
              onSelect={onSelect}
            />
          </group>
        )
      })}

      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableDamping
        dampingFactor={0.08}
        enablePan
        rotateSpeed={0.7}
        zoomSpeed={0.8}
        minDistance={scaleMode === 'scientific' ? 0.0002 : 0.25}
        maxDistance={600}
      />
      <CameraReset resetRequest={resetRequest} selectedId={selectedId} scaleMode={scaleMode} controlsRef={controlsRef} />
    </>
  )
}

function CameraReset({
  resetRequest,
  selectedId,
  scaleMode,
  controlsRef,
}: {
  resetRequest: number
  selectedId: string
  scaleMode: ScaleMode
  controlsRef: RefObject<OrbitControlsImpl | null>
}) {
  const { camera } = useThree()
  const previousReset = useRef(resetRequest)
  const previousScale = useRef(scaleMode)

  useFrame(() => {
    if (previousReset.current === resetRequest && previousScale.current === scaleMode) return
    const resetRequested = previousReset.current !== resetRequest
    previousReset.current = resetRequest
    previousScale.current = scaleMode
    if (resetRequested || !selectedId) {
      controlsRef.current?.target.set(0, 0, 0)
      camera.position.set(0, scaleMode === 'scientific' ? 75 : 7, scaleMode === 'scientific' ? 145 : 17)
    }
  })

  return null
}

function SunBody({
  profile,
  scaleMode,
  selected,
  language,
  onSelect,
}: {
  profile: CelestialProfile
  scaleMode: ScaleMode
  selected: boolean
  language: 'fr' | 'en'
  onSelect: (id: string) => void
}) {
  const radius = bodySceneRadius(profile.physicalRadiusKm, scaleMode, true)
  return (
    <group>
      <mesh
        onClick={(event) => {
          event.stopPropagation()
          onSelect(profile.id)
        }}
        onPointerOver={(event) => {
          event.stopPropagation()
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          document.body.style.cursor = ''
        }}
      >
        <sphereGeometry args={[radius, 48, 36]} />
        {profile.texture
          ? <SunMaterial textureUrl={profile.texture} />
          : <meshBasicMaterial color={profile.textureColor ?? '#C6A15B'} />}
      </mesh>
      <mesh scale={1.45}>
        <sphereGeometry args={[radius, 32, 24]} />
        <meshBasicMaterial color="#C6A15B" transparent opacity={selected ? 0.15 : 0.08} side={DoubleSide} depthWrite={false} />
      </mesh>
      {selected && <Html position={[0, radius + 0.16, 0]} center distanceFactor={10} style={{ pointerEvents: 'none' }}>
        <BodyLabel name={profile.name[language]} selected />
      </Html>}
    </group>
  )
}

function SunMaterial({ textureUrl }: { textureUrl: string }) {
  const texture = useTexture(textureUrl, (loaded) => {
    loaded.colorSpace = SRGBColorSpace
  })
  return <meshBasicMaterial map={texture} />
}

function AnimatedBody({
  body,
  position,
  radius,
  selected,
  scaleMode,
  elapsedDaysRef,
  positionsRef,
  showLabel,
  language,
  onSelect,
}: {
  body: RenderedBody
  position: { x: number; y: number; z: number }
  radius: number
  selected: boolean
  scaleMode: ScaleMode
  elapsedDaysRef: MutableRefObject<number>
  positionsRef: MutableRefObject<Map<string, { x: number; y: number; z: number }>>
  showLabel: boolean
  language: 'fr' | 'en'
  onSelect: (id: string) => void
}) {
  const rootRef = useRef<Group | null>(null)
  const tiltRef = useRef<Group | null>(null)
  const meshRef = useRef<Mesh | null>(null)
  const previousDays = useRef(0)
  const profile = body.profile
  useFrame(() => {
    if (rootRef.current) {
      const currentPosition = positionsRef.current.get(profile.id) ?? position
      rootRef.current.position.set(currentPosition.x, currentPosition.y, currentPosition.z)
    }

    if (tiltRef.current && profile.rotationPeriodDays) {
      const tilt = profile.axialTiltDeg ?? 0
      tiltRef.current.rotation.z = (tilt * Math.PI) / 180
    }

    if (meshRef.current && profile.rotationPeriodDays) {
      const elapsedDelta = elapsedDaysRef.current - previousDays.current
      meshRef.current.rotation.y += (elapsedDelta * Math.PI * 2) / profile.rotationPeriodDays
    }
    previousDays.current = elapsedDaysRef.current
  })

  return (
    <group ref={rootRef} position={[position.x, position.y, position.z]}>
      <group ref={tiltRef}>
        <mesh
          ref={meshRef}
          onClick={(event) => {
            event.stopPropagation()
            onSelect(profile.id)
          }}
          onPointerOver={(event) => {
            event.stopPropagation()
            document.body.style.cursor = 'pointer'
          }}
          onPointerOut={() => {
            document.body.style.cursor = ''
          }}
        >
          <sphereGeometry args={[Math.max(radius, scaleMode === 'scientific' ? 0.000001 : 0.02), 40, 30]} />
          {profile.texture
            ? <TexturedMaterial textureUrl={profile.texture} color={profile.textureColor} />
            : <meshStandardMaterial color={profile.textureColor ?? '#c0c6d6'} roughness={0.88} />}
        </mesh>
        {profile.id === 'saturn' && <SaturnRings radius={radius} />}
        {profile.id === 'earth' && <EarthClouds radius={radius} />}
      </group>
      {showLabel && (
        <Html position={[0, radius + 0.12, 0]} center distanceFactor={10} style={{ pointerEvents: 'none' }}>
          <BodyLabel name={profile.name[language]} selected={selected} />
        </Html>
      )}
    </group>
  )
}

function TexturedMaterial({ textureUrl, color }: { textureUrl: string; color?: string }) {
  const texture = useTexture(textureUrl, (loaded) => {
    loaded.colorSpace = SRGBColorSpace
  })
  return <meshStandardMaterial map={texture} color={color} roughness={0.94} metalness={0} />
}

function EarthClouds({ radius }: { radius: number }) {
  const texture = useTexture('/textures/planets/2k_earth_clouds.jpg')
  return (
    <mesh scale={1.008}>
      <sphereGeometry args={[radius, 40, 30]} />
      <meshBasicMaterial alphaMap={texture} color="#ffffff" transparent opacity={0.28} depthWrite={false} />
    </mesh>
  )
}

function SaturnRings({ radius }: { radius: number }) {
  const texture = useTexture('/textures/planets/2k_saturn_ring_alpha.png', (loaded) => {
    loaded.colorSpace = SRGBColorSpace
  })
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[radius * 1.35, radius * 2.45, 80]} />
      <meshBasicMaterial map={texture} transparent side={DoubleSide} depthWrite={false} />
    </mesh>
  )
}

function OrbitPath({
  elements,
  scaleMode,
  color,
  selected,
  parentId,
  positionsRef,
  parentRadius,
}: {
  elements: OrbitalElements
  scaleMode: ScaleMode
  color: string
  selected: boolean
  parentId?: string
  positionsRef?: MutableRefObject<Map<string, { x: number; y: number; z: number }>>
  parentRadius?: number
}) {
  const groupRef = useRef<Group | null>(null)
  useFrame(() => {
    if (!parentId || !positionsRef || !groupRef.current) return
    const position = positionsRef.current.get(parentId)
    if (position) groupRef.current.position.set(position.x, position.y, position.z)
  })
  const points = useMemo(
    () => getOrbitPoints(elements, scaleMode, parentId ? ORIGIN : undefined, parentRadius).map(({ x, y, z }) => [x, y, z] as [number, number, number]),
    [elements, scaleMode, parentId, parentRadius],
  )

  return (
    <group ref={groupRef}>
      <Line points={points} color={color} lineWidth={selected ? 1.6 : 0.7} transparent opacity={selected ? 0.7 : 0.3} />
    </group>
  )
}

function BodyLabel({ name, selected }: { name: string; selected: boolean }) {
  return (
    <span className={`whitespace-nowrap rounded-full px-2 py-1 text-[10px] font-semibold ${selected ? 'bg-sunAmber text-spaceNight' : 'bg-spaceNight/80 text-white'}`}>
      {name}
    </span>
  )
}

