export const CurriculumsApi = () => {
  const { $api } = useNuxtApp()

  return {
    createSchemeOfWork: async (payload: CreateSchemeOfWork) => {
      try {
        const res = await $api('/curriculum/scheme', {
          method: 'POST',
          body: payload
        }) as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },
    createWeek: async (payload: CreateWeek) => {
      try {
        const res = await $api('/curriculum/scheme/week', {
          method: 'POST',
          body: payload
        }) as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },
    getWeeksBySchema: async (id: string) => {
      try {
        const res = await $api(`/curriculum/scheme/weeks/${id}`) as any

        if (!res)
          throw new Error('Failed to fetch scheme weeks')

        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },
    getWeeks: async () => {
      try {
        const res = await $api('/curriculum/session/scheme/weeks') as any

        if (!res)
          throw new Error('Failed to fetch scheme weeks')

        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },
    getWeek: async (id: string) => {
      try {
        const res = await $api(`/curriculum/scheme/weeks/${id}`) as any

        if (!res)
          throw new Error('Failed to fetch scheme weeks')

        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },
    getScheme: async (id: string) => {
      try {
        const res = await $api(`/curriculum/scheme/one/${id}`) as any

        if (!res)
          throw new Error('Failed to fetch scheme')

        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },
    getSchemeProgress: async (id: string) => {
      try {
        const res = await $api(`/curriculum/scheme/progress/${id}`) as any

        if (!res)
          throw new Error('Failed to fetch scheme progress')

        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },
    getSchemes: async (page: number, size: number) => {
      try {
        const res = await $api(`/curriculum/scheme?page=${page}&size=${size}`) as any

        if (!res)
          throw new Error('Failed to fetch schemes')

        const data = res.data
        const meta = useMeta(res.meta)

        return { ...res, data, meta }
      } catch (err: any) {
        useHandleError(err)
      }
    }
  }
}
