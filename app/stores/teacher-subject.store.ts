import { defineStore } from 'pinia'

export const useTeacherSubjectStore = defineStore('teacherSubject', {
  state: () => ({
    records: [] as TeacherSubject[],
    meta: {} as Meta,
    loading: false,
    error: null as string | null
  }),

  actions: {
    async fetchAll(page: number = 1, size: number = 6) {
      this.loading = true
      this.error = null
      try {
        const response = await TeacherSubjectApi().getAll(page, size) as any
        this.records = response.data || []
        this.meta = response.meta || {} as Meta
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch teacher subjects'
      } finally {
        this.loading = false
      }
    },
    async fetchAllByClass(id: string, page: number = 1, size: number = 6) {
      this.loading = true
      this.error = null
      try {
        const response = await TeacherSubjectApi().getAllByClass(id, page, size) as any
        return response.data || []
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch class subjects by class'
      } finally {
        this.loading = false
      }
    },
    create(id: string, payload: CreateClassSubjectDto) {
      return TeacherSubjectApi().create(id, payload)
    }
  }
})
