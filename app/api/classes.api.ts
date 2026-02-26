export const ClassApi = () => {
  const { $api } = useNuxtApp()

  return {
    getAll: async (page: number, size: number) => {
      try {
        const res = await $api(`/class?page=${page}&size=${size}`) as any

        if (!res)
          throw new Error('Failed to fetch classes')

        const data = res.data
        const meta = useMeta(res.meta)

        return { ...res, data, meta }

      } catch (err: any) {
        useHandleError(err)
      }
    },
    getAllStreams: async (classId: string) => {
      try {
        const res = await $api(`/class/streams/${classId}`) as any

        if (!res)
          throw new Error('Failed to fetch classes')

        const data = res.data
        return data
      } catch (err: any) {
        useHandleError(err)
      }
    },
    getAllSections: async (classId: string) => {
      try {
        const res = await $api(`/class/section/${classId}`) as any

        if (!res)
          throw new Error('Failed to fetch class sections')

        const data = res.data

        return data as ClassSection[]
      } catch (err: any) {
        useHandleError(err)
      }
    },
    getAllClassSessions: async (page: number = 1, size: number = 6) => {
      try {
        const res = await $api(`/class/session?page=${page}&size=${size}`) as any

        if (!res)
          throw new Error('Failed to fetch class sessions')

        const data = res.data
        const meta = useMeta(res.meta)

        return { data, meta }
      } catch (err: any) {
        useHandleError(err)
      }
    },
    create: async (payload: CreateClassDto) => {
      try {
        return await $api('/class', {
          method: 'POST',
          body: payload
        })
      } catch (err: any) {
        useHandleError(err)
      }
    },
    assignStudentToClass: async (payload: AssignStudentsDto) => {
      try {
        return await $api('/enrollment/class', {
          method: 'POST',
          body: payload
        })
      } catch (err: any) {
        useHandleError(err)
      }
    },
    assignClassMaster: async (id: string, payload: AssignMastertsDto) => {
      try {
        return await $api(`/teacher/assignment/class/${id}`, {
          method: 'POST',
          body: payload
        })
      } catch (err: any) {
        useHandleError(err)
      }
    },
    getOne: async (id: string) => {
      try {
        const res = await $api(`/class/${id}`) as any

        if (!res)
          throw new Error('Failed to fetch class')

        return res.data

      } catch (err: any) {
        useHandleError(err)
      }
    },
    getCurrentClassMaster: async (id: string) => {
      try {
        const res = await $api(`/class/master/${id}`) as any

        if (!res)
          throw new Error('Failed to fetch class master')

        return res.data

      } catch (err: any) {
        useHandleError(err)
      }
    }
  }
}
