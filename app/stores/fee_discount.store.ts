import { defineStore } from 'pinia'

export const useFeeDiscountStore = defineStore('feeDiscount', {
  state: () => ({
    records: [] as FeeDiscount[],
    meta: {} as Meta,
    loading: false,
    error: null as string | null
  }),

  actions: {
    async fetchAll(page: number = 1, size: number = 6) {
      this.loading = true
      this.error = null
      try {
        const response = await FeeApi().getAllDiscounts(page, size) as any
        this.records = response.data || []
        this.meta = response.meta || {} as Meta
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch fee discounts'
      } finally {
        this.loading = false
      }
    },
    create(payload: CreateFeeDiscountDto) {
      return FeeApi().createDiscount(payload)
    },
    countStudentsByFee(id: string) {
      return FeeApi().countByStudentsByFee(id)
    },
    caculateDiscountReport() {
      return FeeApi().caculateDiscountReport()
    }
  }
})
