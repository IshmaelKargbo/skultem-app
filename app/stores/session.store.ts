import { defineStore } from 'pinia'

export const useSessionStore = defineStore('userSession', {
  state: () => ({
    records: [] as UserSession[],
    meta: {} as Meta,
    loading: false,
    error: null as string | null
  }),

  actions: {
    async fetchAll(page: number = 1, size: number = 10) {
      this.loading = true
      this.error = null
      try {
        const response = await SessionApi().getAll(page, size) as any
        this.records = response.data || []
        this.meta = response.meta || {} as Meta
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch user sessions'
      } finally {
        this.loading = false
      }
    },
    async logout(sessionId: string) {
      this.loading = true
      this.error = null
      try {
        await SessionApi().logout(sessionId)
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to logout session'
        throw err
      } finally {
        this.loading = false
      }
    }
  }
})
