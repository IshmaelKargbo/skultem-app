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

export type Timing = {
    id: string
    startTime: string
    endTime: string
    periodDuration: number
    breakDuration: number
    lunchDuration: number
    createdAt: string
    updatedAt: string
}

export type CreateTimingDTO = {
    startTime: string
    endTime: string
    periodDuration: number
    breakDuration: number
    lunchDuration: number
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