export type Teacher = {
    id: string
    user: User
    staffId: string
    address: Address
    phone: string
    status: string
    createdAt: string
    updatedAt: string
}

export type ClassMaster = {
    id: string
    teacher: Teacher
    session: ClassSession
}

export type TeacherSubject = {
    id: string
    teacherId: string
    teacherName: string
    subjectId: string
    subjectName: string
    className: string
    classId: string
    sectionName: string
    sectionId: string
    streamName: string
    streamId: string
    createdAt: string
    updatedAt: string
}

export type CreateTeacherDto = {
    givenNames: string
    familyName: string
    staffId: string
    region: string
    district: string
    chiefdom: string
    city: string
    street: string
    phone: string
    email: string
}