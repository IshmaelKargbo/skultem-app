export type AcademicYear = {
    id: string
    name: string
    startDate: string
    active: boolean
    endDate: string
    status: string
    nextYearId: string | null
    nextYearName: string | null
    createdAt: string
    updatedAt: string
}

export type ConfigureNextAcademicYearDto = {
    name?: string
    startDate?: string
    endDate?: string
}

export type ConfigureNextAcademicYearResult = {
    academicYear: AcademicYear
    terms: Term[]
} 