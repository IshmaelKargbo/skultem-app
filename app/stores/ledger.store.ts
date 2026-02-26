import { defineStore } from 'pinia'

export const useLedgerStore = defineStore('ledger', {
  state: () => ({
    records: [] as Ledger[],
    meta: {} as Meta,
    total: {} as LedgerReport,
    loading: false,
    error: null as string | null
  }),

  actions: {
    async fetchAll(page: number = 1, size: number = 6) {
      this.loading = true
      this.error = null
      try {
        const response = await FeeApi().getLedger(page, size) as any
        this.records = response.data || []
        this.total = response.total
        this.meta = response.meta || {} as Meta
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch ledger'
      } finally {
        this.loading = false
      }
    },
    caculateLedgerReport() {
      return FeeApi().caculateLedgerReport()
    }
  }
})
