import { defineStore } from 'pinia'

export const usePlatformStore = defineStore('platform', {
  state: () => ({
    feeSetting: { amount: null, updatedAt: null } as PlatformFeeSetting,
    loading: false
  }),

  actions: {
    async getFeeSetting() {
      this.loading = true
      try {
        const response = await PlatformApi().getFeeSetting() as any
        this.feeSetting = response
      } finally {
        this.loading = false
      }
    },
    async updateFeeSetting(amount: number) {
      const response = await PlatformApi().updateFeeSetting(amount) as any
      this.feeSetting = response
      return response
    }
  }
})
