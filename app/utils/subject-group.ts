export type SubjectGroup = {
    id: string
    name: string
    streamName: string
    totalSelection: string
}

export type CreateSubjectGroupDto = {
    name: string
    streamId: string
    classId: string
    totalSelection: number
}