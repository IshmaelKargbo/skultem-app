import { defineStore } from 'pinia'

export const useAcademicYearStore = defineStore('academic-year', {
  state: () => ({
    records: [] as AcademicYear[],
    meta: {} as Meta,
    loading: false,
    terms: [] as Term[],
    error: null as string | null
  }),
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
    async getTerms() {
      const res = await AcademicYearApi().getTerms() as Term[]
      this.terms = res || [];
    },
    create(payload: CreateAcademicYearDto) {
      return AcademicYearApi().create(payload)
    }
  },
  getters: {
    isEmpty: (state) => state.records.length === 0,
    hasError: (state) => !!state.error,
    list: (state) => state.records.map((record) => ({
      value: record.id,
      label: record.name,
    })),
    termList: (state) => {
      return state.terms.map(e => ({ label: e.name, value: e.id }))
    },
    getTerm: (state) => {
      return (id: string): Term | undefined => {
        return state.terms.find(e => e.id == id)
      }
    },
  },
})
