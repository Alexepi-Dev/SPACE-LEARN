import { useState } from 'react'
import { useLanguage } from '../i18n/LanguageProvider'
import type { ApodItem } from '../services/apod.service'

export function ApodMedia({ item }: { item: ApodItem }) {
  const { t } = useLanguage()
  const [failed, setFailed] = useState(false)

  if (!failed && item.mediaType === 'video' && item.mediaUrl) {
    return (
      <video
        className="aspect-video w-full bg-spaceNight object-contain"
        controls
        preload="metadata"
        poster={item.previewImageUrl ?? undefined}
        aria-label={item.title}
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
        alt={item.alt ?? item.title}
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
