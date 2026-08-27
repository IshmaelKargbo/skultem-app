export type PromotionOutcome = 'PROMOTE' | 'REPEAT'

export type PromotionRequestStatus = 'PENDING_REVIEW' | 'RETURNED' | 'APPROVED'

export type PromotionRequestItem = {
    studentId: string
    enrollmentId: string
    studentName: string
    admissionNumber: string
    outcome: PromotionOutcome
    remark: string | null
    targetStreamId: string | null
    targetStreamName: string | null
    average: number | null
}

export type PromotionRequest = {
    id: string
    sessionId: string
    sessionName: string
    classMasterName: string
    academicYearName: string
    targetClassName: string | null
    status: PromotionRequestStatus
    teacherNote: string | null
    returnReason: string | null
    approvalNote: string | null
    promoteCount: number
    repeatCount: number
    promotedCount: number
    repeatedCount: number
    submittedAt: string
    executedAt: string | null
    items: PromotionRequestItem[]
}

export type RosterStudent = {
    studentId: string
    enrollmentId: string
    studentName: string
    admissionNumber: string
    average: number | null
    suggestedOutcome: PromotionOutcome | null
}

export type PromotionRoster = {
    sessionName: string
    targetClassName: string | null
    eligible: boolean
    ineligibleReason: string | null
    requiresStreamSelection: boolean
    availableStreams: Stream[]
    students: RosterStudent[]
}

export type PromotionConfig = {
    minPassMark: number | null
    maxRepeatCount: number
    requireApproval: boolean
    requireRemarkForPromote: boolean
}

export type PromotionProgress = {
    academicYearName: string
    totalSessions: number
    completedSessions: number
    pendingSessions: number
    readyToCloseYear: boolean
    nextAcademicYearConfigured: boolean
    nextAcademicYearName: string | null
    outstandingPlatformFee: number
}

type PromotionStatusStyle = {
    label: string
    color: 'warning' | 'error' | 'success'
}

export const promotionRequestStatusStyle: Record<PromotionRequestStatus, PromotionStatusStyle> = {
    PENDING_REVIEW: { label: 'Pending Review', color: 'warning' },
    RETURNED: { label: 'Returned', color: 'error' },
    APPROVED: { label: 'Approved', color: 'success' }
}

export const promotionOutcomes = [
    { label: 'Promote', value: 'PROMOTE' },
    { label: 'Repeat', value: 'REPEAT' }
]
