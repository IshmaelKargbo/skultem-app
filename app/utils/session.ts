export type UserSession = {
    id: string
    userId?: string | null
    userName: string
    userEmail?: string | null
    ipAddress: string
    device: string
    deviceType: string
    os: string
    browser: string
    userAgent: string
    active: boolean
    createdAt: string
}
