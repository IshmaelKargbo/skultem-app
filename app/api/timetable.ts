export const TimetableApi = () => {
  const { $api } = useNuxtApp()

  return {
    searchRoom: async (search: string, page: number, size: number) => {
      try {
        const res: any = await $api(`/timetable/room?page=${page}&size=${size}&search=${search}`)

        if (!res)
          throw new Error('Failed to fetch terms')

        const data = res.data
        const meta = useMeta(res.meta)

        return { ...res, data, meta }

      } catch (err: any) {
        useHandleError(err)
      }
    },
    getTiming: async () => {
      try {
        const res: any = await $api('/timetable/timing')

        if (!res)
          throw new Error('Failed to fetch timing')

        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },
    getTimetable: async (id: string) => {
      try {
        const res: any = await $api(`/timetable/period/${id}`)

        if (!res)
          throw new Error('Failed to fetch timetable')

        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },
    listWorkingDays: async () => {
      try {
        const res: any = await $api('/timetable/working-day')

        if (!res)
          throw new Error('Failed to fetch working day')

        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },
    createRoom: async (payload: CreateRoomDTO) => {
      try {
        return await $api('/timetable/room', {
          method: 'POST',
          body: payload
        })
      } catch (err: any) {
        useHandleError(err)
      }
    },
    createPeriod: async (payload: CreatePeriodDTO) => {
      try {
        return await $api('/timetable/period', {
          method: 'POST',
          body: payload
        })
      } catch (err: any) {
        useHandleError(err)
      }
    },
    createBreak: async (payload: CreatePeriodDTO) => {
      try {
        return await $api('/timetable/break', {
          method: 'POST',
          body: payload
        })
      } catch (err: any) {
        useHandleError(err)
      }
    },
    createLunch: async (payload: CreatePeriodDTO) => {
      try {
        return await $api('/timetable/lunch', {
          method: 'POST',
          body: payload
        })
      } catch (err: any) {
        useHandleError(err)
      }
    },
    setTiming: async (payload: CreateTimingDTO) => {
      try {
        return await $api('/timetable/timing', {
          method: 'POST',
          body: payload
        })
      } catch (err: any) {
        useHandleError(err)
      }
    },
    setWorkingDay: async (payload: SetWorkingDTO) => {
      try {
        return await $api('/timetable/working-day', {
          method: 'POST',
          body: payload
        })
      } catch (err: any) {
        useHandleError(err)
      }
    }
  }
}
