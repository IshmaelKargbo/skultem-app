export type Subject = {
    id: string
    name: string
    code: string
    createdAt: string
    updatedAt: string
}

export type Enrollment = {
    id: string
    studentId: string
    stream?: Stream
    section: Section
    student: Student
    clazz: Clazz
}

export type CreateSubjectDto = {
    name: string
    code: string
    description: string
}