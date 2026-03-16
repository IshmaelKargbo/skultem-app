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

  const download = async (path: string, params: Record<string, string | undefined>) => {
    const accessToken = useCookie("access_token")
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

  return {
    exportLedger: (format: string, filters?: { classId?: string; startDate?: string; endDate?: string }) =>
      download('/report/export/ledger', { format, ...filters }),
    exportPayments: (format: string, filters?: { classId?: string; startDate?: string; endDate?: string }) =>
      download('/report/export/payments', { format, ...filters }),
    exportAttendance: (classSessionId: string, format: string, filters?: { startDate?: string; endDate?: string }) =>
      download('/report/export/attendance', { classSessionId, format, ...filters }),
    exportBehaviour: (classId: string | undefined, format: string, filters?: { startDate?: string; endDate?: string }) =>
      download('/report/export/behaviour', { classId, format, ...filters }),
    exportStudents: (format: string, filters?: { classId?: string; startDate?: string; endDate?: string }) =>
      download('/report/export/students', { format, ...filters }),
    exportFees: (format: string, filters?: { classId?: string; startDate?: string; endDate?: string }) =>
      download('/report/export/fees', { format, ...filters }),
    exportGrades: (teacherSubjectId: string, termId: string, format: string) =>
      download('/report/export/grades', { teacherSubjectId, termId, format }),
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
