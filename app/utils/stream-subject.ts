export type StreamSubject = {
    id: string
    streamName: string
    streamId: string
    subjectName: string
    subjectId: string
    mandatory: boolean
    groupId: string
    groupName: string
    createdAt: string
    updatedAt: string
}

export type CreateStreamSubjectDto = {
    assignments: AssignmentSubject[]
}