// The sales pipeline (leads) and the onboarding of schools - see backend LeadController.
export type LeadStatus = 'NEW' | 'CONTACTED' | 'DEMO_SCHEDULED' | 'DEMO_COMPLETED' | 'INTERESTED' | 'ONBOARDING' | 'CONVERTED' | 'LOST'
export type LeadDemoStatus = 'NOT_SCHEDULED' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'
export type LeadNoteKind = 'NOTE' | 'CALL' | 'EMAIL' | 'MEETING' | 'STATUS_CHANGE' | 'SYSTEM'

export type Lead = {
    id: string
    name: string
    schoolName: string | null
    email: string | null
    phone: string | null
    city: string | null
    source: string
    demoRequestId: string | null
    contactMessageId: string | null
    status: LeadStatus
    demoStatus: LeadDemoStatus
    demoAt: string | null
    assignedToId: string | null
    assignedToName: string | null
    nextFollowUpAt: string | null
    summary: string | null
    schoolId: string | null
    convertedSchoolName: string | null
    convertedAt: string | null
    lostReason: string | null
    // Still being worked and a follow-up is due (or it has never been contacted).
    awaitingFollowUp: boolean
    onboardingId: string | null
    // Where the lead can be moved to by hand from its current status.
    nextStatuses: LeadStatus[]
    createdAt: string
    updatedAt: string
}

export type LeadNote = {
    id: string
    kind: LeadNoteKind
    body: string
    createdById: string | null
    createdByName: string | null
    createdAt: string
}

export type LeadDetail = { lead: Lead, notes: LeadNote[] }

export type LeadSummary = {
    total: number
    byStatus: Record<LeadStatus, number>
    awaitingFollowUp: number
    unassigned: number
    overdue: number
}

export type StaffMember = { id: string, name: string, email: string }

export type SaveLeadDto = {
    name: string
    schoolName: string
    email: string
    phone: string
    city: string
    source: string
    summary: string
    assignedToId: string | null
    nextFollowUpAt: string | null
}

export type LeadStatusOption = {
    value: LeadStatus
    label: string
    color: 'neutral' | 'primary' | 'info' | 'warning' | 'success' | 'error'
    icon: string
}

export const LEAD_STATUSES: LeadStatusOption[] = [
    { value: 'NEW', label: 'New', color: 'primary', icon: 'i-lucide-sparkles' },
    { value: 'CONTACTED', label: 'Contacted', color: 'info', icon: 'i-lucide-phone-call' },
    { value: 'DEMO_SCHEDULED', label: 'Demo scheduled', color: 'warning', icon: 'i-lucide-calendar-clock' },
    { value: 'DEMO_COMPLETED', label: 'Demo completed', color: 'warning', icon: 'i-lucide-presentation' },
    { value: 'INTERESTED', label: 'Interested', color: 'info', icon: 'i-lucide-thumbs-up' },
    { value: 'ONBOARDING', label: 'Onboarding', color: 'primary', icon: 'i-lucide-list-checks' },
    { value: 'CONVERTED', label: 'Converted', color: 'success', icon: 'i-lucide-circle-check' },
    { value: 'LOST', label: 'Lost', color: 'neutral', icon: 'i-lucide-circle-x' }
]

export function leadStatus(value: LeadStatus): LeadStatusOption {
    return LEAD_STATUSES.find(s => s.value === value) ?? LEAD_STATUSES[0]!
}

export type LeadSourceOption = { value: string, label: string }

export const LEAD_SOURCES: LeadSourceOption[] = [
    { value: 'DEMO_REQUEST', label: 'Demo request' },
    { value: 'CONTACT_MESSAGE', label: 'Contact message' },
    { value: 'REFERRAL', label: 'Referral' },
    { value: 'MANUAL', label: 'Added by hand' },
    { value: 'OTHER', label: 'Other' }
]

export const leadSourceLabel = (value: string) => LEAD_SOURCES.find(s => s.value === value)?.label ?? value

export type LeadNoteKindOption = { value: LeadNoteKind, label: string, icon: string }

export const LEAD_NOTE_KINDS: LeadNoteKindOption[] = [
    { value: 'NOTE', label: 'Note', icon: 'i-lucide-sticky-note' },
    { value: 'CALL', label: 'Call', icon: 'i-lucide-phone' },
    { value: 'EMAIL', label: 'Email', icon: 'i-lucide-mail' },
    { value: 'MEETING', label: 'Meeting', icon: 'i-lucide-users' }
]

export const leadNoteIcon = (kind: LeadNoteKind) =>
    LEAD_NOTE_KINDS.find(k => k.value === kind)?.icon ?? (kind === 'STATUS_CHANGE' ? 'i-lucide-arrow-right-left' : 'i-lucide-info')

// ---- Onboarding ----

export type OnboardingStatus = 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
export type OnboardingStepStatus = 'PENDING' | 'IN_PROGRESS' | 'DONE'

export type OnboardingStep = {
    id: string
    key: string
    label: string
    position: number
    applicable: boolean
    status: OnboardingStepStatus
    assignedToId: string | null
    assignedToName: string | null
    dueDate: string | null
    note: string | null
    completedAt: string | null
    completedByName: string | null
    overdue: boolean
}

export type Onboarding = {
    id: string
    leadId: string
    leadName: string
    schoolName: string | null
    schoolId: string | null
    linkedSchoolName: string | null
    assignedToId: string | null
    assignedToName: string | null
    status: OnboardingStatus
    startedAt: string | null
    completedAt: string | null
    doneSteps: number
    totalSteps: number
    percent: number
    currentStep: string | null
    nextDueDate: string | null
    overdueSteps: number
    steps: OnboardingStep[]
}

export type OnboardingStepUpdate = {
    status?: OnboardingStepStatus
    applicable?: boolean
    assignedToId?: string
    clearAssignee?: boolean
    dueDate?: string
    clearDueDate?: boolean
    note?: string
}
