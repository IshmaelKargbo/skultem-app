export type Stream = {
    id: string
    name: string
    description: string
    createdAt: string
    updatedAt: string
}

export type CreateStreamDto = {
    name: string
    description: string
}