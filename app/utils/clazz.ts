export type Clazz = {
    id: string
    name: string
    level: string
    levelOrder: number
    nextClass: Clazz | null
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
    sectionName?: string
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

export type ClassOverview = {
    clazz: Clazz
    sectionCount: number
    streamCount: number
    classMasterCount: number
    sections: ClassSection[]
    streams: ClassStream[]
    classMasters: ClassMaster[]
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

export type CreateClassSessionDto = {
    classId: string
    academicYear: string
    sectionId: string
    streamId?: string | null
}

export type Address = {
    region: string
    district: string
    chiefdom: string
    city: string
    street: string
}

// The class detail page (pages/classes/[id]/index.vue) shows every student in the
// class when no stream is given, and just that stream's roster when one is - e.g.
// SSS1 Art and SSS1 Science are different rosters under the same class. Admin's
// class list already builds this correctly (components/class/admin/index.vue); use
// this everywhere else that links into a class so a streamed class doesn't end up
// showing every stream's students mixed together. streamId must stay nullish (not
// an empty string) for a class with no streams, or `?stream=` would round-trip as a
// non-empty "stream" query value and the page would (wrongly) try to filter by it.
export function classRosterUrl(classId: string, streamId?: string | null) {
    return streamId ? `/classes/${classId}?stream=${streamId}` : `/classes/${classId}`
}
