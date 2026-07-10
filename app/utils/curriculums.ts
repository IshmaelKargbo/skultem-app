export type SchemeOfWork = {
    id: string
    session: string
    sessionId: string
    startDate: string
    subject: boolean
    subjectId: string
    term: string
    endDate: string
    state: string
    createdAt: string
    updatedAt: string
}

export type SchemeProgress = {
    id: string
    completed: number
    totalWeeks: number
    remaining: number
    coverage: number
}

export type CreateSchemeOfWork = {
    session: string
    subject: string
    term: string
}

export type Week = {
    id: string
    topic: string
    subTopic: string
    week: number
    objectives: string[]
    state: string
}

export type CreateWeek = {
    scheme: string
    topic: string
    subtopic: string
    week: number
    objectives: string[]
}