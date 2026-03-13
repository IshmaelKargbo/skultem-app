import { defineStore } from 'pinia'

export const useStudentStore = defineStore('student', {
  state: () => ({
    records: [] as Student[],
    meta: {} as Meta,
    loading: false,
    error: null as string | null
  }),

  actions: {
    async fetchAll(page: number = 1, size: number = 6) {
      this.loading = true
      this.error = null
      try {
        const response = await StudentApi().getAll(page, size) as any
        this.records = response.data || []
        this.meta = response.meta || {} as Meta
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch students'
      } finally {
        this.loading = false
      }
    },
    async fetchAllAndReturn(page: number = 1, size: number = 6) {
      this.loading = true
      this.error = null
      try {
        const response = await StudentApi().getAll(page, size) as any
        return { records: response.data, meta: response.meta }
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch students'
      } finally {
        this.loading = false
      }
    },
    async getAllStudentFeesById(id: string) {
      this.loading = true
      this.error = null
      try {
        const response = await StudentApi().getAllStudentFeesById(id) as any
        return { records: response.data }
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch student fees'
      } finally {
        this.loading = false
      }
    },
    async getAllEnrollmentByClass(id: string) {
      this.loading = true
      this.error = null
      try {
        const response = await StudentApi().getAllEnrollmentByClass(id) as any
        return { records: response }
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch student fees'
      } finally {
        this.loading = false
      }
    },
    async getAllStudentOutstandingFeesById(id: string) {
      this.loading = true
      this.error = null
      try {
        const response = await StudentApi().getAllStudentOutstandingFeesById(id) as any
        return response.data;
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch student fees'
      } finally {
        this.loading = false
      }
    },
    async getPaymentHistoryByStudent(studentId: string, page: number = 1, size: number = 6) {
      this.loading = true
      this.error = null
      try {
        const response = await StudentApi().getPaymentHistoryByStudent(studentId, page, size) as any
        return { records: response.data || [], meta: response.meta || {} as Meta }
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch payment history'
      } finally {
        this.loading = false
      }
    },
    create(payload: CreateStudentDto) {
      return StudentApi().create(payload)
    },
    findEnrollmentByStudent(id: string) {
      return StudentApi().getCurrentEnrollment(id)
    },
    sumFeesPaidByStudentAndFee(student: string, fee: string) {
      return StudentApi().sumFeesPaidByStudentAndFee(student, fee) 
    }
  }
})
