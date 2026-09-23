import { defineStore } from 'pinia'

export const usePlatformStore = defineStore('platform', {
  state: () => ({
    feeSettings: [] as PlatformFeeSetting[],
    loading: false,

    calendar: null as NationalCalendar | null,
    calendarLoading: false
  }),

  getters: {
    feeSettingFor: (state) => (schoolId: string): PlatformFeeSetting =>
      state.feeSettings.find(s => s.schoolId === schoolId) || { schoolId, amount: null, updatedAt: null }
  },

  actions: {
    async fetchCalendar() {
      this.calendarLoading = true
      try {
        this.calendar = (await PlatformApi().getCalendar()) ?? null
      } finally {
        this.calendarLoading = false
      }
    },
    async saveCalendar(payload: SaveNationalCalendarPayload) {
      const response = await PlatformApi().saveCalendar(payload) as NationalCalendar | undefined
      if (response) this.calendar = response
      return response
    },
    async fetchFeeSettings() {
      this.loading = true
      try {
        const response = await PlatformApi().listFeeSettings() as any
        this.feeSettings = response || []
      } finally {
        this.loading = false
      }
    },
    async updateFeeSetting(schoolId: string, amount: number) {
      const response = await PlatformApi().updateFeeSetting(schoolId, amount) as any

      const index = this.feeSettings.findIndex(s => s.schoolId === schoolId)
      if (index !== -1) {
        this.feeSettings[index] = response
      } else if (response) {
        this.feeSettings.push(response)
      }

      return response
    }
  }
})
