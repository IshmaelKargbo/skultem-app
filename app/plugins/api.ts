// /plugins/api.ts
export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()

  const api = $fetch.create({
    baseURL: config.public.apiBase || 'http://localhost:8080',

    onRequest({ options }) {
      // Create headers if they don't exist
      const headers = (options.headers ||= {})

      // Use the set method if it's a Headers object, or standard assignment
      if (headers instanceof Headers) {
        headers.set('X-User-Id', 'USR-2026-0001')
        headers.set('X-School-Id', 'SCL-2026-0001')
      } else if (Array.isArray(headers)) {
        headers.push(['X-User-Id', 'USR-2026-0001'])
        headers.push(['X-School-Id', 'SCL-2026-0001'])
      } else {
        headers['X-User-Id'] = 'USR-2026-0001'
        headers['X-School-Id'] = 'SCL-2026-0001'
      }
    },
    // ... rest of your code
  })

  return { provide: { api } }
})