export type SubjectGroup = {
    id: string
    name: string
    level: string
    streamName: string
    minSelection: string
    maxSelection: string
    required: boolean
    displayOrder: number
}

export type CreateSubjectGroupDto = {
    name: string
    level: string
    streamId: string
    classId: string
    required: boolean
    minSelection: number
    maxSelection: number
    displayOrder: number
}