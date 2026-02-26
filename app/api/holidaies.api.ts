export const HolidayApi = () => {
  const { $api } = useNuxtApp()

  return {
    getAll: async (page: number, size: number) => {
      try {
        const res = await $api(`/holiday?page=${page}&size=${size}`) as any

        if (!res)
          throw new Error('Failed to fetch holidaies')

        const data = res.data
        const meta = useMeta(res.meta)

        return { ...res, data, meta }

      } catch (err: any) {
        useHandleError(err)
      }
    },

    create: async (payload: CreateHolidayDto) => {
      try {
        return await $api('/holiday', {
          method: 'POST',
          body: payload
        })
      } catch (err: any) {
        useHandleError(err)
      }
    }
  }
}
