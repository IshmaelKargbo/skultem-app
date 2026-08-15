export type PromotionOutcome = 'PROMOTE' | 'REPEAT' | 'GRADUATE'

export type PromotionCandidate = {
    studentId: string
    enrollmentId: string
    name: string
    admissionNumber: string
    outcome: PromotionOutcome
    targetClassId: string | null
    targetClassName: string | null
}

export type PromotionBatch = {
    id: string
    fromClassId: string
    fromClassName: string
    toClassName: string
    promotedCount: number
    repeatedCount: number
    graduatedCount: number
    totalCount: number
    performedBy: string
    performedAt: string
    students: PromotionCandidate[]
    isDemo: boolean
}

export const promotionOutcomes = [
    { label: 'Promote', value: 'PROMOTE' },
    { label: 'Repeat', value: 'REPEAT' },
    { label: 'Graduate', value: 'GRADUATE' }
]

type PromotionOutcomeStyle = {
    label: string
    color: 'success' | 'warning' | 'info'
}

export const promotionOutcomeStyle: Record<PromotionOutcome, PromotionOutcomeStyle> = {
    PROMOTE: { label: 'Promote', color: 'success' },
    REPEAT: { label: 'Repeat', color: 'warning' },
    GRADUATE: { label: 'Graduate', color: 'info' }
}
