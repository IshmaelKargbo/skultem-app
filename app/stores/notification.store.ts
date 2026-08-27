import { defineStore } from 'pinia'

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    records: [] as AppNotification[],
    meta: {} as Meta,
    loading: false,
    error: null as string | null
  }),

  actions: {
    async fetchAll(page: number = 1, size: number = 10) {
      this.loading = true
      this.error = null
      try {
        const res = await NotificationApi().getAll(page, size) as any
        this.records = res?.data || []
        this.meta = res?.meta || {} as Meta
      } catch (err: any) {
        this.error = err?.message || 'Failed to fetch notifications'
      } finally {
        this.loading = false
      }
    },

    async markAsRead(id: string) {
      await NotificationApi().markAsRead(id)
      const record = this.records.find(n => n.id === id)
      if (record) record.read = true
    }
  }
})
