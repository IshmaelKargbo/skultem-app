export const ReportApi = () => {
  const { $api } = useNuxtApp()
  const config = useRuntimeConfig()
  const configuredBase = (config.public.apiBase || "http://localhost:8080").replace(/\/+$/, "")
  const baseURL = /\/api\/v\d+$/.test(configuredBase) ? configuredBase : `${configuredBase}/api/v1`

  const buildUrl = (path: string, params: Record<string, string | undefined>) => {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.set(key, value)
      }
    })
    const queryString = query.toString()
    return `${baseURL}${path}${queryString ? `?${queryString}` : ''}`
  }

  // Builds a BETWEEN/GREATER_THAN/LESS_THAN filter on `field`, whichever of startDate/endDate
  // were actually supplied - mirrors ReportExportService's dateRangeFilter() on the backend, so
  // the same "from/to" pair produces the same filter shape the generic builder-export expects.
  const dateRangeFilter = (field: string, type: string, startDate?: string, endDate?: string) => {
    if (!startDate && !endDate) return []
    if (startDate && endDate) return [{ field, operator: 'BETWEEN', type, value: startDate, valueTo: endDate }]
    return startDate
      ? [{ field, operator: 'GREATER_THAN', type, value: startDate }]
      : [{ field, operator: 'LESS_THAN', type, value: endDate }]
  }

  const download = async (path: string, params: Record<string, string | undefined>) => {
    const { accessToken } = useAuthCookies()
    const url = buildUrl(path, params)

    const res = await fetch(url, {
      headers: accessToken.value ? { Authorization: `Bearer ${accessToken.value}` } : {}
    })

    if (!res.ok) {
      throw new Error(`Failed to download report (${res.status})`)
    }

    const blob = await res.blob()
    const disposition = res.headers.get('content-disposition') || ''
    const filename = disposition.includes('filename=')
      ? disposition.split('filename=')[1].replace(/"/g, '').trim()
      : `report.${params.format || 'csv'}`

    return { blob, filename }
  }

  // Same shape as download(), but POSTs a JSON body instead of relying only on query params -
  // needed for the report-builder export, whose entity+filters payload (RunReportDTO) is too
  // structured to flatten into a query string the way the fixed-param exports above do.
  const downloadPost = async (path: string, params: Record<string, string | undefined>, body: unknown) => {
    const { accessToken } = useAuthCookies()
    const url = buildUrl(path, params)

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken.value ? { Authorization: `Bearer ${accessToken.value}` } : {})
      },
      body: JSON.stringify(body)
    })

    if (!res.ok) {
      throw new Error(`Failed to download report (${res.status})`)
    }

    const blob = await res.blob()
    const disposition = res.headers.get('content-disposition') || ''
    const filename = disposition.includes('filename=')
      ? disposition.split('filename=')[1].replace(/"/g, '').trim()
      : `report.${params.format || 'csv'}`

    return { blob, filename }
  }

  return {
    // NOTE: the backend has no /report/export/ledger route with class/date filtering support
    // (StudentLedgerEntry has no class relation to filter on), so classId is accepted here for
    // call-site compatibility but is not applied - only the paidAt date range is. Repointed at
    // the generic builder-export endpoint below instead of the dead /report/export/ledger route.
    exportLedger: (format: string, filters?: { classId?: string; startDate?: string; endDate?: string }) =>
      downloadPost('/report/export/run/download', { format }, {
        entity: 'ledger',
        filters: dateRangeFilter('paidAt', 'instant', filters?.startDate, filters?.endDate)
      }),
    exportPayments: (format: string, filters?: { classId?: string; startDate?: string; endDate?: string }) =>
      download('/report/export/payments', { format, ...filters }),
    exportAttendance: (classSessionId: string, format: string, filters?: { startDate?: string; endDate?: string }) =>
      download('/report/export/attendance', { classSessionId, format, ...filters }),
    exportBehaviour: (classId: string | undefined, format: string, filters?: { startDate?: string; endDate?: string }) =>
      download('/report/export/behaviour', { classId, format, ...filters }),
    // Repointed at the generic builder-export endpoint - /report/export/students never existed on
    // the backend (ReportExportController only has payments/attendance/behaviour/fees/grades plus
    // /run), so this was a silently-broken 404 for anyone who called it. classId/date range map to
    // the same fields the builder's own Students filters use (see report/builder/source.vue).
    exportStudents: (format: string, filters?: { classId?: string; startDate?: string; endDate?: string }) =>
      downloadPost('/report/export/run/download', { format }, {
        entity: 'students',
        filters: [
          ...(filters?.classId ? [{ field: 'clazz.id', operator: 'EQUALS', type: 'select', value: filters.classId }] : []),
          ...dateRangeFilter('createdAt', 'instant', filters?.startDate, filters?.endDate)
        ]
      }),
    exportFees: (format: string, filters?: { classId?: string; startDate?: string; endDate?: string }) =>
      download('/report/export/fees', { format, ...filters }),
    // Fees Reporting - school fees only (platform fee excluded), same filters the on-screen
    // Student Balances / Payment History reports support.
    exportStudentFeeBalances: (format: string, filters?: StudentBalanceFilters) =>
      download('/report/export/fee-balances', { format, ...filters }),
    exportFeePaymentHistory: (format: string, filters?: PaymentHistoryFilters) =>
      download('/report/export/fee-payment-history', { format, ...filters }),
    exportGrades: (teacherSubjectId: string, termId: string, format: string) =>
      download('/report/export/grades', { teacherSubjectId, termId, format }),
    exportBuilderReport: (payload: ReportSelectFilterPayload, format: 'csv' | 'pdf') =>
      downloadPost('/report/export/run/download', { format }, {
        entity: payload.entity,
        filters: payload.filters
      }),
    runReport: async (payload: ReportSelectFilterPayload, page: number = 1, size: number = 12) => {
      try {
        const res: any = await $api(`/report/export/run?page=${page}&size=${size}`, {
          method: 'POST',
          body: payload
        })
        if (res == null) return

        const meta = useMeta(res.meta)
        const data = res.data

        return { data, meta }
      } catch (err: any) {
        useHandleError(err)
      }
    },
    saveReport: async (payload: CreateSavedReport) => {
      try {
        return await $api('/report/save', {
          method: 'POST',
          body: payload
        })
      } catch (err: any) {
        useHandleError(err)
      }
    },
    listReports: async (page: number, size: number) => {
      try {
        const res = await $api(`/report/save?page=${page}&size=${size}`) as any
        if (!res)
          throw new Error('Failed to fetch save reports')
        const data = res.data
        const meta = useMeta(res.meta)
        return { data, meta }
      } catch (err: any) {
        useHandleError(err)
      }
    },
    getReport: async (id: string) => {
      try {
        const res = await $api(`/report/save/${id}`) as any
        if (!res)
          throw new Error('Failed to fetch save report')
        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },
    deleteReport: async (id: string) => {
      try {
        return await $api(`/report/save/${id}`, {
          method: 'DELETE'
        })
      } catch (err: any) {
        useHandleError(err)
      }
    }
  }
}
