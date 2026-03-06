export const StudentApi = () => {
  const { $api } = useNuxtApp()

  return {
    getAll: async (page: number, size: number) => {
      try {
        const res = await $api(`/student?page=${page}&size=${size}`) as any

        if (!res)
          throw new Error('Failed to fetch students')

        const data = res.data
        const meta = useMeta(res.meta)

        return { ...res, data, meta }

      } catch (err: any) {
        useHandleError(err)
      }
    },
    getAllStudentFeesById: async (id: string) => {
      try {
        const res = await $api(`/report/finance/outstanding?studentId=${id}`) as any

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
    create: async (payload: CreateStudentDto) => {
      try {
        return await $api('/student', {
          method: 'POST',
          body: payload
        })
      } catch (err: any) {
        useHandleError(err)
      }
    }
  }
}
