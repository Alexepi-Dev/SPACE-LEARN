import { useEffect, useState } from 'react'
import { CalendarClock, CircleCheck, Info, TriangleAlert, Wrench } from 'lucide-react'
import { getAnnouncementHistory, type Announcement } from '../../services/announcementsApi'
import { useLanguage } from '../../i18n/LanguageProvider'
import type { TranslationKey } from '../../i18n/translations'

const typeLabelKeys: Record<Announcement['type'], TranslationKey> = {
  update: 'announcementTypeUpdate',
  scheduled_maintenance: 'announcementTypeScheduledMaintenance',
  maintenance_in_progress: 'announcementTypeMaintenanceInProgress',
  maintenance_completed: 'announcementTypeMaintenanceCompleted',
  incident: 'announcementTypeIncident',
}

const typeIcons = {
  update: Info,
  scheduled_maintenance: CalendarClock,
  maintenance_in_progress: Wrench,
  maintenance_completed: CircleCheck,
  incident: TriangleAlert,
}

export function UpdatesPage({
  activeAnnouncements,
  siteStatusError,
}: {
  activeAnnouncements: Announcement[]
  siteStatusError: boolean
}) {
  const { t } = useLanguage()
  const [history, setHistory] = useState<Announcement[] | null>(null)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    void getAnnouncementHistory(controller.signal)
      .then(({ announcements }) => {
        setHistory(announcements)
        setLoadError(false)
      })
      .catch(() => {
        if (controller.signal.aborted) return
        setLoadError(true)
      })
    return () => controller.abort()
  }, [])

  const activeIds = new Set(activeAnnouncements.map((announcement) => announcement.id))
  const archivedHistory = history?.filter((announcement) => !activeIds.has(announcement.id)) ?? []

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header>
        <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#236B50]">{t('updatesLink')}</p>
        <h1 className="mt-2 text-3xl font-black text-[#0B1833] sm:text-4xl">{t('updatesTitle')}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{t('updatesDescription')}</p>
      </header>

      <section aria-labelledby="current-announcements">
        <h2 id="current-announcements" className="text-xl font-black text-[#0B1833]">{t('updatesActive')}</h2>
        {activeAnnouncements.length ? (
          <div className="mt-4 space-y-3">
            {activeAnnouncements.map((announcement) => (
              <AnnouncementCard key={announcement.id} announcement={announcement} />
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">{t('updatesEmpty')}</p>
        )}
      </section>

      <section aria-labelledby="announcement-history">
        <h2 id="announcement-history" className="text-xl font-black text-[#0B1833]">{t('updatesHistory')}</h2>
        {(loadError || siteStatusError) && <p role="alert" className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">{t('updatesLoadError')}</p>}
        {!loadError && history === null && <p role="status" className="mt-4 text-sm text-slate-600">{t('updatesLoading')}</p>}
        {archivedHistory.length > 0 && (
          <div className="mt-4 space-y-3">
            {archivedHistory.map((announcement) => (
              <AnnouncementCard key={announcement.id} announcement={announcement} />
            ))}
          </div>
        )}
        {history?.length === 0 && <p className="mt-4 text-sm text-slate-600">{t('updatesEmpty')}</p>}
      </section>
    </div>
  )
}

function AnnouncementCard({ announcement }: { announcement: Announcement }) {
  const { language, t } = useLanguage()
  const Icon = typeIcons[announcement.type]
  const title = language === 'fr' ? announcement.titleFr : announcement.titleEn
  const description = language === 'fr' ? announcement.descriptionFr : announcement.descriptionEn
  const publishedAt = announcement.publishedAt
    ? new Date(announcement.publishedAt).toLocaleString(language)
    : null
  const startsAt = announcement.startAt ? new Date(announcement.startAt).toLocaleString(language) : null
  const endsAt = announcement.endAt ? new Date(announcement.endAt).toLocaleString(language) : null

  return (
    <article
      id={`announcement-${announcement.id}`}
      className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#174F3B]/10 text-[#174F3B]">
          <Icon aria-hidden="true" size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold text-[#0B1833]">{title}</h3>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
              {t(typeLabelKeys[announcement.type])}
            </span>
            {announcement.critical && (
              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-900">
                {t('announcementCritical')}
              </span>
            )}
          </div>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{description}</p>
          {(publishedAt || startsAt || endsAt) && (
            <dl className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
              {publishedAt && <div><dt className="inline font-semibold">{t('announcementPublished')}: </dt><dd className="inline">{publishedAt}</dd></div>}
              {startsAt && <div><dt className="inline font-semibold">{t('announcementStarts')}: </dt><dd className="inline">{startsAt}</dd></div>}
              {endsAt && <div><dt className="inline font-semibold">{t('announcementEnds')}: </dt><dd className="inline">{endsAt}</dd></div>}
            </dl>
          )}
        </div>
      </div>
    </article>
  )
}
