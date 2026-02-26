import { defineStore } from 'pinia'

export const useFeeStore = defineStore('fee', {
  state: () => ({
    records: [] as FeeCategory[],
    meta: {} as Meta,
    loading: false,
    error: null as string | null
  }),

  actions: {
    async fetchAll(page: number = 1, size: number = 6) {
      this.loading = true
      this.error = null
      try {
        const response = await FeeApi().getAllCategories(page, size) as any
        this.records = response.data || []
        this.meta = response.meta || {} as Meta
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch fee categories'
      } finally {
        this.loading = false
      }
    },
    async fetchAllPayment(page: number = 1, size: number = 6) {
      this.loading = true
      this.error = null
      try {
        const response = await FeeApi().getAllPayments(page, size) as any
        return { data: response.data, meta: response.meta }
      } catch (err: any) {
        throw err.data?.message || 'Failed to fetch fee payments'
      } finally {
        this.loading = false
      }
    },
    create(payload: CreateFeeCategoryDto) {
      return FeeApi().createCategory(payload)
    },
    recordPayment(payload: RecordPaymentDto) {
      return FeeApi().recordPayment(payload)
    },
  }
})
