import { defineStore } from 'pinia'
import { SchoolApi } from '~/api/school.api'

export const useAppStore = defineStore('app', {
  state: () => ({
    title: '',
    tenant: undefined as School | undefined
  }),
  actions: {
    setTitle(newTitle: string) {
      this.title = newTitle
    },
    async checkTenant(domain: string) {
      try {
        const response = await SchoolApi().checkTenant(domain) as any
        this.tenant = response
      } catch (err: any) {
        throw err.data?.message || 'Failed to fetch tenant'
      }
    }
  }
})
