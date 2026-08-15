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

type NotificationTypeStyle = {
    icon: string
    color: 'warning' | 'error' | 'primary' | 'success' | 'neutral'
}

export const notificationTypeStyle: Record<string, NotificationTypeStyle> = {
    ATTENDANCE: { icon: ATTENDANCE_ICON, color: 'warning' },
    BEHAVIOUR: { icon: BEHAVIOUR_ICON, color: 'error' },
    ASSESSMENT: { icon: GRADES_ICON, color: 'primary' },
    FEE: { icon: PAYMENT_ICON, color: 'success' }
}

export function notificationTypeIcon(type?: string) {
    return notificationTypeStyle[type ?? '']?.icon ?? BELL_ICON
}

export function notificationTypeColor(type?: string) {
    return notificationTypeStyle[type ?? '']?.color ?? 'neutral'
}

export function notificationPriorityColor(priority?: string) {
    const map: Record<string, 'error' | 'warning' | 'info' | 'neutral'> = { URGENT: 'error', HIGH: 'warning', NORMAL: 'info' }
    return map[priority ?? ''] ?? 'neutral'
}
