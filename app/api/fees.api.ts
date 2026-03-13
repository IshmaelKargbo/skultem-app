export const FeeApi = () => {
  const { $api } = useNuxtApp()

  return {
    getAllCategories: async (page: number, size: number) => {
      try {
        const res = await $api(`/fee/category?page=${page}&size=${size}`) as any

        if (!res)
          throw new Error('Failed to fetch fee categories')

        const data = res.data
        const meta = useMeta(res.meta)

        return { ...res, data, meta }

      } catch (err: any) {
        useHandleError(err)
      }
    },
    getLedger: async (page: number, size: number) => {
      try {
        const res = await $api(`/fee/ledger?page=${page}&size=${size}`) as any

        if (!res)
          throw new Error('Failed to fetch fee ledgers')

        const data = res.data as any
        const meta = useMeta(res.meta)
        const total: LedgerReport = {
          finalBalance: data.finalBalance,
          totalCredit: data.totalCredit,
          totalDebit: data.totalDebit
        }

        return { total, data: data.records, meta }

      } catch (err: any) {
        useHandleError(err)
      }
    },
    caculateDiscountReport: async () => {
      try {
        const res = await $api('/fee/discount/report') as any

        if (!res)
          throw new Error('Failed to fetch fee discount report')

        return res.data;
      } catch (err: any) {
        useHandleError(err)
      }
    },
    caculateLedgerReport: async () => {
      try {
        const res = await $api('/fee/ledger/report') as any

        if (!res)
          throw new Error('Failed to fetch fee ledger report')

        return res.data;
      } catch (err: any) {
        useHandleError(err)
      }
    },
    createDiscount: async (payload: CreateFeeDiscountDto) => {
      try {
        return await $api('/fee/discount', {
          method: 'POST',
          body: payload
        })
      } catch (err: any) {
        useHandleError(err)
      }
    },
    getAllPayments: async (page: number, size: number) => {
      try {
        const res = await $api(`/payment?page=${page}&size=${size}`) as any

        if (!res)
          throw new Error('Failed to fetch fee payment')

        const data = res.data
        const meta = useMeta(res.meta)

        return { data, meta }

      } catch (err: any) {
        useHandleError(err)
      }
    },
    getAllStructures: async (page: number, size: number) => {
      try {
        const res = await $api(`/fee/structure?page=${page}&size=${size}`) as any

        if (!res)
          throw new Error('Failed to fetch fee structures')

        const data = res.data
        const meta = useMeta(res.meta)

        return { ...res, data, meta }

      } catch (err: any) {
        useHandleError(err)
      }
    },
    getAllDiscounts: async (page: number, size: number) => {
      try {
        const res = await $api(`/fee/discount?page=${page}&size=${size}`) as any

        if (!res)
          throw new Error('Failed to fetch fee discounts')

        const data = res.data
        const meta = useMeta(res.meta)

        return { ...res, data, meta }

      } catch (err: any) {
        useHandleError(err)
      }
    },
    createCategory: async (payload: CreateFeeCategoryDto) => {
      try {
        return await $api('/fee/category', {
          method: 'POST',
          body: payload
        })
      } catch (err: any) {
        useHandleError(err)
      }
    },
    recordPayment: async (payload: RecordPaymentDto) => {
      try {
        return await $api('/payment', {
          method: 'POST',
          body: payload
        })
      } catch (err: any) {
        useHandleError(err)
      }
    },
    createStructure: async (payload: CreateFeeStructureDto) => {
      try {
        return await $api('/fee/structure', {
          method: 'POST',
          body: payload
        })
      } catch (err: any) {
        useHandleError(err)
      }
    },
    assignFeeToStudent: async (payload: AssignFeeToStudentDto) => {
      try {
        return await $api('/fee/structure/assign', {
          method: 'POST',
          body: payload
        })
      } catch (err: any) {
        useHandleError(err)
      }
    },
    countByStudentsByFee: async (id: string) => {
      try {
        const res = await $api(`/fee/structure/count/${id}`) as any

        if (!res)
          throw new Error('Failed to fetch count students for fee structure')

        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },
    countByStudentFees: async (id: string) => {
      try {
        const res = await $api(`/fee/student/${id}`) as any

        if (!res)
          throw new Error('Failed to fetch count student fees')

        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    }
  }
}
