export const TeacherAttendanceApi = () => {
  const { $api } = useNuxtApp()

  return {
    mark: async (date: string, records: { teacherId: string, status: string, note?: string }[]) => {
      try {
        return await $api('/teacher-attendance/mark', { method: 'POST', body: { date, records } })
      } catch (err: any) {
        useHandleError(err)
      }
    },

    roster: async (date: string) => {
      try {
        const res = await $api(`/teacher-attendance/roster?date=${date}`) as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },

    history: async (page: number, size: number) => {
      try {
        const res = await $api(`/teacher-attendance/history?page=${page}&size=${size}`) as any
        const meta = useMeta(res.meta)
        return { ...res, meta }
      } catch (err: any) {
        useHandleError(err)
      }
    },

    historyDetail: async (date: string) => {
      try {
        const res = await $api(`/teacher-attendance/history/${date}`) as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },

    // One teacher's own attendance within a range - powers the calendar on their profile page.
    byTeacher: async (teacherId: string, from: string, to: string) => {
      try {
        const res = await $api(`/teacher-attendance/teacher/${teacherId}?from=${from}&to=${to}`) as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },

    // Self-service version of byTeacher - the signed-in teacher's own history, for their clock-in page.
    myHistory: async (from: string, to: string) => {
      try {
        const res = await $api(`/teacher-attendance/me/history?from=${from}&to=${to}`) as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },

    // Admin clocking a teacher in/out on their behalf - for staff who can't reliably self-service
    // (internet/GPS issues, or no portal access at all). No location required.
    adminClockIn: async (teacherId: string) => {
      try {
        const res = await $api(`/teacher-attendance/${teacherId}/admin-clock-in`, { method: 'POST' }) as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },

    adminClockOut: async (teacherId: string) => {
      try {
        const res = await $api(`/teacher-attendance/${teacherId}/admin-clock-out`, { method: 'POST' }) as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },

    // Undoes today's most recent clock event (clock-out if there is one, otherwise clock-in) -
    // for correcting a mistaken clock.
    adminUnclock: async (teacherId: string) => {
      try {
        await $api(`/teacher-attendance/${teacherId}/admin-unclock`, { method: 'POST' })
      } catch (err: any) {
        useHandleError(err)
      }
    },

    // Self-service - the geofenced clock-in/out.
    clockIn: async (latitude: number, longitude: number, accuracy?: number) => {
      try {
        const res = await $api('/teacher-attendance/clock-in', { method: 'POST', body: { latitude, longitude, accuracy } }) as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },

    clockOut: async (latitude: number, longitude: number, accuracy?: number) => {
      try {
        const res = await $api('/teacher-attendance/clock-out', { method: 'POST', body: { latitude, longitude, accuracy } }) as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },

    myToday: async () => {
      try {
        const res = await $api('/teacher-attendance/me/today') as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },

    getMonthlySummary: async (year: number, month: number) => {
      try {
        const res = await $api(`/teacher-attendance/summary/monthly?year=${year}&month=${month}`) as any
        return res.data as TeacherAttendanceSummaryRow[]
      } catch (err: any) {
        useHandleError(err)
      }
    },

    getTermSummary: async (termId: string) => {
      try {
        const res = await $api(`/teacher-attendance/summary/term?termId=${termId}`) as any
        return res.data as TermTeacherAttendanceSummary
      } catch (err: any) {
        useHandleError(err)
      }
    },

    getManagementReport: async (params: {
      reportType: TeacherManagementReportType
      termId?: string
      date?: string
      year?: number
      month?: number
    }) => {
      try {
        const query = new URLSearchParams({ reportType: params.reportType })
        if (params.termId) query.set('termId', params.termId)
        if (params.date) query.set('date', params.date)
        if (params.year != null) query.set('year', String(params.year))
        if (params.month != null) query.set('month', String(params.month))

        const res = await $api(`/teacher-attendance/management-report?${query.toString()}`) as any
        return res.data as TeacherManagementReport
      } catch (err: any) {
        useHandleError(err)
      }
    },

    getLocationSettings: async () => {
      try {
        const res = await $api('/attendance-location') as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },

    saveLocationSettings: async (payload: { latitude: number, longitude: number, radiusMeters: number, allowedIps?: string }) => {
      try {
        const res = await $api('/attendance-location', { method: 'PUT', body: payload }) as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    }
  }
}
