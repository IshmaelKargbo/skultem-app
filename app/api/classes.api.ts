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
    getAllClassSessions: async (page: number = 1, size: number = 6, academicYearId?: string, sectionId?: string,
      streamId?: string, query?: string) => {
      try {
        const params = new URLSearchParams({ page: String(page), size: String(size) })
        if (academicYearId) params.set('academicYearId', academicYearId)
        if (sectionId) params.set('sectionId', sectionId)
        if (streamId) params.set('streamId', streamId)
        if (query) params.set('query', query)

        const res = await $api(`/class-session?${params}`) as any

        if (!res)
          throw new Error('Failed to fetch class sessions')

        const data = res.data
        const meta = useMeta(res.meta)

        return { data, meta }
      } catch (err: any) {
        useHandleError(err)
      }
    },
    getAllMeClassSessions: async () => {
      try {
        const res = await $api('/class-session/me') as any

        if (!res)
          throw new Error('Failed to fetch class sessions')

        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },
    getAllUnassignClassSessions: async (page: number = 1, size: number = 6) => {
      try {
        const res = await $api(`/class-session/unassigned?page=${page}&size=${size}`) as any

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
    createSession: async (payload: CreateClassSessionDto) => {
      try {
        return await $api('/class-session', {
          method: 'POST',
          body: payload
        })
      } catch (err: any) {
        useHandleError(err)
      }
    },
    setupAllSessions: async (academicYearId: string) => {
      try {
        const res = await $api(`/class-session/setup-all?academicYearId=${academicYearId}`, {
          method: 'POST'
        }) as any

        if (!res)
          throw new Error('Failed to set up class sessions')

        return res.data as { created: number }
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
        return await $api(`/teacher-assignment/class/${id}`, {
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
    getAttention: async (id: string, academicYearId?: string) => {
      try {
        const params = academicYearId ? `?academicYearId=${academicYearId}` : ''
        const res = await $api(`/class/${id}/attention${params}`) as any

        if (!res)
          throw new Error('Failed to fetch class attention')

        return res.data as ClassAttention

      } catch (err: any) {
        useHandleError(err)
      }
    },
    getAttentionSummary: async (academicYearId?: string) => {
      try {
        const params = academicYearId ? `?academicYearId=${academicYearId}` : ''
        const res = await $api(`/class/attention-summary${params}`) as any

        if (!res)
          throw new Error('Failed to fetch class attention summary')

        return res.data as ClassAttentionSummary

      } catch (err: any) {
        useHandleError(err)
      }
    },
    getOneByClassAndStream: async (id: string, stream: string, academicYearId: string) => {
      try {
        const res = await $api(`/class-session/${id}/stream/${stream}?academicYearId=${academicYearId}`) as any

        if (!res)
          throw new Error('Failed to fetch class')

        return res.data

      } catch (err: any) {
        useHandleError(err)
      }
    },
    getOneByClass: async (id: string, academicYearId: string) => {
      try {
        const res = await $api(`/class-session/class/${id}?academicYearId=${academicYearId}`) as any

        if (!res)
          throw new Error('Failed to fetch class')

        return res.data

      } catch (err: any) {
        useHandleError(err)
      }
    },
    getOverview: async (id: string) => {
      try {
        const res = await $api(`/class/${id}/overview`) as any

        if (!res)
          throw new Error('Failed to fetch class overview')

        return res.data as ClassOverview

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
    },
    getClassSubjects: async (classId: string, streamId?: string) => {
      try {
        const query = streamId ? `?streamId=${streamId}` : ''
        const res = await $api(`/class/subject/${classId}${query}`) as any

        if (!res)
          throw new Error('Failed to fetch class subjects')

        return res.data as ClassCurriculum
      } catch (err: any) {
        useHandleError(err)
      }
    },
    updateTemplate: async (classId: string, templateId: string) => {
      try {
        return await $api(`/class/${classId}/template`, {
          method: 'PUT',
          body: { templateId }
        })
      } catch (err: any) {
        useHandleError(err)
      }
    },
    setNextClass: async (id: string, nextClass: string) => {
      try {
        const res = await $api('/class/next', {
          method: 'PUT',
          body: { id, nextClass }
        }) as any

        if (!res)
          throw new Error('Failed to set next class')

        return res.data as Clazz
      } catch (err: any) {
        useHandleError(err)
      }
    },
    setTerminal: async (id: string, terminal: boolean) => {
      try {
        const res = await $api(`/class/${id}/terminal`, {
          method: 'PUT',
          body: { terminal }
        }) as any

        if (!res)
          throw new Error('Failed to update class')

        return res.data as Clazz
      } catch (err: any) {
        useHandleError(err)
      }
    }
  }
}
