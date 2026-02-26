export const SubjectApi = () => {
  const { $api } = useNuxtApp()

  return {
    getAll: async (page: number, size: number) => {
      try {
        const res = await $api(`/subject?page=${page}&size=${size}`) as any

        if (!res)
          throw new Error('Failed to fetch subjects')

        const data = res.data
        const meta = useMeta(res.meta)

        return { ...res, data, meta }

      } catch (err: any) {
        useHandleError(err)
      }
    },
    create: async (payload: CreateSubjectDto) => {
      try {
        return await $api('/subject', {
          method: 'POST',
          body: payload
        })
      } catch (err: any) {
        useHandleError(err)
      }
    },
    getOne: async (id: string) => {
      try {
        const res = await $api(`/subject/${id}`) as any

        if (!res)
          throw new Error('Failed to fetch subject')

        return res.data

      } catch (err: any) {
        useHandleError(err)
      }
    }
  }
}
