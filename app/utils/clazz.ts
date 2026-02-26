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
    streamId: string
    sectionName: string
    sectionId: string
    totalStudent: number
    classLevel: string
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
    streams: string[]
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