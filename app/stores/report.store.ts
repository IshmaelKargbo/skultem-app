import { defineStore } from 'pinia'

export const useReportStore = defineStore('report', {
  state: () => ({
    students: [] as Student[],
    teachers: [] as Teacher[],
    classes: [] as ClassSession[],
    subjects: [] as TeacherSubject[],
    loading: false,
    entity: "",
    meta: null as Meta | null,
    error: null as string | null,
    run: false
  }),
  actions: {
    async runReport(query: ReportSelectFilterPayload, page: number = 1, size: number = 6) {
      this.loading = true
      this.error = null
      try {
        const response = await ReportApi().runReport(query, page, size)
        if (response == null) return
        this.meta = response.meta
        this.run = true
        this.entity = query.entity.toLowerCase()

        switch (query.entity.toLowerCase()) {
          case "students":
            this.students = response.data
          case "teachers":
            this.teachers = response.data
          case "classes":
            this.classes = response.data
          case "subjects":
            this.subjects = response.data
            break;
          default:
            break;
        }
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to run report'
      } finally {
        this.loading = false
      }
    },
    clear() {
      this.run = false
      this.teachers = []
      this.students = []
      this.classes = []
      this.meta = null
    }
  }
})
