import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    title: '',
    tenant: undefined as School | undefined,
    // false: no back button. true: show it, browser-history back (router.back()).
    // A string: show it, but go straight to that path instead - for pages reached via a tab
    // strip (e.g. a student's Personal/Attendance/Fees tabs), where history-back just steps
    // back one tab at a time rather than returning to the list the user actually came from.
    back: false as boolean | string,
    notifications: 0 as number
  }),
  actions: {
    setTitle(newTitle: string) {
      this.title = newTitle
    },
    setBack(back: boolean | string) {
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
    async fetchCycleOverview() {
      try {
        const response = await AssessmentApi().getCycleOverview() as AssessmentCycleOverview
        return response
      } catch (err: any) {
        throw err.data?.message || 'Failed to fetch assessment cycle overview'
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
