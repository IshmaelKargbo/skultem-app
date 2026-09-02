import { defineStore } from 'pinia'

export const useLeaveStore = defineStore('leave', {
  state: () => ({
    records: [] as LeaveRequest[],
    meta: {} as Meta,
    loading: false,

    current: null as LeaveRequest | null,
    loadingCurrent: false,

    summary: null as LeaveSummary | null,
    loadingSummary: false,

    error: null as string | null
  }),

  actions: {
    async fetchAll(page: number = 1, size: number = 9, filters: { status?: string, type?: string, search?: string } = {}) {
      this.loading = true
      this.error = null
      try {
        const res = await LeaveApi().list(page, size, filters)
        this.records = res?.data || []
        this.meta = res?.meta || {} as Meta
      } catch (err: any) {
        this.error = err?.message || 'Failed to fetch leave requests'
      } finally {
        this.loading = false
      }
    },

    async fetchMine(page: number = 1, size: number = 9) {
      this.loading = true
      this.error = null
      try {
        const res = await LeaveApi().listMine(page, size)
        this.records = res?.data || []
        this.meta = res?.meta || {} as Meta
      } catch (err: any) {
        this.error = err?.message || 'Failed to fetch leave requests'
      } finally {
        this.loading = false
      }
    },

    async fetchSummary() {
      this.loadingSummary = true
      try {
        this.summary = await LeaveApi().summary()
      } catch (err: any) {
        this.error = err?.message || 'Failed to fetch leave summary'
      } finally {
        this.loadingSummary = false
      }
    },

    async fetchById(id: string) {
      this.loadingCurrent = true
      this.error = null
      this.current = null
      try {
        this.current = await LeaveApi().getById(id)
      } catch (err: any) {
        this.error = err?.message || 'Failed to fetch leave request'
      } finally {
        this.loadingCurrent = false
      }
    },

    async create(payload: { teacherId: string, type: string, startDate: string, endDate: string, reason: string }) {
      return await LeaveApi().create(payload)
    },

    async createForMe(payload: { type: string, startDate: string, endDate: string, reason: string }) {
      return await LeaveApi().createForMe(payload)
    },

    async review(id: string, approve: boolean, note?: string) {
      const updated = await LeaveApi().review(id, approve, note)
      if (updated) this.current = updated
      return updated
    }
  }
})
