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
    async allByClass(id: string) {
      this.loading = true
      this.error = null
      try {
        const response = await TeacherSubjectApi().getAllByClass(id, 0, 0) as any
        this.records = response.data || []
        this.meta = response.meta || {} as Meta
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch class subjects by class'
      } finally {
        this.loading = false
      }
    },
    async fetchAllByTeacher(page: number = 1, size: number = 6) {
      this.loading = true
      this.error = null
      try {
        const response = await TeacherSubjectApi().getAllByTeacher(page, size) as any        
        return response || []
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch teacher subjects'
      } finally {
        this.loading = false
      }
    },
    async allByTeacher() {
      this.loading = true
      this.error = null
      try {
        const res = await TeacherSubjectApi().getAllByTeacher(0, 0) as any 
        this.records = res;
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch teacher subjects'
      } finally {
        this.loading = false
      }
    },
    create(id: string, payload: CreateTeacherSubjectDto) {
      return TeacherSubjectApi().create(id, payload)
    }
  },
  getters: {
    list(state): { label: string, value: string }[] {
      return state.records.map(e => ({ label: `${e.subjectName} (${e.teacherName})`, value: e.id }))
    },
    classes: (state) => {
      const seen = new Set<string>()

      return state.records.filter(record => {
        if (seen.has(record.className)) {
          return false
        }

        seen.add(record.className)
        return true
      }).map(e => ({ label: e.className, value: e.sessionId }))
    },
    getClass: (state) => {
      return (id: string): TeacherSubject | undefined => {
        return state.records.find(e => e.sessionId === id)
      }
    }
  }
})
