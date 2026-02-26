export type Section = {
    id: string
    name: string
    description: string
    createdAt: string
    updatedAt: string
}

export type CreateSectionDto = {
    name: string
    description: string
}