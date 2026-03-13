export const AttendanceApi = () => {
  const { $api } = useNuxtApp()

  return {
    getSession: async (id: string, date: string) => {
      try {
        const res = await $api(`/attendance/session/${id}?date=${date}`) as any

        if (!res)
          throw new Error('Failed to fetch attendance session')

        const data = res.data
        const meta = res.meta
        return { data, meta }

      } catch (err: any) {
        useHandleError(err)
      }
    },
    getHistory: async (id: string, page=1, size=6) => {
      try {
        const res = await $api(`/attendance/session/report/${id}?page=${page}&size=${size}`) as any

        if (!res)
          throw new Error('Failed to fetch attendance history')

        const data = res.data
        const meta = useMeta(res.meta)
        
        return { data, meta }
      } catch (err: any) {
        useHandleError(err)
      }
    },
    create: async (id: string, payload: CreateAttendanceDto) => {
      try {
        return await $api(`/attendance/session/${id}`, {
          method: 'POST',
          body: payload
        })
      } catch (err: any) {
        useHandleError(err)
      }
    }
  }
}
