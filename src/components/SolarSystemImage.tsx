import { useLanguage } from '../i18n/LanguageProvider'

const imageUrl = '/solar-system-illustration.png'

export function SolarSystemImage({ compact = false }: { compact?: boolean }) {
  const { t } = useLanguage()

  if (compact) {
    return (
      <figure className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
        <img
          src={imageUrl}
          alt={t('solarSystemImageAlt')}
          className="aspect-video w-full rounded-lg bg-spaceNight object-cover ring-1 ring-white/10 sm:w-40 sm:shrink-0"
          loading="lazy"
          decoding="async"
        />
        <figcaption className="min-w-0">
          <span className="inline-flex rounded-full bg-white/10 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wide text-sunAmber">
            {t('illustrationLabel')}
          </span>
          <p className="text-[10px] leading-5 text-spaceMist/80 sm:text-[11px]">{t('solarSystemImageNote')}</p>
        </figcaption>
      </figure>
    )
  }

  return (
    <figure className="w-full max-w-[500px]">
      <img
        src={imageUrl}
        alt={t('solarSystemImageAlt')}
        className="aspect-video w-full rounded-2xl bg-spaceNight object-cover ring-1 ring-white/10"
        decoding="async"
      />
      <figcaption className="mt-2 text-center">
        <span className="inline-flex rounded-full bg-white/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-sunAmber">
          {t('illustrationLabel')}
        </span>
        <p className="text-[11px] leading-5 text-spaceMist/80 sm:text-xs">{t('solarSystemImageNote')}</p>
      </figcaption>
    </figure>
  )
}
