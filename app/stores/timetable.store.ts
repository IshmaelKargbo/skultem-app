import { defineStore } from 'pinia'

export const useTimetableStore = defineStore('timetable', {
  state: () => ({
    rooms: [] as Room[],
    periods: [] as Period[],
    roomMeta: {} as Meta,
    timing: {
      startTime: '09:00',
      endTime: '15:00',
      breakDuration: 15,
      lunchDuration: 45,
      periodDuration: 45
    } as Timing,
    workingDays: [
      { day: 'MONDAY', state: false },
      { day: 'TUESDAY', state: false },
      { day: 'WEDNESDAY', state: false },
      { day: 'THURSDAY', state: false },
      { day: 'FRIDAY', state: false },
      { day: 'SATURDAY', state: false },
      { day: 'SUNDAY', state: false }
    ] as WorkingDay[],
    loading: false
  }),

  actions: {
    async searchRoom(page: number = 1, size: number = 6, search: string = "") {
      this.loading = true
      try {
        const response = await TimetableApi().searchRoom(search, page, size)
        this.rooms = response.data || []
        this.roomMeta = response.meta || {} as Meta
      } catch (err: any) {
        throw err.data?.message || 'Failed to fetch terms'
      } finally {
        this.loading = false
      }
    },
    async getTiming() {
      this.loading = true
      try {
        const response = await TimetableApi().getTiming()
        this.timing = response
      } catch (err: any) {
        throw err.data?.message || 'Failed to fetch timing'
      } finally {
        this.loading = false
      }
    },
    async getTimetable(id: string) {
      this.loading = true
      try {
        const response = await TimetableApi().getTimetable(id)
        this.periods = response
      } catch (err: any) {
        throw err.data?.message || 'Failed to fetch timetable'
      } finally {
        this.loading = false
      }
    },
    async getWorkingDays() {
      this.loading = true
      try {
        const response = await TimetableApi().listWorkingDays()
        this.workingDays = response
      } catch (err: any) {
        throw err.data?.message || 'Failed to fetch working days'
      } finally {
        this.loading = false
      }
    },
    async createRoom(payload: CreateRoomDTO, index: number) {
      const row = await TimetableApi().createRoom(payload) as any
      this.rooms[index] = row.data
    },
    async createPeriod(payload: CreatePeriodDTO) {
      return await TimetableApi().createPeriod(payload)
    },
    async createBreak(payload: CreatePeriodDTO) {
      return await TimetableApi().createBreak(payload)
    },
    async createLunch(payload: CreatePeriodDTO) {
      return await TimetableApi().createLunch(payload)
    },
    async setTiming(payload: CreateTimingDTO) {
      TimetableApi().setTiming(payload) as any
    },
    async setWorkingDay(payload: SetWorkingDTO) {
      TimetableApi().setWorkingDay(payload) as any
    },
    addRoom() {
      this.rooms.unshift({ id: '', name: '', no: '', description: '', createdAt: '', updatedAt: '' })
    },
    removeRoom(index: number) {
      const row = this.rooms[0]

      if (row && !row.id) {
        this.rooms.splice(index, 1)
      }
    }
  },
  getters: {
    isWorkingDaysEmpty(state): boolean {
      return !state.workingDays.some(day => day.id && day.id.trim() !== '')
    },
    days(state): string[] {
      return state.workingDays.filter((e) => e.state).map(e => clean(e.day))
    },
    listRooms(state): { label: string, value: string }[] {
      return state.rooms.map(e => ({ label: e.name, value: e.id }))
    }
  }
})
