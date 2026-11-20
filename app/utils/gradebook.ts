// The class master's grade book (backend: GetClassGradebookUseCase) - every pupil against every subject, from the
// marks subject teachers have submitted (awaiting approval or approved). Drafts stay with the subject teacher.

export type GradebookStatus = 'APPROVED' | 'SUBMITTED' | 'NOT_SUBMITTED'

export type GradebookAssessment = { id: string, name: string, position: number, weight: number | null, status: GradebookStatus }

export type GradebookSubject = {
  teacherSubjectId: string
  name: string
  // Short code ("MATH") - column headings stay narrow when a class takes 18-20 subjects.
  code?: string | null
  teacher: string | null
  assessments: GradebookAssessment[]
  submitted: number
  classAverage: number | null
}

export type GradebookResult = { total: number | null, grade: string | null, scores: Record<string, number | null> }

export type GradebookStudent = {
  studentId: string
  name: string
  admissionNumber: string | null
  photo: string | null
  subjects: Record<string, GradebookResult>
  average: number | null
  position: number | null
  passed: boolean | null
}

export type Gradebook = {
  classSessionId: string
  className: string
  termId: string
  termName: string
  passMark: number
  subjects: GradebookSubject[]
  students: GradebookStudent[]
  // The section's class - what the report-card view (the broadsheet) of the same class reads.
  classId?: string | null
  sectionId?: string | null
  streamId?: string | null
}

// A named type, with no comma in the export line: Nuxt's auto-import scanner reads `export const A: B<C, D>` as
// exporting A and D (it registered `color`, which broke Grade Entry - it has a variable by that name).
type GradebookStatusStyles = Record<GradebookStatus, { label: string, color: 'success' | 'info' | 'neutral' }>
export const GRADEBOOK_STATUS: GradebookStatusStyles = {
  APPROVED: { label: 'Approved', color: 'success' },
  SUBMITTED: { label: 'Awaiting approval', color: 'info' },
  NOT_SUBMITTED: { label: 'Not submitted', color: 'neutral' }
}

// A mark against the pass mark: red below it, green from 70. Written out in full so Tailwind generates them.
export function gradebookTone(v: number | null | undefined, passMark: number) {
  if (v == null) return { text: 'text-muted', soft: 'bg-elevated/60 text-muted' }
  if (v < passMark) return { text: 'text-error', soft: 'bg-error/10 text-error' }
  if (v >= 70) return { text: 'text-success', soft: 'bg-success/10 text-success' }
  return { text: 'text-info', soft: 'bg-info/10 text-info' }
}

export const gradebookNumber = (v: number | null | undefined) =>
  v == null ? '-' : (Math.round(v * 10) / 10).toString()

// A subject's short heading: its code, else initials of a long name ("Religious and Moral Education" -> "RME"),
// else the first four letters ("English" -> "ENGL").
export function subjectShort(s: { name: string, code?: string | null }) {
  if (s.code?.trim()) return s.code.trim().toUpperCase()
  const words = s.name.split(/\s+/).filter(w => w && !['and', 'of', '&', 'the'].includes(w.toLowerCase()))
  if (words.length > 1) return words.map(w => w[0]!.toUpperCase()).join('').slice(0, 5)
  return s.name.slice(0, 4).toUpperCase()
}

// Background for a small bar, by mark - written out in full so Tailwind generates it.
export function gradebookBar(v: number | null | undefined, passMark: number) {
  if (v == null) return 'bg-elevated'
  if (v < passMark) return 'bg-error'
  if (v >= 70) return 'bg-success'
  return 'bg-info'
}

// The report-card results (the broadsheet) in the grade book's shape, so both sources share one page and one design.
// Photos and subject codes come from the live grade book of the same class.
export function broadsheetToGradebook(sheet: Broadsheet, live: Gradebook | null): Gradebook {
  const photos = new Map((live?.students ?? []).map(s => [s.studentId, s.photo]))
  const codes = new Map((live?.subjects ?? []).map(s => [s.name, s.code ?? null]))
  const summaries = new Map(sheet.subjectSummaries.map(s => [s.subject, s]))
  return {
    classSessionId: live?.classSessionId ?? '',
    className: live?.className ?? sheet.className,
    termId: sheet.termId,
    termName: sheet.termName,
    passMark: live?.passMark ?? 50,
    classId: sheet.classId,
    sectionId: live?.sectionId ?? null,
    streamId: live?.streamId ?? null,
    subjects: sheet.subjects.map(name => ({
      teacherSubjectId: name,
      name,
      code: codes.get(name) ?? null,
      teacher: null,
      assessments: [],
      submitted: 0,
      classAverage: summaries.get(name)?.average ?? null
    })),
    students: sheet.rows.map(r => ({
      studentId: r.studentId,
      name: r.studentName,
      admissionNumber: r.admissionNumber,
      photo: photos.get(r.studentId) ?? null,
      subjects: Object.fromEntries(Object.entries(r.scores).map(([subject, c]) =>
        [subject, { total: c.score, grade: c.grade, scores: {} }])),
      average: r.average,
      position: r.position,
      passed: r.passed
    }))
  }
}
