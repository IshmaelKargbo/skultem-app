// Health Care (backend: /health-care, docs/HEALTH_CARE.md): sick bay visits, the school's health care rules, and reports.

export type HealthCareVisitStatus = 'OPEN' | 'CLOSED' | 'VOIDED'
export type HealthCareOutcome = 'RETURNED_TO_CLASS' | 'SENT_HOME' | 'REFERRED'
export type HealthCareVisitFilter = 'ALL' | 'OPEN' | 'FOLLOW_UP' | 'CLOSED' | 'VOIDED'
export type LimitPeriod = 'DAY' | 'WEEK' | 'MONTH' | 'TERM'
export type LimitAction = 'WARN' | 'REASON' | 'REFUSE'
export type RepeatAction = 'WARN' | 'REASON'
export type HealthCareLevel = 'DAYCARE' | 'NURSERY' | 'PRIMARY' | 'JSS' | 'SSS'

export type HealthCareVisitComplaint = { code: string, label: string, urgent: boolean }

export type HealthCareMedication = {
    id: string
    name: string
    dose: string
    givenAt: string
    recordedBy: string
    recordedByName: string | null
    repeatReason: string | null
}

export type HealthCareNote = { id: string, text: string, at: string, by: string, byName: string | null }

export type HealthCareParentNotified = { userId: string, name: string | null, at: string, manual: boolean }

export type HealthCareOverLimit = {
    ruleName: string
    maxVisits: number
    period: LimitPeriod
    action: LimitAction
    count: number
    urgent: boolean
    reason: string | null
    by: string
    byName: string | null
}

export type HealthCareVisit = {
    id: string
    studentId: string
    studentName: string
    studentClass: string | null
    status: HealthCareVisitStatus
    arrivedAt: string
    complaints: HealthCareVisitComplaint[]
    complaintOther: string | null
    broughtBy: string | null
    temperature: number | null
    notes: string | null
    treatment: string | null
    medications: HealthCareMedication[]
    continuesVisitId: string | null
    overLimit: HealthCareOverLimit | null
    openedByName: string | null
    outcome: HealthCareOutcome | null
    leftAt: string | null
    collectedBy: string | null
    collectedByRelation: string | null
    referredTo: string | null
    ambulanceCalled: boolean | null
    accompaniedBy: string | null
    closedAt: string | null
    closedByName: string | null
    followUpReason: string | null
    followUpNotes: HealthCareNote[]
    parentNotifications: HealthCareParentNotified[]
    // NONE: no parent has an account. FAILED: sending failed.
    notifyProblem: 'NONE' | 'FAILED' | null
    canNotifyParents: boolean
    voidedAt: string | null
    voidedByName: string | null
    voidReason: string | null
    urgent: boolean
    // Still open after the student's school day ended.
    needsFollowUp: boolean
    minutesIn: number | null
    longStay: boolean
}

export type HealthCareComplaint = { code: string, label: string, urgent: boolean, standard: boolean, hidden: boolean }

export type HealthCareLimitRule = {
    id: string | null
    name: string
    levels: HealthCareLevel[]
    maxVisits: number
    period: LimitPeriod
    action: LimitAction
    enabled: boolean
}

export type HealthCareCustomComplaint = { code: string | null, label: string, urgent: boolean, hidden: boolean }

export type HealthCareComplaintSettings = { hidden: string[], urgent: string[], custom: HealthCareCustomComplaint[] }

export type HealthCareSettings = {
    limitRules: HealthCareLimitRule[]
    medicationAllowed: boolean
    sameMedicineHours: number | null
    sameMedicineAction: RepeatAction
    maxMedicationLines: number | null
    requireBroughtBy: boolean
    requireTemperature: boolean
    requireTreatment: boolean
    requireNotesOnReturn: boolean
    notifyOutcomes: HealthCareOutcome[]
    allowManualNotify: boolean
    notifyPrincipalOnReferral: boolean
    principalAlertVisits: number | null
    principalAlertPeriod: LimitPeriod | null
    longStayMinutes: number | null
    complaints: HealthCareComplaintSettings
    // The resulting list: standard complaints with the school's changes, then its own. Hidden ones included.
    complaintList: HealthCareComplaint[]
    // The school has saved its own rules (otherwise these are the defaults).
    customized: boolean
    updatedByName: string | null
    updatedAt: string | null
}

export type HealthCareOverview = {
    inSickBay: HealthCareVisit[]
    followUp: HealthCareVisit[]
    today: { visits: number, open: number, returnedToClass: number, sentHome: number, referred: number, turnedAway: number }
    longStayMinutes: number | null
}

export type HealthCareLimitCheck = {
    result: 'ALLOW' | LimitAction
    ruleName: string | null
    maxVisits: number | null
    period: LimitPeriod | null
    count: number
    urgent: boolean
    refused: boolean
    needsReason: boolean
    message: string | null
}

export type HealthCareVisitCheck = {
    studentId: string
    studentName: string
    studentClass: string | null
    visitsThisWeek: number
    visitsThisTerm: number
    lastVisitAt: string | null
    lastVisitComplaints: string | null
    // Already has an open visit: close or follow that up first.
    openVisitId: string | null
    limit: HealthCareLimitCheck
    // Today's closed visits a new visit can continue (it then doesn't count towards limits).
    continuable: { id: string, arrivedAt: string, complaints: string, outcome: HealthCareOutcome | null }[]
}

export type HealthCareTrendScope = 'MONTH' | 'TERM' | 'YEAR'

export type HealthCareTermOption = { id: string, name: string, start: string, end: string }
export type HealthCareYearOption = { id: string, name: string, start: string | null, end: string | null, terms: HealthCareTermOption[] }
export type HealthCarePeriods = { activeYearId: string | null, activeTermId: string | null, years: HealthCareYearOption[] }

// One column: a week of a month, a month of a term, or a term of a year ("Outside terms" has no dates).
export type HealthCareBucket = { key: string, label: string, from: string | null, to: string | null }
// Counts in bucket order, then the total.
export type HealthCareTrendRow = { key: string, label: string, urgent: boolean, counts: number[], total: number }
export type HealthCareMedicineRow = { name: string, times: number, students: number }

export type HealthCareTrends = {
    scope: HealthCareTrendScope
    title: string
    from: string
    to: string
    buckets: HealthCareBucket[]
    // Visits, Students seen, Urgent, Turned away - in that order.
    overview: HealthCareTrendRow[]
    complaints: HealthCareTrendRow[]
    outcomes: HealthCareTrendRow[]
    classes: HealthCareTrendRow[]
    medicines: HealthCareMedicineRow[]
    byWeekday: HealthCareCount[]
    byHour: HealthCareCount[]
}

/** The visit list's filters (components/health-care/FilterDrawer.vue). */
export type HealthCareVisitFilters = {
    status: HealthCareVisitFilter
    outcome: HealthCareOutcome | ''
    complaint: string
    overLimit: boolean
    from: string
    to: string
}

export type HealthCareStartResult = { visit: HealthCareVisit | null, turnedAway: boolean, message: string | null }

export type HealthCareMedicationCheck = {
    name: string
    lastGivenAt: string
    minutesAgo: number
    windowHours: number
    action: RepeatAction
    message: string
}

export type HealthCareCount = { key: string, label: string, count: number }

export type HealthCareSummary = {
    from: string
    to: string
    visits: number
    // Different students seen.
    students: number
    urgent: number
    stillOpen: number
    overLimit: number
    turnedAway: number
    // Over visits closed with a real departure time; null when there are none.
    averageMinutes: number | null
    byComplaint: HealthCareCount[]
    byOutcome: HealthCareCount[]
    classes: HealthCareClassRow[]
    // Every day of the range, days without visits included.
    days: HealthCareDayRow[]
}

export type HealthCareClassRow = {
    className: string
    visits: number
    students: number
    returnedToClass: number
    sentHome: number
    referred: number
    stillOpen: number
}

export type HealthCareDayRow = { date: string, visits: number, sentHome: number, referred: number }

export type HealthCareFrequentVisitor = {
    studentId: string
    studentName: string
    studentClass: string | null
    visits: number
    dates: string[]
    complaints: string[]
}

export type HealthCareTurnedAway = {
    id: string
    studentId: string
    studentName: string
    studentClass: string | null
    at: string
    complaints: string
    ruleName: string
    maxVisits: number
    period: LimitPeriod
    visitCount: number
    recordedByName: string | null
}

export type HealthCareLimitsReport = { from: string, to: string, overLimit: HealthCareVisit[], turnedAway: HealthCareTurnedAway[] }

export type HealthCareStudentHistory = {
    studentId: string
    studentName: string
    visits: HealthCareVisit[]
    turnedAway: HealthCareTurnedAway[]
}

type BadgeColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'
// Named types, and objects over several lines: Nuxt's auto-import scanner splits an `export const` line at its commas,
// so `Record<A, string>` or `{ DAY: 'day', WEEK: 'week' }` on one line would look like exports named `string`, `WEEK`...
type Badge = { label: string, color: BadgeColor, icon: string }
type Option<T> = { label: string, value: T }
type DescribedOption<T> = Option<T> & { description: string }
type OutcomeStyles = Record<HealthCareOutcome, Badge>
type PeriodLabels = Record<LimitPeriod, string>

export const outcomeStyle: OutcomeStyles = {
    RETURNED_TO_CLASS: { label: 'Returned to class', color: 'success', icon: 'i-lucide-school' },
    SENT_HOME: { label: 'Sent home', color: 'warning', icon: 'i-lucide-house' },
    REFERRED: { label: 'Referred', color: 'error', icon: 'i-lucide-ambulance' }
}

export const outcomeOptions = (Object.keys(outcomeStyle) as HealthCareOutcome[])
    .map(value => ({ label: outcomeStyle[value].label, value }))

/** What a visit's badge says: in the sick bay, needs follow-up, its outcome, or voided. */
export function visitBadge(v: HealthCareVisit): { label: string, color: BadgeColor } {
    if (v.status === 'VOIDED') return { label: 'Voided', color: 'neutral' }
    if (v.status === 'OPEN') return v.needsFollowUp
        ? { label: 'Needs follow-up', color: 'warning' }
        : { label: 'In the sick bay', color: 'info' }
    return v.outcome ? outcomeStyle[v.outcome] : { label: 'Closed', color: 'neutral' }
}

export const visitFilterOptions: Option<HealthCareVisitFilter>[] = [
    { label: 'All visits', value: 'ALL' },
    { label: 'In the sick bay', value: 'OPEN' },
    { label: 'Needs follow-up', value: 'FOLLOW_UP' },
    { label: 'Closed', value: 'CLOSED' },
    { label: 'Voided', value: 'VOIDED' }
]

export const periodLabel: PeriodLabels = {
    DAY: 'day',
    WEEK: 'week',
    MONTH: 'month',
    TERM: 'term'
}

export const periodOptions: Option<LimitPeriod>[] = [
    { label: 'Day', value: 'DAY' },
    { label: 'Week (Mon–Sun)', value: 'WEEK' },
    { label: 'Month', value: 'MONTH' },
    { label: 'Term', value: 'TERM' }
]

export const limitActionOptions: DescribedOption<LimitAction>[] = [
    { label: 'Warn', value: 'WARN', description: 'The visit goes ahead with a message' },
    { label: 'Ask for a reason', value: 'REASON', description: 'The nurse must give a reason first' },
    { label: 'Refuse', value: 'REFUSE', description: 'Not allowed, except for urgent complaints' }
]

export const levelOptions: Option<HealthCareLevel>[] = [
    { label: 'Daycare', value: 'DAYCARE' },
    { label: 'Nursery', value: 'NURSERY' },
    { label: 'Primary', value: 'PRIMARY' },
    { label: 'JSS', value: 'JSS' },
    { label: 'SSS', value: 'SSS' }
]

/** "Paracetamol 500 mg at 10:15" */
export function medicationLine(m: HealthCareMedication): string {
    return `${m.name} ${m.dose} at ${formatTime(m.givenAt)}`
}

export function complaintText(v: { complaints: HealthCareVisitComplaint[], complaintOther: string | null }): string {
    const text = v.complaints.map(c => c.label).join(', ')
    return v.complaintOther ? `${text} (${v.complaintOther})` : text
}

/** "1 a week (Refuse)" */
export function ruleSummary(r: { maxVisits: number, period: LimitPeriod, action: LimitAction }): string {
    const action = limitActionOptions.find(a => a.value === r.action)?.label ?? r.action
    return `${r.maxVisits} a ${periodLabel[r.period]} · ${action}`
}

/** Local datetime-input value ("2026-10-28T10:15") for an ISO instant, and back. */
export function toLocalInput(iso: string | null): string {
    if (!iso) return ''
    const d = new Date(iso)
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function fromLocalInput(value: string): string | null {
    return value ? new Date(value).toISOString() : null
}
