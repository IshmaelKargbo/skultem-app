// Fees Reporting - the school's own fee dashboard/term-summary/student-balances/outstanding/
// daily-collection/payment-history/payment-methods reports. Every endpoint here excludes the
// Skultem platform fee (see backend FeeReportController) - it's reported separately under
// /fee/platform/* (usePlatformFeeStore), the same split the Student Ledger already keeps.
export const FeeReportApi = () => {
  const { $api } = useNuxtApp()

  const params = (obj: Record<string, string | number | boolean | undefined>) => {
    const query = new URLSearchParams()
    Object.entries(obj).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.set(key, String(value))
      }
    })
    const qs = query.toString()
    return qs ? `?${qs}` : ''
  }

  return {
    getDashboard: async (academicYearId?: string, termId?: string) => {
      try {
        const res = await $api(`/fee/report/dashboard${params({ academicYearId, termId })}`) as any
        if (!res) throw new Error('Failed to fetch fee dashboard summary')
        return res.data as FeeDashboardSummary
      } catch (err: any) {
        useHandleError(err)
      }
    },

    getTermSummary: async (academicYearId?: string, termId?: string, classSessionId?: string,
      feeCategoryId?: string) => {
      try {
        const res = await $api(`/fee/report/term-summary${params({ academicYearId, termId, classSessionId, feeCategoryId })}`) as any
        if (!res) throw new Error('Failed to fetch fee term summary')
        return res.data as FeeTermSummary
      } catch (err: any) {
        useHandleError(err)
      }
    },

    getStudentBalances: async (page: number, size: number, filters: StudentBalanceFilters = {}) => {
      try {
        const res = await $api(`/fee/report/student-balances${params({ page, size, ...filters })}`) as any
        if (!res) throw new Error('Failed to fetch student fee balances')
        const data = res.data as StudentFeeBalance[]
        const meta = useMeta(res.meta)
        return { data, meta }
      } catch (err: any) {
        useHandleError(err)
      }
    },

    getOutstanding: async (academicYearId?: string, termId?: string) => {
      try {
        const res = await $api(`/fee/report/outstanding${params({ academicYearId, termId })}`) as any
        if (!res) throw new Error('Failed to fetch outstanding fees report')
        return res.data as OutstandingFeesReport
      } catch (err: any) {
        useHandleError(err)
      }
    },

    getDailyCollection: async (from?: string, to?: string) => {
      try {
        const res = await $api(`/fee/report/daily-collection${params({ from, to })}`) as any
        if (!res) throw new Error('Failed to fetch daily collection report')
        return res.data as DailyCollectionReport
      } catch (err: any) {
        useHandleError(err)
      }
    },

    getPaymentHistory: async (page: number, size: number, filters: PaymentHistoryFilters = {}) => {
      try {
        const res = await $api(`/fee/report/payment-history${params({ page, size, ...filters })}`) as any
        if (!res) throw new Error('Failed to fetch payment history')
        const data = res.data as FeePaymentRow[]
        const meta = useMeta(res.meta)
        return { data, meta }
      } catch (err: any) {
        useHandleError(err)
      }
    },

    getPaymentMethods: async (academicYearId?: string, termId?: string, from?: string, to?: string) => {
      try {
        const res = await $api(`/fee/report/payment-methods${params({ academicYearId, termId, from, to })}`) as any
        if (!res) throw new Error('Failed to fetch payment method summary')
        return res.data as PaymentMethodSummary
      } catch (err: any) {
        useHandleError(err)
      }
    },
  }
}
