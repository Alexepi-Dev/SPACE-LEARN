interface CacheEntry<T> {
  expiresAt: number
  value: T
}

export class HttpCache<T> {
  private readonly entries = new Map<string, CacheEntry<T>>()
  private readonly pending = new Map<string, Promise<T>>()

  constructor(
    private readonly ttlMs: number,
    private readonly maxEntries = 50,
    private readonly now: () => number = Date.now,
  ) {}

  get(key: string, fetchValue: () => Promise<T>): Promise<T> {
    const cached = this.entries.get(key)
    if (cached && cached.expiresAt > this.now()) return Promise.resolve(cached.value)
    if (cached) this.entries.delete(key)

    const pending = this.pending.get(key)
    if (pending) return pending

    const request = fetchValue()
      .then((value) => {
        if (this.entries.size >= this.maxEntries) {
          const oldestKey = this.entries.keys().next().value
          if (oldestKey !== undefined) this.entries.delete(oldestKey)
        }
        this.entries.set(key, { value, expiresAt: this.now() + this.ttlMs })
        return value
      })
      .finally(() => {
        this.pending.delete(key)
      })

    this.pending.set(key, request)
    return request
  }
}
