import { useState } from 'react'
import { CalendarClock, CircleCheck, Info, TriangleAlert, Wrench, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Announcement } from '../services/announcementsApi'
import { useLanguage } from '../i18n/LanguageProvider'
import type { TranslationKey } from '../i18n/translations'

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

function getAreaForPath(pathname: string): Announcement['areas'][number] | null {
  const firstSegment = pathname.split('/').filter(Boolean)[0]
  if (!firstSegment) return 'site'
  if (firstSegment === 'lesson') return 'academy'
  if (firstSegment === 'admin') return null
  const routeAreas: Record<string, Announcement['areas'][number]> = {
    apod: 'apod',
    academy: 'academy',
    missions: 'missions',
    simulator: 'simulator',
    quiz: 'quiz',
    explorer: 'explorer',
    progress: 'progress',
  }
  return routeAreas[firstSegment] ?? null
}

export function announcementsForPath(announcements: Announcement[], pathname: string): Announcement[] {
  const area = getAreaForPath(pathname)
  return announcements.filter((announcement) =>
    announcement.areas.includes('site')
    || announcement.areas.includes('api')
    || (area !== null && announcement.areas.includes(area)))
}

export function AnnouncementBanner({ announcement }: { announcement: Announcement }) {
  const { language, t } = useLanguage()
  const Icon = typeIcons[announcement.type]
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  const title = language === 'fr' ? announcement.titleFr : announcement.titleEn
  const description = language === 'fr' ? announcement.descriptionFr : announcement.descriptionEn
  const eventDates = [
    announcement.startAt && `${t('announcementStarts')}: ${new Date(announcement.startAt).toLocaleString(language)}`,
    announcement.endAt && `${t('announcementEnds')}: ${new Date(announcement.endAt).toLocaleString(language)}`,
  ].filter(Boolean)

  return (
    <aside
      role={announcement.critical ? 'alert' : 'status'}
      aria-live={announcement.critical ? 'assertive' : 'polite'}
      className={`border-b px-4 py-3 text-white sm:px-6 ${
        announcement.critical
          ? 'border-[#C6A15B] bg-[#0B1833]'
          : 'border-[#236B50] bg-[#174F3B]'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-start gap-3">
        <Icon aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-[#C6A15B]" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="font-bold">{title}</p>
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold">
              {t(typeLabelKeys[announcement.type])}
            </span>
            {announcement.critical && (
              <span className="text-[10px] font-bold uppercase tracking-wide text-[#E8CD95]">
                {t('announcementCritical')}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm leading-5 text-white/90">{description}</p>
          {eventDates.length > 0 && (
            <p className="mt-1 text-xs text-white/75">{eventDates.join(' · ')}</p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <Link
              to={`/updates#announcement-${encodeURIComponent(announcement.id)}`}
              className="text-xs font-bold text-[#E8CD95] underline underline-offset-2 hover:text-white"
            >
              {t('announcementReadMore')}
            </Link>
            {announcement.critical && (
              <button
                type="button"
                onClick={() => setDismissed(true)}
                className="rounded-full border border-white/30 px-3 py-1 text-xs font-semibold hover:bg-white/10"
              >
                {t('announcementAcknowledge')}
              </button>
            )}
          </div>
        </div>
        {!announcement.critical && (
          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label={t('announcementClose')}
            className="rounded-full p-1 text-white/80 hover:bg-white/10 hover:text-white"
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        )}
      </div>
    </aside>
  )
}
