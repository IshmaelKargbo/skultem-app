import { defineStore } from 'pinia'

export const useLedgerStore = defineStore('ledger', {
  state: () => ({
    records: [] as Ledger[],
    meta: {
      size: 0,
      page: 0,
      total: 0,
      showingFrom: 0,
      showingTo: 0,
      totalPages: 0
    } as Meta,
    total: {} as LedgerReport,
    entries: [] as Ledger[],
    entriesMeta: {
      size: 0,
      page: 0,
      total: 0,
      showingFrom: 0,
      showingTo: 0,
      totalPages: 0
    } as Meta,
    entriesLoading: true,
    loading: true,
    error: null as string | null
  }),

  actions: {
    async fetchAll(page: number = 1, size: number = runtimeConf().limit) {
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
    async fetchEntries(page: number, size: number, filters: LedgerFilters = {}) {
      this.entriesLoading = true
      try {
        const response = await FeeApi().getLedger(page, size, filters)
        this.entries = response?.data || []
        this.entriesMeta = response?.meta || {} as Meta
      } finally {
        this.entriesLoading = false
      }
    },
    async caculateLedgerReport() {
      const res = await FeeApi().caculateLedgerReport()
      if (res) {
        this.total = {
          totalDebit: res.totalDebit,
          totalCredit: res.totalCredit,
          finalBalance: res.netBalance
        }
      }
      return res
    }
  }
})
