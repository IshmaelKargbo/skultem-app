import { defineStore } from 'pinia'

export const useSchemeOfWorkStore = defineStore('schemaOfWork', {
  state: () => ({
    records: [] as SchemeOfWork[],
    meta: {} as Meta,
    progress: undefined as SchemeProgress | undefined,
    filter: {} as SchemeOfWorkFilter,
    loading: false
  }),

  actions: {
    async fetchAll(page: number = 1, size: number = 6, filter?: SchemeOfWorkFilter) {
      this.loading = true
      if (filter) this.filter = filter
      try {
        const response = await CurriculumsApi().getSchemes(page, size, this.filter) as any
        this.records = response.data || []
        this.meta = response.meta || {} as Meta
      } catch (err: any) {
        // CurriculumsApi() funnels failures through useHandleError, which re-throws a plain
        // Error (message on `.message`) rather than the raw ofetch error (message on
        // `.data.message`) - check both so the real reason surfaces instead of the fallback.
        throw err.data?.message || err.message || 'Failed to fetch scheme of work'
      } finally {
        this.loading = false
      }
    },
    async fetchMine(page: number = 1, size: number = 6, filter?: SchemeOfWorkFilter) {
      this.loading = true
      if (filter) this.filter = filter
      try {
        const response = await CurriculumsApi().getMySchemes(page, size, this.filter) as any
        this.records = response.data || []
        this.meta = response.meta || {} as Meta
      } catch (err: any) {
        throw err.data?.message || err.message || 'Failed to fetch my schemes of work'
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
        throw err.data?.message || err.message || 'Failed to fetch scheme progress'
      } finally {
        this.loading = false
      }
    },
    async create(payload: CreateSchemeOfWork) {
      try {
        return CurriculumsApi().createSchemeOfWork(payload)
      } catch (err: any) {
        throw err.data?.message || err.message || 'Failed to create scheme of work'
      }
    },
  },
  getters: {}
})
