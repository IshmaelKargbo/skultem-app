import { defineStore } from 'pinia'

export const useStudentStore = defineStore('student', {
  state: () => ({
    records: [] as Student[],
    record: undefined as Student | undefined,
    activeCycle: null as ActiveCycle | null,
    meta: {} as Meta,
    loading: true,
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
    async fetchStudent(id: string) {
      this.loading = true
      this.error = null
      try {
        return await StudentApi().getStudent(id) as any
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch student'
      } finally {
        this.loading = false
      }
    },
    async viewStudent(id: string) {
      this.loading = true
      this.error = null
      try {
        const res = await StudentApi().getStudent(id) as any
        this.record = res
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch student'
      } finally {
        this.loading = false
      }
    },
    async fetchActiveCycle(sessionId: string = "") {
      this.loading = true
      this.error = null
      try {
        const response = await StudentApi().getActiveCycle(sessionId) as any
        this.activeCycle = response || null
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch student active cycle'
      } finally {
        this.loading = false
      }
    },
    async fetchRank(id: string, termId: string) {
      this.loading = true
      this.error = null
      try {
        const response = await StudentApi().getRank(id, termId) as any
        return response
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch student rank'
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
    create(payload: FormData) {
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
