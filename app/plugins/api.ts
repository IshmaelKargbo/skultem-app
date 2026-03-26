export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const configuredBase = (config.public.apiBase || "http://localhost:8080").replace(/\/+$/, "")
  const baseURL = /\/api\/v\d+$/.test(configuredBase) ? configuredBase : `${configuredBase}/api/v1`

  let isRefreshing = false
  let refreshPromise: Promise<string | null> | null = null

  const getNewAccessToken = async (refreshToken: string): Promise<string | null> => {
    if (isRefreshing && refreshPromise) return refreshPromise

    isRefreshing = true
    refreshPromise = $fetch<any>(`${baseURL}/auth/refresh`, {
      method: 'POST',
      body: { refreshToken }
    })
      .then((res) => {
        const newToken = res?.data?.accessToken
        if (!newToken) throw new Error("No token returned")
        return newToken as string
      })
      .catch(() => null)
      .finally(() => {
        isRefreshing = false
        refreshPromise = null
      })

    return refreshPromise
  }

  const api = $fetch.create({
    baseURL,

    onRequest(context: any) {
      const accessToken = useCookie("access_token")
      if (accessToken.value) {
        context.options.headers = {
          ...context.options.headers,
          Authorization: `Bearer ${accessToken.value}`,
        }
      }
    },

    async onResponseError(context: any) {
      const accessToken = useCookie("access_token")
      const refreshToken = useCookie("refresh_token")

      const logoutAndRedirect = async () => {
        accessToken.value = null
        refreshToken.value = null
        await navigateTo("/login")
      }

      if (context.response.status === 401) {
        if (context.request.toString().includes('/auth/refresh')) {
          await logoutAndRedirect()
          return
        }

        if (refreshToken.value) {
          const newToken = await getNewAccessToken(refreshToken.value)

          if (!newToken) {
            await logoutAndRedirect()
            return
          }

          accessToken.value = newToken

          // ✅ Mutate the context options so the retry picks up the new token
          context.options.headers = {
            ...context.options.headers,
            Authorization: `Bearer ${newToken}`,
          }

          // ✅ Re-assign the response by awaiting and mutating context.response
          const retryResponse = await $fetch.raw(context.request, {
            ...context.options,
            headers: {
              ...context.options.headers,
              Authorization: `Bearer ${newToken}`,
            },
          })

          // ✅ Overwrite the response so the original caller gets the retried result
          context.response = retryResponse
          context.response._data = retryResponse._data

          return
        } else {
          await logoutAndRedirect()
        }
      }

      if (context.response.status >= 500) {
        console.error("Server Error:", context.response.statusText)
      }
    },
  })

  return { provide: { api } }
})