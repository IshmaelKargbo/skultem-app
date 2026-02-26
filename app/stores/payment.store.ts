import { defineStore } from 'pinia'

export const useFeePaymentStore = defineStore('feePayment', {
  state: () => ({
    records: [] as FeePayment[],
    meta: {} as Meta,
    loading: true,
    error: null as string | null
  }),

  actions: {
    async fetchAll(page: number = 1, size: number = 6) {
      this.loading = true
      this.error = null
      try {
        const response = await FeeApi().getAllPayments(page, size) as any
        this.records = response.data || []
        this.meta = response.meta || {} as Meta
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch fee payments'
      } finally {
        this.loading = false
      }
    },
    recordPayment(payload: RecordPaymentDto) {
      return FeeApi().recordPayment(payload)
    },
  }
})
