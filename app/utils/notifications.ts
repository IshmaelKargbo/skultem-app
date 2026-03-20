export type AppNotification = {
    id: string
    title: string
    message: string
    type: string
    meta?: Record<string, string>
    read: boolean
    createdAt: string
    updatedAt?: string
}