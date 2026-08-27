export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const configuredBase = (config.public.apiBase || "http://localhost:8080").replace(/\/+$/, "")
  const baseURL = /\/api\/v\d+$/.test(configuredBase) ? configuredBase : `${configuredBase}/api/v1`

  let refreshPromise: Promise<string | null> | null = null

  const getAuthCookies = () => useAuthCookies()

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
      const { accessToken } = getAuthCookies()
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

  // Two report/analytics endpoints are reads shaped as POST (they need a filter payload in the
  // body), not mutations - the dashboard's widgets and the Transactions/report-builder pages both
  // go through these. They're the only POSTs that get the year switcher applied; every other POST
  // is left alone on purpose (see below).
  const READ_VIA_POST = ["/report/export/run", "/widget/run"]
  const isReadViaPost = (request: string) => READ_VIA_POST.some((path) => request.includes(path))

  // The header's year switcher (useAcademicYearStore().viewingYearId) is the single source of
  // truth for "what year is the user looking at". Rather than threading that through every list
  // page's fetch calls by hand, every plain GET request picks it up here automatically - unless
  // the caller already put its own academicYearId on the URL (e.g. a report comparing a specific
  // year on purpose), in which case that wins. Mutations (POST/PUT/DELETE) are never touched: they
  // must always act on the school's actual active year, not whichever one is merely being viewed -
  // the two read-via-POST endpoints above are the sole, explicit exception.
  const withViewingYear = (request: string): string => {
    try {
      if (/[?&]academicYearId=/.test(request)) return request

      const yearId = useAcademicYearStore().viewingYearId
      if (!yearId) return request

      const separator = request.includes("?") ? "&" : "?"
      return `${request}${separator}academicYearId=${encodeURIComponent(yearId)}`
    } catch {
      // Pinia not ready yet (e.g. very early in app boot) - fall back to the plain request.
      return request
    }
  }

  const api = async <T>(request: any, options: Record<string, any> = {}): Promise<T> => {
    const requestUrl = typeof request === "string" ? request : request?.toString?.() || ""
    const isRefreshRequest = requestUrl.includes("/auth/refresh")
    const hasRetried = Boolean(options._retried)
    const method = String(options.method || "GET").toUpperCase()
    const appliesYearSwitch = typeof request === "string"
      && (method === "GET" || (method === "POST" && isReadViaPost(requestUrl)))

    const finalRequest = appliesYearSwitch ? withViewingYear(request) : request

    try {
      return await rawApi<T>(finalRequest, options)
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

      return await rawApi<T>(finalRequest, {
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
