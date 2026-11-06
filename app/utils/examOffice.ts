// Exam Office: exam timetables (one per assessment per term), the submission tracker and class broadsheets (backend ExamOfficeController).

export type ExamRef = { id: string, name: string }

export type ExamTimetableStatus = 'DRAFT' | 'PUBLISHED'

// One paper: a subject sat by one or more classes together, watched by one or more invigilators.
export type ExamPaper = {
    id: string
    subjectId: string
    subjectName: string
    paper: string | null
    examDate: string
    // "HH:mm:ss" from the API
    startTime: string
    endTime: string
    venue: string | null
    notes: string | null
    classes: ExamRef[]
    invigilators: ExamRef[]
}

// One assessment's exam timetable for a term (Term 1 "1st Test", Term 1 "Exam" ...).
export type ExamTimetable = {
    id: string
    termId: string
    termName: string
    termStartDate: string
    termEndDate: string
    assessmentId: string
    assessmentName: string
    templateName: string
    title: string
    startDate: string | null
    endDate: string | null
    instructions: string | null
    status: ExamTimetableStatus
    publishedAt: string | null
    publishedByName: string | null
    // The classes that sit this assessment (that you can see).
    classes: ExamRef[]
    papers: ExamPaper[]
    // Per class, subjects with no paper yet - exam office only (null for everyone else).
    missing: { classId: string, className: string, subjects: ExamRef[] }[] | null
}

// One assessment in a term, with its timetable once set up.
export type ExamTimetableSummary = {
    assessmentId: string
    assessmentName: string
    templateName: string
    position: number
    timetableId: string | null
    title: string | null
    status: ExamTimetableStatus | null
    startDate: string | null
    endDate: string | null
    paperCount: number
}

export type SaveExamTimetableDto = {
    termId?: string
    assessmentId?: string
    title: string
    startDate?: string | null
    endDate?: string | null
    instructions?: string | null
}

export type SaveExamPaperDto = {
    subjectId: string
    paper?: string
    examDate: string
    startTime: string
    endTime: string
    classIds: string[]
    invigilatorIds: string[]
    venue?: string
    notes?: string
}

// What candidates are usually told on a Sierra Leone exam timetable - a starting point the exam office can edit.
export const DEFAULT_EXAM_INSTRUCTIONS = [
    'Candidates must be seated 15 minutes before each paper starts.',
    'Come in full school uniform with your own pens, pencils, ruler and mathematical set.',
    'Mobile phones, bags and written notes are not allowed in the exam hall.',
    'Any candidate caught cheating will have that paper cancelled.',
].join('\n')

// Common paper names, for the paper field's suggestions.
export const EXAM_PAPER_NAMES = ['Paper 1', 'Paper 2', 'Paper 1 (Objectives)', 'Paper 2 (Theory)', 'Practical', 'Oral']

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


// Papers grouped by exam day, in date and time order.
export function groupPapersByDay(papers: ExamPaper[]) {
    const days = new Map<string, ExamPaper[]>()
    const sorted = [...papers].sort((a, b) => a.examDate.localeCompare(b.examDate) || a.startTime.localeCompare(b.startTime))
    for (const p of sorted) days.set(p.examDate, [...(days.get(p.examDate) ?? []), p])
    return [...days.entries()].map(([date, list], index) => ({ date, index, papers: list }))
}

export function formatExamDay(date: string) {
    return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

// Morning or afternoon sitting, as exam days are usually split.
export function sittingOf(startTime: string) {
    return startTime.slice(0, 5) < '12:00' ? 'Morning' : 'Afternoon'
}
