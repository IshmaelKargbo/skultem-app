import { defineStore } from 'pinia'

export const useAssessmentStore = defineStore('assessment', {
  state: () => ({
    records: [] as AssessmentTemplate[],
    assessments: [] as Assessment[],
    gradingScale: null as GradingScale | null,
    meta: {} as Meta,
    loading: false,
    error: null as string | null
  }),

  actions: {
    async fetchAll(page: number = 1, size: number = 6) {
      this.loading = true
      this.error = null
      try {
        const response = await AssessmentApi().getAll(page, size) as any
        this.records = response.data || []
        this.meta = response.meta || {} as Meta
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch assessment template'
      } finally {
        this.loading = false
      }
    },
    async fetchAllStudentAssessments(teacherId: string, termId: string) {
      this.loading = true
      this.error = null
      try {
        const response = await AssessmentApi().getAllStudentAssessment(teacherId, termId) as any
        return response
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch assessment template'
      } finally {
        this.loading = false
      }
    },
    async fetchAllAssessments(subjectId: string, termId: string) {
      this.loading = true
      this.error = null
      try {
        const response = await AssessmentApi().getAllAssessment(subjectId, termId) as any
        return response
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch template assessments'
      } finally {
        this.loading = false
      }
    },
    async fetchAssessments() {
      this.loading = true
      this.error = null
      try {
        const response = await AssessmentApi().getAssessments() as any
        this.assessments = response
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch template assessments'
      } finally {
        this.loading = false
      }
    },
    async fetchClassAssessments(id: string) {
      this.loading = true
      this.error = null
      try {
        const response = await AssessmentApi().getClassAssessments(id) as any
        this.assessments = response
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch class assessments'
      } finally {
        this.loading = false
      }
    },
    async fetchAllAssessmentApprovalRequest(teacherId: string) {
      this.loading = true
      this.error = null
      try {
        const response = await AssessmentApi().getAllAssessmentApprovalRequest(teacherId) as any
        return response || []
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch approval requests'
      } finally {
        this.loading = false
      }
    },
    async fetchActiveCycle(classId?: string) {
      this.loading = true
      this.error = null
      try {
        const response = await AssessmentApi().getActiveCycle(classId) as ActiveAssessmentCycle
        return response
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch active assessment cycle'
        throw err
      } finally {
        this.loading = false
      }
    },
    async fetchCycleOverview() {
      this.loading = true
      this.error = null
      try {
        const response = await AssessmentApi().getCycleOverview() as AssessmentCycleOverview
        return response
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch assessment cycle overview'
        throw err
      } finally {
        this.loading = false
      }
    },
    async advanceCycle(termId: string) {
      this.loading = true
      this.error = null
      try {
        const response = await AssessmentApi().advanceCycle(termId) as AssessmentCycleAdvance
        return response
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to advance assessment cycle'
        throw err
      } finally {
        this.loading = false
      }
    },
    async fetchGradingScale() {
      this.loading = true
      this.error = null
      try {
        const response = await AssessmentApi().getGradingScale() as GradingScale
        this.gradingScale = response
        return response
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch grading scale'
        throw err
      } finally {
        this.loading = false
      }
    },
    async updateGradingScale(payload: UpdateGradingScaleDto) {
      this.loading = true
      this.error = null
      try {
        const response = await AssessmentApi().updateGradingScale(payload) as GradingScale
        this.gradingScale = response
        return response
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to update grading scale'
        throw err
      } finally {
        this.loading = false
      }
    },
    create(payload: CreateAssessmentTemplateDto) {
      return AssessmentApi().create(payload)
    },
    assign(templateId: string, payload: AssignAssessmentsDto) {
      return AssessmentApi().assign(templateId, payload)
    },
    grade(teacherSubjectId: string, payload: GradeAssessmentDto) {
      return AssessmentApi().grade(teacherSubjectId, payload)
    },
    submit(teacherSubjectId: string, payload: SubmitAssessmentDto) {
      return AssessmentApi().submit(teacherSubjectId, payload)
    },
    approveRequest(approvalRequestId: string, note: string) {
      return AssessmentApi().approveRequest(approvalRequestId, note)
    },
    returnRequest(approvalRequestId: string, note: string) {
      return AssessmentApi().returnRequest(approvalRequestId, note)
    }
  }
})
