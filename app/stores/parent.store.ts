import { defineStore } from 'pinia'

export const useParentStore = defineStore('parent', {
  state: () => ({
    records: [] as Parent[],
    students: [] as Student[],
    notifications: [] as AppNotification[],
    meta: {} as Meta,
    loading: false,
    error: null as string | null
  }),

  actions: {
    async fetchAll(page: number = 1, size: number = 6) {
      this.loading = true
      this.error = null
      try {
        const response = await ParentApi().getAll(page, size) as any
        this.records = response.data || []
        this.meta = response.meta || {} as Meta
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch parents'
      } finally {
        this.loading = false
      }
    },
    async fetchAllStudents(page: number = 1, size: number = 6) {
      this.loading = true
      this.error = null
      try {
        const response = await ParentApi().getAllStudent(page, size) as any
        this.students = response.data || []
        this.meta = response.meta || {} as Meta
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch parent students'
      } finally {
        this.loading = false
      }
    },
    async fetchAllNotifications(page: number = 1, size: number = 6) {
      this.loading = true
      this.error = null
      try {
        const response = await ParentApi().getAllNotifications(page, size) as any
        this.notifications = response.data || []
        this.meta = response.meta || {} as Meta
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch parent notifications'
      } finally {
        this.loading = false
      }
    },
    create(payload: CreateParentDto) {
      return ParentApi().create(payload)
    }
  }
})
