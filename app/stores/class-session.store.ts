import { defineStore } from 'pinia'

export const useClassSessionStore = defineStore('classSession', {
  state: () => ({
    records: [] as ClassSession[],
    meta: {} as Meta,
    loading: false,
    error: null as string | null
  }),

  actions: {
    async fetchAll(page: number = 1, size: number = 6, academicYearId?: string, sectionId?: string, streamId?: string,
      query?: string, level?: string) {
      this.loading = true
      this.error = null
      try {
        const response = await ClassApi().getAllClassSessions(page, size, academicYearId, sectionId, streamId,
          query, level) as any
        this.records = response.data || []
        this.meta = response.meta || {} as Meta
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch class sessions'
      } finally {
        this.loading = false
      }
    },
    create(payload: CreateClassSessionDto) {
      return ClassApi().createSession(payload)
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
    // Every class session, not just ones with no class master yet - a session can now hold more
    // than one active class master (e.g. co-taught classes), so it must stay pickable even after
    // it already has one. Deliberately doesn't touch `records`/`meta` (unlike fetchAll) so it
    // can't clobber a class list table's own paginated state underneath it.
    async fetchAllForMasterAssignment() {
      try {
        const response = await ClassApi().getAllClassSessions(1, 0) as any
        return response.data
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch class sessions'
      }
    },
    setupAll(academicYearId: string) {
      return ClassApi().setupAllSessions(academicYearId)
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
    listByClass(state): { label: string, value: string }[] {
      return state.records.map(e => {
        let name = `${e.clazz} (${e.sectionName})`

        if (e.streamName != 'N/A') {
          name = `${e.clazz} (${e.sectionName}) - ${e.streamName}`
        }
        return { label: name, value: e.clazzId }
      })
    },
    get: (state) => {
      return (id: string): ClassSession | undefined => {
        return state.records.find(e => e.id === id)
      }
    },
    getByClazz: (state) => {
      return (id: string): ClassSession | undefined => {
        return state.records.find(e => e.clazzId === id)
      }
    }
  }
})
