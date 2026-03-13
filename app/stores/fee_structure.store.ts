import { defineStore } from 'pinia'

export const useFeeStructureStore = defineStore('fee_structure', {
  state: () => ({
    records: [] as FeeStructure[],
    meta: {} as Meta,
    loading: false,
    error: null as string | null
  }),

  actions: {
    async fetchAll(page: number = 1, size: number = 6) {
      this.loading = true
      this.error = null
      try {
        const response = await FeeApi().getAllStructures(page, size) as any
        this.records = response.data || []
        this.meta = response.meta || {} as Meta
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch fee structures'
      } finally {
        this.loading = false
      }
    },
    create(payload: CreateFeeStructureDto) {
      return FeeApi().createStructure(payload)
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
