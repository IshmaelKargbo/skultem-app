// Leave Management - built on the existing Teacher entity, same as payroll.

export type LeaveType = 'ANNUAL' | 'SICK' | 'EMERGENCY' | 'MATERNITY' | 'PATERNITY' | 'STUDY' | 'UNPAID' | 'OTHER'
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export type LeaveRequest = {
    id: string
    schoolId: string
    teacher: Teacher
    type: LeaveType
    startDate: string
    endDate: string
    durationDays: number
    reason: string
    status: LeaveStatus
    reviewNote: string | null
    reviewedAt: string | null
    createdAt: string
    updatedAt: string
}

export type LeaveSummary = {
    total: number
    pending: number
    approved: number
    rejected: number
}

export const LEAVE_TYPE_OPTIONS: { label: string, value: LeaveType }[] = [
    { label: 'Annual Leave', value: 'ANNUAL' },
    { label: 'Sick Leave', value: 'SICK' },
    { label: 'Emergency Leave', value: 'EMERGENCY' },
    { label: 'Maternity Leave', value: 'MATERNITY' },
    { label: 'Paternity Leave', value: 'PATERNITY' },
    { label: 'Study Leave', value: 'STUDY' },
    { label: 'Unpaid Leave', value: 'UNPAID' },
    { label: 'Other', value: 'OTHER' },
]

export function leaveStatusColor(status?: LeaveStatus) {
    switch (status) {
        case 'APPROVED':
            return 'success'
        case 'REJECTED':
            return 'error'
        default:
            return 'warning'
    }
}
