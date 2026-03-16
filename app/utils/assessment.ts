export type AssessmentTemplate = {
    id: string
    name: string
    description: string
    assessments: Assessment[],
    createdAt: string,
    updatedAt: string
}

export type Assessment = {
    id: string
    name: string
    weight: number
    position: number
    status: string
}

export type ApprovalRequestStatus = "Pending Review" | "Approved" | "Returned"

export type AssessmentApprovalRequest = {
    id: string
    teacher: string
    subject: string
    assessment: string
    class: string
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
}

export type ApprovalRequestDTO = {
    note: string
}

export type AssessmentScore = {
    id: string
    name: string
    assessment: string
    score: number
    weight: number
    weightScore: number
    grade?: string
    status: string
}

export type Grade = {
    id: string
    name: string
    assessment: string
    term: string
    teacher: string
    student: string
    score: number
    weight: number
    weightScore: number
    grade?: string
    status: string
}

export type StudentAssessment = {
    id: string
    name: string
    scores: AssessmentScore[]
    status: string
    createdAt: string
    updatedAt: string
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
