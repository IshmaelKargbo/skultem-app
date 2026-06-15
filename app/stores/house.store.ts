import { defineStore } from 'pinia'

export const useHouseStore = defineStore('house', {
  state: () => ({
    records: [] as House[],
    meta: {} as Meta,
    loading: false,
    error: null as string | null
  }),

  actions: {
    async fetchAll(page: number = 1, size: number = 6) {
      this.loading = true
      this.error = null
      try {
        const response = await HouseApi().getAll(page, size) as any
        this.records = response.data || []
        this.meta = response.meta || {} as Meta
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch houses'
      } finally {
        this.loading = false
      }
    },
    create(payload: CreateHouseDto) {
      return HouseApi().create(payload)
    }
  }
})
