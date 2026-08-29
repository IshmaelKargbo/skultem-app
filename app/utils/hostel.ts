export type HostelType = 'MIXED' | 'MALE' | 'FEMALE' | 'STAFF'

export type Hostel = {
    id: string
    name: string
    type: HostelType
    capacity: number
    rooms: number
    supervisor: string
    createdAt: string
    updatedAt: string
}

export type CreateHostelDto = {
    name: string
    type: HostelType
    capacity: number
    rooms: number
    supervisor: string
}

export type UpdateHostelDto = CreateHostelDto & {
    id: string
}

export const hostelTypeOptions: { label: string, value: HostelType }[] = [
    { label: 'Mixed', value: 'MIXED' },
    { label: 'Male', value: 'MALE' },
    { label: 'Female', value: 'FEMALE' },
    { label: 'Staff', value: 'STAFF' }
]

export const parseHostelType: Record<HostelType, string> = {
    MIXED: 'Mixed',
    MALE: 'Male',
    FEMALE: 'Female',
    STAFF: 'Staff'
}

export type RoomType = {
    id: string
    name: string
    description: string
    capacity: number
    price: number
    createdAt: string
    updatedAt: string
}

export type CreateRoomTypeDto = {
    name: string
    description: string
    capacity: number
    price: number
}

export type UpdateRoomTypeDto = CreateRoomTypeDto & {
    id: string
}

// Named HostelRoom, not Room - utils/timetable.ts has its own, unrelated Room type (a scheduling
// venue) and Nuxt auto-imports both files' exports into the same global namespace, so a bare
// "Room" here would silently collide with (and lose to) timetable's.
export type HostelRoom = {
    id: string
    name: string
    hostel: Hostel
    type: RoomType
    createdAt: string
    updatedAt: string
}

export type CreateRoomDto = {
    name: string
    hostelId: string
    typeId: string
}

export type UpdateRoomDto = CreateRoomDto & {
    id: string
}

export type AllocationStatus = 'ACTIVE' | 'VACATED'

export type Allocation = {
    id: string
    room: HostelRoom
    studentName: string
    admissionNo: string
    className: string
    allocatedAt: string
    vacatedAt: string | null
    status: AllocationStatus
}

export type AllocateStudentDto = {
    roomId: string
    studentName: string
    admissionNo: string
    className: string
}

type AllocationStatusStyle = {
    label: string
    color: 'success' | 'neutral'
}

export const allocationStatusStyle: Record<AllocationStatus, AllocationStatusStyle> = {
    ACTIVE: { label: 'Active', color: 'success' },
    VACATED: { label: 'Vacated', color: 'neutral' }
}
