import { defineStore } from 'pinia'

export const useClassSessionStore = defineStore('classSession', {
  state: () => ({
    records: [] as ClassSession[],
    meta: {} as Meta,
    loading: false,
    error: null as string | null
  }),

  actions: {
    async fetchAll(page: number = 1, size: number = 6) {
      this.loading = true
      this.error = null
      try {
        const response = await ClassApi().getAllClassSessions(page, size) as any
        this.records = response.data || []
        this.meta = response.meta || {} as Meta
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch class sessions'
      } finally {
        this.loading = false
      }
    },
    async fetchAllMe() {
      this.loading = true
      this.error = null
      try {
        const response = await ClassApi().getAllMeClassSessions() as any
        return response
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch class sessions'
      } finally {
        this.loading = false
      }
    },
    async fetchAllUnassign(page: number = 1, size: number = 6) {
      try {
        const response = await ClassApi().getAllUnassignClassSessions(page, size) as any
        return response.data
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch class sessions'
      }
    },
  },
  getters: {
    list(state): { label: string, value: string }[] {
      return state.records.map(e => {
        let name = `${e.clazz} (${e.sectionName})`

        if (e.streamName != 'N/A') {
          name = `${e.clazz} (${e.sectionName}) - ${e.streamName}`
        }
        return { label: name, value: e.id }
      })
    },
    get: (state) => {
      return (id: string): ClassSession | undefined => {
        return state.records.find(e => e.id === id)
      }
    }
  }
})
