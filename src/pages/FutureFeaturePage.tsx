import { ArrowRight, Atom, Compass, Rocket, Telescope } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { PageHeading } from '../components/PageHeading'
import { useLanguage } from '../i18n/LanguageProvider'

export function FutureFeaturePage() {
  const { t } = useLanguage()
  const { pathname } = useLocation()
  const isMissions = pathname === '/missions'
  const title = isMissions ? t('missionsTitle') : t('simulatorTitle')
  const description = isMissions ? t('missionsDescription') : t('simulatorDescription')

  return (
    <div>
      <PageHeading eyebrow={t('futureLabel')} title={title} description={description} />
      {isMissions ? <MissionsPreview /> : <SimulatorPreview />}
    </div>
  )
}

function MissionsPreview() {
  const { t } = useLanguage()
  const ideas = [
    ['missionIdeaOne', Rocket],
    ['missionIdeaTwo', Telescope],
    ['missionIdeaThree', Compass],
    ['missionIdeaFour', Atom],
  ] as const

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(230px,0.75fr)_minmax(0,1.5fr)]">
      <aside className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        {ideas.map(([key, Icon], index) => (
          <article key={key} className={`rounded-3xl p-4 sm:p-5 ${index === 0 ? 'bg-spaceNight text-white' : 'border border-white bg-white text-spaceNight'}`}>
            <div className="flex items-center justify-between gap-3">
              <span className={`grid h-9 w-9 place-items-center rounded-full ${index === 0 ? 'bg-sunAmber text-spaceNight' : 'bg-spaceMist text-[#118d88]'}`}><Icon className="h-4 w-4" /></span>
              <span className={`rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide ${index === 0 ? 'bg-sunAmber text-spaceNight' : 'bg-spaceMist text-slate-600'}`}>{t('inPreparation')}</span>
            </div>
            <h2 className={`font-display mt-4 text-sm font-bold ${index === 0 ? 'text-white' : 'text-spaceNight'}`}>{t(key)}</h2>
            <p className={`mt-1 text-xs leading-5 ${index === 0 ? 'text-slate-300' : 'text-slate-600'}`}>{t('missionIdeaDescription')}</p>
          </article>
        ))}
      </aside>

      <section className="overflow-hidden rounded-3xl bg-white shadow-sm">
        <div className="bg-spaceNight p-5 text-white sm:p-7">
          <span className="inline-flex items-center gap-2 rounded-full bg-sunAmber px-3 py-1 text-[9px] font-bold uppercase tracking-wide text-spaceNight">
            <Rocket className="h-3 w-3" /> {t('futureLabel')}
          </span>
          <h2 className="font-display mt-4 text-2xl font-bold">{t('missionRoadmapTitle')}</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">{t('missionRoadmapDescription')}</p>
        </div>
        <div className="p-5 sm:p-7">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#139f98]">{t('missionPlannedActivities')}</p>
          <ol className="mt-4 grid gap-3 sm:grid-cols-2">
            {ideas.map(([key], index) => (
              <li key={key} className="flex gap-3 rounded-2xl bg-spaceMist p-4">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-spaceTurquoise/25 text-xs font-bold text-spaceNight">{index + 1}</span>
                <span className="min-w-0">
                  <span className="block text-xs font-bold text-spaceNight">{t(key)}</span>
                  <span className="mt-1 block text-[10px] leading-4 text-slate-600">{t('missionIdeaDescription')}</span>
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-xs leading-5 text-slate-500">{t('missionNoFictionNote')}</p>
          <Link to="/academy" className="mt-5 inline-flex items-center gap-2 rounded-full bg-sunAmber px-5 py-2.5 text-xs font-bold text-spaceNight transition hover:bg-amber-300">
            {t('startLearning')} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}

function SimulatorPreview() {
  const { t } = useLanguage()
  const concepts = ['simulatorDistance', 'simulatorMassConcept', 'simulatorSpeedConcept'] as const

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(270px,0.7fr)]">
      <figure className="relative min-h-[300px] overflow-hidden rounded-3xl bg-spaceNight p-5 text-white sm:min-h-[380px] sm:p-7">
        <span className="inline-flex rounded-full bg-sunAmber px-3 py-1.5 text-[9px] font-bold uppercase tracking-wide text-spaceNight">{t('simplifiedModel')}</span>
        <div className="relative mx-auto mt-5 aspect-[1.4] max-w-[500px]">
          <div className="absolute left-1/2 top-1/2 h-[78%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-spaceTurquoise/80" />
          <div className="absolute left-1/2 top-1/2 h-[54%] w-[54%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-dashed border-white/25" />
          <span className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sunAmber shadow-[0_0_30px_rgba(244,162,35,0.35)]" />
          <span className="absolute left-[76%] top-[23%] h-4 w-4 rounded-full bg-vividIndigo shadow-[0_0_18px_rgba(91,124,250,0.5)]" />
          <span className="absolute left-[18%] top-[20%] h-1 w-1 rounded-full bg-white" />
          <span className="absolute left-[82%] top-[78%] h-1 w-1 rounded-full bg-white" />
          <span className="absolute left-[12%] top-[73%] h-1 w-1 rounded-full bg-white" />
        </div>
        <figcaption className="mt-3 max-w-lg text-xs leading-5 text-slate-300">
          {t('simulatorScaleNote')}
        </figcaption>
      </figure>

      <aside className="space-y-4">
        <section className="rounded-3xl border border-white bg-white p-5 shadow-sm sm:p-6">
          <h2 className="font-display text-lg font-bold text-spaceNight">{t('simulatorConceptsTitle')}</h2>
          <ul className="mt-4 space-y-3">
            {concepts.map((key, index) => (
              <li key={key} className="flex items-start gap-3 rounded-2xl bg-spaceMist p-3">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-sunAmber/25 text-xs font-bold text-spaceNight">{index + 1}</span>
                <span className="text-xs leading-5 text-slate-700">{t(key)}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-3xl bg-[#dff6f2] p-5 sm:p-6">
          <h2 className="font-display text-base font-bold text-spaceNight">{t('simulatorComingTitle')}</h2>
          <p className="mt-2 text-xs leading-5 text-slate-700">{t('simulatorComingDescription')}</p>
          <Link to="/academy" className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#087e79] underline-offset-4 hover:underline">
            {t('browseAcademy')} <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </aside>
    </div>
  )
}
