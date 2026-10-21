export const AttendanceApi = () => {
  const { $api } = useNuxtApp()

  return {
    getSession: async (id: string, date: string) => {
      try {
        const res = await $api(`/attendance/session/${id}?date=${date}`) as any

        if (!res)
          throw new Error('Failed to fetch attendance session')

        const data = res.data
        const meta = res.meta
        return { data, meta }

      } catch (err: any) {
        useHandleError(err)
      }
    },
    getHistory: async (id: string, page=1, size=6) => {
      try {
        const res = await $api(`/attendance/session/report/${id}?page=${page}&size=${size}`) as any

        if (!res)
          throw new Error('Failed to fetch attendance history')

        const data = res.data
        const meta = useMeta(res.meta)
        
        return { data, meta }
      } catch (err: any) {
        useHandleError(err)
      }
    },
    create: async (id: string, payload: CreateAttendanceDto) => {
      try {
        return await $api(`/attendance/session/${id}`, {
          method: 'POST',
          body: payload
        })
      } catch (err: any) {
        useHandleError(err)
      }
    },
    getDailyRegister: async (classSessionId: string, date: string) => {
      try {
        const res = await $api(`/attendance/register/${classSessionId}?date=${date}`) as any

        if (!res)
          throw new Error('Failed to fetch daily attendance register')

        return res.data as DailyAttendanceRegister
      } catch (err: any) {
        useHandleError(err)
      }
    },
    // classSessionId, not classId - scoped to one section/stream (e.g. "SSS 1 Science"), not the
    // whole class, so a class split into streams reports on each stream separately.
    getMonthlySummary: async (classSessionId: string, year: number, month: number) => {
      try {
        const query = new URLSearchParams({ classSessionId, year: String(year), month: String(month) })

        const res = await $api(`/attendance/summary/monthly?${query.toString()}`) as any

        if (!res)
          throw new Error('Failed to fetch monthly attendance summary')

        return res.data as StudentAttendanceSummary[]
      } catch (err: any) {
        useHandleError(err)
      }
    },
    getTermSummary: async (classSessionId: string, termId: string) => {
      try {
        const query = new URLSearchParams({ classSessionId, termId })

        const res = await $api(`/attendance/summary/term?${query.toString()}`) as any

        if (!res)
          throw new Error('Failed to fetch term attendance summary')

        return res.data as TermAttendanceSummary
      } catch (err: any) {
        useHandleError(err)
      }
    },
    // termId omitted/blank means "All Terms" - the whole academic year's date range.
    getClassSummary: async (academicYearId?: string, termId?: string) => {
      try {
        const query = new URLSearchParams()
        if (academicYearId) query.set('academicYearId', academicYearId)
        if (termId) query.set('termId', termId)

        const res = await $api(`/attendance/summary/class?${query.toString()}`) as any

        if (!res)
          throw new Error('Failed to fetch class attendance summary')

        return res.data as ClassAttendanceSummary
      } catch (err: any) {
        useHandleError(err)
      }
    },
    getInspectionReport: async (params: {
      reportType: InspectionReportType
      classSessionId: string
      termId?: string
      date?: string
      year?: number
      month?: number
    }) => {
      try {
        const query = new URLSearchParams({
          reportType: params.reportType,
          classSessionId: params.classSessionId
        })
        if (params.termId) query.set('termId', params.termId)
        if (params.date) query.set('date', params.date)
        if (params.year != null) query.set('year', String(params.year))
        if (params.month != null) query.set('month', String(params.month))

        const res = await $api(`/attendance/inspection-report?${query.toString()}`) as any

        if (!res)
          throw new Error('Failed to generate inspection report')

        return res.data as InspectionReport
      } catch (err: any) {
        useHandleError(err)
      }
    },

    // Every class in the caller's scope at once - see GenerateInspectionReportUseCase#executeForAllClasses.
    getInspectionReportForAllClasses: async (params: {
      reportType: InspectionReportType
      academicYearId?: string
      termId?: string
      date?: string
      year?: number
      month?: number
    }) => {
      try {
        const query = new URLSearchParams({ reportType: params.reportType })
        if (params.academicYearId) query.set('academicYearId', params.academicYearId)
        if (params.termId) query.set('termId', params.termId)
        if (params.date) query.set('date', params.date)
        if (params.year != null) query.set('year', String(params.year))
        if (params.month != null) query.set('month', String(params.month))

        const res = await $api(`/attendance/inspection-report/all-classes?${query.toString()}`) as any

        if (!res)
          throw new Error('Failed to generate inspection report')

        return res.data as ClassInspectionReport[]
      } catch (err: any) {
        useHandleError(err)
      }
    },

    // Errors are left to the caller: the students list just goes without the column when there's no
    // active term, rather than toasting on every visit.
    getStudentTermAttendance: async (params: { academicYearId?: string, termId?: string } = {}) => {
      const query = new URLSearchParams()
      if (params.academicYearId) query.set('academicYearId', params.academicYearId)
      if (params.termId) query.set('termId', params.termId)
      const res = await $api(`/attendance/term-to-date/students?${query.toString()}`) as any
      return res?.data as StudentTermAttendance | undefined
    },

    // The class page roster - see getStudentTermAttendance.
    getClassTermAttendance: async (classId: string, params: { academicYearId?: string, termId?: string } = {}) => {
      const query = new URLSearchParams()
      if (params.academicYearId) query.set('academicYearId', params.academicYearId)
      if (params.termId) query.set('termId', params.termId)
      const res = await $api(`/attendance/term-to-date/class/${classId}?${query.toString()}`) as any
      return res?.data as StudentTermAttendance | undefined
    },

    // One student's term breakdown (profile + parent view). Errors left to the caller, like the list ones.
    getStudentTermAttendanceDetail: async (studentId: string, params: { academicYearId?: string, termId?: string } = {}) => {
      const query = new URLSearchParams()
      if (params.academicYearId) query.set('academicYearId', params.academicYearId)
      if (params.termId) query.set('termId', params.termId)
      const res = await $api(`/attendance/term-to-date/student/${studentId}?${query.toString()}`) as any
      return res?.data as StudentTermAttendanceDetail | undefined
    },

    getMarkingCompliance: async (params: { academicYearId?: string, termId?: string } = {}) => {
      try {
        const query = new URLSearchParams()
        if (params.academicYearId) query.set('academicYearId', params.academicYearId)
        if (params.termId) query.set('termId', params.termId)
        const res = await $api(`/attendance/marking-compliance?${query.toString()}`) as any
        return res.data as AttendanceMarkingCompliance
      } catch (err: any) {
        useHandleError(err)
      }
    }
  }
}
