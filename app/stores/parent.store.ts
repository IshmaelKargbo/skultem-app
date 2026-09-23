import { defineStore } from 'pinia'

export const useParentStore = defineStore('parent', {
  state: () => ({
    records: [] as Parent[],
    students: [] as Student[],
    meta: {} as Meta,
    loading: true,
    error: null as string | null
  }),

  actions: {
    async fetchAll(page: number = 1, size: number = runtimeConf().limit, query?: string, sortBy?: string, direction?: string) {
      this.loading = true
      this.error = null
      try {
        const response = await ParentApi().getAll(page, size, query, sortBy, direction) as any
        this.records = response.data || []
        this.meta = response.meta || {} as Meta
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch parents'
      } finally {
        this.loading = false
      }
    },
    async fetchAllStudents(page: number = 1, size: number = runtimeConf().limit) {
      this.loading = true
      this.error = null
      try {
        const response = await ParentApi().getAllStudent(page, size) as any
        this.students = response.data || []
        this.meta = response.meta || {} as Meta
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch parent students'
      } finally {
        this.loading = false
      }
    },
    create(payload: CreateParentDto) {
      return ParentApi().create(payload)
    },
    async addEmail(id: string, email: string) {
      const res = await ParentApi().addEmail(id, email) as any
      const updated = res?.data
      if (updated) {
        const index = this.records.findIndex(e => e.id === id)
        if (index !== -1) this.records[index] = updated
      }
      return res
    }
  },
  getters: {
    list(state): { label: string, value: string }[] {
      return state.students.map(e => ({ label: `${e.givenNames} ${e.familyName} (${e.className})`, value: e.sessionId }))
    },
  }
})
