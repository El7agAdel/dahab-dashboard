interface ApiErrorBody {
  message: string
  error: { code: string; details?: Record<string, string[]> }
  requestId: string
}

// Every failed API call rejects with this (spec 8). Status 0 means no response (offline, timeout).
export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly details: Record<string, string[]> | undefined
  readonly requestId: string | undefined
  readonly retryAfterSeconds: number | undefined

  constructor(init: {
    status: number
    code: string
    message?: string
    details?: Record<string, string[]>
    requestId?: string
    retryAfterSeconds?: number
  }) {
    super(init.message ?? init.code)
    this.name = 'ApiError'
    this.status = init.status
    this.code = init.code
    this.details = init.details
    this.requestId = init.requestId
    this.retryAfterSeconds = init.retryAfterSeconds
  }
}

export function parseErrorBody(
  status: number,
  body: unknown,
  retryAfter?: string | null,
): ApiError {
  const retryAfterSeconds = Number(retryAfter) || undefined // seconds form only; an HTTP date is ignored
  const parsed = body as Partial<ApiErrorBody> | null
  if (typeof parsed?.error?.code !== 'string') {
    return new ApiError({ status, code: 'UNKNOWN_ERROR', retryAfterSeconds })
  }
  return new ApiError({
    status,
    code: parsed.error.code,
    message: parsed.message,
    details: parsed.error.details,
    requestId: parsed.requestId,
    retryAfterSeconds,
  })
}
