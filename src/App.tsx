import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { SiteFooter } from './components/SiteFooter'
import { SiteHeader } from './components/SiteHeader'
import { CookieConsentManager } from './components/CookieConsentManager'
import { CookieConsentProvider } from './components/CookieConsentProvider'
import { LanguageProvider } from './i18n/LanguageProvider'
import { AcademyPage } from './pages/Academy/AcademyPage'
import { FutureFeaturePage } from './pages/FutureFeature/FutureFeaturePage'
import { HomePage } from './pages/Home/HomePage'
import { LessonPage } from './pages/Lesson/LessonPage'
import { ProgressPage } from './pages/Progress/ProgressPage'
import { ApodPage } from './pages/Apod/ApodPage'
import { CookiePolicyPage } from './pages/CookiePolicyPage'
import { QuizPage } from './pages/QuizPage'
import { AdminPage } from './pages/AdminPage'
import { ExplorerPage } from './pages/ExplorerPage'
import { useLanguage } from './i18n/LanguageProvider'
import { AnnouncementBanner, announcementsForPath } from './components/AnnouncementBanner'
import { getPublicAnnouncements, type Announcement, type MaintenanceSettings } from './services/announcementsApi'
import { MaintenancePage } from './pages/MaintenancePage'
import { UpdatesPage } from './pages/UpdatesPage'

const SolarSystemExplorerPage = lazy(() => import('./pages/SolarSystemExplorerPage')
  .then((module) => ({ default: module.SolarSystemExplorerPage })))

export default function App() {
  return (
    <BrowserRouter>
      <CookieConsentProvider>
        <LanguageProvider>
          <AppLayout />
        </LanguageProvider>
      </CookieConsentProvider>
    </BrowserRouter>
  )
}

function AppLayout() {
  const { pathname } = useLocation()
  const isAdmin = pathname === '/admin' || pathname.startsWith('/admin/')
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [maintenance, setMaintenance] = useState<MaintenanceSettings | null>(null)
  const [siteStatusError, setSiteStatusError] = useState(false)
  const requestInFlight = useRef(false)

  useEffect(() => {
    let active = true
    let controller: AbortController | undefined

    const refresh = async () => {
      if (requestInFlight.current) return
      requestInFlight.current = true
      controller = new AbortController()
      try {
        const status = await getPublicAnnouncements(controller.signal)
        if (active) {
          setAnnouncements(status.announcements)
          setMaintenance(status.maintenance)
          setSiteStatusError(false)
        }
      } catch {
        if (active && !controller.signal.aborted) setSiteStatusError(true)
      } finally {
        requestInFlight.current = false
      }
    }

    void refresh()
    const intervalId = window.setInterval(() => void refresh(), 30_000)
    return () => {
      active = false
      controller?.abort()
      window.clearInterval(intervalId)
    }
  }, [])

  if (!isAdmin && maintenance?.enabled) {
    return <MaintenancePage maintenance={maintenance} />
  }

  return (
    <div className="min-h-screen bg-spaceMist text-spaceNight">
      <RouteScrollReset />
      {!isAdmin && <SiteHeader />}
      {!isAdmin && announcementsForPath(announcements, pathname).map((announcement) => (
        <AnnouncementBanner key={announcement.id} announcement={announcement} />
      ))}
      <main className={isAdmin ? '' : 'mx-auto min-h-[calc(100vh-160px)] max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8'}>
        <Routes>
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/apod" element={<ApodPage />} />
          <Route path="/academy" element={<AcademyPage />} />
          <Route path="/lesson/:lessonId" element={<LessonPage />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/quiz/:lessonId" element={<QuizPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/cookies" element={<CookiePolicyPage />} />
          <Route
            path="/updates"
            element={<UpdatesPage activeAnnouncements={announcements} siteStatusError={siteStatusError} />}
          />
          <Route path="/missions" element={<FutureFeaturePage />} />
          <Route path="/simulator" element={<SimulatorRoute />} />
          <Route path="/explorer" element={<ExplorerPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!isAdmin && <SiteFooter />}
      {!isAdmin && <CookieConsentManager />}
    </div>
  )
}

function SimulatorRoute() {
  const { t } = useLanguage()
  return (
    <Suspense fallback={<p className="py-16 text-center text-sm text-slate-600">{t('simulatorLoading')}</p>}>
      <SolarSystemExplorerPage />
    </Suspense>
  )
}

function RouteScrollReset() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname])

  return null
}
