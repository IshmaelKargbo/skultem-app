import { defineStore } from 'pinia'

export const useTransactionStore = defineStore('transaction', {
  state: () => ({
    records: [] as Transaction[],
    meta: {} as Meta,
    loading: true
  }),

  actions: {
    async fetchAll(page: number, size: number, filters: TransactionFilters = {}) {
      this.loading = true
      try {
        const response = await TransactionApi().search(page, size, filters)
        this.records = response?.data || []
        this.meta = response?.meta || {} as Meta
      } finally {
        this.loading = false
      }
    }
  }
})
