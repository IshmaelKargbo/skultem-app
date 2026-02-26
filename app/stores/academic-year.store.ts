import { defineStore } from 'pinia'

export const useAcademicYearStore = defineStore('academic-year', {
  state: () => ({
    records: [] as AcademicYear[],
    meta: {} as Meta,
    loading: false,
    error: null as string | null
  }),
  getters: {
    isEmpty: (state) => state.records.length === 0,
    hasError: (state) => !!state.error,
    list: (state) => state.records.map((record) => ({
      value: record.id,
      label: record.name,
    })),
  },
  actions: {
    async fetchAll(page: number = 1, size: number = 6) {
      this.loading = true
      this.error = null
      try {
        const response = await AcademicYearApi().getAll(page, size)
        this.records = response.data || []
        this.meta = response.meta || {} as Meta
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch academic years'
      } finally {
        this.loading = false
      }
    },
    findOne(id: string) {
      return AcademicYearApi().getOne(id)
    },
    create(payload: CreateAcademicYearDto) {
      return AcademicYearApi().create(payload)
    }
  }
})
