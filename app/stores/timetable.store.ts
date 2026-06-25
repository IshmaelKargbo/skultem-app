import { defineStore } from 'pinia'

export const useTimetableStore = defineStore('timetable', {
  state: () => ({
    rooms: [] as Room[],
    periods: [] as Period[],
    roomMeta: null as Meta | null,
    periodLoading: true,
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
    async searchRoom(page = 1, size = 6, search = '') {
      this.loading = true
      try {
        const response = await TimetableApi().searchRoom(search, page, size)
        this.rooms = response.data || []
        this.roomMeta = response.meta || null
      } catch (err: any) {
        throw err.data?.message || 'Failed to fetch rooms'
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
      this.periodLoading = true
      try {
        const response = await TimetableApi().getTimetable(id)
        this.periods = response
      } catch (err: any) {
        throw err.data?.message || 'Failed to fetch timetable'
      } finally {
        this.periodLoading = false
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
      const res = await TimetableApi().createRoom(payload)
      const updated = (res as any).data

      if (!updated) return

      const i = this.rooms.findIndex(r => r.id === updated.id)
      if (i !== -1) {
        this.rooms[i] = updated
      } else if (index !== undefined) {
        this.rooms[index] = updated
      }
    },
    async updateRoom(payload: UpdateRoomDTO, index: number) {
      const res = await TimetableApi().updateRoom(payload)
      const updated = (res as any).data

      if (!updated) return

      const i = this.rooms.findIndex(r => r.id === updated.id)
      if (i !== -1) {
        this.rooms[i] = updated
      } else if (index !== undefined) {
        this.rooms[index] = updated
      }
    },
    async createPeriod(payload: CreatePeriodDTO) {
      const res = await TimetableApi().createPeriod(payload)
      const data = (res as any).data
      if (data) this.periods.push(data)
    },
    async createBreak(payload: CreatePeriodDTO) {
      const res = await TimetableApi().createBreak(payload)
      const data = (res as any).data
      if (data) this.periods.push(data)
    },
    async createLunch(payload: CreatePeriodDTO) {
      const res = await TimetableApi().createLunch(payload)
      const data = (res as any).data
      if (data) this.periods.push(data)
    },
    async setTimetable(payload: CreateTimetableDTO, index: any) {
      const res = await TimetableApi().createTimetable(payload)
      const domain = (res as any).data

      if (!domain) return

      const periodIndex = this.periods.findIndex(e => e.id === payload.period)
      if (periodIndex === -1) return

      this.periods[periodIndex].subjects ??= []
      this.periods[periodIndex].subjects[index] = domain

      console.log(this.periods);

    },
    async setTiming(payload: CreateTimingDTO) {
      await TimetableApi().setTiming(payload)
    },
    async deletePeriod(id: string) {
      await TimetableApi().deletePeriod(id)
      this.periods.pop()
    },
    async deleteRoom(id: string, index: string) {
      await TimetableApi().deleteRoom(id)
      this.rooms.splice(Number.parseInt(index), 1)
    },
    async setWorkingDay(payload: SetWorkingDTO) {
      await TimetableApi().setWorkingDay(payload)
    },
    addRoom() {
      this.rooms.unshift({
        id: '',
        name: '',
        no: '',
        description: '',
        createdAt: '',
        updatedAt: ''
      })
    },
  },
  getters: {
    isWorkingDaysEmpty(state): boolean {
      return !state.workingDays.some(day => day.state)
    },
    days(state): string[] {
      return state.workingDays
        .filter(e => e.state)
        .map(e => e.day)
    },
    listRooms(state): { label: string; value: string }[] {
      return state.rooms.map(e => ({
        label: e.name,
        value: e.id
      }))
    },
    getDay: (state) => {
      return (index: number): WorkingDay | undefined => state.workingDays[index]
    },
    getDayRange: (state) => {
      const selected: any = state.workingDays.filter(e => e.state)

      if (selected.length === 0) return ''

      if (selected.length === 1) {
        return clean(selected[0].day)
      }

      return `${clean(selected[0].day)} - ${clean(selected[selected.length - 1].day)}`
    }
  }
})