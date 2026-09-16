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