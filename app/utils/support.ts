// Support tickets, notification history and platform health - see backend SupportController and
// PlatformOperationsController.
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'WAITING' | 'RESOLVED' | 'CLOSED'
export type TicketPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
export type TicketCategory = 'ACCOUNT_ACCESS' | 'BILLING' | 'BUG' | 'TRAINING' | 'DATA' | 'FEATURE_REQUEST' | 'OTHER'
export type TicketMessageKind = 'REPLY' | 'FROM_SCHOOL' | 'INTERNAL' | 'SYSTEM'

export type SupportTicket = {
    id: string
    number: string
    schoolId: string | null
    schoolName: string | null
    requesterName: string
    requesterEmail: string | null
    requesterPhone: string | null
    category: TicketCategory
    priority: TicketPriority
    status: TicketStatus
    subject: string
    description: string
    assignedToId: string | null
    assignedToName: string | null
    resolutionNote: string | null
    createdByName: string | null
    createdAt: string
    updatedAt: string
    resolvedAt: string | null
    // Still open and nobody has it.
    unassigned: boolean
    nextStatuses: TicketStatus[]
}

export type TicketMessage = {
    id: string
    kind: TicketMessageKind
    body: string
    createdByName: string | null
    createdAt: string
}

export type TicketDetail = { ticket: SupportTicket, messages: TicketMessage[] }

export type SupportSummary = {
    open: number
    inProgress: number
    waiting: number
    resolved: number
    unassigned: number
    urgent: number
    byStatus: Record<TicketStatus, number>
}

export type CreateTicketDto = {
    schoolId: string | null
    requesterName: string
    requesterEmail: string
    requesterPhone: string
    category: TicketCategory
    priority: TicketPriority
    subject: string
    description: string
    assignedToId: string | null
}

export type TicketStatusOption = {
    value: TicketStatus
    label: string
    color: 'primary' | 'info' | 'warning' | 'success' | 'neutral'
    icon: string
}

export const TICKET_STATUSES: TicketStatusOption[] = [
    { value: 'OPEN', label: 'Open', color: 'primary', icon: 'i-lucide-circle-dot' },
    { value: 'IN_PROGRESS', label: 'In progress', color: 'info', icon: 'i-lucide-loader' },
    { value: 'WAITING', label: 'Waiting on school', color: 'warning', icon: 'i-lucide-hourglass' },
    { value: 'RESOLVED', label: 'Resolved', color: 'success', icon: 'i-lucide-circle-check' },
    { value: 'CLOSED', label: 'Closed', color: 'neutral', icon: 'i-lucide-archive' }
]

export const ticketStatus = (value: TicketStatus): TicketStatusOption =>
    TICKET_STATUSES.find(s => s.value === value) ?? TICKET_STATUSES[0]!

export type TicketPriorityOption = { value: TicketPriority, label: string, color: 'neutral' | 'info' | 'warning' | 'error' }

export const TICKET_PRIORITIES: TicketPriorityOption[] = [
    { value: 'LOW', label: 'Low', color: 'neutral' },
    { value: 'NORMAL', label: 'Normal', color: 'info' },
    { value: 'HIGH', label: 'High', color: 'warning' },
    { value: 'URGENT', label: 'Urgent', color: 'error' }
]

export const ticketPriority = (value: TicketPriority): TicketPriorityOption =>
    TICKET_PRIORITIES.find(p => p.value === value) ?? TICKET_PRIORITIES[1]!

export type TicketCategoryOption = { value: TicketCategory, label: string }

export const TICKET_CATEGORIES: TicketCategoryOption[] = [
    { value: 'ACCOUNT_ACCESS', label: 'Account access' },
    { value: 'BILLING', label: 'Billing' },
    { value: 'BUG', label: 'Something is broken' },
    { value: 'TRAINING', label: 'Training / how-to' },
    { value: 'DATA', label: 'Data help' },
    { value: 'FEATURE_REQUEST', label: 'Feature request' },
    { value: 'OTHER', label: 'Other' }
]

export const ticketCategoryLabel = (value: TicketCategory) => TICKET_CATEGORIES.find(c => c.value === value)?.label ?? value

// ---- Notification history ----

export type BroadcastRecord = {
    id: string
    schoolId: string
    schoolName: string
    title: string
    audience: string
    channels: string[]
    status: string
    recipients: number
    sentByName: string | null
    scheduledAt: string | null
    sentAt: string | null
    createdAt: string
}

export type NotificationOverview = {
    days: number
    broadcasts: number
    scheduledBroadcasts: number
    inApp: number
    inAppRead: number
    byType: { type: string, created: number, read: number }[]
    announcements: { live: number, scheduled: number, ended: number }
}

// ---- Platform health ----

export type HealthLevel = 'OK' | 'WARNING' | 'FAILED' | 'NOT_TRACKED'

export type HealthCheck = {
    key: string
    label: string
    level: HealthLevel
    detail: string
    latencyMs: number | null
}

export type PlatformHealth = {
    overall: HealthLevel
    checkedAt: string
    checks: HealthCheck[]
    runtime: { java: string, uptimeSeconds: number, memoryUsedMb: number, memoryMaxMb: number, processors: number }
}
