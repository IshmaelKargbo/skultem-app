// Browser-side cache of print-safe (data: URI) images keyed by their source URL, so a logo or
// signature that has been fetched once is instant on every later report, receipt or card - across
// page loads, not just within one visit. An upload always produces a new URL, so an entry can never
// be stale. Small on purpose (the backend already shrinks embedded images) and best-effort:
// storage can be full, blocked or private-mode, and every failure just means "not cached".
const PREFIX = 'img-data:'
const MAX_ENTRIES = 8
const MAX_ENTRY_CHARS = 1_200_000

export function readCachedDataUri(url?: string | null): string {
    if (!url || !import.meta.client) return ''
    try {
        const raw = localStorage.getItem(PREFIX + url)
        return raw ? (JSON.parse(raw).d as string) : ''
    } catch {
        return ''
    }
}

export function writeCachedDataUri(url: string | null | undefined, dataUri: string | null | undefined) {
    if (!url || !dataUri || !import.meta.client || dataUri.length > MAX_ENTRY_CHARS) return
    try {
        localStorage.setItem(PREFIX + url, JSON.stringify({ d: dataUri, t: Date.now() }))

        // Drop the oldest entries beyond the cap.
        const entries: { key: string, t: number }[] = []
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (!key?.startsWith(PREFIX)) continue
            try {
                entries.push({ key, t: JSON.parse(localStorage.getItem(key) || '{}').t || 0 })
            } catch {
                entries.push({ key, t: 0 })
            }
        }
        entries.sort((a, b) => b.t - a.t).slice(MAX_ENTRIES).forEach(e => localStorage.removeItem(e.key))
    } catch {
        // Full or unavailable - not cached, nothing else to do.
    }
}
