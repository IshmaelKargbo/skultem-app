import { defineStore } from 'pinia'

export const useStreamSubjectStore = defineStore('streamSubject', {
  state: () => ({
    records: [] as StreamSubject[],
    meta: {} as Meta,
    loading: false,
    error: null as string | null
  }),

  actions: {
    async fetchAll(page: number = 1, size: number = 6) {
      this.loading = true
      this.error = null
      try {
        const response = await StreamSubjectApi().getAll(page, size) as any
        this.records = response.data || []
        this.meta = response.meta || {} as Meta
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch stream subjects'
      } finally {
        this.loading = false
      }
    },
    async fetchAllByStream(id: string, page: number = 1, size: number = 6) {
      this.loading = true
      this.error = null
      try {
        const response = await StreamSubjectApi().getAllByStream(id, page, size) as any
        return response.data || []
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch stream subjects by class'
      } finally {
        this.loading = false
      }
    },
    create(id: string, payload: CreateStreamSubjectDto) {
      return StreamSubjectApi().create(id, payload)
    }
  }
})
