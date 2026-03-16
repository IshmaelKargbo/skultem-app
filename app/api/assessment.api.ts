export const AssessmentApi = () => {
  const { $api } = useNuxtApp()

  return {
    getAll: async (page: number = 1, size: number = 10) => {
      try {
        const res = await $api(`/assessment/template?page=${page}&size=${size}`) as any

        if (!res)
          throw new Error('Failed to fetch assessment templates')

        const data = res.data
        const meta = useMeta(res.meta)
        return { data, meta }

      } catch (err: any) {
        useHandleError(err)
      }
    },
    getAllStudentAssessment: async (teacherSubjectId: string, termId: string) => {
      try {
        const res = await $api(`/assessment/student?teacherSubjectId=${teacherSubjectId}&termId=${termId}`) as any

        if (!res)
          throw new Error('Failed to fetch student assessments')

        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },
    getAllAssessmentApprovalRequest: async (teacherId: string) => {
      try {
        const res = await $api(`/assessment/approval/${teacherId}`) as any

        if (!res)
          throw new Error('Failed to fetch assessment approval requests')

        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },
    getAllAssessment: async (subjectId: string, termId: string) => {
      try {
        const res = await $api(`/assessment/template/${subjectId}?termId=${termId}`) as any

        if (!res)
          throw new Error('Failed to fetch template assessments')
  
        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },
    getAssessments: async () => {
      try {
        const res = await $api('/assessment/list') as any

        if (!res)
          throw new Error('Failed to fetch assessments list')
  
        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },
    getActiveCycle: async (classId?: string) => {
      try {
        const query = classId ? `?classId=${encodeURIComponent(classId)}` : ''
        const res = await $api(`/assessment/cycle/active${query}`) as any

        if (!res)
          throw new Error('Failed to fetch active assessment cycle')

        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },
    getCycleOverview: async () => {
      try {
        const res = await $api('/assessment/cycle/overview') as any

        if (!res)
          throw new Error('Failed to fetch assessment cycle overview')

        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },
    advanceCycle: async (termId: string) => {
      try {
        const res = await $api(`/assessment/cycle/${termId}/advance`, {
          method: 'POST'
        }) as any

        if (!res)
          throw new Error('Failed to advance assessment cycle')

        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },
    getGradingScale: async () => {
      try {
        const res = await $api('/assessment/grading-scale') as any

        if (!res)
          throw new Error('Failed to fetch grading scale')

        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },
    updateGradingScale: async (payload: UpdateGradingScaleDto) => {
      try {
        const res = await $api('/assessment/grading-scale', {
          method: 'POST',
          body: payload
        }) as any

        if (!res)
          throw new Error('Failed to update grading scale')

        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },
    create: async (payload: CreateAssessmentTemplateDto) => {
      try {
        return await $api('/assessment/template', {
          method: 'POST',
          body: payload
        })
      } catch (err: any) {
        useHandleError(err)
      }
    },
    assign: async (templateId: string, payload: AssignAssessmentsDto) => {
      try {
        return await $api(`/assessment/template/${templateId}/assignment`, {
          method: 'POST',
          body: payload
        })
      } catch (err: any) {
        useHandleError(err)
      }
    },
    grade: async (teacherSubjectId: string, payload: GradeAssessmentDto) => {
      try {
        return await $api(`/assessment/grade/${teacherSubjectId}`, {
          method: 'POST',
          body: payload
        })
      } catch (err: any) {
        useHandleError(err)
      }
    },
    submit: async (teacherSubjectId: string, payload: SubmitAssessmentDto) => {
      try {
        return await $api(`/assessment/submit/${teacherSubjectId}`, {
          method: 'POST',
          body: payload
        })
      } catch (err: any) {
        useHandleError(err)
      }
    },
    approveRequest: async (approvalRequestId: string, note: string) => {
      try {
        return await $api(`/assessment/approval/${approvalRequestId}/approve`, {
          method: 'POST',
          body: { note }
        })
      } catch (err: any) {
        useHandleError(err)
      }
    },
    returnRequest: async (approvalRequestId: string, note: string) => {
      try {
        return await $api(`/assessment/approval/${approvalRequestId}/return`, {
          method: 'POST',
          body: { note }
        })
      } catch (err: any) {
        useHandleError(err)
      }
    }
  }
}
