export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const configuredBase = (config.public.apiBase || 'http://localhost:8080').replace(/\/+$/, '')
  const baseURL = /\/api\/v\d+$/.test(configuredBase)
    ? configuredBase
    : `${configuredBase}/api/v1`

  const api = $fetch.create({
    baseURL,
    
    // We change "{ options }" to "context" to stop the auto-import bug
    onRequest(context: any) {
      context.options.headers = {
        ...context.options.headers,
        'X-User-Id': 'USR-2026-0001',
        'X-School-Id': 'SCL-2026-0001',
      }
    },
  })

  return { provide: { api } }
})
