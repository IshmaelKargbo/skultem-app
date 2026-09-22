import { defineStore } from 'pinia'

export const useFeeReportStore = defineStore('fee-report', {
  state: () => ({
    dashboard: null as FeeDashboardSummary | null,
    termSummary: null as FeeTermSummary | null,
    outstanding: null as OutstandingFeesReport | null,
    dailyCollection: null as DailyCollectionReport | null,
    paymentMethods: null as PaymentMethodSummary | null,

    studentBalances: [] as StudentFeeBalance[],
    studentBalancesMeta: {} as Meta,

    paymentHistory: [] as FeePaymentRow[],
    paymentHistoryMeta: {} as Meta,

    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchDashboard(academicYearId?: string, termId?: string) {
      this.loading = true
      this.error = null
      try {
        this.dashboard = await FeeReportApi().getDashboard(academicYearId, termId) || null
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch fee dashboard'
      } finally {
        this.loading = false
      }
    },

    async fetchTermSummary(academicYearId?: string, termId?: string, classSessionId?: string,
      feeCategoryId?: string) {
      this.loading = true
      this.error = null
      try {
        this.termSummary = await FeeReportApi().getTermSummary(academicYearId, termId, classSessionId,
          feeCategoryId) || null
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch fee term summary'
      } finally {
        this.loading = false
      }
    },

    async fetchStudentBalances(page: number, size: number, filters: StudentBalanceFilters = {}) {
      this.loading = true
      this.error = null
      try {
        const res = await FeeReportApi().getStudentBalances(page, size, filters)
        this.studentBalances = res?.data || []
        this.studentBalancesMeta = res?.meta || {} as Meta
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch student fee balances'
      } finally {
        this.loading = false
      }
    },

    async fetchOutstanding(academicYearId?: string, termId?: string) {
      this.loading = true
      this.error = null
      try {
        this.outstanding = await FeeReportApi().getOutstanding(academicYearId, termId) || null
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch outstanding fees report'
      } finally {
        this.loading = false
      }
    },

    async fetchDailyCollection(from?: string, to?: string) {
      this.loading = true
      this.error = null
      try {
        this.dailyCollection = await FeeReportApi().getDailyCollection(from, to) || null
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch daily collection report'
      } finally {
        this.loading = false
      }
    },

    async fetchPaymentHistory(page: number, size: number, filters: PaymentHistoryFilters = {}) {
      this.loading = true
      this.error = null
      try {
        const res = await FeeReportApi().getPaymentHistory(page, size, filters)
        this.paymentHistory = res?.data || []
        this.paymentHistoryMeta = res?.meta || {} as Meta
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch payment history'
      } finally {
        this.loading = false
      }
    },

    async fetchPaymentMethods(academicYearId?: string, termId?: string, from?: string, to?: string) {
      this.loading = true
      this.error = null
      try {
        this.paymentMethods = await FeeReportApi().getPaymentMethods(academicYearId, termId, from, to) || null
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch payment method summary'
      } finally {
        this.loading = false
      }
    },
  },
})
