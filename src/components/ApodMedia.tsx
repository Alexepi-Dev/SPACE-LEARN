import { useState } from 'react'
import { useLanguage } from '../i18n/LanguageProvider'
import type { ApodItem } from '../services/apod.service'

export function ApodMedia({ item, preferOriginal = false }: { item: ApodItem; preferOriginal?: boolean }) {
  const { language, t } = useLanguage()
  const [failed, setFailed] = useState(false)
  const frenchTranslation = language === 'fr' && !preferOriginal ? item.frenchTranslation : null
  const title = frenchTranslation?.title ?? item.title
  const alt = frenchTranslation
    ? frenchTranslation.alt ?? frenchTranslation.title
    : item.alt ?? title

  if (!failed && item.mediaType === 'video' && item.mediaUrl) {
    return (
      <video
        className="aspect-video w-full bg-spaceNight object-contain"
        controls
        preload="metadata"
        poster={item.previewImageUrl ?? undefined}
        aria-label={title}
        onError={() => setFailed(true)}
      >
        <source src={item.mediaUrl} />
      </video>
    )
  }

  const imageUrl = item.mediaType === 'image' ? item.mediaUrl : item.previewImageUrl
  if (!failed && imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={alt}
        className="aspect-video w-full bg-spaceNight object-contain"
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
      />
    )
  }

  return (
    <div className="flex aspect-video items-center justify-center bg-spaceNight px-6 text-center text-xs leading-5 text-slate-300">
      {t('apodNoPreview')}
    </div>
  )
}
