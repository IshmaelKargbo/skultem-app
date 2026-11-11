export const ReportCardApi = () => {
  const { $api } = useNuxtApp()

  return {
    assessments: async (classId: string): Promise<ReportCardAssessmentOption[]> => {
      try {
        const res = await $api(`/report-card/assessments?classId=${classId}`) as any
        return res.data || []
      } catch (err: any) {
        useHandleError(err)
        return []
      }
    },

    generate: async (payload: GenerateReportCardPayload) => {
      try {
        const res = await $api('/report-card/generate', {
          method: 'POST',
          body: payload
        }) as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },

    byStudent: async (studentId: string) => {
      try {
        const res = await $api(`/report-card/student/${studentId}`) as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },

    fetchAll: async (page: number, size: number, filters?: ReportCardFilters) => {
      try {
        const query = new URLSearchParams({ page: String(page), size: String(size) })
        if (filters?.classId) query.set('classId', filters.classId)
        if (filters?.termId) query.set('termId', filters.termId)
        if (filters?.search) query.set('search', filters.search)
        if (filters?.level) query.set('level', filters.level)
        if (filters?.sectionId) query.set('sectionId', filters.sectionId)
        if (filters?.streamId) query.set('streamId', filters.streamId)

        const res = await $api(`/report-card?${query.toString()}`) as any
        const meta = useMeta(res.meta)
        return { data: res.data, meta }
      } catch (err: any) {
        useHandleError(err)
      }
    },

    stats: async () => {
      try {
        const res = await $api('/report-card/stats') as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },

    get: async (id: string) => {
      try {
        const res = await $api(`/report-card/${id}`) as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },

    updateRemark: async (id: string, remark: string) => {
      try {
        const res = await $api(`/report-card/${id}/remark`, {
          method: 'PATCH',
          body: { remark }
        }) as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },

    // The class teacher's decision on a class's cards for a term (ids = only these; empty = all of them).
    review: async (decision: 'approve' | 'return', payload: { classId: string, termId: string, ids?: string[], note?: string }) => {
      try {
        const res = await $api(`/report-card/review/${decision}`, { method: 'POST', body: payload }) as any
        return res?.data as { count: number, reviewStatus: ReportCardReviewStatus }
      } catch (err: any) {
        useHandleError(err)
      }
    },

    // PDFs made on the server by M-Compose (only when useDocumentService().reportCards is on). They throw with the
    // server's message, so the page can show it.
    downloadPdf: (id: string, studentName: string) =>
      downloadApiFile(`/report-card/${encodeURIComponent(id)}/pdf`, `report-card-${studentName}.pdf`),

    // The card's PDF to show in the page (Print), as M-Compose makes it.
    pdfBlob: (id: string, studentName: string) =>
      fetchApiFile(`/report-card/${encodeURIComponent(id)}/pdf?inline=true`, `report-card-${studentName}.pdf`),

    // The school's report card design as it prints (latest card, or placeholders); template = try another design.
    designPreview: (template?: string | null) =>
      fetchApiFile(`/report-card/preview${template ? `?template=${encodeURIComponent(template)}` : ''}`,
        'report-card-design-preview.pdf'),

    // Every card of a class for a term, in one PDF.
    downloadClassPdf: (classId: string, termId: string) =>
      downloadApiFile(`/report-card/pdf?classId=${encodeURIComponent(classId)}&termId=${encodeURIComponent(termId)}`,
        'report-cards.pdf'),

    trackDownload: async (id: string) => {
      try {
        await $api(`/report-card/${id}/download`, { method: 'POST' })
      } catch (err: any) {
        useHandleError(err)
      }
    }
  }
}
