import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import {
  Activity,
  Bell,
  BookOpen,
  ChartNoAxesCombined,
  Clock3,
  Database,
  LayoutDashboard,
  LogOut,
  RefreshCw,
  Settings,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { ApiRequestError } from '../services/api'
import { lessons } from '../services/lessonCatalog'
import {
  getAdminAuditLog,
  getAdminOverview,
  getAdminServices,
  loginAdmin,
  type AdminAuditLog,
  type AdminOverview,
  type AdminServices,
  type AdminSession,
} from '../services/adminApi'
import { useLanguage } from '../i18n/LanguageProvider'
import { adminTranslations } from '../i18n/adminTranslations'

type AdminMessageKey = 'configError' | 'databaseError' | 'loginError' | 'loadError' | 'sessionExpired'
type AdminView = 'overview' | 'activity' | 'learners' | 'content' | 'services' | 'reports' | 'notifications' | 'security' | 'settings'
type AdminCopy = { [Key in keyof typeof adminTranslations.fr]: string }

const refreshOptions = [0, 30, 60, 300] as const

function formatUptime(seconds: number, language: 'fr' | 'en') {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return language === 'fr' ? `${hours} h ${minutes} min` : `${hours} h ${minutes} min`
}

export function AdminPage() {
  const { language, setLanguage } = useLanguage()
  const text = adminTranslations[language]
  const [session, setSession] = useState<AdminSession | null>(null)
  const [overview, setOverview] = useState<AdminOverview | null>(null)
  const [services, setServices] = useState<AdminServices | null>(null)
  const [audit, setAudit] = useState<AdminAuditLog | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<AdminMessageKey | null>(null)
  const [activeView, setActiveView] = useState<AdminView>('overview')
  const [refreshSeconds, setRefreshSeconds] = useState<number>(0)
  const refreshInFlight = useRef(false)

  const loadDashboard = useCallback(async (token: string) => {
    if (refreshInFlight.current) return
    refreshInFlight.current = true
    setBusy(true)
    setError(null)
    try {
      const [nextOverview, nextServices, nextAudit] = await Promise.all([
        getAdminOverview(token),
        getAdminServices(token),
        getAdminAuditLog(token),
      ])
      setOverview(nextOverview)
      setServices(nextServices)
      setAudit(nextAudit)
    } catch (loadError) {
      if (loadError instanceof ApiRequestError && loadError.status === 401) {
        setSession(null)
        setOverview(null)
        setServices(null)
        setAudit(null)
        setError('sessionExpired')
      } else {
        setError('loadError')
      }
    } finally {
        refreshInFlight.current = false
      setBusy(false)
    }
  }, [])

  useEffect(() => {
    if (!session || refreshSeconds === 0) return
    const intervalId = window.setInterval(() => {
        void loadDashboard(session.token)
    }, refreshSeconds * 1000)
    return () => window.clearInterval(intervalId)
  }, [loadDashboard, refreshSeconds, session])

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const nextSession = await loginAdmin(email, password)
      setPassword('')
      setSession(nextSession)
      await loadDashboard(nextSession.token)
    } catch (loginError) {
      if (loginError instanceof ApiRequestError && ['API_NOT_CONFIGURED', 'ADMIN_NOT_CONFIGURED'].includes(loginError.code)) {
        setError('configError')
      } else if (loginError instanceof ApiRequestError && loginError.code === 'ADMIN_AUDIT_UNAVAILABLE') {
        setError('databaseError')
      } else {
        setError('loginError')
      }
    } finally {
      setBusy(false)
    }
  }

  function signOut() {
    setSession(null)
    setOverview(null)
    setServices(null)
    setAudit(null)
    setError(null)
    setActiveView('overview')
  }

  const statusLabel = (status: string) => status === 'operational'
    ? text.operational
    : status === 'not_configured'
      ? text.notConfigured
      : text.serviceUnavailable
  const viewLabels: Record<AdminView, string> = {
    overview: text.navOverview,
    activity: text.navActivity,
    learners: text.navLearners,
    content: text.navContent,
    services: text.navServices,
    reports: text.navReports,
    notifications: text.navNotifications,
    security: text.navSecurity,
    settings: text.navSettings,
  }
  const navigation: { view: AdminView; icon: React.ReactNode }[] = [
    { view: 'overview', icon: <LayoutDashboard size={17} /> },
    { view: 'activity', icon: <Activity size={17} /> },
    { view: 'learners', icon: <Users size={17} /> },
    { view: 'content', icon: <BookOpen size={17} /> },
    { view: 'services', icon: <Database size={17} /> },
    { view: 'reports', icon: <ChartNoAxesCombined size={17} /> },
    { view: 'notifications', icon: <Bell size={17} /> },
    { view: 'security', icon: <ShieldCheck size={17} /> },
    { view: 'settings', icon: <Settings size={17} /> },
  ]
  const serviceAlerts = services?.services.filter((service) => service.status === 'unavailable') ?? []
  const unconfiguredCount = services?.services.filter((service) => service.status === 'not_configured').length ?? 0

  return (
    <div className="min-h-screen bg-[#F5F7F5]">
      <header className="border-b border-white/10 bg-[#0B1833] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <img src="/space-learn-africa-mark.png" alt="" className="h-10 w-16 object-contain" />
            <div>
              <p className="text-xs font-black tracking-[0.12em]">SPACE LEARN</p>
              <p className="mt-1 text-xs text-slate-400">{text.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-full border border-white/15 p-0.5" role="group" aria-label={language === 'fr' ? 'Langue' : 'Language'}>
              {(['fr', 'en'] as const).map((nextLanguage) => (
                <button
                  key={nextLanguage}
                  type="button"
                  onClick={() => setLanguage(nextLanguage)}
                  aria-pressed={language === nextLanguage}
                  className={`rounded-full px-3 py-1 text-xs font-bold ${language === nextLanguage ? 'bg-white text-[#0B1833]' : 'text-slate-300'}`}
                >
                  {nextLanguage.toUpperCase()}
                </button>
              ))}
            </div>
            {session && (
              <button onClick={signOut} className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-sm text-slate-200 hover:bg-white/10">
                <LogOut size={16} /> <span className="hidden sm:inline">{text.logout}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {!session ? (
          <section className="mx-auto mt-8 max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-[#174F3B]"><ShieldCheck /></div>
            <h1 className="text-2xl font-black text-[#0B1833]">{text.loginTitle}</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">{text.loginDescription}</p>
            <form className="mt-6 space-y-4" onSubmit={(event) => void handleLogin(event)}>
              <label className="block text-sm font-semibold text-slate-700">
                {text.email}
                <input required autoComplete="username" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-[#236B50] focus:ring-2 focus:ring-emerald-100" />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                {text.password}
                <input required autoComplete="current-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-[#236B50] focus:ring-2 focus:ring-emerald-100" />
              </label>
              {error && <p role="alert" className="rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-800">{text[error]}</p>}
              <button disabled={busy} className="w-full rounded-xl bg-[#174F3B] px-4 py-3 font-bold text-white transition hover:bg-[#236B50] disabled:cursor-wait disabled:opacity-70">
                {busy ? text.signingIn : text.signIn}
              </button>
            </form>
          </section>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
            <aside className="rounded-3xl bg-[#174F3B] p-4 text-white shadow-sm sm:p-5">
              <p className="px-3 text-xs font-bold uppercase tracking-[0.16em] text-emerald-100">{text.adminMenu}</p>
              <nav aria-label={text.adminMenu} className="mt-3 flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible">
                {navigation.map(({ view, icon }) => (
                  <button
                    key={view}
                    type="button"
                    onClick={() => setActiveView(view)}
                    aria-current={activeView === view ? 'page' : undefined}
                    className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition lg:w-full ${activeView === view ? 'bg-white text-[#174F3B]' : 'text-emerald-50 hover:bg-white/10'}`}
                  >
                    {icon}<span>{viewLabels[view]}</span>
                  </button>
                ))}
              </nav>
              <div className="mt-4 hidden border-t border-white/20 px-3 pt-4 text-sm lg:block">
                <p className="font-bold">{text.role}</p>
                <p className="mt-1 text-xs leading-5 text-emerald-100">{text.sessionExpires}: {new Date(session.expiresAt).toLocaleString(language)}</p>
              </div>
            </aside>

            <section aria-label={text.title} className="min-w-0 space-y-6">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#236B50]">{text.role}</p>
                  <h1 className="mt-2 text-3xl font-black text-[#0B1833]">{viewLabels[activeView]}</h1>
                  <p className="mt-1 text-sm text-slate-600">{text.title}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600">
                    <span>{text.autoRefresh}</span>
                    <select value={refreshSeconds} onChange={(event) => setRefreshSeconds(Number(event.target.value))} className="max-w-28 bg-transparent font-semibold text-[#0B1833] outline-none">
                      {refreshOptions.map((seconds) => (
                        <option key={seconds} value={seconds}>
                          {seconds === 0 ? text.refreshOff : seconds === 300 ? text.refresh5m : text.refreshSeconds.replace('{seconds}', String(seconds))}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button onClick={() => void loadDashboard(session.token)} disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-[#174F3B] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#236B50] disabled:opacity-60">
                    <RefreshCw size={16} className={busy ? 'animate-spin' : ''} /> {text.refresh}
                  </button>
                </div>
              </div>

              {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{text[error]}</p>}
              {busy && !overview && <p role="status" className="text-sm text-slate-500">{text.loading}</p>}

              {activeView === 'overview' && overview && (
                <>
                  {serviceAlerts.length > 0 && (
                    <section role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
                      <p className="font-bold">{text.serviceAlert}</p>
                      <p className="mt-1">{serviceAlerts.map((service) => service.name).join(', ')}</p>
                    </section>
                  )}
                  <section aria-label={text.summary} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard icon={<Activity />} label={text.uptime} value={formatUptime(overview.api.uptimeSeconds, language)} />
                    <MetricCard icon={<Users />} label={text.learnerAccounts} value={text.unavailable} detail={text.privacyNote} />
                    <MetricCard icon={<Clock3 />} label={text.learnerActivity} value={text.notCollected} />
                    <MetricCard icon={<BookOpen />} label={text.content} value={`${lessons.length} ${text.lessons}`} detail={text.staticCatalog} />
                  </section>
                  <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <SectionTitle icon={<Activity />} title={text.requestActivity} />
                    <p className="mt-2 text-sm text-slate-600">{text.metricsScope}</p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      <MetricCard icon={<Activity />} label={text.requests} value={String(overview.monitoring.totals.requests)} />
                      <MetricCard icon={<Activity />} label={text.httpErrors} value={String(overview.monitoring.totals.clientErrors + overview.monitoring.totals.serverErrors)} />
                      <MetricCard icon={<Activity />} label={text.serverErrors} value={String(overview.monitoring.totals.serverErrors)} />
                      <MetricCard
                        icon={<Clock3 />}
                        label={text.averageResponse}
                        value={overview.monitoring.totals.requests ? `${overview.monitoring.totals.averageResponseTimeMs} ms` : '—'}
                        detail={!overview.monitoring.totals.requests ? text.noRequests : undefined}
                      />
                    </div>
                    <RequestChart series={overview.monitoring.series} language={language} text={text} />
                  </section>
                  <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <SectionTitle icon={<Database />} title={text.integrations} />
                    <ServiceGrid services={services} statusLabel={statusLabel} language={language} text={text} />
                  </section>
                </>
              )}

              {activeView === 'services' && (
                <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <SectionTitle icon={<Database />} title={text.integrations} />
                  <p className="mt-2 text-sm text-slate-600">{text.serviceScope}</p>
                  <ServiceGrid services={services} statusLabel={statusLabel} language={language} text={text} />
                </section>
              )}

              {(activeView === 'activity' || activeView === 'security') && (
                <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <SectionTitle icon={activeView === 'security' ? <ShieldCheck /> : <Activity />} title={activeView === 'security' ? text.audit : text.navActivity} />
                    <button type="button" onClick={() => exportAudit(audit)} disabled={!audit?.entries.length} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">
                      {text.exportCsv}
                    </button>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{text.activityScope}</p>
                  <AuditEntries audit={audit} language={language} text={text} />
                </section>
              )}

              {activeView === 'learners' && <UnavailablePanel icon={<Users />} title={text.navLearners} description={text.learnersUnavailable} />}

              {activeView === 'content' && (
                <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <SectionTitle icon={<BookOpen />} title={text.navContent} />
                  <p className="mt-2 text-sm text-slate-600">{text.contentReadOnly}</p>
                  <div className="mt-4 divide-y divide-slate-100">
                    {lessons.map((lesson) => (
                      <div key={lesson.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                        <span className="font-semibold text-slate-800">{lesson.content[language].title}</span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{text.staticCatalog}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {activeView === 'reports' && <UnavailablePanel icon={<ChartNoAxesCombined />} title={text.navReports} description={text.reportsUnavailable} />}

              {activeView === 'notifications' && (
                <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <SectionTitle icon={<Bell />} title={text.navNotifications} />
                  <p className="mt-2 text-sm text-slate-600">{text.notificationsScope}</p>
                  {serviceAlerts.length ? serviceAlerts.map((service) => (
                    <div key={service.name} className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
                      <strong>{service.name}</strong> — {text.serviceUnavailable}
                    </div>
                  )) : <p className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900">{text.noServiceAlerts}</p>}
                  {unconfiguredCount > 0 && <p className="mt-4 text-xs text-slate-500">{text.unconfiguredServices.replace('{count}', String(unconfiguredCount))}</p>}
                </section>
              )}

              {activeView === 'settings' && (
                <UnavailablePanel icon={<Settings />} title={text.navSettings} description={`${text.settingsScope} ${text.roleScope}`} />
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  )
}

function MetricCard({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: string; detail?: string }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between text-[#236B50]"><span className="text-sm font-semibold text-slate-600">{label}</span>{icon}</div>
      <p className="mt-4 text-2xl font-black text-[#0B1833]">{value}</p>
      {detail && <p className="mt-2 text-xs leading-5 text-slate-500">{detail}</p>}
    </article>
  )
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return <h2 className="flex items-center gap-2 text-lg font-black text-[#0B1833]">{icon}{title}</h2>
}

function StatusBadge({ status, label }: { status: string; label: string }) {
  const color = status === 'operational' ? 'bg-emerald-100 text-emerald-800' : status === 'not_configured' ? 'bg-slate-200 text-slate-700' : 'bg-rose-100 text-rose-800'
  return <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${color}`}>{label}</span>
}

function ServiceGrid({
  services,
  statusLabel,
  language,
  text,
}: {
  services: AdminServices | null
  statusLabel: (status: string) => string
  language: 'fr' | 'en'
  text: AdminCopy
}) {
  if (!services) return <p className="mt-4 text-sm text-slate-500">{text.noServices}</p>
  return (
    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {services.services.map((service) => (
        <article key={service.name} className="flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
          <div className="min-w-0">
            <h3 className="truncate font-bold text-slate-800">{service.name}</h3>
            {service.responseTimeMs !== undefined && service.responseTimeMs !== null && (
              <p className="mt-1 text-xs text-slate-500">{service.responseTimeMs} ms</p>
            )}
          </div>
          <StatusBadge status={service.status} label={statusLabel(service.status)} />
        </article>
      ))}
      <p className="sm:col-span-2 lg:col-span-3 text-xs text-slate-500">
        {text.observed}: {new Date(services.observedAt).toLocaleString(language)}
      </p>
    </div>
  )
}

function RequestChart({ series, language, text }: {
  series: AdminOverview['monitoring']['series']
  language: 'fr' | 'en'
  text: AdminCopy
}) {
  const maximumRequests = Math.max(1, ...series.map((bucket) => bucket.requests))
  const formatTime = (value: string) => new Intl.DateTimeFormat(language, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))

  return (
    <figure className="mt-6">
      <div role="list" aria-label={text.requestActivity} className="flex h-36 items-end gap-1 border-b border-slate-200">
        {series.map((bucket) => {
          const requestHeight = bucket.requests ? Math.max(3, bucket.requests / maximumRequests * 100) : 0
          const errorHeight = bucket.errors ? Math.max(3, bucket.errors / maximumRequests * 100) : 0
          const time = formatTime(bucket.startsAt)
          const label = `${time}: ${text.requests} ${bucket.requests}, ${text.httpErrors.toLowerCase()} ${bucket.errors}`
          return (
            <div key={bucket.startsAt} role="listitem" aria-label={label} title={label} className="relative h-full min-w-0 flex-1">
              <div className="absolute inset-x-0 bottom-0 rounded-t bg-[#236B50]" style={{ height: `${requestHeight}%` }} />
              <div className="absolute inset-x-0 bottom-0 rounded-t bg-rose-500" style={{ height: `${errorHeight}%` }} />
            </div>
          )
        })}
      </div>
      <figcaption className="mt-2 flex items-center justify-between gap-3 text-xs text-slate-500">
        <span>{series[0] ? formatTime(series[0].startsAt) : ''}</span>
        <span className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-[#236B50]" />{text.requests}</span>
          <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-rose-500" />{text.httpErrors}</span>
        </span>
        <span>{series.length ? formatTime(series[series.length - 1].startsAt) : ''}</span>
      </figcaption>
    </figure>
  )
}

function AuditEntries({ audit, language, text }: {
  audit: AdminAuditLog | null
  language: 'fr' | 'en'
  text: AdminCopy
}) {
  if (!audit?.entries.length) return <p className="py-4 text-sm text-slate-500">{text.noAudit}</p>
  return (
    <div className="mt-4 divide-y divide-slate-100">
      {audit.entries.map((entry, index) => (
        <div key={`${entry.occurredAt}-${index}`} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
          <span className="min-w-[180px] font-semibold text-slate-800">{entry.action} · {entry.resource}</span>
          <span className="text-slate-500">{new Date(entry.occurredAt).toLocaleString(language)}</span>
          <StatusBadge status={entry.result === 'success' ? 'operational' : 'unavailable'} label={entry.result === 'success' ? text.success : text.failure} />
        </div>
      ))}
    </div>
  )
}

function UnavailablePanel({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <SectionTitle icon={icon} title={title} />
      <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
    </section>
  )
}

function exportAudit(audit: AdminAuditLog | null) {
  if (!audit?.entries.length) return
  const rows = [
    ['action', 'resource', 'result', 'occurred_at'],
    ...audit.entries.map((entry) => [entry.action, entry.resource, entry.result, entry.occurredAt]),
  ]
  const csv = rows.map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(',')).join('\r\n')
  const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = 'space-learn-admin-audit.csv'
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}
