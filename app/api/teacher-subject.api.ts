export const TeacherSubjectApi = () => {
  const { $api } = useNuxtApp()

  return {
    getAll: async (page: number, size: number, classId?: string, query?: string, sortBy?: string, direction?: string) => {
      try {
        const params = new URLSearchParams({ page: String(page), size: String(size) })
        if (classId) params.set('classId', classId)
        if (query) params.set('query', query)
        if (sortBy) params.set('sortBy', sortBy)
        if (direction) params.set('direction', direction)

        const res = await $api(`/teacher/subject?${params}`) as any

        if (!res)
          throw new Error('Failed to fetch teacher subjects')

        const data = res.data
        const meta = useMeta(res.meta)

        return { ...res, data, meta }

      } catch (err: any) {
        useHandleError(err)
      }
    },
    getAllByTeacher: async (page: number, size: number) => {
      try {
        const res = await $api(`/teacher/subject/me?page=${page}&size=${size}`) as any

        if (!res)
          throw new Error('Failed to fetch teacher subjects')

        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },
    getAllByClass: async (id: string, page: number, size: number) => {
      try {
        const res = await $api(`/teacher/subject/session/${id}?page=${page}&size=${size}`) as any

        if (!res)
          throw new Error('Failed to fetch teacher subjects by class')

        const data = res.data
        const meta = useMeta(res.meta)

        return { ...res, data, meta }

      } catch (err: any) {
        useHandleError(err)
      }
    },
    create: async (id: string, payload: CreateTeacherSubjectDto) => {
      try {
        return await $api(`/teacher-assignment/subject/${id}`, {
          method: 'POST',
          body: payload
        })
      } catch (err: any) {
        useHandleError(err)
      }
    }
  }
}
