/**
 * api-client.ts — typed HTTP client for SafeFamily.
 *
 * Wraps axios with:
 *  - base URL from VITE_API_URL (falls back to /api for same-origin proxy)
 *  - withCredentials: true   → cookies sent on every request (cookie auth)
 *  - Bearer token interceptor → JWT mode (active when 'token' is in localStorage)
 *  - Normalized ApiError thrown by every helper — no need to parse raw axios errors
 *
 * Usage:
 *   import { apiClient } from '@/lib/api-client'
 *   const user = await apiClient.get<User>('/api/users/me')
 */
import axios, { isAxiosError, type AxiosRequestConfig } from 'axios'
import { ApiError, type ApiErrorBody } from '@/types/api'

// ── Internal axios instance ──────────────────────────────────────────────────

const _http = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '',
  headers: { 'Content-Type': 'application/json' },
  // Required for cookie-based auth (HttpOnly session cookies).
  // Harmless when using Bearer tokens.
  withCredentials: true,
})

// ── Request interceptor — attach JWT when present ────────────────────────────
// When using cookie auth exclusively, this block can be removed.

_http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Response interceptor — normalize every error to ApiError ─────────────────

_http.interceptors.response.use(
  (response) => response,
  (err) => Promise.reject(normalizeError(err)),
)

function normalizeError(err: unknown): ApiError {
  if (isAxiosError(err)) {
    const status = err.response?.status ?? 0
    const body = err.response?.data as ApiErrorBody | undefined
    const message = body?.error ?? err.message ?? 'An unexpected error occurred.'
    return new ApiError(status, message, err.response?.data)
  }

  const message = err instanceof Error ? err.message : 'An unexpected error occurred.'
  return new ApiError(0, message)
}

// ── Typed HTTP helpers ────────────────────────────────────────────────────────
// Each helper returns T (the unwrapped response body) or throws ApiError.

export const apiClient = {
  /** HTTP GET — fetches a resource. */
  get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return _http.get<T>(url, config).then((r) => r.data)
  },

  /** HTTP POST — creates a resource. */
  post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return _http.post<T>(url, data, config).then((r) => r.data)
  },

  /** HTTP PUT — full replacement of a resource. */
  put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return _http.put<T>(url, data, config).then((r) => r.data)
  },

  /** HTTP PATCH — partial update of a resource. */
  patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return _http.patch<T>(url, data, config).then((r) => r.data)
  },

  /** HTTP DELETE — removes a resource. */
  del<T = void>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return _http.delete<T>(url, config).then((r) => r.data)
  },
}
