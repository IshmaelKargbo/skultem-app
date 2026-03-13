export const SessionApi = () => {
  const { $api } = useNuxtApp()

  return {
    getAll: async (page: number, size: number) => {
      try {
        const res = await $api(`/session?page=${page}&size=${size}`) as any

        if (!res)
          throw new Error('Failed to fetch user sessions')

        const data = res.data
        const meta = useMeta(res.meta)

        return { data, meta }
      } catch (err: any) {
        useHandleError(err)
      }
    },
    logout: async (sessionId: string) => {
      try {
        return await $api(`/session/${sessionId}/logout`, {
          method: 'POST'
        })
      } catch (err: any) {
        useHandleError(err)
      }
    }
  }
}
