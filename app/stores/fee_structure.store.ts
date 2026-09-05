import { defineStore } from 'pinia'

export const useFeeStructureStore = defineStore('fee_structure', {
  state: () => ({
    records: [] as FeeStructure[],
    current: undefined as FeeStructure | undefined,
    meta: {} as Meta,
    loading: false,
    error: null as string | null
  }),

  actions: {
    async fetchAll(page: number = 1, size: number = 6, termId?: string, classId?: string, studentType?: string, sortBy?: string, direction?: string, gender?: string) {
      this.loading = true
      this.error = null
      try {
        const response = await FeeApi().getAllStructures(page, size, termId, classId, studentType, sortBy, direction, gender) as any
        this.records = response.data || []
        this.meta = response.meta || {} as Meta
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch fee structures'
      } finally {
        this.loading = false
      }
    },
    async getOne(id: string) {
      this.loading = true
      try {
        const response = await FeeApi().getStructure(id) as any
        this.current = response
        return response
      } catch (err: any) {
        throw err.data?.message || 'Failed to fetch fee structure'
      } finally {
        this.loading = false
      }
    },
    create(payload: CreateFeeStructureDto) {
      return FeeApi().createStructure(payload)
    },
    async update(id: string, payload: UpdateFeeStructureDto) {
      const response = await FeeApi().updateStructure(id, payload) as any

      const index = this.records.findIndex(f => f.id === id)
      if (index !== -1)
        this.records[index] = response

      if (this.current?.id === id)
        this.current = response

      return response
    },
    async remove(id: string) {
      await FeeApi().deleteStructure(id)
      this.records = this.records.filter(f => f.id !== id)
    },
    assignToStudent(payload: AssignFeeToStudentDto) {
      return FeeApi().assignFeeToStudent(payload)
    },
    countStudentsByFee(id: string) {
      return FeeApi().countByStudentsByFee(id)
    },
    countStudentFees(id: string) {
      return FeeApi().countByStudentFees(id)
    }
  }
})
