export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const configuredBase = (config.public.apiBase || "http://localhost:8080").replace(/\/+$/, "")
  const baseURL = /\/api\/v\d+$/.test(configuredBase) ? configuredBase : `${configuredBase}/api/v1`

  const api: any = $fetch.create({
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
      if (context.response.status === 401) {
        const refreshToken = useCookie("refresh_token")
        const accessToken = useCookie("access_token")

        if (refreshToken.value) {
          try {
            const res = await UserApi().refresh({ refreshToken: refreshToken.value })

            accessToken.value = res.accessToken

            context.request.options.headers = {
              ...context.request.options.headers,
              Authorization: `Bearer ${res.accessToken}`,
            }

            return api(context.request)
          } catch (err) {
            navigateTo("/login")
          }
        } else {
          navigateTo("/login")
        }

        return
      }
    },
  })

  return { provide: { api } }
})