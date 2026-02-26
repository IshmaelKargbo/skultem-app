export type AttendanceRecord = {
    studentId: string
    present: boolean
    excused: boolean
    reason: string
    late: boolean
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
}

export type CreateAttendanceDto = {
    date: string
    holiday: boolean
    records: AttendanceRecord[]
}