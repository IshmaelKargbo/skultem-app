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