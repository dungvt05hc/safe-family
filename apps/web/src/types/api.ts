/**
 * Normalized error thrown by every apiClient method.
 * Use `instanceof ApiError` in catch blocks or TanStack Query's `onError` to
 * access HTTP status and the server message without re-parsing raw axios errors.
 *
 * @example
 * } catch (err) {
 *   if (err instanceof ApiError && err.isNotFound) { ... }
 * }
 */
export class ApiError extends Error {
  constructor(
    /** HTTP status code, or 0 for network/timeout errors */
    public readonly status: number,
    message: string,
    /** Raw response body, if any */
    public readonly data?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
    // Maintains proper prototype chain in transpiled ES5
    Object.setPrototypeOf(this, new.target.prototype)
  }

  get isNetworkError() { return this.status === 0 }
  get isUnauthorized() { return this.status === 401 }
  get isForbidden()    { return this.status === 403 }
  get isNotFound()     { return this.status === 404 }
  get isConflict()     { return this.status === 409 }
  get isServerError()  { return this.status >= 500 }
}

/** Shape of error response bodies from the SafeFamily API */
export interface ApiErrorBody {
  error: string
}

/** Generic paginated list response */
export interface PaginatedResponse<T> {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
}
