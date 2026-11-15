import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useCookieConsent } from '../components/CookieConsentContext'
import { translations, type Language, type TranslationKey } from './translations'

interface LanguageContextValue {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: TranslationKey) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)
const STORAGE_KEY = 'space-learn-africa-language'

function getSavedLanguage(canUsePreferences: boolean): Language {
  if (!canUsePreferences) return 'fr'
  try {
    const savedLanguage = window.localStorage.getItem(STORAGE_KEY)
    return savedLanguage === 'en' ? 'en' : 'fr'
  } catch {
    return 'fr'
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { consent } = useCookieConsent()
  const [language, setLanguageState] = useState<Language>(() => getSavedLanguage(consent?.preferences === true))

  const setLanguage = (nextLanguage: Language) => {
    setLanguageState(nextLanguage)
  }

  useEffect(() => {
    try {
      if (consent?.preferences) {
        window.localStorage.setItem(STORAGE_KEY, language)
      } else {
        window.localStorage.removeItem(STORAGE_KEY)
      }
    } catch {
      // The selected language remains available for this session if storage is disabled.
    }
  }, [consent?.preferences, language])

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: (key: TranslationKey) => translations[language][key],
    }),
    [language],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
