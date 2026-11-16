import { ArrowLeft, ArrowRight, BookOpen, Check, Clock3, ExternalLink } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { PageHeading } from '../../components/PageHeading'
import { SolarSystemImage } from '../../components/SolarSystemImage'
import { useLanguage } from '../../i18n/LanguageProvider'
import { getLesson, lessons } from '../../services/lessonCatalog'
import { useProgressStore } from '../../store/useProgressStore'
import { LessonQuiz } from '../Quiz/QuizPage'

export function LessonPage() {
  const { lessonId } = useParams()
  const { language, t } = useLanguage()
  const lesson = getLesson(lessonId)
  const completeLesson = useProgressStore((state) => state.completeLesson)
  const completedLessonIds = useProgressStore((state) => state.completedLessonIds)
  const completed = lesson ? completedLessonIds.includes(lesson.id) : false

  if (!lesson) return <Navigate to="/academy" replace />
  const content = lesson.content[language]
  const lessonIndex = lessons.findIndex((item) => item.id === lesson.id)
  const progressPercent = Math.round((completedLessonIds.length / lessons.length) * 100)

  return (
    <article>
      <Link to="/academy" className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-[#0d1934]">
        <ArrowLeft className="h-4 w-4" /> {t('backToAcademy')}
      </Link>
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_230px]">
        <div className="space-y-5">
          <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-teal-700">
              {t('academyTitle')} · {t('lesson')} {lessonIndex + 1}
            </div>
            <PageHeading
              title={content.title}
              description={content.summary}
            >
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#edf2fb] px-3 py-2 text-xs text-[#344360]">
                <Clock3 className="h-4 w-4 text-amber-600" /> {lesson.estimatedMinutes} {t('minutes')}
              </span>
            </PageHeading>

            <span className="inline-flex rounded-full bg-teal-400 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-[#09213b]">
              {t('learningContent')}
            </span>
            <div className="mt-4 space-y-5">
              {content.sections.map((section) => (
                <section key={section.heading}>
                  <h2 className="text-sm font-bold text-[#0d1934]">{section.heading}</h2>
                  <div className="mt-2 space-y-3 text-xs leading-6 text-slate-600 sm:text-sm">
                    {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                  </div>
                </section>
              ))}
            </div>

            {lesson.id === 'solar-system' && (
              <div className="mt-5 rounded-xl bg-[#0b1733] px-4 py-3 text-white">
                <SolarSystemImage compact />
              </div>
            )}

            <div className="mt-5 rounded-xl bg-[#edf2fb] p-4">
              <h2 className="text-xs font-bold text-[#0d1934]">{t('keyIdea')}</h2>
              <p className="mt-1 text-xs leading-5 text-slate-600">{content.takeaway}</p>
            </div>

            <section className="mt-5 border-t border-slate-100 pt-4">
              <h2 className="text-xs font-bold text-[#0d1934]">{t('resources')}</h2>
              <ul className="mt-2 flex flex-wrap gap-2">
                {content.resources.map((resource) => (
                  <li key={resource.url}>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#f3f6fc] px-3 py-2 text-[10px] font-medium text-teal-800 hover:bg-teal-50"
                    >
                      {resource.title} <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          </section>

          <LessonQuiz key={lesson.id} lessonId={lesson.id} embedded />
        </div>

        <aside className="space-y-3 lg:sticky lg:top-20">
          <section className="rounded-2xl bg-[#0b1733] p-4 text-white">
            <h2 className="text-xs font-bold">{t('progressTitle')}</h2>
            <div className="mt-3 flex items-center justify-between gap-2 text-[9px] text-slate-300">
              <span>{t('topicProgress')}</span>
              <span>{completedLessonIds.length} {t('outOf')} {lessons.length}</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#24345b]">
              <div className="h-full rounded-full bg-[#f7a51a] transition-all" style={{ width: `${progressPercent}%` }} />
            </div>
            <p className="mt-3 text-[9px] leading-4 text-slate-400">{t('learningContentDescription')}</p>
          </section>

          <section className="rounded-2xl bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-xs font-bold text-[#0d1934]">{t('themeLessons')}</h2>
            <ol className="space-y-1">
              {lessons.map((item, index) => {
                const isComplete = completedLessonIds.includes(item.id)
                const isCurrent = item.id === lesson.id
                return (
                  <li key={item.id}>
                    <Link
                      to={`/lesson/${item.id}`}
                      className={`flex items-center gap-2 rounded-lg px-2 py-2 text-[10px] transition ${
                        isCurrent ? 'bg-teal-50 font-semibold text-teal-800' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className={`grid h-4 w-4 shrink-0 place-items-center rounded-full text-[8px] ${isComplete ? 'bg-teal-400 text-[#0b1733]' : 'bg-[#e2e8f4] text-[#304161]'}`}>
                        {isComplete ? <Check className="h-3 w-3" /> : index + 1}
                      </span>
                      <span className="min-w-0 flex-1 truncate">{item.content[language].title}</span>
                    </Link>
                  </li>
                )
              })}
            </ol>
          </section>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => completeLesson(lesson.id)}
              disabled={completed}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 px-3 py-2.5 text-[10px] font-semibold text-[#263551] transition hover:bg-white disabled:border-emerald-200 disabled:bg-emerald-50 disabled:text-emerald-700"
            >
              {completed ? <Check className="h-3.5 w-3.5" /> : <BookOpen className="h-3.5 w-3.5" />}
              {completed ? t('completed') : t('markComplete')}
            </button>
            <a href="#lesson-quiz" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#f7a51a] px-3 py-2.5 text-[10px] font-bold text-[#101b34] transition hover:bg-amber-300">
              {t('takeQuiz')} <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </aside>
      </div>
    </article>
  )
}
