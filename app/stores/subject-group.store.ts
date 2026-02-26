import { defineStore } from 'pinia'

export const useSubjectGroupStore = defineStore('subjectGroup', {
  state: () => ({
    records: [] as SubjectGroup[],
    meta: {} as Meta,
    loading: false,
    error: null as string | null
  }),

  actions: {
    async fetchAll(page: number = 1, size: number = 6) {
      this.loading = true
      this.error = null
      try {
        const response = await SubjectGroupApi().getAll(page, size) as any
        this.records = response.data || []
        this.meta = response.meta || {} as Meta
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch subject groups'
      } finally {
        this.loading = false
      }
    },
    async fetchAllByClass(id: string, page: number = 1, size: number = 6) {
      this.loading = true
      this.error = null
      try {
        const response = await SubjectGroupApi().getAllByClass(id, page, size) as any
        return response.data
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch subject groups by class'
      } finally {
        this.loading = false
      }
    },
    async fetchAllByStream(id: string, page: number = 1, size: number = 6) {
      this.loading = true
      this.error = null
      try {
        const response = await SubjectGroupApi().getAllBySubject(id, page, size) as any
        return response.data
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch subject groups by stream'
      } finally {
        this.loading = false
      }
    },
    create(payload: CreateSubjectGroupDto) {
      return SubjectGroupApi().create(payload)
    }
  }
})
