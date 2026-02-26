export type ClassSubject = {
    id: string
    className: string
    classId: string
    subjectName: string
    subjectId: string
    mandatory: boolean
    teacherName: string
    teacherId: string
    groupId: string
    groupName: string
    createdAt: string
    updatedAt: string
}

export type CreateClassSubjectDto = {
    assignments: AssignmentSubject[]
}