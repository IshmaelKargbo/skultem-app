export type Teacher = {
    id: string
    title: string
    user: User
    gender: string
    staffId: string
    street: string
    city: string
    phone: string
    classes: string[]
    status: string
    designation: string | null
    teaching: boolean
    createdAt: string
    updatedAt: string
}

export type ClassMaster = {
    id: string
    teacher: Teacher
    session: ClassSession
}

export type TeacherClassMasterPromotionStatus = 'READY' | 'PENDING_REVIEW' | 'RETURNED' | 'APPROVED' | null

export type TeacherClassMaster = {
    classMasterId: string
    sessionId: string
    classId: string
    sessionName: string
    className: string
    studentCount: number
    promotionStatus: TeacherClassMasterPromotionStatus
}

export type TeacherSubject = {
    id: string
    teacherId: string
    teacherName: string
    subjectId: string
    subjectName: string
    className: string
    classId: string
    sessionId: string
    sectionName: string
    sectionId: string
    streamName: string
    streamId: string
    assignedAt: string
    createdAt: string
    updatedAt: string
}

export type CreateTeacherSubjectDto = {
    assignments: AssignmentTeacherSubject[]
}

export type CreateTeacherDto = {
    givenNames: string
    familyName: string
    staffId: string
    classMaster: string
    gender: string
    title: string
    city: string
    street: string
    phone: string
    email: string
    designation?: string
    // Defaults to true when omitted. The Add Staff form passes false for staff who won't use the
    // portal - their account still gets created, they just never get emailed the credentials.
    sendWelcomeEmail?: boolean
    // Defaults to true when omitted. The Add Staff form passes false - drives whether the
    // Subjects/Curriculum tabs show on their profile.
    teaching?: boolean
}

export type EditTeacherDTO = {
    givenNames: string
    familyName: string
    staffId: string
    gender: string
    title: string
    city: string
    street: string
    phone: string
    designation?: string
}
