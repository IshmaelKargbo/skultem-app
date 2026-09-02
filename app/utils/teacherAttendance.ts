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
}

export type MyAttendanceToday = {
    status: TeacherAttendanceStatus | null
    clockedInAt: string | null
    clockedOutAt: string | null
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
