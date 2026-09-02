import { defineStore } from 'pinia'

export const useTeacherAttendanceStore = defineStore('teacherAttendance', {
  state: () => ({
    roster: null as TeacherAttendanceRoster | null,
    loadingRoster: false,

    history: [] as TeacherAttendanceDaySummary[],
    historyMeta: {} as Meta,
    loadingHistory: false,

    saving: false,

    // Self-service clock-in/out
    myToday: null as MyAttendanceToday | null,
    loadingMyToday: false,
    clockingIn: false,
    clockingOut: false,

    // Admin clocking a teacher in/out on the roster - keyed by teacherId so one row's spinner
    // doesn't disable the whole table.
    adminClockingTeacherId: null as string | null,

    // Admin location settings
    locationSettings: null as AttendanceLocationSettings | null,
    loadingLocationSettings: false,
    savingLocationSettings: false,

    error: null as string | null
  }),

  actions: {
    async fetchRoster(date: string) {
      this.loadingRoster = true
      this.error = null
      try {
        this.roster = await TeacherAttendanceApi().roster(date)
      } catch (err: any) {
        this.error = err?.message || 'Failed to fetch attendance roster'
      } finally {
        this.loadingRoster = false
      }
    },

    async mark(date: string, records: { teacherId: string, status: string, note?: string }[]) {
      this.saving = true
      try {
        await TeacherAttendanceApi().mark(date, records)
        await this.fetchRoster(date)
      } finally {
        this.saving = false
      }
    },

    async adminClockIn(teacherId: string, date: string) {
      this.adminClockingTeacherId = teacherId
      try {
        const result = await TeacherAttendanceApi().adminClockIn(teacherId)
        await this.fetchRoster(date)
        return result as ClockInResult
      } finally {
        this.adminClockingTeacherId = null
      }
    },

    async adminClockOut(teacherId: string, date: string) {
      this.adminClockingTeacherId = teacherId
      try {
        const result = await TeacherAttendanceApi().adminClockOut(teacherId)
        await this.fetchRoster(date)
        return result as ClockOutResult
      } finally {
        this.adminClockingTeacherId = null
      }
    },

    async fetchHistory(page: number = 1, size: number = 10) {
      this.loadingHistory = true
      try {
        const res = await TeacherAttendanceApi().history(page, size)
        this.history = res?.data || []
        this.historyMeta = res?.meta || {} as Meta
      } catch (err: any) {
        this.error = err?.message || 'Failed to fetch attendance history'
      } finally {
        this.loadingHistory = false
      }
    },

    async fetchMyToday() {
      this.loadingMyToday = true
      this.error = null
      try {
        this.myToday = await TeacherAttendanceApi().myToday()
      } catch (err: any) {
        this.error = err?.message || "Failed to fetch today's attendance"
      } finally {
        this.loadingMyToday = false
      }
    },

    async clockIn(latitude: number, longitude: number) {
      this.clockingIn = true
      try {
        const result = await TeacherAttendanceApi().clockIn(latitude, longitude)
        await this.fetchMyToday()
        return result as ClockInResult
      } finally {
        this.clockingIn = false
      }
    },

    async clockOut(latitude: number, longitude: number) {
      this.clockingOut = true
      try {
        const result = await TeacherAttendanceApi().clockOut(latitude, longitude)
        await this.fetchMyToday()
        return result as ClockOutResult
      } finally {
        this.clockingOut = false
      }
    },

    async fetchLocationSettings() {
      this.loadingLocationSettings = true
      this.error = null
      try {
        this.locationSettings = await TeacherAttendanceApi().getLocationSettings()
      } catch (err: any) {
        this.error = err?.message || 'Failed to fetch location settings'
      } finally {
        this.loadingLocationSettings = false
      }
    },

    async saveLocationSettings(payload: { latitude: number, longitude: number, radiusMeters: number, allowedIps?: string }) {
      this.savingLocationSettings = true
      try {
        this.locationSettings = await TeacherAttendanceApi().saveLocationSettings(payload)
        return this.locationSettings
      } finally {
        this.savingLocationSettings = false
      }
    }
  }
})
