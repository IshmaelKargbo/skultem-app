export const StudentApi = () => {
  const { $api } = useNuxtApp()

  return {
    getAll: async (search: string, page: number, size: number, classId?: string, sortBy?: string, direction?: string) => {
      try {
        const params = new URLSearchParams({ page: String(page), size: String(size) })
        if (search) params.set('search', search)
        if (classId) params.set('classId', classId)
        if (sortBy) params.set('sortBy', sortBy)
        if (direction) params.set('direction', direction)

        const res = await $api(`/student?${params}`) as any

        if (!res)
          throw new Error('Failed to fetch students')

        const data = res.data
        const meta = useMeta(res.meta)

        return { ...res, data, meta }

      } catch (err: any) {
        useHandleError(err)
      }
    },
    getStudent: async (id: string) => {
      try {
        const res = await $api(`/student/${id}`) as any

        if (!res)
          throw new Error('Failed to fetch student')

        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },
    getActiveCycle: async (sessionId: string) => {
      try {
        const res = await $api(`/student/cycle/${sessionId}`) as any

        if (!res)
          throw new Error('Failed to fetch active cycle')

        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },
    getRank: async (id: string, termId: string) => {
      try {
        const res = await $api(`/student/rank/${id}?termId=${termId}`) as any

        if (!res)
          throw new Error('Failed to fetch rank')

        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },
    getAllStudentFeesById: async (id: string) => {
      try {
        const res = await $api(`/student/fee/${id}`) as any

        if (!res)
          throw new Error('Failed to fetch student fees')

        const data = res.data

        return { ...res, data }

      } catch (err: any) {
        useHandleError(err)
      }
    },
    getAllStudentOutstandingFeesById: async (id: string) => {
      try {
        const res = await $api(`/report/finance/outstanding/list?studentId=${id}`) as any

        if (!res)
          throw new Error('Failed to fetch student fees')

        const data = res.data

        return { data }

      } catch (err: any) {
        useHandleError(err)
      }
    },
    getPaymentHistoryByStudent: async (studentId: string, page: number, size: number) => {
      try {
        const res = await $api(`/report/finance/payments?studentId=${studentId}&page=${page}&size=${size}`) as any

        if (!res)
          throw new Error('Failed to fetch payment history')

        const data = res.data
        const meta = useMeta(res.meta)

        return { data, meta }
      } catch (err: any) {
        useHandleError(err)
      }
    },
    getCurrentEnrollment: async (id: string) => {
      try {
        const res = await $api(`/enrollment/student/${id}`) as any

        if (!res)
          throw new Error('Failed to fetch student enrollment')

        return res.data

      } catch (err: any) {
        useHandleError(err)
      }
    },
    getAllEnrollmentByClass: async (id: string) => {
      try {
        const res = await $api(`/enrollment/class/${id}`) as any

        if (!res)
          throw new Error('Failed to fetch student enrollments by class')

        return res.data

      } catch (err: any) {
        useHandleError(err)
      }
    },
    getByClass: async (classId: string, streamId: string | undefined, page: number, size: number) => {
      try {
        const res = await $api(`/enrollment/class/${classId}?page=${page}&size=${size}${streamId ? `&stream=${streamId}` : ''}`) as any

        if (!res)
          throw new Error('Failed to fetch students by class')

        const data = res.data
        const meta = useMeta(res.meta)

        return { data, meta }
      } catch (err: any) {
        useHandleError(err)
      }
    },
    sumFeesPaidByStudentAndFee: async (studentId: string, feeId: string) => {
      try {
        const res = await $api(`/payment/student/${studentId}/${feeId}`) as any

        if (!res)
          throw new Error('Failed to fetch sum student fees')

        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },
    create: async (payload: FormData) => {
      try {
        const res: { data: any } = await $api('/student', {
          method: 'POST',
          body: payload
        })
        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },
    // Enrollment doesn't require a photo - this adds or replaces one afterwards.
    updatePhoto: async (id: string, photo: File) => {
      try {
        const formData = new FormData()
        formData.append('photo', photo)

        const res: { data: any } = await $api(`/student/${id}/photo`, {
          method: 'PATCH',
          body: formData
        })
        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    }
  }
}
