export type NoticeCategory = 'GENERAL' | 'ACADEMIC' | 'FEE' | 'URGENT'
export type Audience = 'ALL' | 'STUDENTS' | 'PARENTS' | 'TEACHERS' | 'STAFF'
export type BroadcastChannel = 'SMS' | 'EMAIL' | 'PUSH' | 'IN_APP'
export type BroadcastStatus = 'SENT' | 'SCHEDULED' | 'FAILED'
export type CalendarEntryType = 'EVENT' | 'HOLIDAY'

export type Notice = {
    id: string
    title: string
    content: string
    category: NoticeCategory
    audience: Audience
    pinned: boolean
    postedBy: string
    postedAt: string
    expiresAt: string | null
}

export type CalendarEntry = {
    id: string
    title: string
    description: string
    type: CalendarEntryType
    startDate: string
    endDate: string
    location: string
}

export type Broadcast = {
    id: string
    title: string
    message: string
    audience: Audience
    channels: BroadcastChannel[]
    status: BroadcastStatus
    recipientsCount: number
    deliveredCount: number
    sentBy: string
    scheduledAt: string | null
    sentAt: string | null
    createdAt: string
}

export type CreateNoticeDto = {
    title: string
    content: string
    category: NoticeCategory
    audience: Audience
    expiresAt: string | null
}

export type UpdateNoticeDto = CreateNoticeDto & { id: string }

export type CreateCalendarEntryDto = {
    title: string
    description: string
    type: CalendarEntryType
    startDate: string
    endDate: string
    location: string
}

export type UpdateCalendarEntryDto = CreateCalendarEntryDto & { id: string }

export type ComposeBroadcastDto = {
    title: string
    message: string
    audience: Audience
    channels: BroadcastChannel[]
    sendOption: 'NOW' | 'SCHEDULE'
    scheduledAt: string | null
}

export const audiences = [
    { label: 'Everyone', value: 'ALL' },
    { label: 'Students', value: 'STUDENTS' },
    { label: 'Parents', value: 'PARENTS' },
    { label: 'Teachers', value: 'TEACHERS' },
    { label: 'Staff', value: 'STAFF' }
]

export const audienceSize: Record<Audience, number> = {
    ALL: 850,
    STUDENTS: 620,
    PARENTS: 610,
    TEACHERS: 45,
    STAFF: 60
}

export const broadcastChannels = [
    { label: 'SMS', value: 'SMS' },
    { label: 'Email', value: 'EMAIL' },
    { label: 'Push Notification', value: 'PUSH' },
    { label: 'In-App', value: 'IN_APP' }
]

type NoticeCategoryStyle = {
    label: string
    color: 'neutral' | 'info' | 'warning' | 'error'
}

export const noticeCategoryStyle: Record<NoticeCategory, NoticeCategoryStyle> = {
    GENERAL: { label: 'General', color: 'neutral' },
    ACADEMIC: { label: 'Academic', color: 'info' },
    FEE: { label: 'Fee', color: 'warning' },
    URGENT: { label: 'Urgent', color: 'error' }
}

type BroadcastStatusStyle = {
    label: string
    color: 'success' | 'info' | 'error'
}

export const broadcastStatusStyle: Record<BroadcastStatus, BroadcastStatusStyle> = {
    SENT: { label: 'Sent', color: 'success' },
    SCHEDULED: { label: 'Scheduled', color: 'info' },
    FAILED: { label: 'Failed', color: 'error' }
}

export function audienceLabel(value: Audience): string {
    return audiences.find(e => e.value === value)?.label || value
}

export function isNoticeExpired(notice: Notice): boolean {
    return !!notice.expiresAt && new Date(notice.expiresAt).getTime() < Date.now()
}

export function isEntryUpcoming(entry: CalendarEntry): boolean {
    return new Date(entry.endDate).getTime() >= Date.now()
}
