// "Needs attention", in plain words - the same wording as the mobile app. Says out loud the school's own cut-offs, so
// the numbers mean something to a teacher (or to a guardian they're on the phone with).

export type FollowUpAction = 'CALLED_GUARDIAN' | 'MESSAGED_GUARDIAN' | 'MET_GUARDIAN' | 'SPOKE_WITH_PUPIL' | 'OTHER'

export type FollowUp = {
  id: string
  studentId: string
  action: FollowUpAction
  note: string | null
  resolved: boolean
  recordedBy: string | null
  createdAt: string
}

type FollowUpActionOption = { value: FollowUpAction, label: string }
export const FOLLOW_UP_ACTIONS: FollowUpActionOption[] = [
  { value: 'CALLED_GUARDIAN', label: 'Called the guardian' },
  { value: 'MESSAGED_GUARDIAN', label: 'Sent the guardian a message' },
  { value: 'MET_GUARDIAN', label: 'Met the guardian' },
  { value: 'SPOKE_WITH_PUPIL', label: 'Spoke with the student' },
  { value: 'OTHER', label: 'Something else' }
]

export const followUpActionLabel = (a: FollowUpAction) =>
  FOLLOW_UP_ACTIONS.find(x => x.value === a)?.label ?? 'Something else'

// A named type, with no comma in the export line: Nuxt's auto-import scanner reads `export const A: B<C, D>` as
// exporting A and D (it registered `string` as an export of this file).
type AttentionLevelLabels = Record<StudentAttention['severity'], string>
export const ATTENTION_LEVEL_LABEL: AttentionLevelLabels = {
  CRITICAL: 'Urgent',
  NEEDS_ATTENTION: 'Needs attention',
  WATCH: 'Keep an eye on'
}

const pct = (v: number) => `${Math.round(v * 10) / 10}%`

// Why the student is flagged - one point per line, most pressing first.
export function attentionReasons(a: StudentAttention, opts: { attendanceExpected?: number | null, passMark?: number | null } = {}) {
  const out: string[] = []
  if (a.attendanceFlag) {
    if (a.absenceStreak >= 3) out.push(`Absent ${a.absenceStreak} school days in a row`)
    if (a.attendanceRate != null) {
      const inTen = Math.min(10, Math.max(0, Math.round(a.attendanceRate / 10)))
      out.push(`Present on about ${inTen} in 10 school days lately`
        + (opts.attendanceExpected != null ? ` (the school expects at least ${Math.round(opts.attendanceExpected)}%)` : ''))
    }
    if (a.termAttendanceRate != null) out.push(`This term overall: ${pct(a.termAttendanceRate)} attendance`)
    if (a.attendanceTrend === 'DECLINING') out.push('Attendance is getting worse')
    if (a.attendanceTrend === 'IMPROVING') out.push('Attendance is getting better')
    if (!out.length) out.push('Missing school too often')
  }
  if (a.academicFlag) {
    out.push(a.academicAverage == null
      ? 'Marks are below the pass mark'
      : `Average mark ${pct(a.academicAverage)} - below the pass mark${opts.passMark != null ? ` of ${opts.passMark}%` : ''}`)
    if (a.previousTermAverage != null) out.push(`Was ${pct(a.previousTermAverage)} last term`)
    if (a.academicTrend === 'DECLINING') out.push('Marks are falling')
    if (a.academicTrend === 'IMPROVING') out.push('Marks are getting better')
  }
  if (!out.length) out.push('Slipping recently')
  return out
}

// What the teacher should do about it.
export function attentionNextStep(a: StudentAttention) {
  if (a.severity === 'WATCH') return 'Nothing needed yet - keep an eye on them over the next few weeks.'
  if (a.attendanceFlag && a.academicFlag) {
    return 'Call the guardian to find out why they\'re missing school, and agree together how to help them catch up on their work.'
  }
  if (a.attendanceFlag) {
    return a.absenceStreak >= 3
      ? 'Call the guardian today - they\'ve been away several days running.'
      : 'Call the guardian to find out why they\'re missing school.'
  }
  return 'Talk with the student and their subject teachers about where they\'re struggling, and let the guardian know.'
}

// "today", "yesterday", "3 days ago", or "12 Nov".
export function whenSaid(iso: string) {
  const t = new Date(iso), n = new Date()
  const day = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const days = Math.round((day(n) - day(t)) / 86400000)
  if (days <= 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days} days ago`
  return t.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
}

// Where a flagged student's follow-up stands, in a few words.
export function followUpStatus(a: StudentAttention | undefined, latest: FollowUp | undefined) {
  if (!latest) {
    return a && a.severity !== 'WATCH'
      ? { text: 'Not followed up yet', color: 'error' as const, icon: 'i-lucide-circle-alert' }
      : { text: 'No follow-up needed yet', color: 'neutral' as const, icon: 'i-lucide-eye' }
  }
  const what = followUpActionLabel(latest.action).toLowerCase()
  return latest.resolved
    ? { text: `Resolved ${whenSaid(latest.createdAt)} · ${what}`, color: 'success' as const, icon: 'i-lucide-circle-check' }
    : { text: `Followed up ${whenSaid(latest.createdAt)} · ${what}`, color: 'info' as const, icon: 'i-lucide-history' }
}
