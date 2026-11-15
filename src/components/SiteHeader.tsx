import { Link, NavLink } from 'react-router-dom'
import { BookOpen, Compass, FlaskConical, Home, Image, ListChecks, MoreHorizontal, Rocket, Telescope } from 'lucide-react'
import { useState } from 'react'
import { useLanguage } from '../i18n/LanguageProvider'
import type { TranslationKey } from '../i18n/translations'

const links: { to: string; label: TranslationKey; mobileLabel: TranslationKey; icon: typeof Home }[] = [
  { to: '/', label: 'navHome', mobileLabel: 'navHomeShort', icon: Home },
  { to: '/academy', label: 'navAcademy', mobileLabel: 'navAcademyShort', icon: BookOpen },
  { to: '/apod', label: 'navApod', mobileLabel: 'navApod', icon: Image },
  { to: '/missions', label: 'navMissions', mobileLabel: 'navMissions', icon: Rocket },
  { to: '/simulator', label: 'navSimulator', mobileLabel: 'navSimulator', icon: FlaskConical },
  { to: '/quiz', label: 'navQuiz', mobileLabel: 'navQuizShort', icon: ListChecks },
  { to: '/explorer', label: 'navExplorer', mobileLabel: 'navExplorerShort', icon: Compass },
  { to: '/progress', label: 'navProgress', mobileLabel: 'navProgressShort', icon: Telescope },
]

export function SiteHeader() {
  const { language, setLanguage, t } = useLanguage()
  const [moreOpen, setMoreOpen] = useState(false)
  const mainMobileLinks = links.filter((item) => ['/', '/academy', '/quiz', '/explorer', '/progress'].includes(item.to))
  const additionalLinks = links.filter((item) => ['/apod', '/missions', '/simulator'].includes(item.to))
  const desktopLinks = links.filter((item) => ['/', '/academy', '/apod', '/missions', '/simulator', '/quiz', '/explorer'].includes(item.to))

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-spaceNight text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2 sm:px-6 lg:h-[62px] lg:px-8">
        <Link to="/" className="flex min-w-0 shrink-0 items-center gap-2.5" aria-label="SPACE LEARN">
          <img
            src="/space-learn-africa-mark.png"
            alt=""
            className="h-9 w-[62px] shrink-0 object-contain"
          />
          <span className="min-w-0">
            <span className="block truncate text-[11px] font-extrabold tracking-[0.1em] text-white sm:text-xs">SPACE LEARN</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label={t('menu')}>
          {desktopLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `border-b-2 px-2 py-2 text-[11px] font-medium transition lg:px-2.5 ${
                isActive ? 'border-sunAmber text-white' : 'border-transparent text-spaceMist/80 hover:text-white'
                }`
              }
            >
              {t(label)}
            </NavLink>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <div className="flex rounded-full border border-white/15 p-0.5" role="group" aria-label={t('language')}>
            <button
              type="button"
              onClick={() => setLanguage('fr')}
              aria-pressed={language === 'fr'}
              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${language === 'fr' ? 'bg-white text-spaceNight' : 'text-spaceMist/80'}`}
            >
              FR
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              aria-pressed={language === 'en'}
              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${language === 'en' ? 'bg-white text-spaceNight' : 'text-spaceMist/80'}`}
            >
              EN
            </button>
          </div>
          <Link to="/academy" className="hidden rounded-full bg-sunAmber px-4 py-2 text-[11px] font-bold text-spaceNight transition hover:brightness-110 sm:inline-flex">
            {t('startNow')}
          </Link>
        </div>
      </div>

      <nav className="mobile-bottom-nav fixed inset-x-0 bottom-0 z-50 grid grid-cols-6 border-t border-white/10 bg-spaceNight/95 px-1 pb-1 pt-1 backdrop-blur md:hidden" aria-label={t('menu')}>
        {mainMobileLinks.map(({ to, mobileLabel, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex min-w-0 flex-col items-center gap-1 rounded-xl py-1.5 text-[10px] font-medium ${
                isActive ? 'text-sunAmber' : 'text-spaceMist/70'
              }`
            }
          >
            <Icon className="h-[18px] w-[18px]" />
            <span className="max-w-full truncate">{t(mobileLabel)}</span>
          </NavLink>
        ))}
        <button
          type="button"
          onClick={() => setMoreOpen((open) => !open)}
          className={`flex min-w-0 flex-col items-center gap-1 rounded-xl py-1.5 text-[10px] font-medium ${moreOpen ? 'text-sunAmber' : 'text-spaceMist/70'}`}
          aria-expanded={moreOpen}
          aria-label={t('more')}
        >
          <MoreHorizontal className="h-[18px] w-[18px]" />
          <span>{t('more')}</span>
        </button>
        {moreOpen && (
          <div className="col-span-6 flex flex-wrap justify-center gap-2 border-t border-white/10 px-2 py-2">
            {additionalLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMoreOpen(false)}
                className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-xs font-medium text-spaceMist/90 hover:bg-white/10"
              >
                <Icon className="h-4 w-4 text-sunAmber" />
                {t(label)}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </header>
  )
}
