export const SubjectGroupApi = () => {
  const { $api } = useNuxtApp()

  return {
    getAll: async (page: number, size: number) => {
      try {
        const res = await $api(`/subject-group?page=${page}&size=${size}`) as any

        if (!res)
          throw new Error('Failed to fetch subject groups')

        const data = res.data
        const meta = useMeta(res.meta)

        return { ...res, data, meta }

      } catch (err: any) {
        useHandleError(err)
      }
    },
    getAllByClass: async (id: string, page: number, size: number) => {
      try {
        const res = await $api(`/subject-group/class/${id}?page=${page}&size=${size}`) as any

        if (!res)
          throw new Error('Failed to fetch subject groups by id')

        const data = res.data
        const meta = useMeta(res.meta)

        return { ...res, data, meta }

      } catch (err: any) {
        useHandleError(err)
      }
    },
    getAllBySubject: async (id: string, page: number, size: number) => {
      try {
        const res = await $api(`/subject-group/stream/${id}?page=${page}&size=${size}`) as any

        if (!res)
          throw new Error('Failed to fetch subject groups by stream')

        const data = res.data
        const meta = useMeta(res.meta)

        return { ...res, data, meta }

      } catch (err: any) {
        useHandleError(err)
      }
    },
    create: async (payload: CreateSubjectGroupDto) => {
      try {
        return await $api('/subject-group', {
          method: 'POST',
          body: payload
        })
      } catch (err: any) {
        useHandleError(err)
      }
    }
  }
}
