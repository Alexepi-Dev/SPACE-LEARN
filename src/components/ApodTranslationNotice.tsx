import { Info } from 'lucide-react'
import { useLanguage } from '../i18n/LanguageProvider'
import type { ApodItem } from '../services/apod.service'

export function ApodTranslationNotice({ items }: { items: ApodItem[] }) {
  const { language, t } = useLanguage()
  if (language !== 'fr' || items.length === 0) return null

  const status = items[0].translationStatus
  let message: string | null = null
  if (status === 'not_configured') message = t('apodTranslationNotConfigured')
  if (status === 'unavailable' || status === 'not_requested') message = t('apodTranslationUnavailable')
  if (status === 'translated') message = t('apodTranslationNotice')

  if (!message) return null

  return (
    <p
      role={status === 'not_configured' || status === 'unavailable' ? 'status' : 'note'}
      className={`mb-5 flex items-start gap-2 rounded-2xl border px-4 py-3 text-xs leading-5 ${
        status === 'translated'
          ? 'border-spaceTurquoise/30 bg-spaceTurquoise/10 text-spaceBlue'
          : 'border-sunAmber/40 bg-sunAmber/10 text-spaceNight'
      }`}
    >
      <Info aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
      {message}
    </p>
  )
}
