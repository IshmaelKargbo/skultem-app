export const AcademicYearApi = () => {
  const { $api } = useNuxtApp()

  return {
    getAll: async (page: number, size: number) => {
      try {
        const res = await $api(`/academic-year?page=${page}&size=${size}`) as any

        if (!res)
          throw new Error('Failed to fetch academic years')

        const data = res.data
        const meta = useMeta(res.meta)

        return { ...res, data, meta }

      } catch (err: any) {
        useHandleError(err)
      }
    },
    create: async (payload: CreateAcademicYearDto) => {
      try {
        return await $api('/academic-year', {
          method: 'POST',
          body: payload
        })
      } catch (err: any) {
        useHandleError(err)
      }
    },
    getOne: async (id: string) => {
      try {
        const res = await $api(`/academic-year/${id}`) as any

        if (!res)
          throw new Error('Failed to fetch academic year')

        return res.data

      } catch (err: any) {
        useHandleError(err)
      }
    }
  }
}

export type CreateAcademicYearDto = {
  name: string
  startDate: string
  endDate: string
}
