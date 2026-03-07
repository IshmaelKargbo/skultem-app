export const BehaviourApi = () => {
  const { $api } = useNuxtApp()

  return {
    getAll: async (classId: string, page: number, size: number) => {
      try {
        const res = await $api(`/behaviours?classId=${classId}page=${page}&size=${size}`) as any

        if (!res)
          throw new Error('Failed to fetch behaviours')

        const data = res.data
        const meta = useMeta(res.meta)

        return { ...res, data, meta }

      } catch (err: any) {
        useHandleError(err)
      }
    },
    getAllReport: async (classId: string) => {
      try {
        const res = await $api(`/behaviours/report?classId=${classId}`) as any

        if (!res)
          throw new Error('Failed to fetch behaviour reports')

        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },
    getAllCateegory: async (page: number, size: number) => {
      try {
        const res = await $api(`/behaviours/category?page=${page}&size=${size}`) as any

        if (!res)
          throw new Error('Failed to fetch behaviour categories')

        const data = res.data
        const meta = useMeta(res.meta)

        return { ...res, data, meta }

      } catch (err: any) {
        useHandleError(err)
      }
    },
    create: async (payload: CreateBehaviourDto) => {
      try {
        return await $api('/behaviours', {
          method: 'POST',
          body: payload
        })
      } catch (err: any) {
        useHandleError(err)
      }
    },
    createCategory: async (payload: CreateBehaviourCategoryDto) => {
      try {
        return await $api('/behaviours/category', {
          method: 'POST',
          body: payload
        })
      } catch (err: any) {
        useHandleError(err)
      }
    }
  }
}
