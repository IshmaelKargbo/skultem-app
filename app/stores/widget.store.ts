import { defineStore } from 'pinia'

export const useWidgetStore = defineStore('widget', {
  state: () => ({
    loading: false,
    error: null as string | null
  }),
  actions: {
    async runAnalytic(param: any, page: number = 0, size: number = 0) {
      this.loading = true
      this.error = null
      try {
        const response = await WidgetApi().runAnalytics(param, page, size)
        return response
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch admin report'
      } finally {
        this.loading = false
      }
    }
  }
})
