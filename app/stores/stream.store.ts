import { defineStore } from 'pinia'

export const useStreamStore = defineStore('stream', {
  state: () => ({
    records: [] as Stream[],
    meta: {} as Meta,
    loading: false,
    error: null as string | null
  }),

  actions: {
    async fetchAll(page: number = 1, size: number = 6) {
      this.loading = true
      this.error = null
      try {
        const response = await StreamApi().getAll(page, size) as any
        this.records = response.data || []
        this.meta = response.meta || {} as Meta
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch streams'
      } finally {
        this.loading = false
      }
    },
    create(payload: CreateStreamDto) {
      return StreamApi().create(payload)
    },
    findOne(id: string) {
      return StreamApi().getOne(id) 
    }
  }
})
