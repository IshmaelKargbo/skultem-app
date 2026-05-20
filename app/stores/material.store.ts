import { defineStore } from 'pinia'

export const useMaterialStore = defineStore('fee', {
  state: () => ({
    categories: [] as MaterialCategory[],
    records: [] as Material[],
    meta: {} as Meta,
    loading: false,
    error: null as string | null
  }),

  actions: {
    async fetchAllCategory(page: number = 1, size: number = 6) {
      this.loading = true
      this.error = null
      try {
        const response = await MaterialApi().getAllCategories(page, size) as any
        this.categories = response.data || []
        this.meta = response.meta || {} as Meta
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch material categories'
      } finally {
        this.loading = false
      }
    },
    async fetchAll(page: number = 1, size: number = 6) {
      this.loading = true
      this.error = null
      try {
        const response = await MaterialApi().getAll(page, size) as any
        this.records = response.data || []
        this.meta = response.meta || {} as Meta
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch materials'
      } finally {
        this.loading = false
      }
    },
    createCategory(payload: CreateMaterialCategoryDto) {
      return MaterialApi().createCategory(payload)
    },
    create(payload: CreateMaterialDto) {
      return MaterialApi().create(payload)
    },
    restock(payload: RestockDto) {
      return MaterialApi().restock(payload)
    }
  }
})
