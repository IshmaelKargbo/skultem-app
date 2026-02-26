import { defineStore } from 'pinia'

export const useSubjectStore = defineStore('subject', {
  state: () => ({
    records: [] as Subject[],
    meta: {} as Meta,
    loading: false,
    error: null as string | null
  }),

  actions: {
    async fetchAll(page: number = 1, size: number = 6) {
      this.loading = true
      this.error = null
      try {
        const response = await SubjectApi().getAll(page, size) as any
        this.records = response.data || []
        this.meta = response.meta || {} as Meta
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch subjects'
      } finally {
        this.loading = false
      }
    },
    create(payload: CreateSubjectDto) {
      return SubjectApi().create(payload)
    },
    findOne(id: string) {
      return SubjectApi().getOne(id) 
    },
    findTeacherSubjects(id: string) {
      return SubjectApi().getOne(id) 
    }
  }
})
