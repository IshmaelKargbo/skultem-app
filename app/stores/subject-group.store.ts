import { defineStore } from 'pinia'

let latestListRequest = 0

export const useSubjectGroupStore = defineStore('subjectGroup', {
  state: () => ({
    records: [] as SubjectGroup[],
    meta: {} as Meta,
    loading: true,
    error: null as string | null
  }),

  actions: {
    async fetchAll(page: number = 1, size: number = runtimeConf().limit, classId?: string, query?: string, sortBy?: string, direction?: string) {
      // Only the latest request may update the list, so a slow older response can't overwrite
      // newer results or clear the loading state early.
      const request = ++latestListRequest
      this.loading = true
      this.error = null
      try {
        const response = await SubjectGroupApi().getAll(page, size, classId, query, sortBy, direction) as any
        if (request !== latestListRequest) return
        this.records = response.data || []
        this.meta = response.meta || {} as Meta
      } catch (err: any) {
        if (request !== latestListRequest) return
        this.error = err.data?.message || 'Failed to fetch subject groups'
      } finally {
        if (request === latestListRequest) this.loading = false
      }
    },
    async fetchAllByClass(id: string, page: number = 1, size: number = runtimeConf().limit) {
      this.loading = true
      this.error = null
      try {
        const response = await SubjectGroupApi().getAllByClass(id, page, size) as any
        return response.data
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch subject groups by class'
      } finally {
        this.loading = false
      }
    },
    async fetchAllByStream(id: string, page: number = 1, size: number = runtimeConf().limit) {
      this.loading = true
      this.error = null
      try {
        const response = await SubjectGroupApi().getAllBySubject(id, page, size) as any
        return response.data
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch subject groups by stream'
      } finally {
        this.loading = false
      }
    },
    create(payload: CreateSubjectGroupDto) {
      return SubjectGroupApi().create(payload)
    },
    edit(id: string, payload: EditSubjectGroupDto) {
      return SubjectGroupApi().edit(id, payload)
    },
    remove(id: string) {
      return SubjectGroupApi().remove(id)
    }
  }
})
