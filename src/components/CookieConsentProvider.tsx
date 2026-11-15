import { useState, type ReactNode } from 'react'
import { CookieConsentContext, type CookieConsent, type ConsentChoices } from './CookieConsentContext'

const CONSENT_STORAGE_KEY = 'space-learn-africa-cookie-consent'
const CONSENT_VERSION = 1
const CONSENT_DURATION_MS = 180 * 24 * 60 * 60 * 1000

function isCookieConsent(value: unknown): value is CookieConsent {
  if (!value || typeof value !== 'object') return false
  const consent = value as Partial<CookieConsent>
  return consent.version === CONSENT_VERSION
    && consent.necessary === true
    && typeof consent.preferences === 'boolean'
    && typeof consent.statistics === 'boolean'
    && consent.marketing === false
    && typeof consent.savedAt === 'number'
    && typeof consent.expiresAt === 'number'
}

function readStoredConsent(): { consent: CookieConsent | null; storageError: boolean } {
  try {
    const stored = window.localStorage.getItem(CONSENT_STORAGE_KEY)
    if (!stored) return { consent: null, storageError: false }

    let parsed: unknown
    try {
      parsed = JSON.parse(stored)
    } catch {
      window.localStorage.removeItem(CONSENT_STORAGE_KEY)
      return { consent: null, storageError: false }
    }

    if (!isCookieConsent(parsed) || parsed.expiresAt <= Date.now()) {
      window.localStorage.removeItem(CONSENT_STORAGE_KEY)
      return { consent: null, storageError: false }
    }

    return { consent: parsed, storageError: false }
  } catch {
    return { consent: null, storageError: true }
  }
}

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [initialState] = useState(readStoredConsent)
  const [consent, setConsent] = useState<CookieConsent | null>(initialState.consent)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [storageError, setStorageError] = useState(initialState.storageError)

  const saveConsent = (choices: ConsentChoices) => {
    const savedAt = Date.now()
    const nextConsent: CookieConsent = {
      version: CONSENT_VERSION,
      necessary: true,
      preferences: choices.preferences,
      statistics: choices.statistics,
      marketing: false,
      savedAt,
      expiresAt: savedAt + CONSENT_DURATION_MS,
    }

    setConsent(nextConsent)
    setSettingsOpen(false)
    try {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(nextConsent))
      setStorageError(false)
    } catch {
      setStorageError(true)
    }
  }

  return (
    <CookieConsentContext.Provider
      value={{
        consent,
        settingsOpen,
        storageError,
        openSettings: () => setSettingsOpen(true),
        closeSettings: () => setSettingsOpen(false),
        saveConsent,
      }}
    >
      {children}
    </CookieConsentContext.Provider>
  )
}
