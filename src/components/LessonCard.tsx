import { ArrowRight, Clock3, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageProvider'
import type { Lesson, LessonTopic } from '../services/lessonCatalog'
import { useProgressStore } from '../store/useProgressStore'

const topicColors: Record<LessonTopic, string> = {
  systemSolar: 'bg-sunAmber',
  stars: 'bg-vividIndigo',
  planets: 'bg-vividIndigo',
  satellites: 'bg-spaceTurquoise',
  astronomyBasics: 'bg-spaceTurquoise',
}

export function LessonCard({ lesson }: { lesson: Lesson }) {
  const { language, t } = useLanguage()
  const content = lesson.content[language]
  const complete = useProgressStore((state) => state.completedLessonIds.includes(lesson.id))
  const quizTaken = useProgressStore((state) => state.quizResults.some((result) => result.lessonId === lesson.id))
  const status = complete ? t('completedLabel') : quizTaken ? t('quizTakenLabel') : t('notStarted')

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-white bg-white text-spaceNight shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-spaceNight/10">
      <LessonArtwork topic={lesson.topic} accent={topicColors[lesson.topic]} />
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className={`rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-wide text-spaceNight ${complete ? 'bg-spaceTurquoise' : quizTaken ? 'bg-sunAmber' : 'bg-spaceMist'}`}>
            {status}
          </span>
          <span className="rounded-full bg-spaceMist px-3 py-1 text-[9px] font-semibold text-spaceBlue">{t(lesson.topic)}</span>
        </div>
        <h2 className="font-display mt-4 text-xl font-bold text-spaceNight">{content.title}</h2>
        <p className="mt-2 flex-1 text-sm leading-6 text-spaceBlue/80">{content.summary}</p>
        <div className="mt-6 flex items-center justify-between gap-3 border-t border-spaceMist pt-4">
          <span className="flex items-center gap-1.5 text-xs text-spaceBlue/70">
            <Clock3 className="h-3.5 w-3.5 text-secondaryGreen" /> {lesson.estimatedMinutes} {t('minutes')}
          </span>
          <Link to={`/lesson/${lesson.id}`} className="inline-flex items-center gap-2 text-xs font-bold text-secondaryGreen underline-offset-4 hover:underline">
            {complete ? t('reviewLesson') : t('readLesson')} <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </article>
  )
}

function LessonArtwork({ topic, accent }: { topic: LessonTopic; accent: string }) {
  return (
    <div className="relative grid h-32 place-items-center overflow-hidden bg-spaceNight" aria-hidden="true">
      <span className="absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
      <span className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15" />
      {topic === 'systemSolar' && (
        <>
          <span className={`relative z-10 h-7 w-7 rounded-full ${accent} shadow-[0_0_24px_rgba(198,161,91,0.5)]`} />
          <span className="absolute left-[calc(50%+44px)] top-[calc(50%-2px)] h-3 w-3 rounded-full bg-vividIndigo" />
          <span className="absolute left-[calc(50%-53px)] top-[calc(50%+30px)] h-2.5 w-2.5 rounded-full bg-spaceTurquoise" />
        </>
      )}
      {topic === 'planets' && (
        <span className={`relative h-12 w-12 rounded-full ${accent} before:absolute before:left-[-12px] before:top-4 before:h-5 before:w-[72px] before:rotate-[-18deg] before:rounded-[50%] before:border-2 before:border-spaceBlue/30`} />
      )}
      {topic === 'stars' && (
        <span className="relative h-12 w-12 rounded-full bg-sunAmber shadow-[0_0_35px_rgba(198,161,91,0.35)]">
          <Sparkles className="absolute -right-7 -top-5 h-5 w-5 text-white/80" />
        </span>
      )}
      {topic === 'satellites' && (
        <div className="relative h-12 w-12 rounded-full border border-white/20">
          <span className="absolute inset-3 rounded-full bg-spaceTurquoise" />
          <span className="absolute -right-3 top-1 h-3 w-3 rotate-45 bg-sunAmber" />
        </div>
      )}
      {topic === 'astronomyBasics' && (
        <div className="relative h-14 w-20">
          <span className="absolute left-1 top-10 h-1.5 w-1.5 rounded-full bg-white" />
          <span className="absolute left-8 top-4 h-2 w-2 rounded-full bg-sunAmber" />
          <span className="absolute right-2 top-8 h-1.5 w-1.5 rounded-full bg-white" />
          <span className="absolute right-0 top-0 h-1.5 w-1.5 rounded-full bg-spaceTurquoise" />
          <span className="absolute left-2 top-[34px] h-px w-9 rotate-[-38deg] bg-white/40" />
          <span className="absolute left-9 top-[22px] h-px w-8 rotate-[25deg] bg-white/40" />
          <span className="absolute right-1 top-[12px] h-px w-6 rotate-[-52deg] bg-white/40" />
        </div>
      )}
    </div>
  )
}
