import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { ArrowLeft, ArrowRight, ExternalLink, Image, RotateCw, Search, Video } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { ApodMedia } from '../components/ApodMedia'
import { ApodTranslationNotice } from '../components/ApodTranslationNotice'
import { PageHeading } from '../components/PageHeading'
import { useLanguage } from '../i18n/LanguageProvider'
import { ApiRequestError } from '../services/api'
import { getApodPage, type ApodItem } from '../services/apod.service'

type MediaFilter = 'all' | 'image' | 'video'
const ITEMS_PER_PAGE = 8

export function ExplorerPage() {
  const { language, t } = useLanguage()
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState<MediaFilter>('all')
  const [searchValue, setSearchValue] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const query = useQuery({
    queryKey: ['nasa-apod-explorer', language, page, ITEMS_PER_PAGE],
    queryFn: ({ signal }) => getApodPage(page, ITEMS_PER_PAGE, language, signal),
    placeholderData: keepPreviousData,
  })

  const items = useMemo(() => query.data?.items.filter((item) => {
    const matchesType = filter === 'all' || item.mediaType === filter
    const displayedText = language === 'fr' ? item.frenchTranslation : null
    const searchableText = `${displayedText?.title ?? item.title} ${displayedText?.explanation ?? item.explanation} ${item.credit ?? ''}`.toLocaleLowerCase(language)
    return matchesType && searchableText.includes(searchTerm.toLocaleLowerCase(language))
  }) ?? [], [filter, language, query.data?.items, searchTerm])

  const errorMessage = query.error instanceof ApiRequestError && query.error.code === 'API_NOT_CONFIGURED'
    ? t('apodApiNotConfigured')
    : t('apodError')

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSearchTerm(searchValue.trim())
  }

  return (
    <div>
      <PageHeading eyebrow={t('explorerTitle')} title={t('explorerBrowseTitle')} description={t('explorerBrowseDescription')} />

      <form onSubmit={submitSearch} className="mb-3 flex flex-col gap-2 sm:flex-row">
        <label className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <span className="sr-only">{t('searchMedia')}</span>
          <input
            type="search"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder={t('searchMediaPlaceholder')}
            className="w-full rounded-full border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#2ec4b6] focus:ring-2 focus:ring-[#2ec4b6]/20"
          />
        </label>
        <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-full bg-sunAmber px-6 py-3 text-xs font-bold text-spaceNight transition hover:bg-amber-300">
          <Search className="h-4 w-4" /> {t('searchMedia')}
        </button>
      </form>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2" role="group" aria-label={t('mediaFilters')}>
          {([
            ['all', t('allMedia')],
            ['image', t('apodImage')],
            ['video', t('apodVideo')],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              aria-pressed={filter === value}
              className={`rounded-full px-4 py-2 text-[10px] font-bold transition ${filter === value ? 'bg-spaceNight text-white' : 'border border-slate-300 bg-white text-slate-700 hover:border-spaceTurquoise'}`}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-slate-500">{t('explorerScopeNote')}</p>
      </div>

      {query.isPending && (
        <div className="flex items-center justify-center gap-3 rounded-3xl bg-white p-8 text-sm text-slate-600" role="status">
          <RotateCw className="h-4 w-4 animate-spin text-[#139f98]" /> {t('apodLoading')}
        </div>
      )}
      {query.isError && (
        <section className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950" role="alert">
          <p>{errorMessage}</p>
          <button type="button" onClick={() => void query.refetch()} disabled={query.isFetching} className="mt-3 inline-flex items-center gap-2 rounded-full bg-spaceNight px-4 py-2 text-xs font-semibold text-white disabled:opacity-60">
            <RotateCw className={`h-3.5 w-3.5 ${query.isFetching ? 'animate-spin' : ''}`} /> {t('apodRetry')}
          </button>
        </section>
      )}

      {query.data && <ApodTranslationNotice items={query.data.items} />}

      {query.data && items.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {items.map((item) => <ExplorerCard key={`${item.date}-${item.title}`} item={item} language={language} />)}
          </div>
          <nav className="mt-6 flex items-center justify-between gap-3" aria-label={t('explorerTitle')}>
            <button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={!query.data.pagination.hasPreviousPage || query.isFetching} className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50">
              <ArrowLeft className="h-4 w-4" /> {t('apodPrevious')}
            </button>
            <span className="text-xs text-slate-500">{t('apodPageOf')} {page}{query.data.pagination.totalPages ? ` ${t('apodOf')} ${query.data.pagination.totalPages}` : ''}</span>
            <button type="button" onClick={() => setPage((value) => value + 1)} disabled={!query.data.pagination.hasNextPage || query.isFetching} className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50">
              {t('apodNext')} <ArrowRight className="h-4 w-4" />
            </button>
          </nav>
        </>
      )}
      {query.data && items.length === 0 && (
        <section className="rounded-3xl border border-slate-200 bg-white p-8 text-center" role="status">
          <Search className="mx-auto h-7 w-7 text-slate-400" />
          <p className="mt-3 text-sm font-semibold text-spaceNight">{t('explorerNoResults')}</p>
          <p className="mt-1 text-xs text-slate-500">{t('explorerScopeNote')}</p>
        </section>
      )}
    </div>
  )
}

function ExplorerCard({ item, language }: { item: ApodItem; language: 'fr' | 'en' }) {
  const { t } = useLanguage()
  const date = new Intl.DateTimeFormat(language === 'fr' ? 'fr-FR' : 'en-GB', {
    dateStyle: 'medium',
    timeZone: 'UTC',
  }).format(new Date(`${item.date}T00:00:00Z`))
  const MediaIcon = item.mediaType === 'video' ? Video : Image
  const title = language === 'fr' ? item.frenchTranslation?.title ?? item.title : item.title
  const explanation = language === 'fr' ? item.frenchTranslation?.explanation ?? item.explanation : item.explanation

  return (
    <article className="group overflow-hidden rounded-3xl border border-white bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative overflow-hidden bg-spaceNight">
        <ApodMedia item={item} />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-spaceTurquoise px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-spaceNight">
          <MediaIcon className="h-3 w-3" /> {t('realDataLabel')}
        </span>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between gap-2 text-[10px] text-slate-500">
          <span>{item.mediaType === 'image' ? t('apodImage') : item.mediaType === 'video' ? t('apodVideo') : t('apodOther')}</span>
          <time dateTime={item.date}>{date}</time>
        </div>
        <h2 className="font-display mt-2 line-clamp-2 text-sm font-bold leading-5 text-spaceNight">{title}</h2>
        <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-600">{explanation}</p>
        {item.credit && <p className="mt-2 truncate text-[10px] text-slate-500">{t('apodCredit')}: {item.credit}</p>}
        <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-bold text-[#118d88] hover:underline">
          {t('apodOriginal')} <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </article>
  )
}
