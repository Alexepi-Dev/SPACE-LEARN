import {
  AlertCircle,
  ArrowUpRight,
  CircleHelp,
  Focus,
  LoaderCircle,
  MoonStar,
  Orbit,
  Pause,
  Play,
  RotateCcw,
  Telescope,
} from 'lucide-react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { PageHeading } from '../../components/PageHeading'
import { useLanguage } from '../../i18n/LanguageProvider'
import { ApiRequestError } from '../../services/api'
import { getSolarSystemEphemeris, type SolarSystemEphemeris } from '../../services/solarSystemApi'
import { bodiesById, moons, planetSourceUrl, planets, sun, textureAttributionUrl, textureLicenseUrl } from '../../features/solar-system/data'
import { SolarSystemCanvas } from '../../features/solar-system/SolarSystemCanvas'
import type { CelestialProfile, RenderedBody, ScaleMode } from '../../features/solar-system/types'
import type { TranslationKey } from '../../i18n/translations'

type ViewMode = 'system' | 'moons' | 'compare'

const TOUR_STOPS = ['sun', 'mercury', 'earth', 'mars', 'jupiter', 'saturn', 'neptune']
const SPEEDS = [1, 10, 100, 1_000, 10_000]

export function SolarSystemExplorerPage() {
  const { language, t } = useLanguage()
  const [viewMode, setViewMode] = useState<ViewMode>('system')
  const [scaleMode, setScaleMode] = useState<ScaleMode>('pedagogical')
  const [selectedId, setSelectedId] = useState('earth')
  const [compareIds, setCompareIds] = useState(['earth', 'jupiter'])
  const [ephemeris, setEphemeris] = useState<SolarSystemEphemeris | null>(null)
  const [completedRequestKey, setCompletedRequestKey] = useState<string | null>(null)
  const [requestError, setRequestError] = useState<{ key: string; code: string } | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [paused, setPaused] = useState(() => (
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ))
  const [speed, setSpeed] = useState(100)
  const [showOrbits, setShowOrbits] = useState(true)
  const [elapsedDays, setElapsedDays] = useState(0)
  const [focusRequest, setFocusRequest] = useState(0)
  const [resetRequest, setResetRequest] = useState(0)
  const [tourIndex, setTourIndex] = useState<number | null>(null)

  const selectedProfile = bodiesById.get(selectedId) ?? sun
  const includeMoons = viewMode === 'moons' || selectedProfile.category === 'moon'
  const requestKey = `${includeMoons}:${refreshKey}`
  const loading = completedRequestKey !== requestKey
  const errorCode = requestError?.key === requestKey ? requestError.code : null

  const chooseBody = (id: string) => {
    setSelectedId(id)
    setFocusRequest((request) => request + 1)
    if (bodiesById.get(id)?.category === 'moon') setViewMode('moons')
  }

  useEffect(() => {
    const controller = new AbortController()

    getSolarSystemEphemeris(includeMoons, controller.signal)
      .then(setEphemeris)
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setRequestError({
          key: requestKey,
          code: error instanceof ApiRequestError ? error.code : 'REQUEST_FAILED',
        })
      })
      .finally(() => {
        if (!controller.signal.aborted) setCompletedRequestKey(requestKey)
      })

    return () => controller.abort()
  }, [includeMoons, refreshKey, requestKey])

  const elementsById = useMemo(
    () => new Map(ephemeris?.elements.map((element) => [element.bodyId, element]) ?? []),
    [ephemeris],
  )
  const planetBodies = useMemo(
    () => planets.flatMap((profile): RenderedBody[] => {
      const elements = elementsById.get(profile.id)
      return elements ? [{ profile, elements }] : []
    }),
    [elementsById],
  )
  const moonBodies = useMemo(
    () => moons.flatMap((profile): RenderedBody[] => {
      const elements = elementsById.get(profile.id)
      return elements ? [{ profile, elements }] : []
    }),
    [elementsById],
  )
  const selectedElements = elementsById.get(selectedId)
  const availableIds = new Set(['sun', ...elementsById.keys()])
  const unavailablePlanets = ephemeris?.unavailable.filter((target) => target.bodyId !== 'sun') ?? []
  const unavailableMoons = unavailablePlanets.filter((target) => moons.some((moon) => moon.id === target.bodyId))

  const startTour = () => {
    setViewMode('system')
    setTourIndex(0)
    chooseBody(TOUR_STOPS[0])
  }

  const advanceTour = () => {
    if (tourIndex === null) return
    const nextIndex = tourIndex + 1
    if (nextIndex >= TOUR_STOPS.length) {
      setTourIndex(null)
      return
    }
    setTourIndex(nextIndex)
    chooseBody(TOUR_STOPS[nextIndex])
  }

  return (
    <div className="pb-5">
      <PageHeading eyebrow={t('simulatorDataLabel')} title={t('simulatorTitle')} description={t('simulatorDescription')} />

      <section className="overflow-hidden rounded-[1.75rem] bg-spaceNight text-white shadow-xl shadow-spaceNight/10">
        <div className="flex flex-col gap-4 border-b border-white/10 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2" role="group" aria-label={t('simulatorSelectBody')}>
            <ViewButton active={viewMode === 'system'} onClick={() => setViewMode('system')} icon={<Orbit className="h-4 w-4" />}>
              {t('simulatorViewSystem')}
            </ViewButton>
            <ViewButton active={viewMode === 'moons'} onClick={() => setViewMode('moons')} icon={<MoonStar className="h-4 w-4" />}>
              {t('simulatorViewMoons')}
            </ViewButton>
            <ViewButton active={viewMode === 'compare'} onClick={() => setViewMode('compare')} icon={<Telescope className="h-4 w-4" />}>
              {t('simulatorViewCompare')}
            </ViewButton>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-full border border-white/15 bg-white/5 p-1" aria-label={t('simulatorScale')}>
              <ScaleButton active={scaleMode === 'pedagogical'} onClick={() => setScaleMode('pedagogical')}>
                {t('simulatorScalePedagogical')}
              </ScaleButton>
              <ScaleButton active={scaleMode === 'scientific'} onClick={() => setScaleMode('scientific')}>
                {t('simulatorScaleScientific')}
              </ScaleButton>
            </div>
            <button
              type="button"
              onClick={tourIndex === null ? startTour : advanceTour}
              className="inline-flex min-h-10 items-center gap-2 rounded-full bg-sunAmber px-4 text-xs font-bold text-spaceNight transition hover:bg-amber-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sunAmber"
            >
              <CircleHelp className="h-4 w-4" />
              {tourIndex === null
                ? t('simulatorTourStart')
                : tourIndex === TOUR_STOPS.length - 1
                  ? t('simulatorTourFinish')
                  : t('simulatorTourNext')}
            </button>
          </div>
        </div>

        <div className="grid gap-4 p-3 sm:p-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(290px,0.68fr)]">
          <div className="min-w-0">
            <div className="relative h-[min(58vh,560px)] min-h-[340px] overflow-hidden rounded-2xl border border-white/10 bg-[#071224] sm:min-h-[420px]">
              <SolarSystemCanvas
                planets={planetBodies}
                moons={moonBodies}
                sun={sun}
                selectedId={selectedId}
                scaleMode={scaleMode}
                paused={paused}
                speed={speed}
                showOrbits={showOrbits}
                focusRequest={focusRequest}
                resetRequest={resetRequest}
                language={language}
                onElapsedDaysChange={setElapsedDays}
                onSelect={chooseBody}
                fallbackMessage={t('simulatorWebglFallback')}
              />

              {loading && !ephemeris && (
                <div className="absolute inset-0 z-10 grid place-items-center bg-spaceNight/80 p-6 text-center">
                  <div>
                    <LoaderCircle className="mx-auto h-7 w-7 animate-spin text-spaceTurquoise" />
                    <p className="mt-3 text-sm text-slate-200">{t('simulatorLoading')}</p>
                  </div>
                </div>
              )}
              {errorCode && !ephemeris && (
                <div className="absolute inset-0 z-10 grid place-items-center bg-spaceNight/90 p-6 text-center">
                  <div className="max-w-sm">
                    <AlertCircle className="mx-auto h-8 w-8 text-sunAmber" />
                    <p className="mt-3 text-sm text-white">
                      {errorCode === 'API_NOT_CONFIGURED' ? t('simulatorApiNotConfigured') : t('simulatorLoadError')}
                    </p>
                    <button
                      type="button"
                      onClick={() => setRefreshKey((key) => key + 1)}
                      className="mt-4 rounded-full bg-white px-4 py-2 text-xs font-bold text-spaceNight"
                    >
                      {t('simulatorRetry')}
                    </button>
                  </div>
                </div>
              )}

              <div className="pointer-events-none absolute left-3 top-3 flex flex-wrap gap-2 sm:left-4 sm:top-4">
                <span className="rounded-full bg-spaceNight/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-spaceTurquoise">
                  {t('simulatorDataLabel')}
                </span>
                {ephemeris && (
                  <span className="rounded-full bg-spaceNight/75 px-3 py-1.5 text-[10px] text-slate-200">
                    {ephemeris.epochTdb}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setResetRequest((request) => request + 1)}
                className="absolute right-3 top-3 z-10 inline-flex h-9 items-center gap-2 rounded-full border border-white/15 bg-spaceNight/75 px-3 text-[10px] font-semibold text-white transition hover:bg-white/15 sm:right-4 sm:top-4"
                aria-label={t('simulatorResetView')}
              >
                <Focus className="h-3.5 w-3.5" /> <span className="hidden sm:inline">{t('simulatorResetView')}</span>
              </button>
              <div className="pointer-events-none absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2 text-[9px] text-slate-300 sm:bottom-4 sm:left-4 sm:right-4">
                <span className="max-w-[65%] rounded-lg bg-spaceNight/70 px-2.5 py-1.5">{t(scaleMode === 'scientific' ? 'simulatorScaleScientificNote' : 'simulatorScalePedagogicalNote')}</span>
                <span className="rounded-lg bg-spaceNight/70 px-2.5 py-1.5">{t('simulatorAccessibility')}</span>
              </div>
            </div>

            <SimulationControls
              paused={paused}
              speed={speed}
              showOrbits={showOrbits}
              elapsedDays={elapsedDays}
              onTogglePaused={() => setPaused((value) => !value)}
              onSpeedChange={setSpeed}
              onToggleOrbits={() => setShowOrbits((value) => !value)}
            />
            {tourIndex !== null && (
              <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-sunAmber/30 bg-sunAmber/10 px-4 py-3 text-xs text-amber-100">
                <span>{t('simulatorTourDescription')} <strong>{t('simulatorTourStep')} {tourIndex + 1}/{TOUR_STOPS.length}</strong></span>
                <button type="button" className="shrink-0 text-amber-200 underline underline-offset-2" onClick={() => setTourIndex(null)}>
                  {t('simulatorTourFinish')}
                </button>
              </div>
            )}

            <div className="mt-4">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">{t('simulatorSelectBody')}</p>
              <div className="flex gap-2 overflow-x-auto pb-2">
                <BodySelector
                  id="sun"
                  selectedId={selectedId}
                  profile={sun}
                  language={language}
                  disabled={false}
                  missingTitle={t('simulatorOrbitalUnavailable')}
                  onSelect={chooseBody}
                />
                {planets.map((profile) => (
                  <BodySelector
                    key={profile.id}
                    id={profile.id}
                    selectedId={selectedId}
                    profile={profile}
                    language={language}
                    disabled={!availableIds.has(profile.id)}
                    missingTitle={t('simulatorOrbitalUnavailable')}
                    onSelect={chooseBody}
                  />
                ))}
              </div>
            </div>

            {viewMode === 'moons' && (
              <MoonSelector
                selectedId={selectedId}
                availableIds={availableIds}
                loading={loading && !ephemeris?.elements.some((element) => element.kind === 'moon')}
                language={language}
                onSelect={chooseBody}
                t={t}
              />
            )}
          </div>

          <aside className="min-w-0 space-y-3">
            {viewMode === 'compare' && (
              <ComparePanel
                ids={compareIds}
                profiles={[sun, ...planets, ...moons]}
                language={language}
                t={t}
                onChange={(index, id) => setCompareIds((current) => current.map((value, i) => (i === index ? id : value)))}
              />
            )}

            {viewMode === 'moons' && (
              <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <h2 className="font-display text-sm font-bold text-white">{t('simulatorKnownMoons')}</h2>
                <p className="mt-2 text-xs leading-5 text-slate-300">{t('simulatorMoonSource')}</p>
                {unavailableMoons.length > 0 && (
                  <p className="mt-3 rounded-xl bg-sunAmber/10 px-3 py-2 text-[11px] leading-5 text-amber-100">{t('simulatorUnavailableMoons')}</p>
                )}
                {loading && !ephemeris?.elements.some((element) => element.kind === 'moon') && (
                  <p className="mt-3 text-[11px] text-slate-300">{t('simulatorMoonsLoading')}</p>
                )}
              </section>
            )}

            <BodyInformation
              profile={selectedProfile}
              elements={selectedElements}
              language={language}
              epoch={ephemeris?.epochTdb}
              onFocus={() => setFocusRequest((request) => request + 1)}
              t={t}
            />

            <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <h2 className="font-display text-sm font-bold text-white">{t('simulatorSource')}</h2>
              <dl className="mt-3 space-y-2 text-[11px] leading-5 text-slate-300">
                <div><dt className="inline text-slate-500">{t('simulatorEpoch')}: </dt><dd className="inline">{ephemeris?.epochTdb ?? t('simulatorNoAxis')}</dd></div>
                <div><dt className="inline text-slate-500">{t('simulatorReferenceFrame')}: </dt><dd className="inline">{ephemeris?.referenceFrame ?? t('simulatorReferenceFrameValue')}</dd></div>
                <div><dt className="inline text-slate-500">{t('simulatorUnits')}: </dt><dd className="inline">{t('simulatorOrbitalUnits')}</dd></div>
              </dl>
              <p className="mt-3 text-[11px] leading-5 text-slate-300">{t('simulatorPositionModel')}</p>
              <p className="mt-2 text-[10px] leading-4 text-slate-400">{t('simulatorFactsChecked')}</p>
              {unavailablePlanets.length > 0 && (
                <p className="mt-3 rounded-xl bg-rose-400/10 px-3 py-2 text-[11px] leading-5 text-rose-100">
                  {t('simulatorPartialData')} {unavailablePlanets.map((target) => target.name).join(', ')}
                </p>
              )}
              {errorCode && ephemeris && (
                <button type="button" onClick={() => setRefreshKey((key) => key + 1)} className="mt-3 text-[11px] font-bold text-spaceTurquoise underline underline-offset-2">
                  {t('simulatorRetry')}
                </button>
              )}
            </section>
          </aside>
        </div>
      </section>

      <div className="mt-4">
        <p className="rounded-2xl border border-white bg-[#e6f4f3] px-4 py-3 text-xs leading-5 text-slate-600">
          {t('simulatorTextureCredit')} {' '}
          <a href={textureAttributionUrl} target="_blank" rel="noreferrer" className="font-semibold text-[#087e79] underline underline-offset-2">
            Solar System Scope
          </a>
          {' · '}
          <a href={textureLicenseUrl} target="_blank" rel="noreferrer" className="font-semibold text-[#087e79] underline underline-offset-2">CC BY 4.0</a>
          <span className="mt-1 block">{t('simulatorTextureLimit')}</span>
        </p>
      </div>
    </div>
  )
}

function ViewButton({ active, onClick, icon, children }: {
  active: boolean
  onClick: () => void
  icon: ReactNode
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`inline-flex min-h-10 items-center gap-2 rounded-full px-3.5 text-xs font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-spaceTurquoise ${active ? 'bg-spaceTurquoise text-spaceNight' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}
    >
      {icon}{children}
    </button>
  )
}

function ScaleButton({ active, onClick, children }: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`min-h-8 rounded-full px-3 text-[10px] font-semibold transition ${active ? 'bg-white text-spaceNight' : 'text-slate-300 hover:text-white'}`}
    >
      {children}
    </button>
  )
}

function SimulationControls({
  paused,
  speed,
  showOrbits,
  elapsedDays,
  onTogglePaused,
  onSpeedChange,
  onToggleOrbits,
}: {
  paused: boolean
  speed: number
  showOrbits: boolean
  elapsedDays: number
  onTogglePaused: () => void
  onSpeedChange: (speed: number) => void
  onToggleOrbits: () => void
}) {
  const { t, language } = useLanguage()
  const numberFormat = new Intl.NumberFormat(language === 'fr' ? 'fr-FR' : 'en-US', { maximumFractionDigits: 1 })

  return (
    <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
      <button
        type="button"
        onClick={onTogglePaused}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white/10 px-3 text-xs font-bold text-white transition hover:bg-white/15"
      >
        {paused ? <Play className="h-4 w-4 text-spaceTurquoise" /> : <Pause className="h-4 w-4 text-spaceTurquoise" />}
        {paused ? t('simulatorPlay') : t('simulatorPause')}
      </button>
      <label className="flex min-h-11 items-center justify-between gap-2 rounded-xl bg-white/10 px-3 text-xs text-slate-200">
        <span>{t('simulatorSpeed')}</span>
        <select
          value={speed}
          onChange={(event) => onSpeedChange(Number(event.target.value))}
          className="max-w-28 rounded-lg border border-white/10 bg-spaceNight px-2 py-1.5 text-xs font-semibold text-white"
        >
          {SPEEDS.map((value) => <option key={value} value={value}>{value.toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US')}×</option>)}
        </select>
      </label>
      <button
        type="button"
        onClick={onToggleOrbits}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white/10 px-3 text-xs font-semibold text-slate-200 transition hover:bg-white/15"
      >
        <Orbit className="h-4 w-4 text-spaceTurquoise" />
        {showOrbits ? t('simulatorHideOrbits') : t('simulatorShowOrbits')}
      </button>
      <div className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white/10 px-3 text-xs text-slate-300">
        <RotateCcw className="h-3.5 w-3.5 text-sunAmber" />
        {t('simulatorTime')}: +{numberFormat.format(elapsedDays)} {t('simulatorDays')}
      </div>
    </div>
  )
}

function BodySelector({ id, selectedId, profile, language, disabled, missingTitle, onSelect }: {
  id: string
  selectedId: string
  profile: CelestialProfile
  language: 'fr' | 'en'
  disabled: boolean
  missingTitle: string
  onSelect: (id: string) => void
}) {
  const selected = id === selectedId
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect(id)}
      title={disabled ? `${profile.name[language]} — ${missingTitle}` : profile.name[language]}
      className={`min-h-10 shrink-0 rounded-full border px-3.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${selected ? 'border-sunAmber bg-sunAmber text-spaceNight' : 'border-white/15 bg-white/5 text-slate-200 hover:bg-white/10'}`}
    >
      {profile.name[language]}
    </button>
  )
}

function MoonSelector({ selectedId, availableIds, loading, language, onSelect, t }: {
  selectedId: string
  availableIds: Set<string>
  loading: boolean
  language: 'fr' | 'en'
  onSelect: (id: string) => void
  t: (key: TranslationKey) => string
}) {
  return (
    <div className="mt-4">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">{t('simulatorKnownMoons')}</p>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {moons.map((profile) => (
          <BodySelector
            key={profile.id}
            id={profile.id}
            selectedId={selectedId}
            profile={profile}
            language={language}
            disabled={!availableIds.has(profile.id)}
            missingTitle={t('simulatorOrbitalUnavailable')}
            onSelect={onSelect}
          />
        ))}
        {loading && <LoaderCircle className="my-auto h-4 w-4 shrink-0 animate-spin text-spaceTurquoise" />}
      </div>
    </div>
  )
}

function BodyInformation({ profile, elements, language, epoch, onFocus, t }: {
  profile: CelestialProfile
  elements?: import('../../services/solarSystemApi').OrbitalElements
  language: 'fr' | 'en'
  epoch?: string
  onFocus: () => void
  t: (key: TranslationKey) => string
}) {
  const integerFormat = new Intl.NumberFormat(language === 'fr' ? 'fr-FR' : 'en-US', { maximumFractionDigits: 1 })
  const massFormat = new Intl.NumberFormat(language === 'fr' ? 'fr-FR' : 'en-US', { notation: 'scientific', maximumSignificantDigits: 4 })
  const periodDays = elements ? 360 / elements.meanMotionDegPerDay : profile.orbitalPeriodDays
  const rotation = profile.rotationPeriodDays
  const numberWithUnit = (value: number, unit: string, digits = 2) => (
    `${new Intl.NumberFormat(language === 'fr' ? 'fr-FR' : 'en-US', { maximumFractionDigits: digits }).format(value)} ${unit}`
  )
  const periodLabel = (days: number | undefined) => {
    if (days === undefined) return t('simulatorNoPeriod')
    const sign = days < 0 ? '−' : ''
    const absoluteDays = Math.abs(days)
    if (absoluteDays < 1) return `${sign}${numberWithUnit(absoluteDays * 24, 'h')}`
    return `${sign}${numberWithUnit(absoluteDays, t('simulatorDays'))}${days < 0 ? ` · ${t('simulatorRetrograde')}` : ''}`
  }

  return (
    <section className="rounded-2xl border border-spaceTurquoise/20 bg-[#0b1a31] p-4">
      <div className="flex items-start gap-3">
        <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl border border-white/10 bg-white/5">
          {profile.texture
            ? <img src={profile.texture} alt="" className="h-full w-full object-cover" loading="lazy" />
            : <span className="h-5 w-5 rounded-full" style={{ backgroundColor: profile.textureColor }} />}
        </div>
        <div className="min-w-0">
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-spaceTurquoise">{t('simulatorInfoTitle')}</p>
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display mt-1 text-lg font-bold text-white">{profile.name[language]}</h2>
            <button type="button" onClick={onFocus} className="inline-flex min-h-8 shrink-0 items-center gap-1 rounded-full bg-white/10 px-2.5 text-[10px] font-semibold text-spaceTurquoise hover:bg-white/15">
              <Focus className="h-3 w-3" />{t('simulatorFocus')}
            </button>
          </div>
          <p className="text-[10px] text-slate-400">{profile.category === 'moon' ? `${t('simulatorKindMoon')} · ${bodiesById.get(profile.parentId ?? '')?.name[language]}` : profile.category === 'star' ? t('simulatorKindStar') : t('simulatorKindPlanet')}</p>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-2">
        <DataCell label={t('simulatorDiameter')} value={`${integerFormat.format(profile.diameterKm)} km`} />
        <DataCell label={t('simulatorMass')} value={profile.massKg === undefined ? t('simulatorNoMass') : `${massFormat.format(profile.massKg)} kg`} />
        <DataCell label={t('simulatorRotation')} value={periodLabel(rotation)} />
        <DataCell label={t('simulatorYear')} value={profile.category === 'star' ? t('simulatorNotApplicable') : periodLabel(periodDays)} />
        <DataCell
          label={t('simulatorSemimajorAxis')}
          value={elements ? `${numberWithUnit(elements.semiMajorAxisAu, 'AU', 5)} · ${integerFormat.format(elements.semiMajorAxisAu * 149_597_870.7)} km` : profile.category === 'star' ? t('simulatorNotApplicable') : t('simulatorNoAxis')}
        />
        <DataCell label={t('simulatorTemperature')} value={profile.temperature?.[language] ?? t('simulatorNoAxis')} />
        {profile.moonCount !== undefined && (
          <DataCell label={t('simulatorMoonsCount')} value={`${profile.moonCount}${profile.moonCountNote ? ` · ${profile.moonCountNote[language]}` : ''}`} wide />
        )}
      </dl>

      <div className="mt-3 rounded-xl bg-white/5 px-3 py-2.5">
        <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">{t('simulatorAtmosphere')}</p>
        <p className="mt-1 text-[11px] leading-5 text-slate-200">{profile.atmosphere[language]}</p>
      </div>
      <div className="mt-2 rounded-xl bg-spaceTurquoise/10 px-3 py-2.5">
        <p className="text-[9px] font-bold uppercase tracking-wide text-spaceTurquoise">{t('simulatorHighlight')}</p>
        <p className="mt-1 text-[11px] leading-5 text-slate-200">{profile.highlight[language]}</p>
      </div>
      {!profile.texture && profile.category === 'moon' && (
        <p className="mt-3 text-[10px] leading-4 text-slate-400">{t('simulatorNoTexture')}</p>
      )}
      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[10px]">
        <SourceLink href={profile.sourceUrl} label={t('simulatorFactSource')} />
        {profile.massKg !== undefined && <SourceLink href={planetSourceUrl} label={t('simulatorPlanetSource')} />}
        {elements && epoch && <SourceLink href="https://ssd.jpl.nasa.gov/horizons/" label="NASA/JPL Horizons" />}
      </div>
      {elements && epoch && (
        <p className="mt-2 text-[9px] leading-4 text-slate-500">
          {t('simulatorEpoch')}: {epoch} · e={elements.eccentricity.toFixed(5)} · i={elements.inclinationDeg.toFixed(3)}°
        </p>
      )}
    </section>
  )
}

function DataCell({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={`min-w-0 rounded-xl bg-white/5 px-3 py-2 ${wide ? 'col-span-2' : ''}`}>
      <dt className="text-[9px] font-semibold uppercase leading-4 tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-1 break-words text-[11px] font-semibold leading-4 text-white">{value}</dd>
    </div>
  )
}

function SourceLink({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-spaceTurquoise underline-offset-2 hover:underline">
      {label}<ArrowUpRight className="h-3 w-3" />
    </a>
  )
}

function ComparePanel({ ids, profiles, language, t, onChange }: {
  ids: string[]
  profiles: CelestialProfile[]
  language: 'fr' | 'en'
  t: (key: TranslationKey) => string
  onChange: (index: number, id: string) => void
}) {
  const format = new Intl.NumberFormat(language === 'fr' ? 'fr-FR' : 'en-US', { maximumFractionDigits: 1 })
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <h2 className="font-display text-sm font-bold text-white">{t('simulatorCompareTitle')}</h2>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {ids.map((id, index) => (
          <label key={index} className="min-w-0 text-[10px] text-slate-400">
            {t(index === 0 ? 'simulatorCompareFirst' : 'simulatorCompareSecond')}
            <select
              value={id}
              onChange={(event) => onChange(index, event.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-spaceNight px-2 py-2 text-xs font-semibold text-white"
            >
              {profiles.map((profile) => (
                <option key={profile.id} value={profile.id}>{profile.name[language]}</option>
              ))}
            </select>
          </label>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {ids.map((id) => {
          const profile = bodiesById.get(id) ?? sun
          return (
            <div key={id} className="rounded-xl bg-white/5 p-3">
              <p className="text-xs font-bold text-spaceTurquoise">{profile.name[language]}</p>
              <p className="mt-2 text-[10px] text-slate-400">{t('simulatorDiameter')}</p>
              <p className="text-xs font-semibold text-white">{format.format(profile.diameterKm)} km</p>
              {profile.massKg !== undefined && (
                <>
                  <p className="mt-2 text-[10px] text-slate-400">{t('simulatorMass')}</p>
                  <p className="text-xs font-semibold text-white">{profile.massKg.toExponential(2)} kg</p>
                </>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
