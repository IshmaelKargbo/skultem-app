import { defineStore } from 'pinia'

export const useSchemeOfWorkStore = defineStore('schemaOfWork', {
  state: () => ({
    records: [] as SchemeOfWork[],
    meta: {} as Meta,
    progress: undefined as SchemeProgress | undefined,
    loading: false
  }),

  actions: {
    async fetchAll(page: number = 1, size: number = 6) {
      this.loading = true
      try {
        const response = await CurriculumsApi().getSchemes(page, size) as any
        this.records = response.data || []
        this.meta = response.meta || {} as Meta
      } catch (err: any) {
        throw err.data?.message || 'Failed to fetch scheme of work'
      } finally {
        this.loading = false
      }
    },
    async getProgress(id: string) {
      this.loading = true
      try {
        const response = await CurriculumsApi().getSchemeProgress(id) as any
        this.progress = response
      } catch (err: any) {
        throw err.data?.message || 'Failed to fetch scheme progress'
      } finally {
        this.loading = false
      }
    },
    async create(payload: CreateSchemeOfWork) {
      try {
        return CurriculumsApi().createSchemeOfWork(payload)
      } catch (err: any) {
        throw err.data?.message || 'Failed to create scheme of work'
      }
    },
  },
  getters: {}
})
