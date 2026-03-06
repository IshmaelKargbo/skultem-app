import { defineStore } from 'pinia'

export const useClassStore = defineStore('class', {
  state: () => ({
    records: [] as Clazz[],
    meta: {} as Meta,
    loading: false,
    error: null as string | null
  }),

  actions: {
    async fetchAll(page: number = 1, size: number = 6) {
      this.loading = true
      this.error = null
      try {
        const response = await ClassApi().getAll(page, size) as any
        this.records = response.data || []
        this.meta = response.meta || {} as Meta
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch classes'
      } finally {
        this.loading = false
      }
    },
    create(payload: CreateClassDto) {
      return ClassApi().create(payload)
    },
    assignStudentClass(payload: AssignStudentsDto) {
      return ClassApi().assignStudentToClass(payload)
    },
    assignClassMaster(id: string, payload: AssignMastertsDto) {
      return ClassApi().assignClassMaster(id, payload)
    },
    findOne(id: string) {
      return ClassApi().getOne(id) 
    },
    findAllStreams(id: string) {
      return ClassApi().getAllStreams(id) 
    },
    async findAllSections(id: string) {
      const res = await ClassApi().getAllSections(id) 
      if (res) return res
    },
    findClassMaster(id: string) {
      return ClassApi().getCurrentClassMaster(id) 
    },
    updateTemplate(classId: string, templateId: string) {
      return ClassApi().updateTemplate(classId, templateId)
    }
  }
})
