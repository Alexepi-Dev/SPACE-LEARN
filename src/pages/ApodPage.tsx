import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { ArrowLeft, ArrowRight, ExternalLink, Image, RotateCw, Video } from 'lucide-react'
import { useState } from 'react'
import { PageHeading } from '../components/PageHeading'
import { ApodMedia } from '../components/ApodMedia'
import { useLanguage } from '../i18n/LanguageProvider'
import { ApiRequestError } from '../services/api'
import { getApodPage, type ApodItem } from '../services/apod.service'

const ITEMS_PER_PAGE = 8

export function ApodPage() {
  const { language, t } = useLanguage()
  const [page, setPage] = useState(1)
  const query = useQuery({
    queryKey: ['nasa-apod', page, ITEMS_PER_PAGE],
    queryFn: ({ signal }) => getApodPage(page, ITEMS_PER_PAGE, signal),
    placeholderData: keepPreviousData,
  })

  const errorMessage = query.error instanceof ApiRequestError && query.error.code === 'API_NOT_CONFIGURED'
    ? t('apodApiNotConfigured')
    : t('apodError')
  const totalPages = query.data?.pagination.totalPages

  return (
    <div className="min-w-0">
      <PageHeading eyebrow={t('apodLink')} title={t('apodPageTitle')} description={t('apodPageDescription')} />

      {query.isPending && (
        <div className="flex items-center justify-center gap-3 rounded-3xl bg-white p-6 text-sm text-spaceBlue/80 shadow-sm sm:p-8" role="status">
          <RotateCw className="h-4 w-4 animate-spin text-secondaryGreen" />
          {t('apodLoading')}
        </div>
      )}

      {query.isError && (
        <section className="mb-5 min-w-0 rounded-3xl border border-sunAmber/40 bg-sunAmber/10 p-4 text-spaceNight sm:p-5" role="alert">
          <p className="break-words text-sm leading-6 sm:text-base">{errorMessage}</p>
          <button
            type="button"
            onClick={() => void query.refetch()}
            disabled={query.isFetching}
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-spaceNight px-4 py-2 text-xs font-semibold text-white transition hover:bg-deepIndigo disabled:opacity-60"
          >
            <RotateCw className={`h-3.5 w-3.5 ${query.isFetching ? 'animate-spin' : ''}`} />
            {t('apodRetry')}
          </button>
        </section>
      )}

      {query.data && query.data.items.length === 0 && (
        <section className="rounded-3xl border border-spaceMist bg-white p-4 text-sm leading-6 text-spaceBlue/80 sm:p-6" role="status">
          {t('apodEmpty')}
        </section>
      )}

      {query.data && query.data.items.length > 0 && (
        <>
          <div className="grid gap-5 md:grid-cols-2">
            {query.data.items.map((item) => (
              <ApodCard key={`${item.date}-${item.title}`} item={item} language={language} />
            ))}
          </div>
          <nav className="mt-6 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:flex sm:gap-3" aria-label={t('apodPageTitle')}>
            <button
              type="button"
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              disabled={!query.data.pagination.hasPreviousPage || query.isFetching}
              className="inline-flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full border border-spaceBlue/20 bg-white px-2.5 py-2.5 text-center text-[10px] font-semibold leading-4 text-spaceBlue disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none sm:gap-2 sm:px-4 sm:text-xs"
            >
              <ArrowLeft className="h-4 w-4 shrink-0" />
              <span className="sm:hidden">{t('apodPreviousShort')}</span>
              <span className="hidden sm:inline">{t('apodPrevious')}</span>
            </button>
            <span className="min-w-0 text-center text-[10px] text-spaceBlue/70 sm:text-xs">
              {t('apodPageOf')} {page}{totalPages ? ` ${t('apodOf')} ${totalPages}` : ''}
            </span>
            <button
              type="button"
              onClick={() => setPage((value) => value + 1)}
              disabled={!query.data.pagination.hasNextPage || query.isFetching}
              className="inline-flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full border border-spaceBlue/20 bg-white px-2.5 py-2.5 text-center text-[10px] font-semibold leading-4 text-spaceBlue disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none sm:gap-2 sm:px-4 sm:text-xs"
            >
              <span className="sm:hidden">{t('apodNextShort')}</span>
              <span className="hidden sm:inline">{t('apodNext')}</span>
              <ArrowRight className="h-4 w-4 shrink-0" />
            </button>
          </nav>
        </>
      )}
    </div>
  )
}

function ApodCard({ item, language }: { item: ApodItem; language: 'fr' | 'en' }) {
  const { t } = useLanguage()
  const date = new Intl.DateTimeFormat(language === 'fr' ? 'fr-FR' : 'en-GB', {
    dateStyle: 'long',
    timeZone: 'UTC',
  }).format(new Date(`${item.date}T00:00:00Z`))
  const mediaLabel = item.mediaType === 'image' ? t('apodImage') : item.mediaType === 'video' ? t('apodVideo') : t('apodOther')
  const MediaIcon = item.mediaType === 'video' ? Video : Image

  return (
    <article className="min-w-0 overflow-hidden rounded-3xl border border-white bg-white shadow-sm">
      <figure>
        <ApodMedia item={item} />
        <figcaption className="flex flex-wrap items-center justify-between gap-2 border-b border-spaceMist px-4 py-3 sm:gap-3">
          <span className="inline-flex min-w-0 items-center gap-2 rounded-full bg-spaceMist px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-spaceBlue">
            <MediaIcon className="h-3.5 w-3.5 shrink-0 text-secondaryGreen" />
            {mediaLabel}
          </span>
          <time className="shrink-0 text-[10px] text-spaceBlue/70 sm:text-xs" dateTime={item.date}>{date}</time>
        </figcaption>
      </figure>
      <div className="p-4 sm:p-5">
        <h2 className="break-words text-base font-bold leading-snug text-spaceNight sm:text-lg">{item.title}</h2>
        <p className="mt-3 whitespace-pre-line break-words text-sm leading-6 text-spaceBlue/80 sm:text-base sm:leading-7">{item.explanation}</p>
        {item.credit && <p className="mt-3 break-words text-xs leading-5 text-spaceBlue/70">{t('apodCredit')}: {item.credit}</p>}
        <a
          href={item.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex max-w-full items-center gap-2 break-words text-xs font-semibold text-secondaryGreen underline-offset-2 hover:underline"
        >
          {t('apodOriginal')}
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </article>
  )
}
