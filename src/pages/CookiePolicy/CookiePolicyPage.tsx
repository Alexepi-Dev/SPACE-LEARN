import { PageHeading } from '../components/PageHeading'
import { useCookieConsent } from '../components/CookieConsentContext'
import { cookiePolicy } from '../i18n/cookiePolicy'
import { useLanguage } from '../i18n/LanguageProvider'

export function CookiePolicyPage() {
  const { language } = useLanguage()
  const { openSettings } = useCookieConsent()
  const copy = cookiePolicy[language]

  return (
    <article className="mx-auto max-w-4xl">
      <PageHeading title={copy.policyTitle} description={copy.policyDescription} />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-slate-500">
          {copy.lastUpdatedLabel} {copy.updatedDate}
        </p>
        <button
          type="button"
          onClick={openSettings}
          className="rounded-full bg-[#0b1733] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#172750]"
        >
          {copy.manageCookies}
        </button>
      </div>

      <div className="space-y-4">
        {copy.sections.map((section) => (
          <section key={section.heading} className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-sm font-bold text-[#0d1934]">{section.heading}</h2>
            {section.paragraphs?.map((paragraph) => (
              <p key={paragraph} className="mt-2 text-xs leading-6 text-slate-600 sm:text-sm">
                {paragraph}
              </p>
            ))}
            {section.bullets && (
              <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-6 text-slate-600 sm:text-sm">
                {section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
              </ul>
            )}
            {section.subsections?.map((subsection) => (
              <div key={subsection.heading} className="mt-4 border-t border-slate-100 pt-4">
                <h3 className="text-xs font-bold text-[#263551]">{subsection.heading}</h3>
                {subsection.paragraphs?.map((paragraph) => (
                  <p key={paragraph} className="mt-2 text-xs leading-6 text-slate-600 sm:text-sm">
                    {paragraph}
                  </p>
                ))}
                {subsection.bullets && (
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-6 text-slate-600 sm:text-sm">
                    {subsection.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </section>
        ))}
      </div>
    </article>
  )
}
