// Staff (teacher) attendance - a genuinely separate concept from student attendance, which is
// keyed off Enrollment (see utils/attendance.ts / useAttendanceStore for that one).

export type TeacherAttendanceStatus = 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED'

export type TeacherRosterEntry = {
    teacher: Teacher
    status: TeacherAttendanceStatus | null
    note: string | null
    clockedInAt: string | null
    clockInIp: string | null
    clockedOutAt: string | null
    clockOutIp: string | null
    clockInByAdmin: boolean
    clockOutByAdmin: boolean
    recordedBy: string | null
}

export type MyAttendanceToday = {
    status: TeacherAttendanceStatus | null
    clockedInAt: string | null
    clockedOutAt: string | null
    // false when the person has no active staff/payroll record here - there's nothing to clock in to.
    onPayroll?: boolean
}

export type ClockInResult = {
    alreadyClockedIn: boolean
    clockedInAt: string
    distanceMeters: number
}

export type ClockOutResult = {
    alreadyClockedOut: boolean
    clockedOutAt: string
    distanceMeters: number
}

export type AttendanceLocationSettings = {
    configured: boolean
    latitude: number
    longitude: number
    radiusMeters: number
    allowedIps: string | null
    // null = the school-wide location; otherwise the management section it belongs to.
    managementSectionId?: string | null
}

export type TeacherAttendanceRoster = {
    date: string
    entries: TeacherRosterEntry[]
    presentCount: number
    lateCount: number
    absentCount: number
    excusedCount: number
    unmarkedCount: number
    totalCount: number
    rate: number
}

export type TeacherAttendanceDay = {
    date: string
    status: TeacherAttendanceStatus | null
    note: string | null
    clockedInAt: string | null
    clockedOutAt: string | null
    clockInByAdmin: boolean
    clockOutByAdmin: boolean
}

export type TeacherAttendanceDaySummary = {
    date: string
    presentCount: number
    lateCount: number
    absentCount: number
    excusedCount: number
    totalCount: number
    rate: number
}

// Mirrors TeacherAttendanceSummaryRowDTO - backs both Monthly and Term Summary's per-teacher
// table. No belowThreshold flag - a threshold isn't applied to teachers automatically.
export type TeacherAttendanceSummaryRow = {
    teacherId: string
    teacherName: string
    workingDays: number
    present: number
    absent: number
    late: number
    attendancePercentage: number | null
}

// Teachers with the most working days first; ties fall back to the higher attendance percentage.
export function sortTeachersByWorkingDays<T extends { workingDays: number, attendancePercentage: number | null }>(
    rows: readonly T[] | null | undefined
): T[] {
    return [...(rows ?? [])].sort((a, b) =>
        (b.workingDays ?? 0) - (a.workingDays ?? 0)
        || (b.attendancePercentage ?? Number.NEGATIVE_INFINITY) - (a.attendancePercentage ?? Number.NEGATIVE_INFINITY))
}

// Mirrors TermTeacherAttendanceSummaryDTO.
export type TermTeacherAttendanceSummary = {
    teachers: TeacherAttendanceSummaryRow[]
    termLabel: string
    totalTeachers: number
    averageAttendance: number
    totalPresent: number
    totalAbsent: number
    totalLate: number
}

export type TeacherManagementReportType = 'DAILY_REGISTER' | 'MONTHLY_SUMMARY' | 'TERM_SUMMARY'

// Mirrors TeacherManagementReportDTO - payload's shape depends on reportType.
export type TeacherManagementReport = {
    reportType: TeacherManagementReportType
    payload: TeacherAttendanceRoster | TeacherAttendanceSummaryRow[] | TermTeacherAttendanceSummary
}

export const TEACHER_ATTENDANCE_STATUS_OPTIONS: { label: string, value: TeacherAttendanceStatus, icon: string }[] = [
    { label: 'Present', value: 'PRESENT', icon: 'i-lucide-check-circle' },
    { label: 'Late', value: 'LATE', icon: 'i-lucide-clock-3' },
    { label: 'Absent', value: 'ABSENT', icon: 'i-lucide-x-circle' },
    { label: 'Excused', value: 'EXCUSED', icon: 'i-lucide-shield-check' },
]

export function teacherAttendanceStatusColor(status?: TeacherAttendanceStatus | null) {
    switch (status) {
        case 'PRESENT':
            return 'success'
        case 'LATE':
            return 'warning'
        case 'ABSENT':
            return 'error'
        case 'EXCUSED':
            return 'info'
        default:
            return 'neutral'
    }
}

// Roles that clock themselves in/out - every staff role except the owner (and parents, who
// aren't staff). Mirrors TeacherAttendanceController's self-service endpoints.
export const CLOCK_IN_ROLES = [
    Role.ADMIN, Role.PRINCIPAL, Role.SUPER_ADMIN, Role.PROPRIETOR,
    Role.ACCOUNTANT, Role.TEACHER, Role.LIBRARIAN, Role.NURSE, Role.EXAM_OFFICER,
]
