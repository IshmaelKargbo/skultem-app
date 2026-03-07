import { defineStore } from 'pinia'

export const useBehaviourCategoryStore = defineStore('behaviourCategoryStore', {
  state: () => ({
    records: [] as BehaviourCategory[],
    meta: {} as Meta,
    loading: false,
    error: null as string | null
  }),

  actions: {
    async fetchAll(page: number = 1, size: number = 6) {
      this.loading = true
      this.error = null
      try {
        const response = await BehaviourApi().getAllCateegory(page, size) as any
        this.records = response.data || []
        this.meta = response.meta || {} as Meta
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch behaviour categories'
      } finally {
        this.loading = false
      }
    },
    create(payload: CreateBehaviourCategoryDto) {
      return BehaviourApi().createCategory(payload)
    }
  }
})
