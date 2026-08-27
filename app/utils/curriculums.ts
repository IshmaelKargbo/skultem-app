export type SchemeOfWork = {
    id: string
    session: string
    sessionId: string
    startDate: string
    subject: string
    subjectId: string
    term: string
    termId: string
    endDate: string
    weeks: number
    state: string
    progressState: LessonState
    createdAt: string
    updatedAt: string
}

export type SchemeOfWorkFilter = {
    subjectId?: string
    sessionId?: string
    termId?: string
    progress?: LessonState
}

export type SchemeProgress = {
    id: string
    completed: number
    totalWeeks: number
    remaining: number
    coverage: number
}

export type CreateSchemeOfWork = {
    session: string
    subject: string
    term: string
}

export type Week = {
    id: string
    schemeId: string
    topic: string
    subTopic: string
    week: number
    objectives: string[]
    state: string
}

export type CreateWeek = {
    scheme: string
    topic: string
    subtopic: string
    week: number
    objectives: string[]
}

// A lesson note stage (Introduction / Development / Conclusion), recording
// what the teacher does and what pupils do at that stage.
export type LessonStage = {
    stage: string
    teacherActivity: string
    pupilsActivity: string
}

export type LessonState = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'

// Shared color mapping for NOT_STARTED / IN_PROGRESS / COMPLETED badges,
// used for both week/lesson state and a scheme's rolled-up progress state.
export function getLessonStateColor(state: string) {
    switch (state) {
        case 'COMPLETED':
            return 'success'
        case 'IN_PROGRESS':
            return 'warning'
        case 'NOT_STARTED':
        default:
            return 'neutral'
    }
}

// A single day's lesson note, written against a week of the scheme of work.
export type Lesson = {
    id: string
    weekId: string
    topic: string
    subTopic: string
    title: string
    content: string
    date: string
    duration: string | null
    objectives: string[]
    previousKnowledge: string | null
    teachingAids: string[]
    referenceMaterials: string[]
    presentation: LessonStage[]
    evaluation: string | null
    assignment: string | null
    state: LessonState
    createdAt: string
    updatedAt: string
}

export type TeacherProgressStatus = 'NO_DATA' | 'BEHIND' | 'ON_TRACK' | 'COMPLETED'

// A teacher's aggregate scheme of work coverage, across every subject/class they teach.
export type TeacherProgress = {
    id: string
    name: string
    subjects: number
    classes: number
    completedWeeks: number
    totalWeeks: number
    coverage: number
    status: TeacherProgressStatus
}

export type SubjectCoverage = {
    subject: string
    classes: string
    completedWeeks: number
    totalWeeks: number
    coverage: number
}

export type TeacherProgressDetail = {
    id: string
    name: string
    subjects: number
    classes: number
    lessonNotes: number
    completedWeeks: number
    totalWeeks: number
    coverage: number
    status: TeacherProgressStatus
    subjectCoverage: SubjectCoverage[]
}

export type CreateLesson = {
    week: string
    title: string
    content: string
    date: string
    duration?: string
    objectives: string[]
    previousKnowledge?: string
    teachingAids: string[]
    referenceMaterials: string[]
    presentation: LessonStage[]
    evaluation?: string
    assignment?: string
}
