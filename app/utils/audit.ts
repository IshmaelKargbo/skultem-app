export type AuditLog = {
    id: string
    action: string
    academicYearName?: string | null
    userId?: string | null
    userName: string
    userEmail?: string | null
    ipAddress?: string | null
    device?: string | null
    deviceType?: string | null
    os?: string | null
    browser?: string | null
    status: 'SUCCESS' | 'FAILURE'
    details?: string | null
    createdAt: string
}
