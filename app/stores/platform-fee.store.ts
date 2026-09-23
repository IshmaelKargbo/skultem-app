import { defineStore } from 'pinia'

export const usePlatformFeeStore = defineStore('platform-fee', {
  state: () => ({
    report: null as PlatformFeeReport | null,
    records: [] as Ledger[],
    meta: {} as Meta,
    loadingReport: true,
    loading: true
  }),

  actions: {
    async fetchReport() {
      this.loadingReport = true
      try {
        this.report = (await FeeApi().getPlatformFeeReport()) ?? null
      } finally {
        this.loadingReport = false
      }
    },
    async fetchEntries(page: number = 1, size: number = 10, filters: LedgerFilters = {}) {
      this.loading = true
      try {
        const response = await FeeApi().getPlatformFeeEntries(page, size, filters)
        this.records = response?.data || []
        this.meta = response?.meta || {} as Meta
      } finally {
        this.loading = false
      }
    }
  }
})
