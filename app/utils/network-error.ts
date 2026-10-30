// Plain-language messages for requests that fail because of the connection or the server being down,
// instead of raw errors like `[POST] "https://…": <no response> Failed to fetch`.
// Used by the $api plugin (every normal request) and the file-download helpers that call fetch directly.
// A message the backend sent itself (validation, business rules) is never replaced.

export const NETWORK_MESSAGES = {
    offline: 'You\'re offline. Check your internet connection and try again.',
    unreachable: 'We couldn\'t reach the server. Check your internet connection and try again.',
    timeout: 'The server is taking too long to respond. Check your connection and try again.',
    unavailable: 'The server is temporarily unavailable. Please try again in a moment.',
    server: 'Something went wrong on our side. Please try again.'
} as const

const isOffline = () => import.meta.client && typeof navigator !== 'undefined' && navigator.onLine === false

/** A friendly message for a request that got no answer at all (no HTTP response), or null if it isn't one. */
export function noResponseMessage(error: any): string | null {
    const cause = error?.cause ?? error
    const name = cause?.name ?? error?.name
    // Cancelled on purpose (e.g. the page moved on) - nothing to tell the user.
    if (name === 'AbortError') return null
    if (name === 'TimeoutError') return NETWORK_MESSAGES.timeout
    if (isOffline()) return NETWORK_MESSAGES.offline
    // What the browser's fetch throws when it can't connect: DNS, refused connection, dropped Wi-Fi, CORS.
    if (cause instanceof TypeError || error?.name === 'FetchError') return NETWORK_MESSAGES.unreachable
    return null
}

/** A friendly message for an HTTP status the backend didn't explain itself, or null to keep its own. */
export function statusMessage(status: number, backendMessage?: string | null): string | null {
    if (backendMessage) return null
    if (status === 502 || status === 503) return NETWORK_MESSAGES.unavailable
    if (status === 504 || status === 408) return NETWORK_MESSAGES.timeout
    if (status >= 500) return NETWORK_MESSAGES.server
    return null
}

/**
 * The connection/server message for a failed $api (ofetch) request, or null when the error already says
 * what went wrong. Statuses only count when the body has no message of its own (a gateway's HTML page,
 * an empty 500).
 */
export function connectionErrorMessage(error: any): string | null {
    const status = error?.response?.status ?? error?.status ?? error?.statusCode
    if (!status) return noResponseMessage(error)
    const data = error?.data ?? error?.response?._data
    const backendMessage = data && typeof data === 'object' ? data.message : null
    return statusMessage(status, backendMessage)
}

/** fetch() for the download helpers: a connection failure becomes a plain-language Error. */
export async function fetchOrExplain(input: string, init?: RequestInit): Promise<Response> {
    try {
        return await fetch(input, init)
    } catch (error: any) {
        throw new Error(noResponseMessage(error) ?? error?.message ?? NETWORK_MESSAGES.unreachable)
    }
}

/** The error to throw for a download that came back !ok: the backend's message, else a plain one. */
export async function downloadError(res: Response, fallback: string): Promise<Error> {
    let message: string | null = null
    try {
        const body = await res.clone().json()
        message = body?.message || null
    } catch {
        // Not JSON (a gateway page, or a file) - fall back below.
    }
    return new Error(message || statusMessage(res.status) || fallback)
}
