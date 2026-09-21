export const TransactionApi = () => {
  const { $api } = useNuxtApp()

  return {
    // The school's transactions, newest first, narrowed by whichever filters are given.
    search: async (page: number, size: number, filters: TransactionFilters = {}) => {
      try {
        const query = new URLSearchParams({ page: String(page), size: String(size) })
        for (const [key, value] of Object.entries(filters)) {
          if (value) query.set(key, value)
        }

        const res = await $api(`/report/finance/transactions?${query.toString()}`) as any

        if (!res)
          throw new Error('Failed to fetch transactions')

        return { data: res.data as Transaction[], meta: useMeta(res.meta) }
      } catch (err: any) {
        useHandleError(err)
      }
    }
  }
}
