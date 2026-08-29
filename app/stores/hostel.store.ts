import { defineStore } from 'pinia'

function uid() {
    return Math.random().toString(36).slice(2, 10)
}

function daysFromNow(days: number) {
    const date = new Date()
    date.setDate(date.getDate() + days)
    return date.toISOString()
}

const seedRoomTypes: RoomType[] = [
    { id: 'rt-1', name: 'Single Room', description: 'Private accommodation for senior students who need quiet and focus.', capacity: 1, price: 550000, createdAt: daysFromNow(-120), updatedAt: daysFromNow(-30) },
    { id: 'rt-2', name: 'Double Room', description: 'Shared room with a balanced mix of comfort and affordability.', capacity: 2, price: 350000, createdAt: daysFromNow(-120), updatedAt: daysFromNow(-30) },
    { id: 'rt-3', name: 'Triple Room', description: 'Practical rooming for students who want a moderate shared setup.', capacity: 3, price: 260000, createdAt: daysFromNow(-120), updatedAt: daysFromNow(-30) },
    { id: 'rt-4', name: 'Quad Room', description: 'Economical arrangement for larger allocations and steady demand.', capacity: 4, price: 220000, createdAt: daysFromNow(-120), updatedAt: daysFromNow(-30) }
]

const seedHostels: Hostel[] = [
    { id: 'hs-1', name: 'Main Hostel', type: 'MIXED', capacity: 120, rooms: 32, supervisor: 'Mr. Kamara', createdAt: daysFromNow(-200), updatedAt: daysFromNow(-10) },
    { id: 'hs-2', name: 'Girls Hostel', type: 'FEMALE', capacity: 80, rooms: 20, supervisor: 'Mrs. Bangura', createdAt: daysFromNow(-190), updatedAt: daysFromNow(-8) },
    { id: 'hs-3', name: 'Boys Hostel', type: 'MALE', capacity: 90, rooms: 24, supervisor: 'Mr. Conteh', createdAt: daysFromNow(-180), updatedAt: daysFromNow(-6) },
    { id: 'hs-4', name: 'Staff Residence', type: 'STAFF', capacity: 40, rooms: 12, supervisor: 'Mr. Jalloh', createdAt: daysFromNow(-170), updatedAt: daysFromNow(-4) }
]

const seedRooms: HostelRoom[] = [
    { id: 'rm-1', name: '12A', hostel: seedHostels[1]!, type: seedRoomTypes[3]!, createdAt: daysFromNow(-90), updatedAt: daysFromNow(-5) },
    { id: 'rm-2', name: '09C', hostel: seedHostels[2]!, type: seedRoomTypes[3]!, createdAt: daysFromNow(-90), updatedAt: daysFromNow(-5) },
    { id: 'rm-3', name: '21D', hostel: seedHostels[0]!, type: seedRoomTypes[1]!, createdAt: daysFromNow(-90), updatedAt: daysFromNow(-5) },
    { id: 'rm-4', name: '08B', hostel: seedHostels[1]!, type: seedRoomTypes[3]!, createdAt: daysFromNow(-90), updatedAt: daysFromNow(-5) },
    { id: 'rm-5', name: '16F', hostel: seedHostels[0]!, type: seedRoomTypes[2]!, createdAt: daysFromNow(-90), updatedAt: daysFromNow(-5) },
    { id: 'rm-6', name: '03G', hostel: seedHostels[2]!, type: seedRoomTypes[2]!, createdAt: daysFromNow(-90), updatedAt: daysFromNow(-5) }
]

const seedAllocations: Allocation[] = [
    { id: 'al-1', room: seedRooms[0]!, studentName: 'Amara Kamara', admissionNo: 'STD-1042', className: 'JSS 2A', allocatedAt: daysFromNow(-40), vacatedAt: null, status: 'ACTIVE' },
    { id: 'al-2', room: seedRooms[0]!, studentName: 'Hawa Bangura', admissionNo: 'STD-1111', className: 'JSS 2B', allocatedAt: daysFromNow(-35), vacatedAt: null, status: 'ACTIVE' },
    { id: 'al-3', room: seedRooms[1]!, studentName: 'Jude Conteh', admissionNo: 'STD-1098', className: 'SSS 1A', allocatedAt: daysFromNow(-50), vacatedAt: null, status: 'ACTIVE' },
    { id: 'al-4', room: seedRooms[2]!, studentName: 'Musa Jalloh', admissionNo: 'STD-1058', className: 'SSS 2C', allocatedAt: daysFromNow(-60), vacatedAt: null, status: 'ACTIVE' },
    { id: 'al-5', room: seedRooms[4]!, studentName: 'Fatmata Sesay', admissionNo: 'STD-1153', className: 'JSS 3A', allocatedAt: daysFromNow(-20), vacatedAt: null, status: 'ACTIVE' },
    { id: 'al-6', room: seedRooms[3]!, studentName: 'Isata Conteh', admissionNo: 'STD-1120', className: 'JSS 1B', allocatedAt: daysFromNow(-15), vacatedAt: daysFromNow(-2), status: 'VACATED' }
]

// NOTE: there is no backend endpoint for hostels yet, so this store keeps
// everything in memory (seeded with sample data) instead of calling an API.
// Swap the actions below for real HostelApi() calls once a backend exists.
export const useHostelStore = defineStore('hostel', {
    state: () => ({
        hostels: [...seedHostels] as Hostel[],
        roomTypes: [...seedRoomTypes] as RoomType[],
        rooms: [...seedRooms] as HostelRoom[],
        allocations: [...seedAllocations] as Allocation[]
    }),

    getters: {
        getHostel: state => (id: string): Hostel | undefined => state.hostels.find(e => e.id === id),
        listHostels(state): { label: string, value: string }[] {
            return state.hostels.map(e => ({ label: e.name, value: e.id }))
        },
        totalBeds(state): number {
            return state.hostels.reduce((sum, h) => sum + (h.capacity || 0), 0)
        },
        totalRooms(state): number {
            return state.rooms.length
        },

        getRoomType: state => (id: string): RoomType | undefined => state.roomTypes.find(e => e.id === id),
        listRoomTypes(state): { label: string, value: string }[] {
            return state.roomTypes.map(e => ({ label: `${e.name} (${e.capacity} bed${e.capacity > 1 ? 's' : ''})`, value: e.id }))
        },
        roomsByType: state => (typeId: string): HostelRoom[] => state.rooms.filter(r => r.type.id === typeId),

        getRoom: state => (id: string): HostelRoom | undefined => state.rooms.find(e => e.id === id),
        roomOccupants: state => (roomId: string): Allocation[] => state.allocations
            .filter(a => a.room.id === roomId && a.status === 'ACTIVE')
            .sort((a, b) => new Date(b.allocatedAt).getTime() - new Date(a.allocatedAt).getTime()),
        roomOccupancy() {
            return (roomId: string): { occupied: number, capacity: number } => {
                const room = this.getRoom(roomId)
                return { occupied: this.roomOccupants(roomId).length, capacity: room?.type.capacity || 0 }
            }
        },
        fullRooms(): HostelRoom[] {
            return this.rooms.filter((room: HostelRoom) => this.roomOccupancy(room.id).occupied >= room.type.capacity)
        },
        listAvailableRooms(): { label: string, value: string }[] {
            return this.rooms
                .filter((room: HostelRoom) => this.roomOccupancy(room.id).occupied < room.type.capacity)
                .map((room: HostelRoom) => {
                    const { occupied, capacity } = this.roomOccupancy(room.id)
                    return { label: `${room.hostel.name} · Room ${room.name} (${capacity - occupied} of ${capacity} free)`, value: room.id }
                })
        },

        activeAllocations(state): Allocation[] {
            return state.allocations.filter(a => a.status === 'ACTIVE')
        },
        totalCapacity(state): number {
            return state.rooms.reduce((sum, r) => sum + r.type.capacity, 0)
        },
        occupiedBeds(): number {
            return this.activeAllocations.length
        },
        freeBeds(): number {
            return this.totalCapacity - this.occupiedBeds
        }
    },

    actions: {
        createHostel(payload: CreateHostelDto) {
            const now = new Date().toISOString()
            this.hostels.unshift({ id: uid(), createdAt: now, updatedAt: now, ...payload })
        },

        updateHostel(payload: UpdateHostelDto) {
            const hostel = this.hostels.find(e => e.id === payload.id)
            if (!hostel) return

            hostel.name = payload.name
            hostel.type = payload.type
            hostel.capacity = payload.capacity
            hostel.rooms = payload.rooms
            hostel.supervisor = payload.supervisor
            hostel.updatedAt = new Date().toISOString()

            this.rooms.filter(r => r.hostel.id === hostel.id).forEach(r => { r.hostel = hostel })
        },

        deleteHostel(id: string) {
            if (this.rooms.some(r => r.hostel.id === id)) {
                throw new Error('Cannot delete a hostel that still has rooms assigned to it')
            }
            this.hostels = this.hostels.filter(e => e.id !== id)
        },

        createRoomType(payload: CreateRoomTypeDto) {
            const now = new Date().toISOString()
            this.roomTypes.unshift({ id: uid(), createdAt: now, updatedAt: now, ...payload })
        },

        updateRoomType(payload: UpdateRoomTypeDto) {
            const type = this.roomTypes.find(e => e.id === payload.id)
            if (!type) return

            if (payload.capacity < type.capacity && this.roomsByType(type.id).some(r => this.roomOccupancy(r.id).occupied > payload.capacity)) {
                throw new Error('Cannot reduce capacity below the number of students already occupying rooms of this type')
            }

            type.name = payload.name
            type.description = payload.description
            type.capacity = payload.capacity
            type.price = payload.price
            type.updatedAt = new Date().toISOString()

            this.rooms.filter(r => r.type.id === type.id).forEach(r => { r.type = type })
        },

        deleteRoomType(id: string) {
            if (this.rooms.some(r => r.type.id === id)) {
                throw new Error('Cannot delete a room type that still has rooms assigned to it')
            }
            this.roomTypes = this.roomTypes.filter(e => e.id !== id)
        },

        createRoom(payload: CreateRoomDto) {
            const hostel = this.hostels.find(e => e.id === payload.hostelId)
            if (!hostel) throw new Error('Select a valid hostel')

            const type = this.roomTypes.find(e => e.id === payload.typeId)
            if (!type) throw new Error('Select a valid room type')

            const now = new Date().toISOString()
            this.rooms.unshift({ id: uid(), name: payload.name, hostel, type, createdAt: now, updatedAt: now })
        },

        updateRoom(payload: UpdateRoomDto) {
            const room = this.rooms.find(e => e.id === payload.id)
            if (!room) return

            const hostel = this.hostels.find(e => e.id === payload.hostelId)
            if (!hostel) throw new Error('Select a valid hostel')

            const type = this.roomTypes.find(e => e.id === payload.typeId)
            if (!type) throw new Error('Select a valid room type')

            const occupied = this.roomOccupancy(room.id).occupied
            if (occupied > type.capacity) {
                throw new Error(`This room type only holds ${type.capacity}, but ${occupied} students are already allocated here`)
            }

            room.name = payload.name
            room.hostel = hostel
            room.type = type
            room.updatedAt = new Date().toISOString()

            this.allocations.filter(a => a.room.id === room.id).forEach(a => { a.room = room })
        },

        deleteRoom(id: string) {
            if (this.allocations.some(a => a.room.id === id && a.status === 'ACTIVE')) {
                throw new Error('Cannot delete a room that currently has students allocated to it')
            }
            this.rooms = this.rooms.filter(e => e.id !== id)
        },

        allocateStudent(payload: AllocateStudentDto) {
            const room = this.rooms.find(e => e.id === payload.roomId)
            if (!room) throw new Error('Select a valid room')

            const { occupied, capacity } = this.roomOccupancy(room.id)
            if (occupied >= capacity) throw new Error('This room is already at full capacity')

            this.allocations.unshift({
                id: uid(),
                room,
                studentName: payload.studentName,
                admissionNo: payload.admissionNo,
                className: payload.className,
                allocatedAt: new Date().toISOString(),
                vacatedAt: null,
                status: 'ACTIVE'
            })
        },

        vacateAllocation(id: string) {
            const allocation = this.allocations.find(e => e.id === id)
            if (!allocation || allocation.status === 'VACATED') return

            allocation.status = 'VACATED'
            allocation.vacatedAt = new Date().toISOString()
        }
    }
})
