import { defineStore } from 'pinia'

export const useHolidayStore = defineStore('holiday', {
  state: () => ({
    records: [] as Holiday[],
    meta: {} as Meta,
    loading: false,
    error: null as string | null
  }),

  actions: {
    async fetchAll(page: number = 1, size: number = 6) {
      this.loading = true
      this.error = null
      try {
        const response = await HolidayApi().getAll(page, size) as any
        this.records = response.data || []
        this.meta = response.meta || {} as Meta
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch holidaies'
      } finally {
        this.loading = false
      }
    },
    create(payload: CreateHolidayDto) {
      return HolidayApi().create(payload)
    }
  }
})
