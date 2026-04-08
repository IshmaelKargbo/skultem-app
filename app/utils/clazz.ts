export type Clazz = {
    id: string
    name: string
    level: string
    levelOrder: number
    nextClass: string | null
    streamId: string
    terminal: boolean
    createdAt: string
    updatedAt: string
}

export type ClassStream = {
    id: string
    clazz: Clazz
    stream: Stream
    createdAt: string
    updatedAt: string
}

export type ClassSection = {
    id: string
    clazz: Clazz
    section: Section
    createdAt: string
    updatedAt: string
}

export type ClassSession = {
    id: string
    clazz: string
    clazzId: string
    streamName: string
    grade: string
    streamId: string
    sectionName: string
    sectionId: string
    teacherName: string
    teacherId: string
    totalStudent: number
    classLevel: string
    feeDetail: {
        total: number
        balance: number
        paid: number
        status: string
    }
}

export type ClassTeacher = {
    id: string
    userId: string
    staffId: string
    givenNames: string
    familyName: string
    streamId: string
    streamName: string
}

export type CreateClassDto = {
    name: string
    level: Level,
    sections: string[],
    levelOrder: number,
    terminal?: boolean,
    streams: string[],
    assessmentTemplateId?: string
}

export type ClassCurriculumSubject = {
    id: string
    name: string
    code: string
    description: string
    createdAt: string
    updatedAt: string
}

export type ClassCurriculumOptionGroup = {
    groupId: string
    name: string
    select: number
    list: ClassCurriculumSubject[]
}

export type ClassCurriculum = {
    core: ClassCurriculumSubject[]
    options: ClassCurriculumOptionGroup[]
}

export type AssignStudentsDto = {
    classId: string
    students: string[],
    sectionId: string,
    streamId: string
}

export type AssignMastertsDto = {
    teacherId: string,
    sectionId: string,
    streamId: string
}

export type Address = {
    region: string
    district: string
    chiefdom: string
    city: string
    street: string
}
