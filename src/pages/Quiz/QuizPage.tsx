import { useState } from 'react'
import { ArrowRight, Check, CircleHelp, RotateCcw, X } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { PageHeading } from '../../components/PageHeading'
import { useLanguage } from '../../i18n/LanguageProvider'
import { getLesson, lessons } from '../../services/lessonCatalog'
import { useProgressStore } from '../../store/useProgressStore'

export function QuizPage() {
  const { lessonId } = useParams()
  const lesson = getLesson(lessonId)
  if (!lessonId) return <QuizPickerPage />
  if (!lesson) return <Navigate to="/academy" replace />
  return <LessonQuiz key={lesson.id} lessonId={lesson.id} />
}

function QuizPickerPage() {
  const { language, t } = useLanguage()

  return (
    <div>
      <PageHeading title={t('navQuiz')} description={t('learningPathDescription')} />
      <div className="grid gap-4 md:grid-cols-2">
        {lessons.map((lesson) => (
          <Link key={lesson.id} to={`/quiz/${lesson.id}`} className="flex items-center justify-between gap-4 rounded-2xl border border-spaceMist bg-white p-5 shadow-sm transition hover:border-secondaryGreen">
            <span>
              <span className="block text-xs font-semibold uppercase tracking-wide text-secondaryGreen">{t(lesson.topic)}</span>
              <span className="mt-2 block font-bold text-spaceNight">{lesson.content[language].title}</span>
            </span>
            <ArrowRight className="h-5 w-5 shrink-0 text-sunAmber" />
          </Link>
        ))}
      </div>
    </div>
  )
}

export function LessonQuiz({ lessonId, embedded = false }: { lessonId: string; embedded?: boolean }) {
  const { language, t } = useLanguage()
  const lesson = getLesson(lessonId)
  const saveQuizResult = useProgressStore((state) => state.saveQuizResult)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  if (!lesson) return <Navigate to="/academy" replace />

  const content = lesson.content[language]
  const currentQuestion = content.quiz[questionIndex]
  const isCorrect = selectedIndex === currentQuestion.answerIndex
  const percent = Math.round(((questionIndex + (checked ? 1 : 0)) / content.quiz.length) * 100)

  const checkAnswer = () => {
    if (selectedIndex === null || checked) return
    setChecked(true)
    if (selectedIndex === currentQuestion.answerIndex) setScore((value) => value + 1)
  }

  const nextQuestion = () => {
    if (!checked) return
    if (questionIndex === content.quiz.length - 1) {
      const finalScore = score
      saveQuizResult({
        lessonId,
        score: finalScore,
        total: content.quiz.length,
        completedAt: new Date().toISOString(),
      })
      setFinished(true)
      return
    }
    setQuestionIndex((value) => value + 1)
    setSelectedIndex(null)
    setChecked(false)
  }

  if (finished) {
    return (
      <div id={embedded ? 'lesson-quiz' : undefined} className="mx-auto max-w-xl rounded-2xl border border-spaceMist bg-white p-6 text-center shadow-sm sm:p-8">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-spaceMist text-secondaryGreen"><Check className="h-6 w-6" /></span>
        <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.18em] text-secondaryGreen">{t('quizComplete')}</p>
        <h1 className="mt-2 text-2xl font-black text-spaceNight">{content.title}</h1>
        <p className="mt-5 text-sm text-slate-500">{t('quizResult')}</p>
        <p className="mt-1 text-5xl font-black text-spaceNight">{score}<span className="text-2xl text-spaceBlue/70">/{content.quiz.length}</span></p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/progress" className="inline-flex items-center justify-center gap-2 rounded-full bg-spaceNight px-5 py-3 text-sm font-bold text-white">{t('navProgress')} <ArrowRight className="h-4 w-4" /></Link>
          <Link to={`/quiz/${lesson.id}`} className="inline-flex items-center justify-center gap-2 rounded-full border border-spaceBlue/20 px-5 py-3 text-sm font-semibold text-spaceNight"><RotateCcw className="h-4 w-4" />{t('retryQuiz')}</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      {!embedded && (
        <>
          <Link to={`/lesson/${lesson.id}`} className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-spaceBlue/80 hover:text-spaceNight">← {t('reviewLesson')}</Link>
          <PageHeading eyebrow={t('quizFor')} title={content.title} />
        </>
      )}
      <section id={embedded ? 'lesson-quiz' : undefined} className="scroll-mt-24 rounded-2xl border border-spaceMist bg-white p-5 text-spaceNight shadow-sm sm:p-7">
        <div className="mb-6 flex items-center justify-between gap-4">
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-secondaryGreen">{t('navQuiz')} · {t('question')} {questionIndex + 1} {t('outOf')} {content.quiz.length}</span>
          <span className="text-xs text-slate-500">{percent}%</span>
        </div>
        <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-spaceMist">
          <div className="h-full rounded-full bg-sunAmber transition-all" style={{ width: `${percent}%` }} />
        </div>
        <h2 className="text-lg font-bold leading-relaxed text-spaceNight sm:text-xl">{currentQuestion.prompt}</h2>
        <div className="mt-6 space-y-3">
          {currentQuestion.options.map((option, index) => {
            const isAnswer = checked && index === currentQuestion.answerIndex
            const isWrongSelection = checked && index === selectedIndex && !isCorrect
            return (
              <button
                type="button"
                key={option}
                onClick={() => !checked && setSelectedIndex(index)}
                disabled={checked}
                className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left text-sm leading-6 transition ${
                  isAnswer
                    ? 'border-secondaryGreen bg-spaceMist text-spaceBlue'
                    : isWrongSelection
                      ? 'border-sunAmber bg-spaceMist text-spaceBlue'
                      : selectedIndex === index
                        ? 'border-secondaryGreen bg-spaceMist text-spaceNight'
                        : 'border-spaceBlue/20 bg-white text-spaceBlue hover:bg-spaceMist'
                }`}
              >
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border border-current text-[10px]">
                  {isAnswer ? <Check className="h-3.5 w-3.5" /> : isWrongSelection ? <X className="h-3.5 w-3.5" /> : String.fromCharCode(65 + index)}
                </span>
                {option}
              </button>
            )
          })}
        </div>
        {!checked && <p className="mt-4 flex items-center gap-2 text-xs text-slate-500"><CircleHelp className="h-4 w-4" />{t('selectAnswer')}</p>}
        {checked && (
          <div className={`mt-5 rounded-xl border p-4 text-xs leading-5 ${isCorrect ? 'border-secondaryGreen bg-spaceMist text-spaceBlue' : 'border-sunAmber bg-spaceMist text-spaceBlue'}`} role="status" aria-live="polite">
            <p className="font-bold">{isCorrect ? t('correct') : t('incorrect')}</p>
            {!isCorrect && <p className="mt-2">{t('correctAnswer')} {currentQuestion.options[currentQuestion.answerIndex]}</p>}
            <p className="mt-2"><strong>{t('explanation')}:</strong> {isCorrect ? currentQuestion.explanation : currentQuestion.correction}</p>
          </div>
        )}
        <button
          type="button"
          onClick={checked ? nextQuestion : checkAnswer}
          disabled={selectedIndex === null}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-sunAmber px-5 py-3 text-sm font-bold text-spaceNight transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
        >
          {checked ? questionIndex === content.quiz.length - 1 ? t('finishQuiz') : t('nextQuestion') : t('checkAnswer')} <ArrowRight className="h-4 w-4" />
        </button>
      </section>
    </div>
  )
}
