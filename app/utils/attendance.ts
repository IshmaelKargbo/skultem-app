export type AttendanceRecord = {
    studentId: string
    present: boolean
    excused: boolean
    reason: string
    late: boolean
}

export type Attendance = {
    studentId: string
    student: string
    state: string
    clazz: string
    date: string
    reason: string
}

export type AttendanceReport = {
    absent: number
    present: number
    marked: number
    rate: number
    holiday: boolean
    late: number
    excused: number
}

export type AttendanceHistory = {
    date: string
    classId: string
    className: string
    // The section / stream this day's attendance is for - blank stream when the class has none.
    sectionName: string
    streamName: string | null
    // The exact class session (SSS 1 Art) - what the page's `class` link points at.
    sessionId: string
    presentCount: number,
    totalCount: number
    createdAt: string
    updatedAt: string
}

export type CreateAttendanceDto = {
    date: string
    holiday: boolean
    records: AttendanceRecord[]
}

// Mirrors ClassSessionAttendanceRecordDTO - recordedBy/recordedAt are null for a record marked
// before that field existed, or for a not-yet-marked student placeholder.
export type DailyAttendanceRegisterRecord = {
    attendanceId: string | null
    enrollmentId: string
    studentId: string
    admissionNumber: string
    studentName: string
    gender: 'MALE' | 'FEMALE' | null
    photo: string | null
    marked: boolean
    holiday: boolean
    present: boolean
    excused: boolean
    late: boolean
    reason: string | null
    recordedBy: string | null
    recordedAt: string | null
}

// Mirrors ClassSessionAttendanceDTO.
export type DailyAttendanceRegister = {
    classSessionId: string
    date: string
    holiday: boolean
    totalStudents: number
    markedCount: number
    unmarkedCount: number
    presentCount: number
    absentCount: number
    excusedCount: number
    lateCount: number
    totalBoys: number
    totalGirls: number
    presentBoys: number
    presentGirls: number
    records: DailyAttendanceRegisterRecord[]
}

// Mirrors StudentAttendanceSummaryDTO - backs both Monthly and Term Summary's per-student table.
export type StudentAttendanceSummary = {
    studentId: string
    enrollmentId: string
    studentName: string
    admissionNumber: string
    className: string
    gender: 'MALE' | 'FEMALE' | null
    schoolDays: number
    present: number
    absent: number
    late: number
    attendancePercentage: number | null
    belowThreshold: boolean
    // The minimum attendance % applied to this student - their section's, else the school's.
    threshold: number
}

// Mirrors TermAttendanceSummaryDTO.
export type TermAttendanceSummary = {
    students: StudentAttendanceSummary[]
    totalStudents: number
    averageAttendance: number
    studentsBelowThreshold: number
    totalPresent: number
    totalAbsent: number
    totalLate: number
    totalBoys: number
    totalGirls: number
    presentBoys: number
    presentGirls: number
    threshold: number
}

// Mirrors ClassAttendanceSummaryRowDTO - one row per class session, "SSS 1 Science" and
// "SSS 1 Art" are separate rows.
export type ClassAttendanceSummaryRow = {
    classId: string
    sectionId: string
    streamId: string | null
    className: string
    totalStudents: number
    totalBoys: number
    totalGirls: number
    present: number
    absent: number
    late: number
    presentBoys: number
    presentGirls: number
    attendancePercentage: number | null
    belowThreshold: boolean
    // The minimum attendance % applied to this class - its section's, else the school's.
    threshold: number
}

// Mirrors ClassAttendanceSummaryDTO - termLabel is null when "All Terms" was requested.
export type ClassAttendanceSummary = {
    classes: ClassAttendanceSummaryRow[]
    termLabel: string | null
    totalClasses: number
    totalStudents: number
    schoolAverageAttendance: number
    classesBelowThreshold: number
    totalBoys: number
    totalGirls: number
    presentBoys: number
    presentGirls: number
}

export type InspectionReportType = 'DAILY_REGISTER' | 'MONTHLY_SUMMARY' | 'TERM_SUMMARY'

// Mirrors InspectionReportDTO - payload's shape depends on reportType.
export type InspectionReport = {
    reportType: InspectionReportType
    payload: DailyAttendanceRegister | StudentAttendanceSummary[] | TermAttendanceSummary
}

// Mirrors ClassInspectionReportDTO - one class's block in an "All classes" inspection report.
export type ClassInspectionReport = {
    classSessionId: string
    className: string
    sectionName: string | null
    streamName: string | null
    report: InspectionReport
}
// "75" when every value agrees, otherwise a phrase for mixed thresholds (each section sets its own).
// `fallback` is the school's own minimum, used when there is nothing to read a value from yet.
export function thresholdText(values: (number | null | undefined)[], fallback: number): string {
    const distinct = [...new Set(values.filter((v): v is number => v != null))]
    if (distinct.length === 0) return `${fallback}%`
    if (distinct.length === 1) return `${distinct[0]}%`
    return `their section's minimum`
}

// Mon-Fri days from `start` to `end` inclusive (ISO yyyy-mm-dd), i.e. calendar school days with
// weekends removed. Holidays aren't known here, so this is the ceiling the recorded days sit under.
export function countWeekdays(start: string | Date | null | undefined, end: string | Date | null | undefined): number {
    if (!start || !end) return 0
    const from = new Date(start)
    const to = new Date(end)
    if (isNaN(from.getTime()) || isNaN(to.getTime()) || from > to) return 0
    const day = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate()))
    const last = Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getUTCDate())
    let count = 0
    for (; day.getTime() <= last; day.setUTCDate(day.getUTCDate() + 1)) {
        const dow = day.getUTCDay()
        if (dow !== 0 && dow !== 6) count++
    }
    return count
}

// Gender attendance summary rows are per class + section + stream: "JSS 1 · A", "SSS 1 · A · Science".
// "N/A" is how a missing stream shows up elsewhere in the app, so it's treated as no stream here too.
export function genderClassRowLabel(row: { className: string, sectionName?: string | null, streamName?: string | null }) {
    return [row.className, row.sectionName, row.streamName !== 'N/A' ? row.streamName : null].filter(Boolean).join(' · ')
}

export function genderClassRowKey(row: { classId: string, sectionId?: string | null, streamId?: string | null }) {
    return `${row.classId}|${row.sectionId ?? ''}|${row.streamId ?? ''}`
}

// Mirrors StudentTermAttendanceDTO - term-to-date attendance over every school day so far.
export type StudentTermAttendance = {
    termId: string
    termName: string
    startDate: string
    asOf: string
    schoolDays: number
    // Every enrolled student; schoolDays counts from countedFrom (always the term start, whenever they
    // enrolled), and percentage is null while that's still 0.
    students: { studentId: string, countedFrom: string, schoolDays: number, presentOrLate: number, percentage: number | null }[]
}

// Mirrors AttendanceMarkingComplianceDTO - how completely each class's register is marked this term.
export type AttendanceMarkingCompliance = {
    termId: string
    termName: string
    startDate: string
    asOf: string
    schoolDays: number
    classes: {
        classSessionId: string
        className: string
        sectionName: string | null
        streamName: string | null
        classMasters: string[]
        // Owed from countedFrom (the later of term start and the class's first student); null = no students.
        countedFrom: string | null
        schoolDays: number
        markedDays: number
        percentage: number | null
        lastMarked: string | null
        missingDays: string[]
    }[]
}

// Mirrors StudentTermAttendanceDetailDTO - one student's term so far, over every school day.
export type StudentTermAttendanceDetail = {
    termId: string
    termName: string
    startDate: string
    asOf: string
    countedFrom: string
    schoolDays: number
    present: number
    late: number
    absent: number
    excused: number
    notMarked: number
    percentage: number | null
}
