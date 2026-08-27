import { defineStore } from 'pinia'

export const useClassStore = defineStore('class', {
  state: () => ({
    records: [] as Clazz[],
    record: undefined as Clazz | undefined,
    overview: undefined as ClassOverview | undefined,
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
    async viewClass(id: string) {
      this.loading = true
      this.error = null
      this.record = undefined
      this.overview = undefined
      try {
        const [record, overview] = await Promise.all([
          ClassApi().getOne(id),
          ClassApi().getOverview(id)
        ])
        this.record = record
        this.overview = overview
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch class'
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
    },
    async setNextClass(id: string, nextClass: string) {
      const res = await ClassApi().setNextClass(id, nextClass)
      if (res && this.record?.id === id) this.record = res
      return res
    },
    async setTerminal(id: string, terminal: boolean) {
      const res = await ClassApi().setTerminal(id, terminal)
      if (res && this.record?.id === id) this.record = res
      return res
    }
  }
})
