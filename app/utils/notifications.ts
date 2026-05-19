export type AppNotification = {
    id: string
    title: string
    message: string
    type: string
    priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
    meta?: Record<string, string>
    read: boolean
    createdAt: string
    updatedAt?: string
}
