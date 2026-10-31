export type SubjectGroup = {
    id: string
    name: string
    className: string
    classId: string
    streamName: string
    streamId: string
    totalSelection: number
}

export type EditSubjectGroupDto = {
    name: string
    totalSelection: number
}

export type CreateSubjectGroupDto = {
    name: string
    streamId: string
    classId: string
    totalSelection: number
}