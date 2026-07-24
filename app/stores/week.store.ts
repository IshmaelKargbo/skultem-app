import { defineStore } from 'pinia'

export const useWeekStore = defineStore('week', {
  state: () => ({
    records: [] as Week[],
    loading: false
  }),

  actions: {
    async fetchAll(id: string) {
      this.loading = true
      try {
        const response = await CurriculumsApi().getWeeksBySchema(id) as any
        this.records = response || []
      } catch (err: any) {
        throw err.data?.message || 'Failed to fetch scheme weeks'
      } finally {
        this.loading = false
      }
    },
    async getWeeks() {
      this.loading = true
      try {
        const response = await CurriculumsApi().getWeeks() as any
        this.records = response || []
      } catch (err: any) {
        throw err.data?.message || 'Failed to fetch scheme weeks'
      } finally {
        this.loading = false
      }
    },
    async getWeek(id: string) {
      this.loading = true
      try {
        const response = await CurriculumsApi().getWeek(id) as any
        this.records = response || []
      } catch (err: any) {
        throw err.data?.message || 'Failed to fetch scheme weeks'
      } finally {
        this.loading = false
      }
    },
    async create(payload: CreateWeek) {
      try {
        return CurriculumsApi().createWeek(payload)
      } catch (err: any) {
        throw err.data?.message || 'Failed to create scheme week'
      }
    },
  },
  getters: {}
})
