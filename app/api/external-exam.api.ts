// External exams (NPSE, BECE, WASSCE, ...): /external-exams. Errors go through useHandleError, which throws an Error
// with the backend's message, so pages can show it as it is.
export type ExamGrade = { minScore: number, maxScore: number, grade: string, points: number, remark: string }

export type ExternalExam = {
  id: string, code: string, name: string, examBody: string | null, level: string | null,
  gradeScale: ExamGrade[], aggregateMode: 'POINTS' | 'TOTAL', bestOf: number, builtIn: boolean,
  // The exam's own print designs; null = the school's general exam design.
  slipTemplate: string | null, statementTemplate: string | null,
  // SCORES: a score per subject (NPSE). GRADES: the grade the exam body released (BECE 1-7, WASSCE A1-F9).
  entryMode: 'SCORES' | 'GRADES'
}

export type SaveExternalExam = Omit<ExternalExam, 'id' | 'builtIn' | 'slipTemplate' | 'statementTemplate'>

export type ExamSubjectOption = { id: string, name: string }

export type ExamSittingSummary = {
  id: string, examId: string, examCode: string, examName: string, classId: string, className: string,
  academicYearId: string, academicYearName: string, centreNumber: string | null, status: 'DRAFT' | 'CONFIRMED',
  candidates: number, withIndexNumber: number, scoresEntered: number, scoresExpected: number,
  confirmedAt: string | null, confirmedByName: string | null
}

export type ExamSubjectResult = {
  subjectId: string, subject: string, score: number | null, grade: string, points: number | null, remark: string
}

export type ExamCandidate = {
  id: string, studentId: string, studentName: string, admissionNumber: string | null, indexNumber: string | null,
  scores: Record<string, number>, grades: Record<string, string>, results: ExamSubjectResult[], subjectsSat: number,
  aggregate: number | null
}

export type ExamSitting = {
  summary: ExamSittingSummary, exam: ExternalExam, subjects: ExamSubjectOption[], aggregateLabel: string,
  candidates: ExamCandidate[]
}

export type ExamDocumentType = 'slip' | 'statement'

export const ExternalExamApi = () => {
  const { $api } = useNuxtApp()
  const base = '/external-exams'

  async function call<T>(path: string, options: Record<string, any> = {}): Promise<T> {
    try {
      const res = await $api(`${base}${path}`, options) as any
      return res?.data as T
    } catch (err: any) {
      useHandleError(err)
      throw err
    }
  }

  // A document as a PDF blob (to show in the page, print or save). Throws with the server's message.
  async function document(path: string): Promise<{ blob: Blob, filename: string }> {
    const { accessToken } = useAuthCookies()
    const res = await fetchOrExplain(`${apiBaseUrl()}${base}${path}`, {
      headers: accessToken.value ? { Authorization: `Bearer ${accessToken.value}` } : {}
    })
    if (!res.ok) throw await downloadError(res, 'Failed to make the document')
    const disposition = res.headers.get('content-disposition') || ''
    const filename = disposition.includes('filename=')
      ? disposition.split('filename=')[1]!.replace(/"/g, '').trim()
      : 'exam-result.pdf'
    return { blob: await res.blob(), filename }
  }

  return {
    exams: () => call<ExternalExam[]>('/exams'),
    createExam: (body: SaveExternalExam) => call<ExternalExam>('/exams', { method: 'POST', body }),
    updateExam: (id: string, body: SaveExternalExam) => call<ExternalExam>(`/exams/${id}`, { method: 'PUT', body }),
    deleteExam: (id: string) => call<void>(`/exams/${id}`, { method: 'DELETE' }),

    classSubjects: (classId: string) =>
      call<ExamSubjectOption[]>(`/class-subjects?classId=${encodeURIComponent(classId)}`),

    sittings: () => call<ExamSittingSummary[]>('/sittings'),
    createSitting: (body: { examId: string, classId: string, academicYearId?: string, centreNumber?: string, subjectIds: string[] }) =>
      call<ExamSitting>('/sittings', { method: 'POST', body }),
    sitting: (id: string) => call<ExamSitting>(`/sittings/${id}`),
    updateSitting: (id: string, body: { centreNumber?: string | null, subjectIds: string[] }) =>
      call<ExamSitting>(`/sittings/${id}`, { method: 'PUT', body }),
    deleteSitting: (id: string) => call<void>(`/sittings/${id}`, { method: 'DELETE' }),
    refreshCandidates: (id: string) => call<ExamSitting>(`/sittings/${id}/candidates/refresh`, { method: 'POST' }),
    removeCandidate: (id: string, candidateId: string) =>
      call<ExamSitting>(`/sittings/${id}/candidates/${candidateId}`, { method: 'DELETE' }),
    // scores for an exam entered as scores, grades for one entered as grades ('' = not sat).
    saveScores: (id: string, candidates: { candidateId: string, indexNumber: string | null, scores?: Record<string, number | null>, grades?: Record<string, string> }[]) =>
      call<ExamSitting>(`/sittings/${id}/scores`, { method: 'PUT', body: { candidates } }),
    confirm: (id: string) => call<ExamSitting>(`/sittings/${id}/confirm`, { method: 'POST' }),
    reopen: (id: string) => call<ExamSitting>(`/sittings/${id}/reopen`, { method: 'POST' }),

    // One candidate's slip or statement, or every candidate's in one PDF.
    candidateDocument: (id: string, candidateId: string, type: ExamDocumentType) =>
      document(`/sittings/${id}/candidates/${candidateId}/document?type=${type}&inline=true`),
    allDocuments: (id: string, type: ExamDocumentType) => document(`/sittings/${id}/document?type=${type}&inline=true`)
  }
}
