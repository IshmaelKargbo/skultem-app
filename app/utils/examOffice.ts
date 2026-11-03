// Exam Office: the exam timetable, the submission tracker and class broadsheets (backend ExamOfficeController).

export type ExamSchedule = {
    id: string
    termId: string
    termName: string
    classId: string
    className: string
    level: string
    subjectId: string
    subjectName: string
    paper: string | null
    examDate: string
    // "HH:mm:ss" from the API
    startTime: string
    endTime: string
    venue: string | null
    invigilatorId: string | null
    invigilatorName: string | null
    notes: string | null
}

export type SaveExamScheduleDto = {
    termId: string
    classId: string
    subjectId: string
    paper?: string
    examDate: string
    startTime: string
    endTime: string
    venue?: string
    invigilatorId?: string
    notes?: string
}

export type ExamSubmissionStatus = 'DRAFT' | 'SUBMITTED' | 'RETURNED' | 'APPROVED' | 'COMPLETED'

export type ExamSubmission = {
    cycleId: string
    classSessionId: string
    classId: string
    className: string
    level: string
    subjectName: string
    assessmentName: string
    assessmentPosition: number
    teacherId: string | null
    teacherName: string | null
    status: ExamSubmissionStatus
    updatedAt: string | null
}

export type ExamSubmissions = {
    termId: string
    termName: string
    rows: ExamSubmission[]
}

export type BroadsheetCell = { score: number | null, grade: string | null }

export type BroadsheetRow = {
    studentId: string
    reportCardId: string
    studentName: string
    admissionNumber: string
    scores: Record<string, BroadsheetCell>
    average: number
    position: number
    overallGrade: string
    passed: boolean
}

export type BroadsheetSubjectSummary = {
    subject: string
    sat: number
    average: number
    highest: number | null
    lowest: number | null
    passed: number
}

export type Broadsheet = {
    classId: string
    className: string
    termId: string
    termName: string
    subjects: string[]
    rows: BroadsheetRow[]
    subjectSummaries: BroadsheetSubjectSummary[]
    studentCount: number
    passed: number
    classAverage: number
    lastGeneratedAt: string | null
}

// What the exam office still needs to chase, in the order it acts on them.
export const SUBMISSION_STATUS: Record<ExamSubmissionStatus, { label: string, color: 'neutral' | 'info' | 'warning' | 'success' | 'error', hint: string }> = {
    DRAFT: { label: 'Not submitted', color: 'warning', hint: 'The teacher is still entering scores' },
    RETURNED: { label: 'Returned', color: 'error', hint: 'Sent back to the teacher for corrections' },
    SUBMITTED: { label: 'Awaiting approval', color: 'info', hint: 'Submitted and waiting for the approver' },
    APPROVED: { label: 'Approved', color: 'success', hint: 'Approved and released' },
    COMPLETED: { label: 'Completed', color: 'success', hint: 'Closed when the cycle moved on' },
}

// "09:00:00" -> "09:00"
export function examTime(value?: string | null) {
    return value ? value.slice(0, 5) : ''
}

