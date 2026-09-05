import { defineStore } from 'pinia'

export const useClassSubjectStore = defineStore('classSubject', {
  state: () => ({
    records: [] as ClassSubject[],
    meta: {} as Meta,
    loading: false,
    error: null as string | null
  }),

  actions: {
    async fetchAll(page: number = 1, size: number = 6, classId?: string, mandatory?: boolean, query?: string, sortBy?: string, direction?: string) {
      this.loading = true
      this.error = null
      try {
        const response = await ClassSubjectApi().getAll(page, size, classId, mandatory, query, sortBy, direction) as any
        this.records = response.data || []
        this.meta = response.meta || {} as Meta
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch class subjects'
      } finally {
        this.loading = false
      }
    },
    async fetchAllByClass(id: string, page: number = 1, size: number = 6) {
      this.loading = true
      this.error = null
      try {
        const response = await ClassSubjectApi().getAllByClass(id, '', page, size) as any
        return response.data || []
        console.log(response);
        
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch class subjects by class'
      } finally {
        this.loading = false
      }
    },
    async fetchAllByClassAndStream(id: string, stream: string, page: number = 1, size: number = 6) {
      this.loading = true
      this.error = null
      try {
        const response = await ClassSubjectApi().getAllByClass(id, stream, page, size) as any
        return response.data || []
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch class subjects by class'
      } finally {
        this.loading = false
      }
    },
    // `stream` matters for classes like SSS that split into separate streams (Science, Art, ...)
    // - each stream carries its own subject set, so leaving it blank would merge every stream's
    // subjects together instead of scoping to the one the caller actually means.
    async allByClass(id: string, stream: string = '', page: number = 1, size: number = 6) {
      this.loading = true
      this.error = null
      try {
        const response = await ClassSubjectApi().getAllByClass(id, stream, page, size) as any
        this.records = response.data || []
        this.meta = response.meta || {} as Meta

      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch class subjects by class'
        throw this.error
      } finally {
        this.loading = false
      }
    },
    create(id: string, payload: CreateClassSubjectDto) {
      return ClassSubjectApi().create(id, payload)
    }
  },
  getters: {
    list(state): Option[] {
      return state.records.map(e => ({ label: e.subjectName, value: e.id }))
    },
    listBySubject(state): Option[] {
      return state.records.map(e => ({ label: e.subjectName, value: e.subjectId }))
    }
  }
})
