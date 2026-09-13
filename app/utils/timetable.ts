export type Room = {
    id: string
    name: string
    no: string
    description: string
    createdAt: string
    updatedAt: string
}

export type CreateRoomDTO = {
    name: string
    no: string
    description: string
}

export type UpdateRoomDTO = {
    id: string
    name: string
    no: string
    description: string
}

// Matches the backend's Level enum (com.moriba.skultem.domain.vo.Level) values exactly -
// deliberately not the existing `Level` enum in utils/common.ts, whose member values
// ('Primary'/'JSS'/'SSS') don't match the API's raw PRIMARY/JSS/SSS strings.
export type SchoolLevel = 'PRIMARY' | 'JSS' | 'SSS'

export const SCHOOL_LEVEL_OPTIONS: { label: string, value: SchoolLevel }[] = [
    { label: 'Primary', value: 'PRIMARY' },
    { label: 'JSS', value: 'JSS' },
    { label: 'SSS', value: 'SSS' },
]

export function schoolLevelLabel(level: SchoolLevel): string {
    return SCHOOL_LEVEL_OPTIONS.find(o => o.value === level)?.label || level
}

// A named, reusable school-day schedule - a school can have several (e.g. "Default", "Primary",
// "JSS/SSS"), each assignable to one or more Levels. isDefault marks the fallback used by any
// Level with no template of its own (see TimingLevel).
export type Timing = {
    id: string
    name: string
    isDefault: boolean
    startTime: string
    endTime: string
    periodDuration: number
    breakDuration: number
    lunchDuration: number
    levels: SchoolLevel[]
    createdAt: string
    updatedAt: string
}

export type CreateTimingDTO = {
    name: string
    startTime: string
    endTime: string
    periodDuration: number
    breakDuration: number
    lunchDuration: number
}

// Which Timing template a Level currently uses.
export type TimingLevel = {
    level: SchoolLevel
    timingId: string
    timingName: string
}

export type WorkingDay = {
    id: string
    day: string
    timing?: Timing
    state: boolean
    createdAt: string
    updatedAt: string
}

export type SetWorkingDTO = {
    timingId: string
    days: {
        day: string
        state: boolean
    }[]
}

export type Timetable = {
    id: string
    subject: string
    subjectId: string
    room: string
    roomId: string
    color: string
    teacher: string
    createdAt: string
    updatedAt: string
}

export type Period = {
    id: string
    startTime: string
    endTime: string
    name: string
    isBreak: boolean
    isLunch: boolean
    subjects: Timetable[]
    createdAt: string
    updatedAt: string
}

export type CreatePeriodDTO = {
    session: string
}

export type CreateTimetableDTO = {
    subject: string
    period: string
    room: string
    day: string
    color: string
}