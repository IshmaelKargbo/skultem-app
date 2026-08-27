import { defineStore } from 'pinia'

export const useWeekStore = defineStore('week', {
  state: () => ({
    records: [] as Week[],
    current: undefined as Week | undefined,
    loading: false
  }),

  actions: {
    async fetchAll(id: string) {
      this.loading = true
      try {
        const response = await CurriculumsApi().getWeeks(id) as any
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
        this.current = response
        return response
      } catch (err: any) {
        throw err.data?.message || 'Failed to fetch week'
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
    async updateState(id: string, state: LessonState) {
      try {
        const response = await CurriculumsApi().updateWeekState(id, state) as any

        const index = this.records.findIndex(w => w.id === id)
        if (index !== -1)
          this.records[index] = response

        if (this.current?.id === id)
          this.current = response

        return response
      } catch (err: any) {
        throw err.data?.message || 'Failed to update week'
      }
    },
  },
  getters: {}
})
