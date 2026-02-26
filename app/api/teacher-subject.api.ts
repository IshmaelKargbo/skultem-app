export const TeacherSubjectApi = () => {
  const { $api } = useNuxtApp()

  return {
    getAll: async (page: number, size: number) => {
      try {
        const res = await $api(`/teacher/subject?page=${page}&size=${size}`) as any

        if (!res)
          throw new Error('Failed to fetch teacher subjects')

        const data = res.data
        const meta = useMeta(res.meta)

        return { ...res, data, meta }

      } catch (err: any) {
        useHandleError(err)
      }
    },
    getAllByClass: async (id: string, page: number, size: number) => {
      try {
        const res = await $api(`/class-subject/${id}?page=${page}&size=${size}`) as any

        if (!res)
          throw new Error('Failed to fetch class subjects by class')

        const data = res.data
        const meta = useMeta(res.meta)

        return { ...res, data, meta }

      } catch (err: any) {
        useHandleError(err)
      }
    },
    create: async (id: string, payload: CreateClassSubjectDto) => {
      try {
        return await $api(`/assignment/class/${id}`, {
          method: 'POST',
          body: payload
        })
      } catch (err: any) {
        useHandleError(err)
      }
    }
  }
}
