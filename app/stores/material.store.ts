import { defineStore } from 'pinia'

export const useMaterialStore = defineStore('material', {
  state: () => ({
    categories: [] as MaterialCategory[],
    supplies: [] as Supply[],
    records: [] as Material[],
    // Materials, categories and supplies each need their own loading/meta - they used to share
    // one `loading`/`meta` pair, which meant an unrelated fetch (e.g. MaterialAdd populating its
    // category dropdown) toggled the exact flag the materials table's `:loading` prop watches.
    // Every material row renders its own MaterialAdd, each firing that category fetch on mount;
    // each one flipping the shared flag made the table remount its rows - and therefore every
    // row's MaterialAdd - which fired the fetch again, forever. See material/add.vue and
    // pages/material/index.vue.
    meta: {} as Meta,
    categoriesMeta: {} as Meta,
    suppliesMeta: {} as Meta,
    loading: false,
    categoriesLoading: false,
    suppliesLoading: false,
    error: null as string | null
  }),

  actions: {
    async fetchAllCategory(page: number = 1, size: number = 6, search?: string) {
      this.categoriesLoading = true
      this.error = null
      try {
        const response = await MaterialApi().getAllCategories(page, size, search) as any
        this.categories = response.data || []
        this.categoriesMeta = response.meta || {} as Meta
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch material categories'
      } finally {
        this.categoriesLoading = false
      }
    },
    async fetchAllSupply(page: number = 1, size: number = 6, search?: string) {
      this.suppliesLoading = true
      this.error = null
      try {
        const response = await MaterialApi().getAllSupply(page, size, search) as any
        this.supplies = response.data || []
        this.suppliesMeta = response.meta || {} as Meta
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch material supplies'
      } finally {
        this.suppliesLoading = false
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
