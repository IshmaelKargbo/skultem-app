export type AssessmentTemplate = {
    id: string
    name: string
    passMark: number
    description: string
    assessments: Assessment[],
    createdAt: string,
    updatedAt: string
    // How the template scores its tests (for the list).
    scoring?: TemplateScoring | null
    // The term (1, 2, 3) students of classes using this template start being graded in.
    startsInTerm?: number
}

export type TemplateScoring = {
    structure: AssessmentStructure
    caPercentage: number
    formalPercentage: number
    // How many named CA parts it has, and whether one of them comes from the attendance register.
    parts: number
    attendance: boolean
    // Tests or terms with their own setup.
    overrides: number
    // No setup of its own - follows the school-wide one.
    inherited: boolean
    // Tests that use CA (a template's own setup lists them; every other test is a single score).
    caTests?: number
}

export type Assessment = {
    id: string
    name: string
    weight: number
    position: number
    status: string
    // The approver's note, set only while the assessment is RETURNED - what needs correcting.
    returnReason?: string | null
    createdAt: string
    updatedAt: string
}

export type ApprovalRequestStatus = "Pending Review" | "Approved" | "Returned"

export type AssessmentApprovalRequest = {
    id: string
    teacher: string
    subject: string
    assessment: string
    term: string
    // Full class name - class, section and stream (e.g. "JSS 1 A Science").
    clazz: string
    // The class session it was submitted for.
    classId: string
    status: ApprovalRequestStatus
    studentCount: number
    avg: number
    avgPercentage: number
    avergeScore: number
    passPercentage: number
    pass: number
    fail: number
    failPercentage: number
    time: string
    note: string
    studentScores: AssessmentScore[]
    teacherSubjectId: string
    assessmentId: string
    termId: string
    // The class master taught this subject themselves, so an admin/proprietor/owner reviews it instead.
    requiresAdminReview?: boolean
    // Who approves grades for this class: its section's choice, else the school's.
    approver?: 'CLASS_MASTER' | 'ADMIN'
}

export type AssessmentApprovalSummary = {
    pending: number
    approved: number
    returned: number
}

export type LeaderBoard = {
    id: string
    rank: number
    name: string
    score: number
    weight: number
    assessments: {
        assessmentId: string
        assessmentName: string
        score: number
        weight: number
        weightedScore: number
    }[]
    grade: string
    trend: string
}

export type Breakdown = {
    id: string
    name: string
    // Weighted percentage over the assessments approved so far - null until one is.
    score: number | null
    scores: AssessmentScore[]
    // Latest approved test against the one before it - null with fewer than two.
    trend: string | null
    grade: string | null
    // Whether score clears passMark - null until something is approved.
    passed: boolean | null
    passMark: number
    // Assessments approved so far, out of all this subject has this term.
    assessed: number
    total: number
}

export type ApprovalRequestDTO = {
    note: string
}

export type AssessmentScore = {
    id: string
    name: string
    assessment: string
    score: number
    student: string
    // The student's profile photo URL, null when none was uploaded.
    studentPhoto?: string | null
    weight: number
    weightScore: number
    trend?: string
    grade?: string
    status: string
    // Only on assessments opened as Continuous Assessment - the breakdown behind the (simple) score.
    continuous?: ContinuousBreakdown | null
}

export type AssessmentStructure = "SIMPLE" | "CA_AND_TEST"

// One named part of the continuous assessment ("Attendance", "Assignment") and its share of the WHOLE assessment.
// The parts plus the formal test total 100. Part n is CA recording no. n.
// source: MANUAL = the teacher records it; ATTENDANCE = filled in from the attendance register (days present or
// late over the term's school days) and read-only.
export type CaComponent = { name: string, weight: number, source?: 'MANUAL' | 'ATTENDANCE' }
export type CaFrequency = "DAILY" | "WEEKLY" | "MID_WEEK" | "CUSTOM"

// What one student's CA assessment was opened with (frozen - later configuration changes don't touch it)
// and what has been recorded so far.
export type ContinuousBreakdown = {
    structure: AssessmentStructure
    caPercentage: number
    formalPercentage: number
    caFrequency: CaFrequency
    caUnit: string
    caEntries: number
    configVersion: number
    caScore: number | null
    formalScore: number | null
    caPoints: number
    formalPoints: number
    caEntryScores: (number | null)[]
    // The CA recordings were submitted as complete - only then can the formal test be entered.
    caSubmitted: boolean
    // Recording slots (1 = Week 1) that are locked: completed for every student and closed to editing.
    lockedWeeks: number[]
    // Named, weighted CA parts (empty when the CA is plain equal recordings) and the formal part's own name.
    caComponents?: CaComponent[]
    formalLabel?: string | null
}

export type AssessmentConfiguration = {
    managementSectionId: string | null
    sectionName: string | null
    structure: AssessmentStructure
    caEnabled: boolean
    caPercentage: number
    formalPercentage: number
    caFrequency: CaFrequency | null
    caFrequencyUnit: string | null
    caEntries: number
    version: number
    isDefault: boolean
    inherited: boolean
    updatedAt: string | null
    updatedBy: string | null
    // Per-term, per-assessment overrides (anything not listed follows the defaults).
    plan: AssessmentPlanItem[]
    // The CA split into named, weighted parts (empty = equal recordings) and the formal part's name.
    caComponents: CaComponent[]
    formalLabel: string | null
    // Set when this is an assessment template's own configuration.
    assessmentTemplateId?: string | null
}

export type AssessmentPlanItem = {
    termId: string
    assessmentName: string
    usesCa: boolean
    caEntries: number
    // This assessment's own CA parts (they replace the defaults' and set its CA/formal split).
    caComponents?: CaComponent[]
    formalLabel?: string | null
}

export type SaveAssessmentConfigurationDto = {
    structure: AssessmentStructure
    caPercentage?: number
    formalPercentage?: number
    caFrequency?: CaFrequency | null
    caEntries?: number
    plan?: AssessmentPlanItem[]
    caComponents?: CaComponent[]
    formalLabel?: string | null
    // Also move assessments nobody has graded yet onto the new setup (default true).
    applyToUnstarted?: boolean
}

export type SaveAssessmentConfigurationResponse = {
    configuration: AssessmentConfiguration
    refreshed: number | null
    skipped: number | null
}

export type RecordContinuousDto = {
    assessmentId: string
    termId: string
    records: {
        scoreId: string
        entries?: { entryNumber: number, score: number | null }[]
        formalScore?: number | null
    }[]
}

export const CA_FREQUENCY_OPTIONS: { label: string, value: CaFrequency, hint: string }[] = [
    { label: 'Daily', value: 'DAILY', hint: 'A CA mark every school day' },
    { label: 'Weekly', value: 'WEEKLY', hint: 'A CA mark each week' },
    { label: 'Mid-week', value: 'MID_WEEK', hint: 'A CA mark in the middle of each week' },
    { label: 'Custom', value: 'CUSTOM', hint: 'Teachers record activities as they happen' }
]

export const CA_UNITS: Record<CaFrequency, { singular: string, plural: string }> = {
    DAILY: { singular: 'Day', plural: 'days' },
    WEEKLY: { singular: 'Week', plural: 'weeks' },
    MID_WEEK: { singular: 'Mid-week', plural: 'mid-weeks' },
    CUSTOM: { singular: 'Activity', plural: 'activities' }
}

// "Week 3", "Day 12", "Activity 2" - what a recording is called.
export function caRecordingLabel(frequency: CaFrequency, n: number) {
    return `${CA_UNITS[frequency].singular} ${n}`
}

// The same arithmetic the server uses (ContinuousAssessmentCalculator) - only to preview a row while a
// teacher types; the server's answer is what is saved.
export function caComponentOf(recordings: (number | null | undefined)[], weights?: number[]): number | null {
    if (!weights?.length) {
        const given = recordings.filter((v): v is number => v !== null && v !== undefined && !Number.isNaN(v))
        if (!given.length) return null
        return Math.round(given.reduce((a, b) => a + b, 0) / given.length)
    }
    // Weighted by each part's share, over the parts recorded so far.
    let sum = 0, weightSum = 0
    recordings.forEach((v, i) => {
        const w = weights[i]
        if (v === null || v === undefined || Number.isNaN(v) || !w) return
        sum += v * w
        weightSum += w
    })
    return weightSum ? Math.round(sum / weightSum) : null
}

// What one recording is called: the part's own name ("Attendance") when the CA has named parts, else "Week 3".
export function caPartLabel(c: { caFrequency: CaFrequency, caComponents?: CaComponent[] }, n: number) {
    return c.caComponents?.[n - 1]?.name ?? caRecordingLabel(c.caFrequency, n)
}

// "parts" for named parts, else the frequency's unit ("weeks").
export function caPartsNoun(c: { caFrequency: CaFrequency, caComponents?: CaComponent[] }) {
    return c.caComponents?.length ? { singular: 'Part', plural: 'parts' } : CA_UNITS[c.caFrequency]
}

// Part n is filled in from the attendance register (read-only for the teacher).
export function caPartIsAuto(c: { caComponents?: CaComponent[] } | null | undefined, n: number) {
    return c?.caComponents?.[n - 1]?.source === 'ATTENDANCE'
}

export function caFormalName(c?: { formalLabel?: string | null } | null) {
    return c?.formalLabel || 'Formal test'
}

export function caWeights(c?: { caComponents?: CaComponent[] } | null) {
    return c?.caComponents?.map(p => p.weight) ?? []
}

export function caPoints(component: number | null | undefined, percentage: number) {
    return component === null || component === undefined ? 0 : Math.round(component * percentage / 10) / 10
}

export function caCombine(ca: number | null | undefined, formal: number | null | undefined, caPct: number, formalPct: number) {
    return Math.round((ca ?? 0) * caPct / 100 + (formal ?? 0) * formalPct / 100)
}

// The first CA breakdown any student has for an assessment - it is the same structure for the whole class.
export function continuousOf(rows: StudentAssessment[], assessmentId: string): ContinuousBreakdown | null {
    for (const r of rows) {
        const c = r.scores.find(s => s.assessment === assessmentId)?.continuous
        if (c && c.structure === 'CA_AND_TEST') return c
    }
    return null
}

// --- Insight: reading the CA recordings that are already stored, without any AI - just arithmetic over
// the structured data every recording leaves behind (see the assessment-configuration memory note). ---

export type CaTrend = 'improving' | 'declining' | 'steady' | 'not-enough-data'

export const CA_TREND_LABEL: Record<CaTrend, string> = {
    improving: 'Improving',
    declining: 'Declining',
    steady: 'Steady',
    'not-enough-data': 'Not enough data yet'
}

// Compares the average of the earlier recordings to the later ones - at least 2 recordings needed, and
// the difference has to clear a small margin before it counts as a real trend rather than noise.
export function caTrendOf(recordings: (number | null | undefined)[]): { trend: CaTrend, delta: number } {
    const given = recordings.filter((v): v is number => v !== null && v !== undefined && !Number.isNaN(v))
    if (given.length < 2) return { trend: 'not-enough-data', delta: 0 }

    const mid = Math.ceil(given.length / 2)
    const earlier = given.slice(0, mid)
    const later = given.slice(mid).length ? given.slice(mid) : given.slice(-1)
    const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length
    const delta = Math.round((avg(later) - avg(earlier)) * 10) / 10

    const trend: CaTrend = delta >= 5 ? 'improving' : delta <= -5 ? 'declining' : 'steady'
    return { trend, delta }
}

export type CaClassInsight = {
    recorded: number
    total: number
    avgCa: number | null
    avgFormal: number | null
    // avgCa and avgFormal on the same 0-100 scale, so the gap says whether the class does better in
    // continuous work than in the formal test, or the other way round.
    gap: number | null
    improving: number
    declining: number
    // Recorded CA but no formal test yet (or the reverse) - one side of the picture is still missing.
    needsAttention: { studentId: string, name: string, reason: string }[]
}

// A class-level read of one CA assessment's recordings so far - averages, whether the class is trending
// up or down, and who still needs a look. Computed entirely from what's already on the page.
export function caClassInsight(rows: StudentAssessment[], assessmentId: string): CaClassInsight | null {
    const structure = continuousOf(rows, assessmentId)
    if (!structure) return null

    const caScores: number[] = []
    const formalScores: number[] = []
    let improving = 0, declining = 0
    const needsAttention: CaClassInsight['needsAttention'] = []

    for (const row of rows) {
        const c = row.scores.find(s => s.assessment === assessmentId)?.continuous
        if (!c) continue
        if (c.caScore !== null && c.caScore !== undefined) caScores.push(c.caScore)
        if (c.formalScore !== null && c.formalScore !== undefined) formalScores.push(c.formalScore)

        const { trend } = caTrendOf(c.caEntryScores)
        if (trend === 'improving') improving++
        if (trend === 'declining') declining++

        if (trend === 'declining') {
            needsAttention.push({ studentId: row.id, name: row.name, reason: 'CA scores trending down' })
        } else if (c.caScore !== null && c.caScore !== undefined && c.caScore < 40) {
            needsAttention.push({ studentId: row.id, name: row.name, reason: 'CA average below 40%' })
        } else if ((c.formalScore === null || c.formalScore === undefined) && c.caEntryScores.some(v => v !== null)) {
            needsAttention.push({ studentId: row.id, name: row.name, reason: 'Formal test not yet recorded' })
        }
    }

    const avg = (xs: number[]) => xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : null
    const avgCa = avg(caScores)
    const avgFormal = avg(formalScores)

    return {
        recorded: caScores.length,
        total: rows.length,
        avgCa,
        avgFormal,
        gap: avgCa !== null && avgFormal !== null ? avgCa - avgFormal : null,
        improving,
        declining,
        needsAttention: needsAttention.slice(0, 5)
    }
}

export type Grade = {
    id: string
    name: string
    assessment: string
    term: string
    subject: string
    teacher: string
    student: string
    score: number
    weight: number
    avarage?: number
    trend?: string
    weightScore: number
    grade?: string
    status: string
}

export type StudentAssessment = {
    id: string
    name: string
    photo?: string
    scores: AssessmentScore[]
    total?: number
    position?: any
    allCompleted?: boolean
    status: string
    createdAt: string
    updatedAt: string
}

export type ScoreStatus = "DRAFT" | "SUBMITTED" | "RETURNED" | "APPROVED" | "COMPLETED" | "LOCKED"

export function isEditableStatus(status: ScoreStatus) {
    return status === "DRAFT" || status === "RETURNED"
}

export function statusBadgeColor(status: any) {
    switch (status) {
        case "DRAFT":
            return "warning"
        case "SUBMITTED":
            return "info"
        case "RETURNED":
            return "error"
        case "APPROVED":
        case "COMPLETED":
            return "success"
        case "LOCKED":
        default:
            return "neutral"
    }
}

export function getStudentScore(student: StudentAssessment, assessmentId: string) {
    return student.scores.find(score => score.assessment === assessmentId)
}

export function toNumberInRange(value: unknown, min: number, max: number) {
    const parsed = Number(value)
    if (Number.isNaN(parsed)) return min
    return Math.min(max, Math.max(min, parsed))
}

export function updateStudentScore(student: StudentAssessment, assessmentId: string, value: unknown) {
    const score = getStudentScore(student, assessmentId)
    if (!score) return
    score.score = toNumberInRange(value, 0, 100)
}

export type ActiveAssessmentCycle = {
    activeTerm: Term | null
    templateId: string | null
    templateName: string | null
    templateDescription: string | null
    assessments: Assessment[]
    totalWeight: number
    ready: boolean
}

export type ClassAssessmentCycleStatus = {
    classId: string
    className: string
    templateId: string | null
    templateName: string | null
    assessmentCount: number
    totalWeight: number
    templateLocked: boolean
    ready: boolean
    note: string
}

export type AssessmentCycleOverview = {
    activeTerm: Term | null
    totalClasses: number
    readyClasses: number
    notReadyClasses: number
    classes: ClassAssessmentCycleStatus[]
}

export type AssessmentCycleAdvance = {
    termId: string
    currentPosition: number
    nextPosition: number | null
    totalPositions: number
    advanced: boolean
    completed: boolean
    message: string
    // The section that was moved, and whether it has closed its last assessment of the term (the term itself stays
    // open until every section has).
    sectionId?: string | null
    sectionName?: string | null
    sectionCompleted?: boolean
}

export type GradeBand = {
    minScore: number
    maxScore: number
    grade: string
}

export type GradingScale = {
    bands: GradeBand[]
}

export type UpdateGradingScaleDto = {
    bands: GradeBand[]
}

export type CreateAssessmentTemplateDto = {
    name: string
    description: string
}

export type AssessmentAssignmentDto = {
    name: string
    weight: number
}

export type AssignAssessmentsDto = {
    assignments: AssessmentAssignmentDto[]
}

export type GradeScoreDto = {
    id: string
    score: number
}

export type GradeAssessmentDto = {
    assessmentId: string
    termId: string
    grades: GradeScoreDto[]
}

export type SubmitAssessmentDto = {
    assessmentId: string
    termId: string
    note: string
}

export type ReopenAssessmentDto = {
    assessmentId: string
    termId: string
    note: string
}

// What is wrong with a set of CA parts, or '' when they are usable: named, unique, each 1-99%, and leaving room
// for the formal test (the parts total 1-99%).
export function partsProblem(parts: CaComponent[]): string {
    if (!parts.length) return 'Add at least one part.'
    const names = new Set<string>()
    let total = 0
    if (parts.filter(p => p.source === 'ATTENDANCE').length > 1) return 'Only one part can come from attendance.'
    for (const p of parts) {
        const name = (p.name ?? '').trim()
        if (!name) return 'Every part needs a name.'
        if (/[|:;\n]/.test(name)) return `“${name}” can't contain | : ; or a line break.`
        if (names.has(name.toLowerCase())) return `“${name}” is listed twice.`
        names.add(name.toLowerCase())
        const w = Number(p.weight)
        if (!Number.isInteger(w) || w < 1 || w > 99) return `“${name}” must be worth a whole number from 1% to 99%.`
        total += w
    }
    if (total > 99) return `The parts total ${total}% - that leaves nothing for the final part. Keep them under 100%.`
    return ''
}
