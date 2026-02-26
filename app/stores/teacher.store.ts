import { defineStore } from 'pinia'

export const useTeacherStore = defineStore('teacher', {
  state: () => ({
    records: [] as Teacher[],
    meta: {} as Meta,
    loading: false,
    error: null as string | null
  }),

  actions: {
    async fetchAll(page: number = 1, size: number = 6) {
      this.loading = true
      this.error = null
      try {
        const response = await TeacherApi().getAll(page, size) as any
        this.records = response.data || []
        this.meta = response.meta || {} as Meta
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch teachers'
      } finally {
        this.loading = false
      }
    },
    create(payload: CreateTeacherDto) {
      return TeacherApi().create(payload)
    },
    fetchSubjects(id: string) {
      return TeacherApi().getAllSubjects(id)
    }
  }
})
