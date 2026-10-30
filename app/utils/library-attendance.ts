// Library Attendance (backend: /library/attendance, docs/LIBRARY_ATTENDANCE.md). Two separate records - a
// student's own library visits, and the register for a class's scheduled Library period. They are never added
// together anywhere in the UI.

export type VisitStatus = 'OPEN' | 'CHECKED_OUT' | 'RESOLVED'
export type VisitFilter = 'ALL' | 'OPEN' | 'UNRESOLVED' | 'CHECKED_OUT' | 'RESOLVED'

export type LibraryVisit = {
    id: string
    studentId: string
    studentName: string
    studentClass: string | null
    status: VisitStatus
    // Still open after the student's school day ended - needs following up.
    unresolved: boolean
    checkedInAt: string
    checkedInByName: string | null
    schoolDayEndsAt: string
    checkedOutAt: string | null
    checkedOutByName: string | null
    // Only for a visit closed by a real check-out.
    durationMinutes: number | null
    resolvedAt: string | null
    resolvedByName: string | null
    resolutionReason: string | null
}

export type CheckInRefusal = { studentId: string, studentName: string | null, reason: string }

// warnings never stop a check-in: a student whose class's library period is on right now (they still need
// marking on that register - an independent visit doesn't count there).
export type CheckInResult = { checkedIn: LibraryVisit[], refused: CheckInRefusal[], warnings: CheckInRefusal[] }

export type LibrarySessionStatus = 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
export type SessionFilter = 'ALL' | LibrarySessionStatus | 'INCOMPLETE'
export type RegisterStatus = 'UNMARKED' | 'PRESENT' | 'ABSENT' | 'EXCUSED'
export type FinalStatus = Exclude<RegisterStatus, 'UNMARKED'>

export type LibrarySession = {
    // null until someone opens (or cancels) it - identified by timetableEntryId + date until then.
    id: string | null
    timetableEntryId: string | null
    date: string
    classSessionId: string
    className: string
    subjectName: string
    periodName: string | null
    startTime: string
    endTime: string
    roomName: string | null
    status: LibrarySessionStatus
    // The period has ended and the register isn't finalized. Nobody is marked absent for it.
    incomplete: boolean
    editable: boolean
    cancelReason: string | null
    rosterCount: number
    present: number
    absent: number
    excused: number
    unmarked: number
}

export type RegisterRow = {
    id: string
    studentId: string
    studentName: string
    studentClass: string | null
    status: RegisterStatus
    excuseReason: string | null
    removed: boolean
    addedManually: boolean
    corrected: boolean
}

export type RosterChange = {
    studentId: string
    studentName: string
    change: 'ADDED' | 'REMOVED'
    reason: string
    changedAt: string
    changedByName: string | null
}

export type AttendanceCorrection = {
    recordId: string
    studentId: string
    studentName: string
    originalStatus: FinalStatus
    correctedStatus: FinalStatus
    reason: string
    correctedAt: string
    correctedByName: string | null
}

export type LibrarySessionDetail = {
    session: LibrarySession
    openedAt: string | null
    openedByName: string | null
    finalizedAt: string | null
    finalizedByName: string | null
    cancelledAt: string | null
    cancelledByName: string | null
    records: RegisterRow[]
    rosterChanges: RosterChange[]
    corrections: AttendanceCorrection[]
}

export type LibraryAttendanceOverview = {
    librarySubjectId: string | null
    librarySubjectName: string | null
    openVisits: number
    unresolvedVisits: number
    visitsToday: number
    sessionsToday: number
    incompleteSessions: number
}

export type StudentLibraryHistory = {
    studentId: string
    studentName: string
    visits: LibraryVisit[]
    sessions: {
        sessionId: string
        date: string
        className: string
        periodName: string | null
        status: RegisterStatus
        sessionStatus: Exclude<LibrarySessionStatus, 'UPCOMING'>
        corrected: boolean
    }[]
}

export type TotalsRow = {
    classSessionId: string | null
    className: string
    sessions: number
    present: number
    absent: number
    excused: number
}

export type LibraryAttendanceTotals = {
    from: string
    to: string
    classes: TotalsRow[]
    overall: TotalsRow
    incompleteSessions: number
    cancelledSessions: number
}

type BadgeColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'

export function visitState(v: LibraryVisit): { label: string, color: BadgeColor } {
    if (v.status === 'OPEN') return v.unresolved
        ? { label: 'Not checked out', color: 'warning' }
        : { label: 'In the library', color: 'success' }
    if (v.status === 'RESOLVED') return { label: 'Followed up', color: 'neutral' }
    return { label: 'Checked out', color: 'info' }
}

export const sessionStatusStyle: Record<LibrarySessionStatus, { label: string, color: BadgeColor }> = {
    UPCOMING: { label: 'Upcoming', color: 'neutral' },
    IN_PROGRESS: { label: 'In progress', color: 'info' },
    COMPLETED: { label: 'Completed', color: 'success' },
    CANCELLED: { label: 'Cancelled', color: 'error' }
}

export const registerStatusStyle: Record<RegisterStatus, { label: string, color: BadgeColor }> = {
    UNMARKED: { label: 'Unmarked', color: 'neutral' },
    PRESENT: { label: 'Present', color: 'success' },
    ABSENT: { label: 'Absent', color: 'error' },
    EXCUSED: { label: 'Excused', color: 'warning' }
}

export const finalStatuses: FinalStatus[] = ['PRESENT', 'ABSENT', 'EXCUSED']

export const sessionFilterOptions: { label: string, value: SessionFilter }[] = [
    { label: 'All sessions', value: 'ALL' },
    { label: 'Upcoming', value: 'UPCOMING' },
    { label: 'In progress', value: 'IN_PROGRESS' },
    { label: 'Incomplete', value: 'INCOMPLETE' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Cancelled', value: 'CANCELLED' }
]

/** "45 min" / "1 h 20 min" */
export function formatMinutes(minutes: number | null): string {
    if (minutes === null || minutes === undefined) return ''
    if (minutes < 60) return `${minutes} min`
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return m ? `${h} h ${m} min` : `${h} h`
}

/** "10:00" from "10:00:00" */
export function shortTime(time: string | null): string {
    return time ? time.slice(0, 5) : ''
}

/** Today in the school's time zone, as yyyy-mm-dd. */
export function schoolToday(): string {
    return new Intl.DateTimeFormat('en-CA', { timeZone: SCHOOL_TIMEZONE }).format(new Date())
}

/** Adds days to a yyyy-mm-dd date. */
export function addDays(date: string, days: number): string {
    const d = new Date(`${date}T00:00:00Z`)
    d.setUTCDate(d.getUTCDate() + days)
    return d.toISOString().slice(0, 10)
}

/** The Monday of the week a yyyy-mm-dd date falls in. */
export function weekStart(date: string): string {
    const d = new Date(`${date}T00:00:00Z`)
    const offset = (d.getUTCDay() + 6) % 7
    return addDays(date, -offset)
}

/** "Wed, 28 Oct" for a yyyy-mm-dd date. */
export function formatDayLabel(date: string): string {
    return new Date(`${date}T00:00:00Z`).toLocaleDateString(undefined, {
        weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC'
    })
}
