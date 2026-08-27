import { defineStore } from 'pinia'

export const useLessonStore = defineStore('lesson', {
  state: () => ({
    records: [] as Lesson[],
    current: undefined as Lesson | undefined,
    loading: false
  }),

  actions: {
    async fetchByWeek(weekId: string) {
      this.loading = true
      try {
        const response = await CurriculumsApi().getWeekLessons(weekId) as any
        this.records = response || []
      } catch (err: any) {
        throw err.data?.message || 'Failed to fetch lesson notes'
      } finally {
        this.loading = false
      }
    },
    async getLesson(id: string) {
      this.loading = true
      try {
        const response = await CurriculumsApi().getLesson(id) as any
        this.current = response
        return response
      } catch (err: any) {
        throw err.data?.message || 'Failed to fetch lesson note'
      } finally {
        this.loading = false
      }
    },
    async create(payload: CreateLesson) {
      try {
        return await CurriculumsApi().createLesson(payload)
      } catch (err: any) {
        throw err.data?.message || 'Failed to create lesson note'
      }
    },
    async updateState(id: string, state: LessonState) {
      try {
        const response = await CurriculumsApi().updateLessonState(id, state) as any

        const index = this.records.findIndex(l => l.id === id)
        if (index !== -1)
          this.records[index] = response

        if (this.current?.id === id)
          this.current = response

        return response
      } catch (err: any) {
        throw err.data?.message || 'Failed to update lesson note'
      }
    }
  },
  getters: {}
})
