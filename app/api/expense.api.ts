export const ExpenseApi = () => {
  const { $api } = useNuxtApp()

  return {
    getAllCategories: async (page: number, size: number) => {
      try {
        const res = await $api(`/expense/category?page=${page}&size=${size}`) as any

        if (!res)
          throw new Error('Failed to fetch expense categories')

        const data = res.data
        const meta = useMeta(res.meta)

        return { ...res, data, meta }
      } catch (err: any) {
        useHandleError(err)
      }
    },
    getAll: async (page: number, size: number) => {
       try {
        const res = await $api(`/expense?page=${page}&size=${size}`) as any

        if (!res)
          throw new Error('Failed to fetch expenses')

        const data = res.data
        const meta = useMeta(res.meta)

        return { ...res, data, meta }
      } catch (err: any) {
        useHandleError(err)
      }
    },
    createCategory: async (payload: CreateExpenseCategoryDTO) => {
      try {
        return await $api('/expense/category', {
          method: 'POST',
          body: payload
        })
      } catch (err: any) {
        useHandleError(err)
      }
    },
    create: async (payload: CreateExpenseDTO) => {
      try {
        return await $api('/expense', {
          method: 'POST',
          body: payload
        })
      } catch (err: any) {
        useHandleError(err)
      }
    }
  }
}
