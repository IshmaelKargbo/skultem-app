import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    title: '',
    tenant: undefined as School | undefined,
    back: false,
    notifications: 0 as number
  }),
  actions: {
    setTitle(newTitle: string) {
      this.title = newTitle
    },
    setBack(back: boolean) {
      this.back = back
    },
    async checkTenant(domain: string) {
      try {
        const response = await SchoolApi().checkTenant(domain) as any
        this.tenant = response
      } catch (err: any) {
        throw err.data?.message || 'Failed to fetch tenant'
      }
    },
    async openNotifications() {
      try {
        const response = await UserApi().openNotifications() as any
        this.notifications = response
      } catch (err: any) {
        throw err.data?.message || 'Failed to fetch tenant'
      }
    },
    async markAsRead(id: string) {
      try {
        await NotificationApi().markAsRead(id) as any
      } catch (err: any) {
        throw err.data?.message || 'Failed to mark as read'
      }
    }
  }
})
