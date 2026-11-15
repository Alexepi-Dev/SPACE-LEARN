import { useLanguage } from '../i18n/LanguageProvider'
import { cookiePolicy } from '../i18n/cookiePolicy'
import { useCookieConsent } from './CookieConsentContext'
import { Link } from 'react-router-dom'

export function SiteFooter() {
  const { language, t } = useLanguage()
  const { openSettings } = useCookieConsent()
  const cookieCopy = cookiePolicy[language]
  return (
    <footer className="bg-spaceNight px-4 py-8 text-spaceMist/80 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-[0.8fr_1.2fr] md:items-center">
        <div>
          <Link to="/" className="text-sm font-extrabold tracking-[0.12em] text-white">SPACE LEARN</Link>
          <p className="mt-1 text-xs font-medium text-sunAmber">{t('tagline')}</p>
        </div>
        <div className="space-y-3 md:text-right">
          <p className="text-xs leading-5 text-spaceMist/70">{t('footerDisclaimer')}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs md:justify-end">
            <Link to="/updates" className="underline underline-offset-2 hover:text-white">
              {t('updatesLink')}
            </Link>
            <a
              href="https://github.com/Alexepi-Dev"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2 hover:text-white"
            >
              {t('developedBy')} <span className="font-semibold text-spaceMist/90">(A.K. VEGBE)</span>
            </a>
            <Link to="/cookies" className="underline underline-offset-2 hover:text-white">
              {cookieCopy.policyLink}
            </Link>
            <button type="button" onClick={openSettings} className="underline underline-offset-2 hover:text-white">
              {cookieCopy.manageCookies}
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
