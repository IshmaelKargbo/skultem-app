// The backend's address comes only from NUXT_PUBLIC_API_BASE. There is no built-in fallback on purpose:
// a missing setting should fail loudly instead of quietly sending requests (and tokens) somewhere else.

// The server root, e.g. https://api.example.com (no trailing slash, no /api/vN).
export function apiServerBase(): string {
  const configured = String(useRuntimeConfig().public.apiBase || '').trim().replace(/\/+$/, '')
  if (!configured) {
    throw new Error('NUXT_PUBLIC_API_BASE is not set. Add it to your .env (e.g. NUXT_PUBLIC_API_BASE=https://api.example.com).')
  }
  return configured.replace(/\/api\/v\d+$/, '')
}

// The versioned API root, e.g. https://api.example.com/api/v1. Keeps a version the setting already names.
export function apiBaseUrl(): string {
  const configured = String(useRuntimeConfig().public.apiBase || '').trim().replace(/\/+$/, '')
  return /\/api\/v\d+$/.test(configured) ? configured : `${apiServerBase()}/api/v1`
}
