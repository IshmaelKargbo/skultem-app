import { defineStore } from 'pinia'

export const useParentStore = defineStore('parent', {
  state: () => ({
    records: [] as Parent[],
    meta: {} as Meta,
    loading: false,
    error: null as string | null
  }),

  actions: {
    async fetchAll(page: number = 1, size: number = 6) {
      this.loading = true
      this.error = null
      try {
        const response = await ParentApi().getAll(page, size) as any
        this.records = response.data || []
        this.meta = response.meta || {} as Meta
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch parents'
      } finally {
        this.loading = false
      }
    },
    create(payload: CreateParentDto) {
      return ParentApi().create(payload)
    }
  }
})
