import { defineStore } from 'pinia'

export const useBehaviourStore = defineStore('behaviourStore', {
  state: () => ({
    records: [] as Behaviour[],
    meta: {} as Meta,
    loading: false,
    error: null as string | null
  }),

  actions: {
    async fetchAll(classId: string = "", page: number = 1, size: number = 6) {
      this.loading = true
      this.error = null
      try {
        const response = await BehaviourApi().getAll(classId, page, size) as any
        this.records = response.data || []
        this.meta = response.meta || {} as Meta
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch behaviours'
      } finally {
        this.loading = false
      }
    },
    async fetchAllReport(classId: string = "") {
      this.loading = true
      this.error = null
      try {
        const response = await BehaviourApi().getAllReport(classId) as any
        return response
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch behaviour reports'
      } finally {
        this.loading = false
      }
    },
    create(payload: CreateBehaviourDto) {
      return BehaviourApi().create(payload)
    }
  }
})
