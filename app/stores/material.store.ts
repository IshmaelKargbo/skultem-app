import { defineStore } from 'pinia'

export const useMaterialStore = defineStore('material', {
  state: () => ({
    categories: [] as MaterialCategory[],
    supplies: [] as Supply[],
    records: [] as Material[],
    meta: {} as Meta,
    loading: false,
    error: null as string | null
  }),

  actions: {
    async fetchAllCategory(page: number = 1, size: number = 6, search?: string) {
      this.loading = true
      this.error = null
      try {
        const response = await MaterialApi().getAllCategories(page, size, search) as any
        this.categories = response.data || []
        this.meta = response.meta || {} as Meta
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch material categories'
      } finally {
        this.loading = false
      }
    },
    async fetchAllSupply(page: number = 1, size: number = 6, search?: string) {
      this.loading = true
      this.error = null
      try {
        const response = await MaterialApi().getAllSupply(page, size, search) as any
        this.supplies = response.data || []
        this.meta = response.meta || {} as Meta
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch material supplies'
      } finally {
        this.loading = false
      }
    },
    async fetchAll(page: number = 1, size: number = 6, search?: string) {
      this.loading = true
      this.error = null
      try {
        const response = await MaterialApi().getAll(page, size, search) as any
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
    async updateCategory(payload: CreateMaterialCategoryDto & { id: string }) {
      const { id, ...rest } = payload
      const response = await MaterialApi().updateCategory(id, rest) as any
      const index = this.categories.findIndex(c => c.id === id)
      if (index !== -1) this.categories[index] = response
      return response
    },
    async removeCategory(id: string) {
      await MaterialApi().deleteCategory(id)
      this.categories = this.categories.filter(c => c.id !== id)
    },
    create(payload: CreateMaterialDto) {
      return MaterialApi().create(payload)
    },
    async update(payload: CreateMaterialDto & { id: string }) {
      const { id, ...rest } = payload
      const response = await MaterialApi().update(id, rest) as any
      const index = this.records.findIndex(m => m.id === id)
      if (index !== -1) this.records[index] = response
      return response
    },
    async remove(id: string) {
      await MaterialApi().delete(id)
      this.records = this.records.filter(m => m.id !== id)
    },
    restock(payload: RestockDto) {
      return MaterialApi().restock(payload)
    },
    supply(payload: SupplyDto) {
      return MaterialApi().supply(payload)
    }
  }
})
