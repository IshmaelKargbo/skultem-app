import { defineStore } from 'pinia'

export const useTimetableStore = defineStore('timetable', {
  state: () => ({
    rooms: [] as Room[],
    periods: [] as Period[],
    roomMeta: null as Meta | null,
    periodLoading: true,
    // Timing templates (Default / Primary / JSS-SSS / ...) - a school can have several, each
    // assignable to one or more Levels. See TimetableTiming for the template manager UI.
    timings: [] as Timing[],
    timingLevels: [] as TimingLevel[],
    timingLoading: true,
    workingDays: [] as WorkingDay[],
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
    async listTimings() {
      this.timingLoading = true
      try {
        this.timings = await TimetableApi().listTimings() || []
      } catch (err: any) {
        throw err.data?.message || 'Failed to fetch timing templates'
      } finally {
        this.timingLoading = false
      }
    },
    async listTimingLevels() {
      try {
        this.timingLevels = await TimetableApi().listTimingLevels() || []
      } catch (err: any) {
        throw err.data?.message || 'Failed to fetch timing level assignments'
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
    // params.session - the working days behind a class session's timetable grid (resolved
    // server-side via that session's Level). params.timingId - one template's own days directly
    // (the Settings page's per-template editor).
    async getWorkingDays(params: { session?: string, timingId?: string }) {
      this.loading = true
      try {
        this.workingDays = await TimetableApi().listWorkingDays(params) || []
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
    // id present -> update that template; absent -> create a new one. Either way, pick up the
    // server-persisted record (real id, and - for a first-ever save - isDefault/levels) instead
    // of leaving the client-only placeholder in place. index is the placeholder's slot (a new
    // template has no id yet to match on, so - same reasoning as createRoom - fall back to
    // overwriting it positionally rather than pushing a duplicate).
    async saveTiming(payload: CreateTimingDTO, id?: string, index?: number) {
      const response = id
        ? await TimetableApi().updateTiming(id, payload)
        : await TimetableApi().createTiming(payload)
      const domain = (response as any)?.data
      if (!domain) return

      const i = this.timings.findIndex(t => t.id === domain.id)
      if (i !== -1) {
        this.timings[i] = domain
      } else if (index !== undefined) {
        this.timings[index] = domain
      } else {
        this.timings.push(domain)
      }

      return domain as Timing
    },
    async deleteTiming(id: string) {
      await TimetableApi().deleteTiming(id)
      this.timings = this.timings.filter(t => t.id !== id)
      this.timingLevels = this.timingLevels.filter(l => l.timingId !== id)
    },
    async setDefaultTiming(id: string) {
      const response = await TimetableApi().setDefaultTiming(id) as any
      if (!response?.data) return

      this.timings = this.timings.map(t => ({ ...t, isDefault: t.id === id }))
    },
    async assignTimingLevel(level: SchoolLevel, timingId: string) {
      const response = await TimetableApi().assignTimingLevel(level, timingId) as any
      if (!response?.data) return

      const i = this.timingLevels.findIndex(l => l.level === level)
      if (i !== -1) {
        this.timingLevels[i] = response.data
      } else {
        this.timingLevels.push(response.data)
      }
    },
    async deletePeriod(id: string) {
      await TimetableApi().deletePeriod(id)
      this.periods.pop()
    },
    // Only the edited period's own row changes - it belongs to a single class session, so this
    // can never leak into another class's timetable.
    async updatePeriod(id: string, payload: UpdatePeriodDTO) {
      const res = await TimetableApi().updatePeriod(id, payload)
      const updated = (res as any)?.data
      if (!updated) return

      const i = this.periods.findIndex(p => p.id === id)
      if (i !== -1) this.periods[i] = { ...this.periods[i], ...updated }
    },
    async deleteRoom(id: string, index: string) {
      await TimetableApi().deleteRoom(id)
      this.rooms.splice(Number.parseInt(index), 1)
    },
    async setWorkingDay(payload: SetWorkingDTO) {
      // Sync local state with what the server actually persisted (this used to discard the
      // response entirely) - matters most on a first save, which turns the client-only default
      // rows (id: null) into real ones with server-assigned ids and timestamps.
      const response = await TimetableApi().setWorkingDay(payload) as any
      if (response?.data) this.workingDays = response.data
    },
    addTiming() {
      this.timings.push({
        id: '',
        name: '',
        isDefault: this.timings.length === 0,
        startTime: '08:00',
        endTime: '15:00',
        periodDuration: 40,
        breakDuration: 15,
        lunchDuration: 45,
        levels: [],
        createdAt: '',
        updatedAt: ''
      })
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
    },
    defaultTiming(state): Timing | undefined {
      return state.timings.find(t => t.isDefault)
    },
    // Which Timing template currently applies to a Level - its own assignment, or the school's
    // default template when it has none.
    timingForLevel: (state) => {
      return (level: SchoolLevel): Timing | undefined => {
        const assignment = state.timingLevels.find(l => l.level === level)
        if (assignment) return state.timings.find(t => t.id === assignment.timingId)
        return state.timings.find(t => t.isDefault)
      }
    }
  }
})
