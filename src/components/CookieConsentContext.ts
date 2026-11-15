import { createContext, useContext } from 'react'

export interface CookieConsent {
  version: 1
  necessary: true
  preferences: boolean
  statistics: boolean
  marketing: false
  savedAt: number
  expiresAt: number
}

export interface ConsentChoices {
  preferences: boolean
  statistics: boolean
}

export interface CookieConsentContextValue {
  consent: CookieConsent | null
  settingsOpen: boolean
  storageError: boolean
  openSettings: () => void
  closeSettings: () => void
  saveConsent: (choices: ConsentChoices) => void
}

export const CookieConsentContext = createContext<CookieConsentContextValue | null>(null)

export function useCookieConsent() {
  const context = useContext(CookieConsentContext)
  if (!context) {
    throw new Error('useCookieConsent must be used within CookieConsentProvider')
  }
  return context
}
