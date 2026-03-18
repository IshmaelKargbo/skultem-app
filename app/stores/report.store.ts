import { defineStore } from 'pinia'

export const useReportStore = defineStore('report', {
  state: () => ({
    saves: [] as SavedReport[],
    students: [] as Student[],
    teachers: [] as Teacher[],
    fees: [] as Fee[],
    payments: [] as Payment[],
    attendances: [] as Attendance[],
    grades: [] as Grade[],
    classes: [] as ClassSession[],
    subjects: [] as TeacherSubject[],
    report: null as ReportSelectFilterPayload | null,
    loading: true,
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
        this.report = query
        this.entity = query.entity.toLowerCase()

        switch (query.entity.toLowerCase()) {
          case "students":
            this.students = response.data
            break
          case "teachers":
            this.teachers = response.data
            break
          case "classes":
            this.classes = response.data
            break
          case "subjects":
            this.subjects = response.data
            break
          case "attendances":
            this.attendances = response.data
            break
          case "fees":
            this.fees = response.data
            break
          case "payments":
            this.payments = response.data
            break
          case "grades":
            this.grades = response.data
            break
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
      this.report = null
      this.meta = null
    },
    async fetchAll(page: number = 1, size: number = 6) {
      this.loading = true
      this.error = null
      try {
        const response = await ReportApi().listReports(page, size)
        if (response == null) return
        this.meta = response.meta
        this.saves = response.data
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch save report'
      } finally {
        this.loading = false
      }
    },
    async save(param: CreateSavedReport) {
      try {
        const res: any = await ReportApi().saveReport(param)
        if (res == null) return
        return res.data
      } catch (err: any) {
        this.error = err.message || 'Failed to save report'
        throw this.error
      }
    },
    async get(id: string) {
      try {
        const res = await ReportApi().getReport(id)
        this.report = res
        return res
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to get report'
      }
    }
  }
})
