import { performance } from 'node:perf_hooks'
import type { RequestHandler } from 'express'

const BUCKET_DURATION_MS = 60 * 1000
const WINDOW_BUCKETS = 60
const CHART_BUCKET_DURATION_MS = 5 * BUCKET_DURATION_MS

interface MetricBucket {
  startAt: number
  requests: number
  clientErrors: number
  serverErrors: number
  totalResponseTimeMs: number
}

export interface RequestMetricsSnapshot {
  observedAt: string
  windowMinutes: number
  totals: {
    requests: number
    clientErrors: number
    serverErrors: number
    averageResponseTimeMs: number
  }
  series: {
    startsAt: string
    requests: number
    errors: number
    averageResponseTimeMs: number
  }[]
}

export interface RequestMetrics {
  middleware: RequestHandler
  snapshot: () => RequestMetricsSnapshot
}

export function createRequestMetrics(clock: () => number = Date.now): RequestMetrics {
  const buckets = new Map<number, MetricBucket>()

  const middleware: RequestHandler = (_request, response, next) => {
    const startedAt = performance.now()
    response.once('finish', () => {
      const completedAt = clock()
      const bucketStart = Math.floor(completedAt / BUCKET_DURATION_MS) * BUCKET_DURATION_MS
      let bucket = buckets.get(bucketStart)
      if (!bucket) {
        bucket = {
          startAt: bucketStart,
          requests: 0,
          clientErrors: 0,
          serverErrors: 0,
          totalResponseTimeMs: 0,
        }
        buckets.set(bucketStart, bucket)
      }

      bucket.requests += 1
      if (response.statusCode >= 400 && response.statusCode < 500) bucket.clientErrors += 1
      if (response.statusCode >= 500) bucket.serverErrors += 1
      bucket.totalResponseTimeMs += Math.max(0, performance.now() - startedAt)

      const oldestBucket = bucketStart - (WINDOW_BUCKETS - 1) * BUCKET_DURATION_MS
      for (const recordedStart of buckets.keys()) {
        if (recordedStart < oldestBucket) buckets.delete(recordedStart)
      }
    })
    next()
  }

  function snapshot(): RequestMetricsSnapshot {
    const observedAt = clock()
    const currentBucket = Math.floor(observedAt / BUCKET_DURATION_MS) * BUCKET_DURATION_MS
    const totals = { requests: 0, clientErrors: 0, serverErrors: 0, totalResponseTimeMs: 0 }
    const chartBuckets = new Map<number, MetricBucket>()

    for (let index = 0; index < WINDOW_BUCKETS; index += 1) {
      const startsAt = currentBucket - (WINDOW_BUCKETS - index - 1) * BUCKET_DURATION_MS
      const bucket = buckets.get(startsAt)
      if (!bucket) continue

      totals.requests += bucket.requests
      totals.clientErrors += bucket.clientErrors
      totals.serverErrors += bucket.serverErrors
      totals.totalResponseTimeMs += bucket.totalResponseTimeMs

      const chartStart = Math.floor(startsAt / CHART_BUCKET_DURATION_MS) * CHART_BUCKET_DURATION_MS
      let chartBucket = chartBuckets.get(chartStart)
      if (!chartBucket) {
        chartBucket = {
          startAt: chartStart,
          requests: 0,
          clientErrors: 0,
          serverErrors: 0,
          totalResponseTimeMs: 0,
        }
        chartBuckets.set(chartStart, chartBucket)
      }
      chartBucket.requests += bucket.requests
      chartBucket.clientErrors += bucket.clientErrors
      chartBucket.serverErrors += bucket.serverErrors
      chartBucket.totalResponseTimeMs += bucket.totalResponseTimeMs
    }

    const firstChartBucket = Math.floor(
      (currentBucket - (WINDOW_BUCKETS - 1) * BUCKET_DURATION_MS) / CHART_BUCKET_DURATION_MS,
    ) * CHART_BUCKET_DURATION_MS
    const lastChartBucket = Math.floor(currentBucket / CHART_BUCKET_DURATION_MS) * CHART_BUCKET_DURATION_MS
    const series = Array.from(
      { length: Math.floor((lastChartBucket - firstChartBucket) / CHART_BUCKET_DURATION_MS) + 1 },
      (_value, index) => {
        const startsAt = firstChartBucket + index * CHART_BUCKET_DURATION_MS
        const bucket = chartBuckets.get(startsAt)
        const errors = (bucket?.clientErrors ?? 0) + (bucket?.serverErrors ?? 0)
        return {
          startsAt: new Date(startsAt).toISOString(),
          requests: bucket?.requests ?? 0,
          errors,
          averageResponseTimeMs: bucket?.requests
            ? Math.round((bucket.totalResponseTimeMs) / bucket.requests)
            : 0,
        }
      },
    )

    return {
      observedAt: new Date(observedAt).toISOString(),
      windowMinutes: WINDOW_BUCKETS,
      totals: {
        requests: totals.requests,
        clientErrors: totals.clientErrors,
        serverErrors: totals.serverErrors,
        averageResponseTimeMs: totals.requests
          ? Math.round(totals.totalResponseTimeMs / totals.requests)
          : 0,
      },
      series,
    }
  }

  return { middleware, snapshot }
}
