// Idempotency keys for the requests that create records (enrolling a student, creating/assigning a
// fee, recording a payment) - see the backend's @Idempotent. A request that fails or times out is
// retried with the SAME key, so if the server actually completed it the retry just returns the
// original result instead of creating a duplicate; once a request succeeds its key is dropped, so
// the next identical request (a deliberate second record) gets a fresh one.
//
// The key is remembered per request (operation + a fingerprint of the body) in sessionStorage, so it
// also survives a page reload while a retry is pending. Plain browser APIs only - utils files can't
// reference each other's auto-imports.
const STORAGE_KEY = 'skultem:idempotency'
const TTL_MS = 30 * 60 * 1000

type Pending = Record<string, { key: string, at: number }>

function load(): Pending {
    try {
        const raw = sessionStorage.getItem(STORAGE_KEY)
        const parsed: Pending = raw ? JSON.parse(raw) : {}
        const now = Date.now()
        return Object.fromEntries(Object.entries(parsed).filter(([, v]) => now - v.at < TTL_MS))
    } catch {
        return {}
    }
}

function save(pending: Pending) {
    try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(pending))
    } catch {
        // Storage unavailable (private mode, SSR) - keys just live for this attempt.
    }
}

const memory: Pending = {}

function newKey(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`
}

// cyrb53 - a compact, well-distributed string hash; this only needs to tell two bodies apart.
function hash(text: string): string {
    let h1 = 0xdeadbeef
    let h2 = 0x41c6ce57
    for (let i = 0; i < text.length; i++) {
        const ch = text.charCodeAt(i)
        h1 = Math.imul(h1 ^ ch, 2654435761)
        h2 = Math.imul(h2 ^ ch, 1597334677)
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36)
}

function fingerprint(operation: string, body: unknown): string {
    let text: string
    if (typeof FormData !== 'undefined' && body instanceof FormData) {
        text = JSON.stringify([...body.entries()].map(([k, v]) =>
            [k, typeof v === 'string' ? v : `file:${(v as File).name}:${(v as File).size}`]))
    } else {
        text = JSON.stringify(body ?? null)
    }
    return `${operation}:${hash(text)}`
}

// Sends a create request with an Idempotency-Key. `send` receives the headers to attach.
export async function withIdempotency<T>(
    operation: string,
    body: unknown,
    send: (headers: Record<string, string>) => Promise<T>
): Promise<T> {
    const id = fingerprint(operation, body)
    const pending = { ...load(), ...memory }
    const key = pending[id]?.key ?? newKey()

    pending[id] = { key, at: Date.now() }
    memory[id] = pending[id]
    save(pending)

    const result = await send({ 'Idempotency-Key': key })

    delete memory[id]
    const after = load()
    delete after[id]
    save(after)
    return result
}
