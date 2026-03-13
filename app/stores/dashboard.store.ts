import { defineStore } from 'pinia'
import { DashboardApi } from '~/api/dashboard.api'

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    loading: false,
    error: null as string | null
  }),
  actions: {
    async fetchAdminReport(page: number = 1, size: number = 6) {
      this.loading = true
      this.error = null
      try {
        const response = await DashboardApi().getAdminReport()
        return response
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch admin report'
      } finally {
        this.loading = false
      }
    },
    async fetchAdminWeekly() {
      this.loading = true
      this.error = null
      try {
        const response = await DashboardApi().getAdminWeekly()
        return response
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch admin weekly-attendance'
      } finally {
        this.loading = false
      }
    },
    async fetchAdminRevnue() {
      this.loading = true
      this.error = null
      try {
        const response = await DashboardApi().getAdminRevenue()
        return response
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch admin revenue'
      } finally {
        this.loading = false
      }
    },
    async fetchStudentEnrollment() {
      this.loading = true
      this.error = null
      try {
        const response = await DashboardApi().getAdminStudentEnrollment()
        return response
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch admin weekly-attendance'
      } finally {
        this.loading = false
      }
    },
    async fetchAdminActivities(size: number = 10) {
      this.loading = true
      this.error = null
      try {
        const response = await DashboardApi().getAdminActivities(size)
        return response
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch admin activities'
      } finally {
        this.loading = false
      }
    },
  }
})
