import { defineStore } from 'pinia'

export const useFeeStore = defineStore('fee', {
  state: () => ({
    records: [] as FeeCategory[],
    feeDetails: {
      records: [],
      summery: {
        paid: 0,
        partial: 0,
        pending: 0
      }
    } as ClassFeeDetails,
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
    async getClassFeeDetails(session: string, term: string, page: number = 1, size: number = 6) {
      this.loading = true
      this.error = null
      try {
        const response = await FeeApi().getClassFeeDetails(session, term, page, size) as any
        this.feeDetails = response
        this.feeDetails.meta = useMeta(response.meta)
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch class fee details'
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
