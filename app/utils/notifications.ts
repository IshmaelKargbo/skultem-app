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

// Short relative time for a notification's timestamp (e.g. "5m ago", "3h ago", "2d ago"),
// falling back to the absolute date once it's old enough that "ago" stops being useful.
export function notificationTimeAgo(date: string) {
    const diffMs = Date.now() - new Date(date).getTime()
    const minutes = Math.floor(diffMs / 60000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`

    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`

    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d ago`

    return formatDate(date)
}
