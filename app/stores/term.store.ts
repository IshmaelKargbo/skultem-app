import { defineStore } from 'pinia'

export const useTermStore = defineStore('term', {
  state: () => ({
    records: [] as Term[],
    meta: {} as Meta,
    loading: false,
    error: null as string | null
  }),

  actions: {
    async fetchAll(page: number = 1, size: number = 6) {
      this.loading = true
      this.error = null
      try {
        const response = await TermApi().getAll(page, size)
        this.records = response.data || []
        this.meta = response.meta || {} as Meta
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch terms'
      } finally {
        this.loading = false
      }
    },
    create(payload: CreateTermDto) {
      return TermApi().create(payload)
    }
  }
})
