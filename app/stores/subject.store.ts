import { defineStore } from 'pinia'

let latestListRequest = 0

export const useSubjectStore = defineStore('subject', {
  state: () => ({
    records: [] as Subject[],
    meta: {} as Meta,
    loading: true,
    error: null as string | null
  }),

  actions: {
    async fetchAll(page: number = 1, size: number = runtimeConf().limit, query?: string, sortBy?: string, direction?: string) {
      // Only the latest request may update the list, so a slow older response can't overwrite
      // newer results or clear the loading state early.
      const request = ++latestListRequest
      this.loading = true
      this.error = null
      try {
        const response = await SubjectApi().getAll(page, size, query, sortBy, direction) as any
        if (request !== latestListRequest) return
        this.records = response.data || []
        this.meta = response.meta || {} as Meta
      } catch (err: any) {
        if (request !== latestListRequest) return
        this.error = err.data?.message || 'Failed to fetch subjects'
      } finally {
        if (request === latestListRequest) this.loading = false
      }
    },
    create(payload: CreateSubjectDto) {
      return SubjectApi().create(payload)
    },
    edit(id: string, payload: EditSubjectDto) {
      return SubjectApi().edit(id, payload)
    },
    remove(id: string) {
      return SubjectApi().remove(id)
    },
    findOne(id: string) {
      return SubjectApi().getOne(id) 
    },
    findTeacherSubjects(id: string) {
      return SubjectApi().getOne(id) 
    }
  }
})
