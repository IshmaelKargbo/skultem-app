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
    listTimings: async () => {
      try {
        const res: any = await $api('/timetable/timing')

        if (!res)
          throw new Error('Failed to fetch timing templates')

        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },
    listTimingLevels: async () => {
      try {
        const res: any = await $api('/timetable/timing/level')

        if (!res)
          throw new Error('Failed to fetch timing level assignments')

        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },
    assignTimingLevel: async (level: SchoolLevel, timingId: string) => {
      try {
        return await $api('/timetable/timing/level', {
          method: 'POST',
          body: { level, timingId }
        })
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
    // Either param resolves a set of working days - `session` for a class session's timetable
    // grid (resolved server-side via that session's Level), `timingId` for editing one specific
    // template directly (the Settings page).
    listWorkingDays: async (params: { session?: string, timingId?: string }) => {
      try {
        const query = params.session
          ? `session=${params.session}`
          : `timingId=${params.timingId}`
        const res: any = await $api(`/timetable/working-day?${query}`)

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
    updateRoom: async (payload: UpdateRoomDTO) => {
      try {
        return await $api('/timetable/room', {
          method: 'PATCH',
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
    createTimetable: async (payload: CreateTimetableDTO) => {
      try {
        return await $api('/timetable', {
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
    createTiming: async (payload: CreateTimingDTO) => {
      try {
        return await $api('/timetable/timing', {
          method: 'POST',
          body: payload
        })
      } catch (err: any) {
        useHandleError(err)
      }
    },
    updateTiming: async (id: string, payload: CreateTimingDTO) => {
      try {
        return await $api(`/timetable/timing/${id}`, {
          method: 'PATCH',
          body: payload
        })
      } catch (err: any) {
        useHandleError(err)
      }
    },
    setDefaultTiming: async (id: string) => {
      try {
        return await $api(`/timetable/timing/${id}/default`, {
          method: 'PATCH'
        })
      } catch (err: any) {
        useHandleError(err)
      }
    },
    deleteTiming: async (id: string) => {
      try {
        return await $api(`/timetable/timing/${id}`, {
          method: 'DELETE'
        })
      } catch (err: any) {
        useHandleError(err)
      }
    },
    deletePeriod: async (id: string) => {
      try {
        return await $api(`/timetable/period/${id}`, {
          method: 'DELETE'
        })
      } catch (err: any) {
        useHandleError(err)
      }
    },
    // Adjusts one period's start/end time - only affects that period's own class session.
    updatePeriod: async (id: string, payload: UpdatePeriodDTO) => {
      try {
        return await $api(`/timetable/period/${id}`, {
          method: 'PATCH',
          body: payload
        })
      } catch (err: any) {
        useHandleError(err)
      }
    },
    deleteRoom: async (id: string) => {
      try {
        return await $api(`/timetable/room/${id}`, {
          method: 'DELETE'
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
