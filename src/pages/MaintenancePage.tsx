import type { MaintenanceSettings } from '../services/announcementsApi'
import { useLanguage } from '../i18n/LanguageProvider'

export function MaintenancePage({ maintenance }: { maintenance: MaintenanceSettings }) {
  const { language, t } = useLanguage()
  const title = language === 'fr' ? maintenance.titleFr : maintenance.titleEn
  const message = language === 'fr' ? maintenance.messageFr : maintenance.messageEn

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0B1833] px-4 py-12 text-white">
      <section className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/5 p-6 text-center shadow-2xl sm:p-10">
        <img
          src="/space-learn-africa-mark.png"
          alt="SPACE LEARN"
          className="mx-auto h-16 w-28 object-contain"
        />
        <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-[#C6A15B]">SPACE LEARN</p>
        <h1 className="mt-3 text-3xl font-black sm:text-4xl">{title || t('maintenanceTitleFallback')}</h1>
        <p className="mt-4 text-base leading-7 text-white/85">{message || t('maintenanceMessageFallback')}</p>
        <p className="mt-3 text-sm text-white/70">{t('maintenanceBackSoon')}</p>
        {maintenance.estimatedEndAt && (
          <p className="mt-6 rounded-2xl border border-[#C6A15B]/40 bg-[#C6A15B]/10 px-4 py-3 text-sm">
            <span className="font-semibold text-[#E8CD95]">{t('maintenanceEstimatedReturn')}: </span>
            {new Date(maintenance.estimatedEndAt).toLocaleString(language)}
          </p>
        )}
        {maintenance.contactEmail && (
          <p className="mt-5 text-sm text-white/75">
            {t('maintenanceContact')}: <a className="font-semibold text-[#E8CD95] underline underline-offset-2" href={`mailto:${maintenance.contactEmail}`}>{maintenance.contactEmail}</a>
          </p>
        )}
      </section>
    </main>
  )
}
