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
    },
    getTerms: async () => {
      try {
        const res = await $api(`/academic-year/terms`) as any

        if (!res)
          throw new Error('Failed to fetch academic year terms')

        return res.data

      } catch (err: any) {
        useHandleError(err)
      }
    },
    configureNext: async (id: string, payload: ConfigureNextAcademicYearDto) => {
      try {
        const res = await $api(`/academic-year/${id}/next`, {
          method: 'POST',
          body: payload
        }) as any

        if (!res)
          throw new Error('Failed to configure next academic year')

        return res.data as ConfigureNextAcademicYearResult

      } catch (err: any) {
        useHandleError(err)
      }
    },
    assignNext: async (id: string, nextYearId: string) => {
      try {
        const res = await $api(`/academic-year/${id}/next`, {
          method: 'PUT',
          body: { nextYearId }
        }) as any

        if (!res)
          throw new Error('Failed to assign next academic year')

        return res.data as AcademicYear

      } catch (err: any) {
        useHandleError(err)
      }
    },
    update: async (id: string, payload: CreateAcademicYearDto) => {
      try {
        const res = await $api(`/academic-year/${id}`, {
          method: 'PATCH',
          body: payload
        }) as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },
    remove: async (id: string) => {
      try {
        return await $api(`/academic-year/${id}`, {
          method: 'DELETE'
        })
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
