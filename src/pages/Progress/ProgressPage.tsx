import { ArrowRight, BookOpen } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeading } from '../../components/PageHeading'
import { useLanguage } from '../../i18n/LanguageProvider'
import { lessons, type LessonTopic } from '../../services/lessonCatalog'
import { useProgressStore } from '../../store/useProgressStore'

const topicOrder: LessonTopic[] = ['systemSolar', 'planets', 'stars', 'satellites', 'astronomyBasics']

export function ProgressPage() {
  const { language, t } = useLanguage()
  const completedLessonIds = useProgressStore((state) => state.completedLessonIds)
  const quizResults = useProgressStore((state) => state.quizResults)
  const completedCount = lessons.filter((lesson) => completedLessonIds.includes(lesson.id)).length
  const completionRate = lessons.length ? Math.round((completedCount / lessons.length) * 100) : 0
  const lessonIds = new Set(lessons.map((lesson) => lesson.id))
  const quizzesTakenCount = new Set(quizResults.filter((result) => lessonIds.has(result.lessonId)).map((result) => result.lessonId)).size
  const recentResults = quizResults
    .slice()
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt))
    .slice(0, 3)
  const nextLesson = lessons.find((lesson) => !completedLessonIds.includes(lesson.id))

  const topicProgress = topicOrder.map((topic) => {
    const topicLessons = lessons.filter((lesson) => lesson.topic === topic)
    const completedInTopic = topicLessons.filter((lesson) => completedLessonIds.includes(lesson.id)).length
    const percent = topicLessons.length ? Math.round((completedInTopic / topicLessons.length) * 100) : 0
    const hasQuizResult = quizResults.some((result) => topicLessons.some((lesson) => lesson.id === result.lessonId))
    const status = topicLessons.length === 0
      ? t('inPreparation')
      : completedInTopic === topicLessons.length
        ? t('completedLabel')
        : completedInTopic > 0 || hasQuizResult
          ? t('inProgressLabel')
          : t('notStarted')

    return { topic, topicLessons, completedInTopic, percent, status }
  })

  return (
    <div>
      <PageHeading eyebrow={t('progressTitle')} title={t('progressPageTitle')} description={t('progressDescription')} />

      <section className="mb-5 grid gap-3 sm:grid-cols-3 sm:gap-4" aria-label={t('progressOverview')}>
        <MetricCard
          value={`${completedCount} / ${lessons.length}`}
          label={t('completedLessons')}
          accent="text-sunAmber"
        />
        <MetricCard
          value={`${quizzesTakenCount} / ${lessons.length}`}
          label={t('quizzesTaken')}
          accent="text-spaceTurquoise"
        />
        <MetricCard
          value={`${completionRate}%`}
          label={t('progressRate')}
          accent="text-vividIndigo"
        />
      </section>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.7fr)_minmax(260px,0.65fr)]">
        <section className="rounded-3xl border border-white bg-white p-5 shadow-sm sm:p-6" aria-labelledby="topic-progress-title">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-secondaryGreen">{t('topicProgressHeading')}</p>
              <h2 id="topic-progress-title" className="font-display mt-1 text-xl font-bold text-spaceNight">{t('progressByTopic')}</h2>
            </div>
            <span className="text-sm font-bold text-spaceNight">{completionRate}%</span>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-spaceMist" role="progressbar" aria-valuenow={completionRate} aria-valuemin={0} aria-valuemax={100} aria-label={t('progressRate')}>
            <div className="h-full rounded-full bg-spaceTurquoise transition-all" style={{ width: `${completionRate}%` }} />
          </div>

          <div className="mt-4 space-y-3">
            {topicProgress.map(({ topic, topicLessons, completedInTopic, percent, status }) => {
              const nextTopicLesson = topicLessons.find((lesson) => !completedLessonIds.includes(lesson.id)) ?? topicLessons[0]
              const rowContent = (
                <>
                  <span className="flex min-w-0 items-center justify-between gap-3 text-xs">
                    <span className="truncate font-semibold text-spaceNight">{t(topic)}</span>
                    <span className={`shrink-0 font-semibold ${percent === 100 ? 'text-secondaryGreen' : percent > 0 ? 'text-sunAmber' : 'text-spaceBlue'}`}>
                      {status}
                    </span>
                  </span>
                  {topicLessons.length > 0 ? (
                    <span className="mt-1.5 block h-2 overflow-hidden rounded-full bg-spaceMist" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label={`${t(topic)}: ${completedInTopic} ${t('outOf')} ${topicLessons.length}`}>
                      <span
                        className={`block h-full rounded-full transition-all ${percent === 100 ? 'bg-spaceTurquoise' : percent > 0 ? 'bg-sunAmber' : 'bg-transparent'}`}
                        style={{ width: `${percent}%` }}
                      />
                    </span>
                  ) : (
                    <span className="mt-1.5 block h-2 rounded-full bg-spaceMist" aria-hidden="true" />
                  )}
                </>
              )

              return nextTopicLesson ? (
                <Link
                  key={topic}
                  to={`/lesson/${nextTopicLesson.id}`}
                  className="block rounded-lg py-1 transition hover:bg-spaceMist/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-spaceTurquoise"
                >
                  {rowContent}
                </Link>
              ) : (
                <div key={topic} className="py-1">
                  {rowContent}
                </div>
              )
            })}
          </div>
        </section>

        <aside className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <section className="rounded-3xl border border-white bg-white p-5 shadow-sm sm:p-6" aria-labelledby="latest-quizzes-title">
            <h2 id="latest-quizzes-title" className="font-display text-lg font-bold text-spaceNight">{t('latestQuizResults')}</h2>
            {recentResults.length ? (
              <div className="mt-2 divide-y divide-slate-100">
                {recentResults.map((result) => {
                  const lesson = lessons.find((item) => item.id === result.lessonId)
                  if (!lesson) return null
                  const completedDate = new Intl.DateTimeFormat(language === 'fr' ? 'fr-FR' : 'en-GB', { dateStyle: 'medium' }).format(new Date(result.completedAt))
                  return (
                    <div key={`${result.lessonId}-${result.completedAt}`} className="flex items-center justify-between gap-3 py-3">
                      <span className="min-w-0">
                        <span className="block truncate text-xs font-semibold text-spaceNight">{lesson.content[language].title}</span>
                        <time className="mt-1 block text-[10px] text-slate-500" dateTime={result.completedAt}>{completedDate}</time>
                      </span>
                      <span className="shrink-0 rounded-full bg-spaceTurquoise/15 px-2.5 py-1 text-xs font-bold text-secondaryGreen">{result.score} {t('outOf')} {result.total}</span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="mt-2 text-sm leading-6 text-slate-600">{t('noQuizResults')}</p>
            )}
          </section>

          <section className="rounded-3xl bg-spaceMist p-5 sm:p-6">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-secondaryGreen"><BookOpen className="h-5 w-5" /></span>
            <h2 className="font-display mt-3 text-lg font-bold text-spaceNight">{t('nextStepTitle')}</h2>
            <p className="mt-1.5 text-sm leading-6 text-slate-600">{nextLesson?.content[language].title ?? t('allLessonsComplete')}</p>
            <Link
              to={nextLesson ? `/lesson/${nextLesson.id}` : '/academy'}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-sunAmber px-4 py-2.5 text-xs font-bold text-spaceNight transition hover:brightness-110"
            >
              {nextLesson ? t('continueLearning') : t('browseAcademy')} <ArrowRight className="h-4 w-4" />
            </Link>
          </section>
        </aside>
      </div>
    </div>
  )
}

function MetricCard({ value, label, accent }: { value: string; label: string; accent: string }) {
  return (
    <article className="rounded-2xl bg-spaceNight p-4 text-white shadow-sm sm:p-5">
      <p className="text-xs font-semibold text-slate-300">{label}</p>
      <p className={`font-display mt-1 text-3xl font-bold ${accent}`}>{value}</p>
    </article>
  )
}
