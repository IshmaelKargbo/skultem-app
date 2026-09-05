import { defineStore } from 'pinia'

export const usePlatformStore = defineStore('platform', {
  state: () => ({
    feeSettings: [] as PlatformFeeSetting[],
    loading: false
  }),

  getters: {
    // Falls back to an unconfigured default rather than undefined - a school simply has no row
    // yet until a SYSTEM_ADMIN sets an amount (see PlatformFeeSettingRepository).
    feeSettingFor: (state) => (schoolId: string): PlatformFeeSetting =>
      state.feeSettings.find(s => s.schoolId === schoolId) || { schoolId, amount: null, updatedAt: null }
  },

  actions: {
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
