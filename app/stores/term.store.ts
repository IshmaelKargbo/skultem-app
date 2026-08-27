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
    async getActive() {
      try {
        const response = await TermApi().getActive()
        return response
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch terms'
      } finally {
        this.loading = false
      }
    },
    create(payload: CreateTermDto) {
      return TermApi().create(payload)
    },
    activate(id: string) {
      return TermApi().activate(id)
    },
    async update(id: string, payload: CreateTermDto) {
      const response = await TermApi().update(id, payload)
      const index = this.records.findIndex(t => t.id === id)
      if (index !== -1) this.records[index] = response
      return response
    },
    async remove(id: string) {
      await TermApi().remove(id)
      this.records = this.records.filter(t => t.id !== id)
    }
  }
})
