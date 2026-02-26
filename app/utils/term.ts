export type Term = {
    id: string
    name: string
    startDate: string
    termNumber: number
    academicYear: AcademicYear
    endDate: string
    status: string
    createdAt: string
    updatedAt: string
}

export type CreateTermDto = {
    name: string
    startDate: string
    academicYearId: string
    endDate: string
}