// Messages from the system admin that show on every user's notice board - see backend
// PlatformAnnouncementController.
export type AnnouncementSeverity = 'INFO' | 'WARNING' | 'CRITICAL'

export type PlatformAnnouncement = {
    id: string
    title: string
    message: string
    severity: AnnouncementSeverity
    active: boolean
    startsAt: string | null
    endsAt: string | null
    // Switched on and inside its dates right now - what users actually see.
    live: boolean
    createdAt: string
    updatedAt: string
}

export type SaveAnnouncementDto = {
    title: string
    message: string
    severity: AnnouncementSeverity
    active: boolean
    startsAt: string | null
    endsAt: string | null
}

export type AnnouncementSeverityOption = {
    label: string
    value: AnnouncementSeverity
    color: 'primary' | 'warning' | 'error'
    icon: string
    hint: string
}

export const ANNOUNCEMENT_SEVERITIES: AnnouncementSeverityOption[] = [
    { label: 'Information', value: 'INFO', color: 'primary', icon: 'i-lucide-info', hint: 'News and general updates' },
    { label: 'Warning', value: 'WARNING', color: 'warning', icon: 'i-lucide-triangle-alert', hint: 'Planned maintenance or something to watch' },
    { label: 'Critical', value: 'CRITICAL', color: 'error', icon: 'i-lucide-octagon-alert', hint: 'An outage or something urgent' }
]

export function announcementSeverity(value: AnnouncementSeverity) {
    return ANNOUNCEMENT_SEVERITIES.find(s => s.value === value) ?? ANNOUNCEMENT_SEVERITIES[0]!
}
