export type NoticeCategory = 'GENERAL' | 'ACADEMIC' | 'FEE' | 'URGENT' | 'EVENT'
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
    // When the announced thing happens (a PTA meeting, a sports day), where, and whether it is also on the
    // school calendar. All null / false for a plain notice.
    eventAt: string | null
    eventEndsAt: string | null
    eventLocation: string | null
    onCalendar: boolean
    // The management section it's for; null = the whole school.
    managementSectionId: string | null
}

export type CalendarEntry = {
    id: string
    title: string
    description: string
    type: CalendarEntryType
    startDate: string
    endDate: string
    location: string
    managementSectionId?: string | null
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
    managementSectionId?: string | null
}

export type CreateNoticeDto = {
    title: string
    content: string
    category: NoticeCategory
    audience: Audience
    expiresAt: string | null
    eventAt?: string | null
    eventEndsAt?: string | null
    eventLocation?: string | null
    // Also put the event on the school calendar (needs eventAt); the calendar entry follows the notice.
    addToCalendar?: boolean
    // '' / undefined = the caller's own section (or the whole school for whole-school staff).
    managementSectionId?: string | null
}

export type UpdateNoticeDto = CreateNoticeDto & { id: string }

export type CreateCalendarEntryDto = {
    title: string
    description: string
    type: CalendarEntryType
    startDate: string
    endDate: string
    location: string
    managementSectionId?: string | null
}

export type UpdateCalendarEntryDto = CreateCalendarEntryDto & { id: string }

export type ComposeBroadcastDto = {
    title: string
    message: string
    audience: Audience
    channels: BroadcastChannel[]
    sendOption: 'NOW' | 'SCHEDULE'
    scheduledAt: string | null
    managementSectionId?: string | null
}

export const audiences = [
    { label: 'Everyone', value: 'ALL' },
    { label: 'Students', value: 'STUDENTS' },
    { label: 'Parents', value: 'PARENTS' },
    { label: 'Teachers', value: 'TEACHERS' },
    { label: 'Staff', value: 'STAFF' }
]

export const broadcastChannels = [
    { label: 'SMS', value: 'SMS', icon: CHANNEL_SMS_ICON },
    { label: 'Email', value: 'EMAIL', icon: CHANNEL_EMAIL_ICON },
    { label: 'Push Notification', value: 'PUSH', icon: CHANNEL_PUSH_ICON },
    { label: 'In-App', value: 'IN_APP', icon: CHANNEL_IN_APP_ICON }
]

type NoticeCategoryStyle = {
    label: string
    color: 'neutral' | 'info' | 'warning' | 'error' | 'success'
}

export const noticeCategoryStyle: Record<NoticeCategory, NoticeCategoryStyle> = {
    GENERAL: { label: 'General', color: 'neutral' },
    ACADEMIC: { label: 'Academic', color: 'info' },
    FEE: { label: 'Fee', color: 'warning' },
    URGENT: { label: 'Urgent', color: 'error' },
    EVENT: { label: 'Event', color: 'success' }
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

// ---- Notices about something that happens on a date (PTA meeting, sports day) ----
// Times are the school's wall-clock time (SCHOOL_TIMEZONE), not the viewer's device time, so a parent
// abroad sees the same "Fri 10 Oct, 9:00 AM" the head teacher typed.

function zoneOffsetMs(date: Date): number {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: SCHOOL_TIMEZONE, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    }).formatToParts(date)
    const v: { [part: string]: number } = {}
    for (const p of parts) if (p.type !== 'literal') v[p.type] = Number(p.value)
    return Date.UTC(v.year!, v.month! - 1, v.day!, v.hour!, v.minute!, v.second!) - date.getTime()
}

// "2026-10-10T09:00" typed in a datetime-local field (school time) -> the ISO instant to send.
export function schoolLocalToIso(local: string): string {
    const [d = '', t = '00:00'] = local.split('T')
    const [y, m, day] = d.split('-').map(Number)
    const [h, min] = t.split(':').map(Number)
    const guess = Date.UTC(y!, m! - 1, day!, h, min)
    return new Date(guess - zoneOffsetMs(new Date(guess))).toISOString()
}

// An ISO instant -> the "YYYY-MM-DDTHH:mm" a datetime-local field wants, in school time.
export function isoToSchoolLocal(iso: string): string {
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: SCHOOL_TIMEZONE, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
    }).formatToParts(new Date(iso))
    const v: { [part: string]: string } = {}
    for (const p of parts) if (p.type !== 'literal') v[p.type] = p.value
    return `${v.year}-${v.month}-${v.day}T${v.hour}:${v.minute}`
}

// "Friday, 10 October 2026 · 9:00 AM - 11:00 AM" (or a range across days).
export function formatEventWhen(notice: Pick<Notice, 'eventAt' | 'eventEndsAt'>): string {
    if (!notice.eventAt) return ''
    const day = (iso: string) => new Date(iso).toLocaleDateString(undefined, {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: SCHOOL_TIMEZONE
    })
    const time = (iso: string) => new Date(iso).toLocaleTimeString(undefined, {
        hour: 'numeric', minute: '2-digit', timeZone: SCHOOL_TIMEZONE
    })
    const start = notice.eventAt
    const end = notice.eventEndsAt
    if (!end) return `${day(start)} · ${time(start)}`
    if (day(start) === day(end)) return `${day(start)} · ${time(start)} - ${time(end)}`
    return `${day(start)} ${time(start)} - ${day(end)} ${time(end)}`
}

export type NoticeEventState = 'UPCOMING' | 'TODAY' | 'PAST'

export function noticeEventState(notice: Pick<Notice, 'eventAt' | 'eventEndsAt'>): NoticeEventState | null {
    if (!notice.eventAt) return null
    const start = new Date(notice.eventAt).getTime()
    const end = notice.eventEndsAt ? new Date(notice.eventEndsAt).getTime() : start + 60 * 60 * 1000
    const now = Date.now()
    if (end < now) return 'PAST'
    const dayOf = (ms: number) => new Date(ms).toLocaleDateString('en-CA', { timeZone: SCHOOL_TIMEZONE })
    return dayOf(start) === dayOf(now) || (start <= now && end >= now) ? 'TODAY' : 'UPCOMING'
}

// "in 3 days" / "tomorrow" / "today" / "2 days ago" - a quick sense of how close the event is.
export function eventCountdown(notice: Pick<Notice, 'eventAt' | 'eventEndsAt'>): string {
    if (!notice.eventAt) return ''
    const dayOf = (iso: string) => new Date(iso).toLocaleDateString('en-CA', { timeZone: SCHOOL_TIMEZONE })
    const a = new Date(dayOf(new Date().toISOString()) + 'T00:00:00Z').getTime()
    const b = new Date(dayOf(notice.eventAt) + 'T00:00:00Z').getTime()
    const days = Math.round((b - a) / 86_400_000)
    if (days === 0) return 'Today'
    if (days === 1) return 'Tomorrow'
    if (days === -1) return 'Yesterday'
    return days > 0 ? `In ${days} days` : `${-days} days ago`
}
