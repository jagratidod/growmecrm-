const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
export const ROUTE_READ_TTL = 10_000
export const ROUTE_READ_STALE_WINDOW = 20_000

export class ApiError extends Error {
  statusCode: number
  data?: unknown

  constructor(message: string, statusCode: number, data?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.data = data
  }
}

type RequestOptions = RequestInit & { cacheMs?: number; fresh?: boolean }

type CachedRead = {
  pending?: Promise<unknown>
  value?: unknown
  expiresAt: number
}
const MAX_CACHED_READS = 30
const reads = new Map<string, CachedRead>()
let currentToken: string | null = null

function readToken() {
  const token = localStorage.getItem('crm_auth_token') || sessionStorage.getItem('crm_auth_token')
  if (currentToken !== token) {
    reads.clear()
    currentToken = token
  }
  return token
}

export function getCachedRead<T>(endpoint: string, staleWindow = 0): T | undefined {
  if (!readToken()) return undefined
  const entry = reads.get(endpoint)
  return entry && entry.expiresAt + staleWindow > Date.now() ? entry.value as T : undefined
}

function waitForRead<T>(promise: Promise<T>, signal?: AbortSignal | null): Promise<T> {
  if (!signal) return promise
  return new Promise((resolve, reject) => {
    const abort = () => reject(signal.reason)
    promise.then(resolve, reject).finally(() => signal.removeEventListener('abort', abort))
    if (signal.aborted) { abort(); return }
    signal.addEventListener('abort', abort, { once: true })
  })
}

export async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const token = readToken()
  const { cacheMs, fresh, ...init } = options
  const method = (init.method || 'GET').toUpperCase()
  const cached = Boolean(cacheMs && token && method === 'GET' && !init.headers)
  if (cached) init.signal?.throwIfAborted()
  const headers: HeadersInit = {
    ...(init.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...init.headers,
  }

  async function fetchResponse(signal?: AbortSignal | null): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...init, signal, headers })
    if (!response.ok) {
      let message = response.statusText || 'An unexpected error occurred'
      try {
        const error = await response.json()
        message = error.message || error.error || message
      } catch { /* Keep the HTTP error message when the server has no JSON body. */ }
      if (token === currentToken && (response.status === 401 || response.status === 403)) reads.clear()
      throw new ApiError(message, response.status)
    }
    if (token === currentToken && method !== 'GET' && method !== 'HEAD') reads.clear()
    return response.json()
  }

  if (!cached || !cacheMs) return fetchResponse(init.signal)

  const existing = reads.get(endpoint)
  if (existing?.pending) return waitForRead(existing.pending as Promise<T>, init.signal)
  if (!fresh && existing && existing.expiresAt > Date.now()) return existing.value as T

  const entry: CachedRead = { expiresAt: existing?.expiresAt || 0, value: existing?.value }
  // Route subscribers can cancel independently while the shared read finishes.
  const pending = fetchResponse().then(
    (value) => {
      if (reads.get(endpoint) === entry) {
        entry.value = value
        entry.expiresAt = Date.now() + cacheMs
        entry.pending = undefined
      }
      return value
    },
    (error: unknown) => {
      if (reads.get(endpoint) === entry) reads.delete(endpoint)
      throw error
    },
  )
  entry.pending = pending
  reads.delete(endpoint)
  if (reads.size >= MAX_CACHED_READS) {
    const oldest = reads.keys().next().value
    if (oldest) reads.delete(oldest)
  }
  reads.set(endpoint, entry)
  return waitForRead(pending, init.signal)
}
