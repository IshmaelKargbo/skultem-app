export type Holiday = {
    id: string
    name: string
    kind: string
    date: string
    fixed: boolean
    createdAt: string
    updatedAt: string
}

export type CreateHolidayDto = {
    name: string
    kind: string
    date: string
    fixed: boolean
}