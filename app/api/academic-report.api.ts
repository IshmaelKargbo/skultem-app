export interface AcademicReportFilters {
  classId?: string
  subjectId?: string
  academicYearId?: string
  termId?: string
  level?: string
  page?: number
  size?: number
}

export const AcademicReportApi = () => {
  const { $api } = useNuxtApp()

  const toQuery = (filters: object) => {
    const query = new URLSearchParams()
    for (const [key, value] of Object.entries(filters as Record<string, string | number | undefined>)) {
      if (value !== undefined && value !== null && value !== '') query.set(key, String(value))
    }
    return query.toString()
  }

  return {
    // classId/subjectId/level omitted = whole school. Returns the composite report (overview,
    // class comparison, subject performance, student performance) in one call.
    getReport: async (filters: AcademicReportFilters) => {
      try {
        const res = await $api(`/report/academic?${toQuery(filters)}`) as any
        return { data: res.data, meta: res.meta }
      } catch (err: any) {
        useHandleError(err)
      }
    },

    getStudentTrend: async (enrollmentId: string, termId: string) => {
      try {
        const res = await $api(`/report/academic/student/${enrollmentId}/trend?termId=${termId}`) as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },

    // Class/school-level (not per-student) trend across assessments in one term.
    getAcademicTrend: async (filters: { classId?: string, subjectId?: string, academicYearId?: string, termId?: string }) => {
      try {
        const res = await $api(`/report/academic/trend?${toQuery(filters)}`) as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },

    getCompletionReport: async (filters: AcademicReportFilters) => {
      try {
        const res = await $api(`/report/academic/completion?${toQuery(filters)}`) as any
        return { data: res.data, meta: res.meta }
      } catch (err: any) {
        useHandleError(err)
      }
    },

    getStudentsRequiringAttention: async (filters: { classId?: string, academicYearId?: string, termId?: string, level?: string, page?: number, size?: number }) => {
      try {
        const res = await $api(`/report/academic/attention?${toQuery(filters)}`) as any
        return { data: res.data, meta: res.meta }
      } catch (err: any) {
        useHandleError(err)
      }
    },

    // CA + formal test progress and the students the classwork already says need a look (termId required).
    getContinuousAssessmentReport: async (filters: { termId?: string, classId?: string, level?: string, page?: number, size?: number }) => {
      try {
        const res = await $api(`/report/academic/continuous?${toQuery(filters)}`) as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },

    getWeeklyGenderAttendance: async (classId: string, filters: { academicYearId?: string, weekOf?: string }) => {
      try {
        const res = await $api(`/report/academic/class/${classId}/attendance/weekly-gender?${toQuery(filters)}`) as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },

    getDemographics: async (filters: { academicYearId?: string, classId?: string, level?: string }) => {
      try {
        const res = await $api(`/report/academic/demographics?${toQuery(filters)}`) as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    }
  }
}
