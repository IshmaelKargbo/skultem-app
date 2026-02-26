export const TeacherApi = () => {
  const { $api } = useNuxtApp()

  return {
    getAll: async (page: number, size: number) => {
      try {
        const res = await $api(`/teacher?page=${page}&size=${size}`) as any

        if (!res)
          throw new Error('Failed to fetch teachers')

        const data = res.data
        const meta = useMeta(res.meta)

        return { ...res, data, meta }

      } catch (err: any) {
        useHandleError(err)
      }
    },
    getAllSubjects: async (id: string) => {
      try {
        const res = await $api(`/teacher/subject/${id}`) as any

        if (!res)
          throw new Error('Failed to fetch teacher subjects')

        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },
    create: async (payload: CreateTeacherDto) => {
      try {
        return await $api('/teacher', {
          method: 'POST',
          body: payload
        })
      } catch (err: any) {
        useHandleError(err)
      }
    }
  }
}
