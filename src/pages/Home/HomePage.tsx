import {
  ArrowRight,
  Atom,
  BookOpen,
  CircleHelp,
  Image,
  Rocket,
  Sparkles,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SolarSystemImage } from '../components/SolarSystemImage'
import { useLanguage } from '../i18n/LanguageProvider'
import type { TranslationKey } from '../i18n/translations'

const pathways: {
  title: TranslationKey
  description: TranslationKey
  href: string
  icon: LucideIcon
  color: string
}[] = [
  { title: 'pathAcademy', description: 'pathAcademyDescription', href: '/academy', icon: BookOpen, color: 'bg-gold text-spaceNight' },
  { title: 'pathMissions', description: 'pathMissionsDescription', href: '/missions', icon: Rocket, color: 'bg-secondaryGreen text-white' },
  { title: 'pathSimulator', description: 'pathSimulatorDescription', href: '/simulator', icon: Atom, color: 'bg-deepGreen text-white' },
  { title: 'pathQuiz', description: 'pathQuizDescription', href: '/quiz', icon: CircleHelp, color: 'bg-blueSecondary text-white' },
  { title: 'pathMedia', description: 'pathMediaDescription', href: '/explorer', icon: Image, color: 'bg-deepGreen text-white' },
]

export function HomePage() {
  const { t } = useLanguage()

  return (
    <div className="-mt-7 space-y-0 sm:-mt-10">
      <section className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden bg-spaceNight text-white">
        <div className="absolute -left-24 top-0 h-80 w-80 rounded-full bg-deepGreen/10 blur-3xl" />
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-5 py-10 sm:px-8 sm:py-14 md:grid-cols-[1.05fr_0.95fr] lg:px-12 lg:py-16">
          <div className="relative z-10">
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.18em] text-sunAmber sm:text-xs">{t('heroCategory')}</p>
            <h1 className="font-display max-w-2xl text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
              <span className="block">{t('heroLineOne')}</span>
              <span className="block">{t('heroLineTwo')}</span>
              <span className="block text-sunAmber">{t('heroLineThree')}</span>
            </h1>
            <p className="mt-5 max-w-lg text-sm leading-6 text-slate-300 sm:text-base">
              {t('heroDescription')}
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <Link to="/lesson/solar-system" className="inline-flex items-center gap-2 rounded-full bg-sunAmber px-4 py-2.5 text-xs font-bold text-spaceNight transition hover:brightness-110">
                {t('exploreLessons')} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link to="/explorer" className="inline-flex items-center rounded-full border border-slate-400/50 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-white/10">
                {t('exploreMedia')}
              </Link>
              <Link to="/apod" className="inline-flex items-center rounded-full border border-slate-400/50 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-white/10">
                {t('apodLink')}
              </Link>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {(['accessibleTag', 'interactiveTag', 'bilingualTag'] as const).map((tag) => (
                <span key={tag} className="rounded-full bg-deepIndigo px-2.5 py-1 text-[9px] font-medium text-slate-200">{t(tag)}</span>
              ))}
            </div>
          </div>
          <div className="mx-auto flex w-full max-w-[520px] items-center justify-center">
            <SolarSystemImage />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-1 py-12 sm:px-2 sm:py-14 lg:py-16">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-secondaryGreen">{t('experienceEyebrow')}</p>
        <h2 className="font-display mt-2 text-2xl font-bold tracking-tight text-spaceNight sm:text-3xl">{t('experienceTitle')}</h2>
        <p className="mt-2 text-xs leading-5 text-slate-600 sm:text-sm">{t('experienceDescription')}</p>
        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          {pathways.map(({ title, description, href, icon: Icon, color }, index) => (
            <Link
              key={title}
              to={href}
              className={`group rounded-2xl bg-spaceMist p-4 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-spaceTurquoise ${
                index < 3 ? 'lg:col-span-2' : 'lg:col-span-3'
              }`}
            >
              <span className={`grid h-8 w-8 place-items-center rounded-full ${color}`}>
                <Icon className="h-4 w-4" />
              </span>
              <h3 className="mt-3 text-sm font-bold text-spaceNight">{t(title)}</h3>
              <p className="mt-1 text-[11px] leading-5 text-slate-600">{t(description)}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="relative left-1/2 w-screen -translate-x-1/2 bg-spaceMist">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-14 lg:px-12">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-secondaryGreen">{t('journeyEyebrow')}</p>
          <h2 className="font-display mt-2 text-2xl font-bold tracking-tight text-spaceNight sm:text-3xl">{t('journeyTitle')}</h2>
          <ol className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {([
              ['stepChoose', 'stepChooseDescription', 'bg-gold text-spaceNight'],
              ['stepLearn', 'stepLearnDescription', 'bg-secondaryGreen text-white'],
              ['stepPractice', 'stepPracticeDescription', 'bg-deepGreen text-white'],
              ['stepProgress', 'stepProgressDescription', 'bg-blueSecondary text-white'],
            ] as const).map(([title, description, color], index) => (
              <li key={title}>
                <span className={`grid h-8 w-8 place-items-center rounded-full ${color} text-xs font-bold`}>{index + 1}</span>
                <h3 className="mt-3 text-sm font-bold text-spaceNight">{t(title)}</h3>
                <p className="mt-1 text-[11px] leading-5 text-slate-600">{t(description)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden bg-spaceNight text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:px-8 sm:py-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-12">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-sunAmber">{t('transparencyEyebrow')}</p>
            <h2 className="font-display mt-2 max-w-md text-2xl font-bold leading-tight tracking-tight sm:text-3xl">{t('transparencyTitle')}</h2>
            <p className="mt-3 max-w-lg text-xs leading-5 text-slate-300 sm:text-sm">{t('transparencyDescription')}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-secondaryGreen px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-white">{t('realDataLabel')}</span>
              <span className="rounded-full bg-sunAmber px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-spaceNight">{t('modelLabel')}</span>
              <span className="rounded-full bg-white px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-spaceNight">{t('exampleLabel')}</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {([
              [t('sampleMediaTitle'), t('sampleOrigin'), 'bg-gold'],
              [t('sampleDataTitle'), t('sampleSource'), 'bg-blueSecondary'],
              [t('modelLabel'), t('notToScale'), 'bg-secondaryGreen'],
            ] as const).map(([title, source, color]) => (
              <article key={title} className="overflow-hidden rounded-xl bg-deepIndigo">
                <div className="grid h-20 place-items-center bg-spaceNight sm:h-24">
                  <span className={`h-7 w-7 rounded-full ${color}`} />
                </div>
                <div className="p-2.5">
                  <span className="rounded-full bg-white px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-wide text-spaceNight">{t('exampleLabel')}</span>
                  <h3 className="mt-2 text-[10px] font-bold text-white">{title}</h3>
                  <p className="mt-1 text-[8px] leading-4 text-slate-300">{source}</p>
                  <p className="mt-1 text-[7px] leading-3 text-sunAmber">{t('sampleIsExample')}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-1 py-10 text-center sm:px-2">
        <Sparkles className="mx-auto h-5 w-5 text-sunAmber" />
        <p className="mt-2 text-sm font-semibold text-spaceNight">{t('learningPathDescription')}</p>
        <Link to="/academy" className="mt-4 inline-flex items-center gap-2 rounded-full bg-spaceNight px-5 py-2.5 text-xs font-bold text-white transition hover:bg-deepIndigo">
          {t('startNow')} <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  )
}
