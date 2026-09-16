import { defineStore } from 'pinia'

export const useAttendanceStore = defineStore('attendance', {
  state: () => ({
    records: [] as AttendanceHistory[],
    meta: {} as Meta,
    loading: false,
    report: {} as AttendanceReport,
    error: null as string | null,

    dailyRegister: null as DailyAttendanceRegister | null,
    loadingDailyRegister: false,

    monthlySummary: [] as StudentAttendanceSummary[],
    loadingMonthlySummary: false,

    termSummary: null as TermAttendanceSummary | null,
    loadingTermSummary: false,

    inspectionReport: null as InspectionReport | null,
    loadingInspectionReport: false,

    classSummary: null as ClassAttendanceSummary | null,
    loadingClassSummary: false
  }),

  actions: {
    async fetchAll(id: string, page: number = 1, size: number = 6) {
      this.loading = true
      this.error = null
      try {
        const response = await AttendanceApi().getHistory(id) as any
        this.records = response.data || []
        this.meta = response.meta || {} as Meta
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch attendance historis'
      } finally {
        this.loading = false
      }
    },
    create(id: string, payload: CreateAttendanceDto) {
      return AttendanceApi().create(id, payload)
    },
    updateReport(param: AttendanceReport) {
      const rate = (param.present + param.late) / param.marked * 100
      const holiday = this.report.holiday
      this.report = { ...param, rate, holiday }
    },
    cleanUp() {
      this.report = {
        absent: 0,
        excused: 0,
        holiday: false,
        late: 0,
        marked: 0,
        present: 0,
        rate: 0
      }
      this.records = [];
      this.meta = {
        page: 0,
        showingFrom: 0,
        showingTo: 0,
        size: 0,
        total: 0,
        totalPages: 0
      };
    },
    async getSession(id: string, date: string) {
      const { data } = await AttendanceApi().getSession(id, date) as any
      const rate = (data.presentCount + data.lateCount) / data.markedCount * 100

      this.report = {
        absent: data.absentCount,
        present: data.presentCount,
        excused: data.excusedCount,
        late: data.lateCount,
        holiday: data.holiday,
        marked: data.markedCount,
        rate: rate || 0
      }
      
      return data.records
    },
    async fetchDailyRegister(classSessionId: string, date: string) {
      this.loadingDailyRegister = true
      try {
        this.dailyRegister = await AttendanceApi().getDailyRegister(classSessionId, date) ?? null
      } finally {
        this.loadingDailyRegister = false
      }
    },
    async fetchMonthlySummary(classSessionId: string, year: number, month: number) {
      this.loadingMonthlySummary = true
      try {
        this.monthlySummary = await AttendanceApi().getMonthlySummary(classSessionId, year, month) ?? []
      } finally {
        this.loadingMonthlySummary = false
      }
    },
    async fetchTermSummary(classSessionId: string, termId: string) {
      this.loadingTermSummary = true
      try {
        this.termSummary = await AttendanceApi().getTermSummary(classSessionId, termId) ?? null
      } finally {
        this.loadingTermSummary = false
      }
    },
    async fetchInspectionReport(params: {
      reportType: InspectionReportType
      classSessionId: string
      termId?: string
      date?: string
      year?: number
      month?: number
    }) {
      this.loadingInspectionReport = true
      try {
        this.inspectionReport = await AttendanceApi().getInspectionReport(params) ?? null
      } finally {
        this.loadingInspectionReport = false
      }
    },
    async fetchClassSummary(academicYearId?: string, termId?: string) {
      this.loadingClassSummary = true
      try {
        this.classSummary = await AttendanceApi().getClassSummary(academicYearId, termId) ?? null
      } finally {
        this.loadingClassSummary = false
      }
    }
  }
})
