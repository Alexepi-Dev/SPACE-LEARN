import { Info } from 'lucide-react'
import { LessonCard } from '../../components/LessonCard'
import { PageHeading } from '../../components/PageHeading'
import { useLanguage } from '../../i18n/LanguageProvider'
import { lessons } from '../../services/lessonCatalog'

export function AcademyPage() {
  const { t } = useLanguage()

  return (
    <div>
      <PageHeading eyebrow={t('academyTitle')} title={t('academyChooseTitle')} description={t('academyDescription')} />
      <div className="mb-6 flex items-center gap-3 rounded-2xl border border-spaceTurquoise/20 bg-white/70 px-4 py-3 text-xs leading-5 text-slate-600">
        <Info className="h-5 w-5 shrink-0 text-[#139f98]" />
        <div>
          <strong className="font-semibold text-spaceNight">{t('learningContent')}</strong>
          <p>{t('learningContentDescription')}</p>
        </div>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {lessons.map((lesson) => <LessonCard key={lesson.id} lesson={lesson} />)}
      </div>
      <p className="mt-5 text-[11px] leading-5 text-slate-500">{lessons.length} {t('lessonCount')} · {t('learningContentDescription')}</p>
    </div>
  )
}
