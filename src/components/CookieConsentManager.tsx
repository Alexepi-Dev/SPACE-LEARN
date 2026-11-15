import { useState } from 'react'
import { Link } from 'react-router-dom'
import { cookiePolicy } from '../i18n/cookiePolicy'
import { useLanguage } from '../i18n/LanguageProvider'
import { useCookieConsent } from './CookieConsentContext'
import type { ConsentChoices, CookieConsent } from './CookieConsentContext'

export function CookieConsentManager() {
  const { language } = useLanguage()
  const {
    consent,
    settingsOpen,
    storageError,
    openSettings,
    closeSettings,
    saveConsent,
  } = useCookieConsent()
  const copy = cookiePolicy[language]
  const saveAll = () => saveConsent({ preferences: true, statistics: true })
  const rejectOptional = () => saveConsent({ preferences: false, statistics: false })

  return (
    <>
      {consent === null && !settingsOpen && (
        <aside
          aria-label={copy.bannerTitle}
          className="fixed inset-x-0 bottom-0 z-[60] max-h-[85vh] overflow-y-auto border-t border-spaceMist bg-white p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] text-spaceNight shadow-[0_-8px_32px_rgba(11,24,51,0.18)] sm:bottom-4 sm:left-auto sm:right-4 sm:max-w-xl sm:rounded-2xl sm:border"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold text-spaceNight">{copy.bannerTitle}</h2>
              <p className="mt-1 text-xs leading-5 text-spaceBlue/80">{copy.bannerDescription}</p>
            </div>
            <Link to="/cookies" className="shrink-0 text-[10px] font-semibold text-secondaryGreen underline underline-offset-2">
              {copy.policyLink}
            </Link>
          </div>
          {storageError && <p className="mt-2 text-xs text-red-700" role="alert">{copy.storageError}</p>}
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
            <button
              type="button"
              onClick={rejectOptional}
              className="rounded-full border border-spaceBlue/20 px-4 py-2.5 text-xs font-semibold text-spaceBlue hover:bg-spaceMist"
            >
              {copy.rejectNonessential}
            </button>
            <button
              type="button"
              onClick={openSettings}
              className="rounded-full border border-spaceBlue/20 px-4 py-2.5 text-xs font-semibold text-spaceBlue hover:bg-spaceMist"
            >
              {copy.customize}
            </button>
            <button
              type="button"
              onClick={saveAll}
              className="rounded-full bg-spaceNight px-4 py-2.5 text-xs font-semibold text-white hover:bg-deepIndigo"
            >
              {copy.acceptNonessential}
            </button>
          </div>
        </aside>
      )}

      {settingsOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-spaceNight/70 p-3 sm:items-center sm:p-6"
          onKeyDown={(event) => {
            if (event.key === 'Escape' && consent) closeSettings()
          }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && consent) closeSettings()
          }}
        >
          <CookieSettingsDialog
            consent={consent}
            storageError={storageError}
            copy={copy}
            closeSettings={closeSettings}
            rejectOptional={rejectOptional}
            saveConsent={saveConsent}
          />
        </div>
      )}

      {storageError && consent && (
        <p
          className="fixed bottom-20 left-3 right-3 z-[80] rounded-xl bg-red-50 p-3 text-xs text-red-800 shadow-lg sm:bottom-4 sm:left-auto sm:right-4 sm:max-w-md"
          role="alert"
        >
          {copy.storageError}
        </p>
      )}
    </>
  )
}

function CookieSettingsDialog({
  consent,
  storageError,
  copy,
  closeSettings,
  rejectOptional,
  saveConsent,
}: {
  consent: CookieConsent | null
  storageError: boolean
  copy: (typeof cookiePolicy)[keyof typeof cookiePolicy]
  closeSettings: () => void
  rejectOptional: () => void
  saveConsent: (choices: ConsentChoices) => void
}) {
  const [preferences, setPreferences] = useState(consent?.preferences ?? false)
  const [statistics, setStatistics] = useState(consent?.statistics ?? false)

  return (
    <section
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-settings-title"
      className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-5 text-spaceNight shadow-2xl sm:p-7"
    >
      <h2 id="cookie-settings-title" className="text-lg font-bold text-spaceNight">
        {copy.settingsTitle}
      </h2>
      <p className="mt-1 text-xs leading-5 text-spaceBlue/80">{copy.settingsDescription}</p>

      <div className="mt-5 space-y-3">
        <PreferenceRow
          title={copy.necessaryTitle}
          description={copy.necessaryDescription}
          checked
          disabled
          status={copy.alwaysOn}
        />
        <PreferenceRow
          title={copy.preferencesTitle}
          description={copy.preferencesDescription}
          checked={preferences}
          onChange={setPreferences}
        />
        <PreferenceRow
          title={copy.statisticsTitle}
          description={copy.statisticsDescription}
          checked={statistics}
          onChange={setStatistics}
        />
        <PreferenceRow
          title={copy.marketingTitle}
          description={copy.marketingDescription}
          checked={false}
          disabled
        />
      </div>

      {storageError && <p className="mt-4 text-xs text-red-700" role="alert">{copy.storageError}</p>}
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {consent && (
          <button
            type="button"
            onClick={closeSettings}
            className="rounded-full border border-spaceBlue/20 px-4 py-2.5 text-xs font-semibold text-spaceBlue hover:bg-spaceMist"
          >
            {copy.cancel}
          </button>
        )}
        <button
          type="button"
          onClick={rejectOptional}
          className="rounded-full border border-spaceBlue/20 px-4 py-2.5 text-xs font-semibold text-spaceBlue hover:bg-spaceMist"
        >
          {copy.rejectNonessential}
        </button>
        <button
          type="button"
          onClick={() => saveConsent({ preferences, statistics })}
          className="rounded-full bg-spaceNight px-4 py-2.5 text-xs font-semibold text-white hover:bg-deepIndigo"
        >
          {copy.saveChoices}
        </button>
      </div>
    </section>
  )
}

function PreferenceRow({
  title,
  description,
  checked,
  disabled = false,
  status,
  onChange,
}: {
  title: string
  description: string
  checked: boolean
  disabled?: boolean
  status?: string
  onChange?: (checked: boolean) => void
}) {
  return (
    <label className="flex items-start gap-3 rounded-xl border border-spaceBlue/20 p-3">
      <input
        type="checkbox"
        className="mt-1 h-4 w-4 accent-secondaryGreen"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange?.(event.currentTarget.checked)}
      />
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2 text-xs font-bold text-spaceNight">
          {title}
          {status && <span className="rounded-full bg-spaceMist px-2 py-0.5 text-[9px] font-semibold text-secondaryGreen">{status}</span>}
        </span>
        <span className="mt-1 block text-[11px] leading-5 text-spaceBlue/80">{description}</span>
      </span>
    </label>
  )
}
