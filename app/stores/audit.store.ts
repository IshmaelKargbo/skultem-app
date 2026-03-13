import { defineStore } from 'pinia'

export const useAuditStore = defineStore('audit', {
  state: () => ({
    records: [] as AuditLog[],
    meta: {} as Meta,
    loading: false,
    error: null as string | null
  }),

  actions: {
    async fetchAll(page: number = 1, size: number = 10, academicYearId?: string) {
      this.loading = true
      this.error = null
      try {
        const response = await AuditApi().getAll(page, size, academicYearId) as any
        this.records = response.data || []
        this.meta = response.meta || {} as Meta
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch audit logs'
      } finally {
        this.loading = false
      }
    }
  }
})
