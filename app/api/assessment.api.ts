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
    // School-wide - unlike getAllAssessmentApprovalRequest below (scoped to one teacher's class),
    // this is the admin approval view's default list.
    getAllSchoolAssessmentApprovalRequest: async (page: number, size: number, status?: string, search?: string, classId?: string) => {
      try {
        const query = new URLSearchParams({ page: String(page), size: String(size) })
        if (status) query.set('status', status)
        if (search) query.set('query', search)
        if (classId) query.set('classId', classId)

        const res = await $api(`/assessment/approval?${query.toString()}`) as any

        if (!res)
          throw new Error('Failed to fetch assessment approval requests')

        const data = res.data
        const meta = useMeta(res.meta)

        return { data, meta }
      } catch (err: any) {
        useHandleError(err)
      }
    },
    getSchoolAssessmentApprovalSummary: async () => {
      try {
        const res = await $api('/assessment/approval/summary') as any

        if (!res)
          throw new Error('Failed to fetch assessment approval summary')

        return res.data as AssessmentApprovalSummary
      } catch (err: any) {
        useHandleError(err)
      }
    },
    getAllAssessmentApprovalRequest: async (teacherId: string, page: number, size: number, status?: string, search?: string, classId?: string) => {
      try {
        const query = new URLSearchParams({ page: String(page), size: String(size) })
        if (status) query.set('status', status)
        if (search) query.set('query', search)
        if (classId) query.set('classId', classId)

        const res = await $api(`/assessment/approval/${teacherId}?${query.toString()}`) as any

        if (!res)
          throw new Error('Failed to fetch assessment approval requests')

        const data = res.data
        const meta = useMeta(res.meta)

        return { data, meta }
      } catch (err: any) {
        useHandleError(err)
      }
    },
    getAssessmentApprovalRequest: async (approvalRequestId: string) => {
      try {
        const res = await $api(`/assessment/approval/request/${approvalRequestId}`) as any

        if (!res)
          throw new Error('Failed to fetch assessment approval request')

        return res.data as AssessmentApprovalRequest
      } catch (err: any) {
        useHandleError(err)
      }
    },
    getAssessmentApprovalSummary: async (teacherId: string) => {
      try {
        const res = await $api(`/assessment/approval/${teacherId}/summary`) as any

        if (!res)
          throw new Error('Failed to fetch assessment approval summary')

        return res.data as AssessmentApprovalSummary
      } catch (err: any) {
        useHandleError(err)
      }
    },
    getAllMeAssessmentApprovalRequest: async (page: number, size: number, status?: string, search?: string, classId?: string) => {
      try {
        const query = new URLSearchParams({ page: String(page), size: String(size) })
        if (status) query.set('status', status)
        if (search) query.set('query', search)
        if (classId) query.set('classId', classId)

        const res = await $api(`/assessment/approval/me?${query.toString()}`) as any

        if (!res)
          throw new Error('Failed to fetch assessment approval requests')

        const data = res.data
        const meta = useMeta(res.meta)
        return { data, meta }

      } catch (err: any) {
        useHandleError(err)
      }
    },
    getMeAssessmentApprovalSummary: async () => {
      try {
        const res = await $api('/assessment/approval/me/summary') as any

        if (!res)
          throw new Error('Failed to fetch assessment approval summary')

        return res.data as AssessmentApprovalSummary
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
    getClassAssessments: async (id: string) => {
      if (!id)
        return []

      try {
        const res = await $api(`/assessment/list/${id}`) as any

        if (!res)
          throw new Error('Failed to fetch class assessments list')

        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },
    getActiveCycle: async (classId?: string, academicYearId?: string) => {
      try {
        const params = new URLSearchParams()
        if (classId) params.set('classId', classId)
        if (academicYearId) params.set('academicYearId', academicYearId)
        const query = params.toString() ? `?${params.toString()}` : ''

        const res = await $api(`/assessment/cycle/active${query}`) as any

        if (!res)
          throw new Error('Failed to fetch active assessment cycle')

        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },
    getCycleOverview: async (academicYearId?: string) => {
      try {
        const query = academicYearId ? `?academicYearId=${encodeURIComponent(academicYearId)}` : ''
        const res = await $api(`/assessment/cycle/overview${query}`) as any

        if (!res)
          throw new Error('Failed to fetch assessment cycle overview')

        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },
    // Sections run their assessments separately, so a section moves on its own (omit sectionId in a school without
    // sections).
    advanceCycle: async (termId: string, sectionId?: string | null) => {
      try {
        const query = sectionId ? `?sectionId=${encodeURIComponent(sectionId)}` : ''
        const res = await $api(`/assessment/cycle/${termId}/advance${query}`, {
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
    // The term students of classes using this template start being graded in (SSS 1 joining in the second term).
    // Earlier terms get no assessments and no fees; untouched assessments already created for them are cleared.
    setTemplateStartsInTerm: async (templateId: string, termNumber: number) => {
      try {
        await $api(`/assessment/template/${templateId}/starts-in-term`, { method: 'PUT', body: { termNumber } })
        return true
      } catch (err: any) {
        useHandleError(err)
        return false
      }
    },
    // The classes / class subjects that have assessments in a term - a class joining later has none in earlier terms.
    getTermGraded: async (termId: string) => {
      try {
        const res = await $api(`/assessment/term/${termId}/graded`) as any
        return res?.data as { classSessionIds: string[], teacherSubjectIds: string[] }
      } catch (err: any) {
        useHandleError(err)
      }
    },
    // What an edit of this template would touch: the classes using it, tests already submitted, marks entered.
    getTemplateUsage: async (templateId: string) => {
      try {
        const res = await $api(`/assessment/template/${templateId}/usage`) as any
        return res?.data as { classNames: string[], submittedTests: number, markedScores: number }
      } catch (err: any) {
        useHandleError(err)
      }
    },
    // Edits a template in place and carries the change to the classes using it. Returns the reason instead of
    // toasting, because "Confirm to change it anyway" is answered with a dialog, not an error message.
    updateTemplate: async (templateId: string, payload: {
      name?: string, passMark?: number, description?: string,
      assessments: { id?: string, name: string, weight: number, terms?: number[] }[], force?: boolean
    }) => {
      try {
        await $api(`/assessment/template/${templateId}`, { method: 'PUT', body: payload })
        return { ok: true as const, message: '' }
      } catch (err: any) {
        return { ok: false as const, message: String(err?.data?.message || err?.message || 'Failed to update the template') }
      }
    },
    // Only a template no class uses and nothing was recorded with. The message says why when it can't go.
    deleteTemplate: async (templateId: string) => {
      try {
        await $api(`/assessment/template/${templateId}`, { method: 'DELETE' })
        return true
      } catch (err: any) {
        useHandleError(err)
        return false
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
    },
    // One assessment template's scoring setup (a template nobody has set up shows what it follows now).
    getTemplateConfiguration: async (templateId: string) => {
      try {
        const res = await $api(`/assessment-configuration/templates/${templateId}`) as any

        if (!res)
          throw new Error('Failed to fetch assessment configuration')

        return res.data as AssessmentConfiguration
      } catch (err: any) {
        useHandleError(err)
      }
    },
    saveConfiguration: async (payload: SaveAssessmentConfigurationDto, templateId: string) => {
      try {
        const res = await $api(`/assessment-configuration/templates/${templateId}`, {
          method: 'PUT',
          body: payload
        }) as any

        if (!res)
          throw new Error('Failed to save assessment configuration')

        return res.data as SaveAssessmentConfigurationResponse
      } catch (err: any) {
        useHandleError(err)
      }
    },
    // Moves every still-blank assessment of the template onto the setup just saved - anything with even one
    // recorded score is left exactly as it is.
    applyConfigurationToUnstarted: async (templateId: string) => {
      try {
        const res = await $api(`/assessment-configuration/templates/${templateId}/apply-to-unstarted`, {
          method: 'POST'
        }) as any

        if (!res)
          throw new Error('Failed to apply the configuration')

        return res.data as { refreshed: number, skipped: number }
      } catch (err: any) {
        useHandleError(err)
      }
    },
    // Refreshes the CA part that comes from attendance (present or late days over the term's school days).
    syncAttendanceCa: async (teacherSubjectId: string, payload: { assessmentId: string, termId: string }) => {
      try {
        const res = await $api(`/assessment/continuous/${teacherSubjectId}/sync-attendance`, {
          method: 'POST',
          body: payload
        }) as any
        return Number(res?.data ?? 0)
      } catch (err: any) {
        useHandleError(err)
        return 0
      }
    },
    // Closes the CA step (every recording in for every student) so the formal test can be entered.
    submitContinuousCa: async (teacherSubjectId: string, payload: { assessmentId: string, termId: string }) => {
      try {
        return await $api(`/assessment/continuous/${teacherSubjectId}/submit-ca`, {
          method: 'POST',
          body: payload
        })
      } catch (err: any) {
        useHandleError(err)
      }
    },
    // Locks a completed CA recording (every student has it). Administrators can unlock it again, with a reason.
    lockContinuousWeek: async (teacherSubjectId: string, payload: { assessmentId: string, termId: string, week: number }) => {
      try {
        return await $api(`/assessment/continuous/${teacherSubjectId}/lock-week`, { method: 'POST', body: payload })
      } catch (err: any) {
        useHandleError(err)
      }
    },
    unlockContinuousWeek: async (teacherSubjectId: string, payload: { assessmentId: string, termId: string, week: number, reason: string }) => {
      try {
        return await $api(`/assessment/continuous/${teacherSubjectId}/unlock-week`, { method: 'POST', body: payload })
      } catch (err: any) {
        useHandleError(err)
      }
    },
    recordContinuous: async (teacherSubjectId: string, payload: RecordContinuousDto) => {
      try {
        return await $api(`/assessment/continuous/${teacherSubjectId}`, {
          method: 'POST',
          body: payload
        })
      } catch (err: any) {
        useHandleError(err)
      }
    },
    reopen: async (teacherSubjectId: string, payload: ReopenAssessmentDto) => {
      try {
        const res = await $api(`/assessment/reopen/${teacherSubjectId}`, {
          method: 'POST',
          body: payload
        }) as any

        if (!res)
          throw new Error('Failed to reopen assessment')

        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    }
  }
}
