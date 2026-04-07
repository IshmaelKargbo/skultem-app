export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const configuredBase = (config.public.apiBase || "http://localhost:8080").replace(/\/+$/, "")
  const baseURL = /\/api\/v\d+$/.test(configuredBase) ? configuredBase : `${configuredBase}/api/v1`

  let refreshPromise: Promise<string | null> | null = null

  const getAuthCookies = () => {
    const accessToken = useCookie<string | null>("access_token")
    const refreshToken = useCookie<string | null>("refresh_token")
    const activeRole = useCookie<string | null>("active_role")

    return { accessToken, refreshToken, activeRole }
  }

  const clearAuthState = () => {
    const { accessToken, refreshToken, activeRole } = getAuthCookies()

    accessToken.value = null
    refreshToken.value = null
    activeRole.value = null
  }

  const logoutAndRedirect = async () => {
    clearAuthState()
    await navigateTo("/login")
  }

  const getNewAccessToken = async (refreshToken: string): Promise<string | null> => {
    if (refreshPromise) {
      return refreshPromise
    }

    refreshPromise = $fetch<any>(`${baseURL}/auth/refresh`, {
      method: 'POST',
      body: { refreshToken }
    })
      .then((res) => {
        const { accessToken, refreshToken: refreshTokenCookie } = getAuthCookies()
        const newToken = res?.data?.accessToken
        const newRefreshToken = res?.data?.refreshToken

        if (!newToken) throw new Error("No token returned")

        accessToken.value = newToken
        if (newRefreshToken) {
          refreshTokenCookie.value = newRefreshToken
        }

        return newToken as string
      })
      .catch(() => null)
      .finally(() => {
        refreshPromise = null
      })

    return refreshPromise
  }

  const rawApi = $fetch.create({
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
      if (context.response.status >= 500) {
        console.error("Server Error:", context.response.statusText)
      }
    },
  })

  const api = async <T>(request: any, options: Record<string, any> = {}): Promise<T> => {
    const requestUrl = typeof request === "string" ? request : request?.toString?.() || ""
    const isRefreshRequest = requestUrl.includes("/auth/refresh")
    const hasRetried = Boolean(options._retried)

    try {
      return await rawApi<T>(request, options)
    } catch (error: any) {
      const status = error?.response?.status
      const { refreshToken } = getAuthCookies()

      if (status !== 401) {
        throw error
      }

      if (isRefreshRequest || hasRetried || !refreshToken.value) {
        await logoutAndRedirect()
        throw error
      }

      const newToken = await getNewAccessToken(refreshToken.value)

      if (!newToken) {
        await logoutAndRedirect()
        throw error
      }

      return await rawApi<T>(request, {
        ...options,
        _retried: true,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${newToken}`,
        },
      })
    }
  }

  return { provide: { api } }
})
