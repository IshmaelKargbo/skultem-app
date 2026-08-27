export const CalendarEventApi = () => {
  const { $api } = useNuxtApp()

  return {
    getAll: async (page: number = 1, size: number = 100) => {
      try {
        const res = await $api(`/calendar-event?page=${page}&size=${size}`) as any

        if (!res)
          throw new Error('Failed to fetch calendar entries')

        const data = res.data
        const meta = useMeta(res.meta)

        return { ...res, data, meta }
      } catch (err: any) {
        useHandleError(err)
      }
    },

    create: async (payload: CreateCalendarEntryDto) => {
      try {
        const res = await $api('/calendar-event', {
          method: 'POST',
          body: payload
        }) as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },

    update: async (id: string, payload: CreateCalendarEntryDto) => {
      try {
        const res = await $api(`/calendar-event/${id}`, {
          method: 'PUT',
          body: payload
        }) as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },

    remove: async (id: string) => {
      try {
        await $api(`/calendar-event/${id}`, {
          method: 'DELETE'
        })
      } catch (err: any) {
        useHandleError(err)
      }
    }
  }
}
