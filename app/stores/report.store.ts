import { defineStore } from 'pinia'

export const useReportStore = defineStore('report', {
  state: () => ({
    saves: [] as SavedReport[],
    students: [] as Student[],
    teachers: [] as Teacher[],
    fees: [] as Fee[],
    payments: [] as Payment[],
    attendances: [] as Attendance[],
    expenses: [] as Expense[],
    transactions: [] as Transaction[],
    ledger: [] as Ledger[],
    leaderboard: [] as LeaderBoard[],
    grades: [] as Grade[],
    breakdown: [] as Breakdown[],
    classes: [] as ClassSession[],
    subjects: [] as TeacherSubject[],
    report: null as ReportSelectFilterPayload | null,
    loading: false,
    entity: "",
    meta: {
      size: 0,
      page: 0,
      total: 0,
      showingFrom: 0,
      showingTo: 0,
      totalPages: 0
    } as Meta,
    error: null as string | null,
    run: false
  }),
  actions: {
    async runReport(query: ReportSelectFilterPayload, page: number = 1, size: number = 6) {
      this.loading = true
      this.run = true

      // Set before the request resolves, not after: the transaction table components watch
      // route.query.page and re-fetch using this.report as soon as it changes, so if a filter
      // change lands here at the same moment (report.store.ts's caller resets the page query to
      // 1 right after calling this), that re-fetch needs the new filters already in place -
      // reading a still-stale report from before this call would refetch the *old* filter set.
      this.report = query
      this.entity = query.entity.toLowerCase()

      this.error = null
      try {
        const response = await ReportApi().runReport(query, page, size)
        if (response == null) return
        this.meta = response.meta

        switch (query.entity.toLowerCase()) {
          case "students":
            this.students = response.data
            break
          case "teachers":
            this.teachers = response.data
            break
          case "breakdown":
            this.breakdown = response.data
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
          case "transactions":
            this.transactions = response.data
            break
          case "ledger":
            this.ledger = response.data
            break
          case "expenses":
            this.expenses = response.data
            break
          case "leaderboard":
            this.leaderboard = response.data
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
      this.meta = {
        size: 0,
        page: 0,
        total: 0,
        showingFrom: 0,
        showingTo: 0,
        totalPages: 0
      }
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
