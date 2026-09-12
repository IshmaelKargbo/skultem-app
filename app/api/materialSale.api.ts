export const MaterialSaleApi = () => {
  const { $api } = useNuxtApp()

  return {
    getAll: async (page: number, size: number, search?: string, status?: string, paidPending?: boolean) => {
      try {
        const query = search ? `&search=${encodeURIComponent(search)}` : ''
        const statusQuery = status ? `&status=${encodeURIComponent(status)}` : ''
        const paidPendingQuery = paidPending ? '&paidPending=true' : ''
        const res = await $api(`/materials/sales?page=${page}&size=${size}${query}${statusQuery}${paidPendingQuery}`) as any

        if (!res)
          throw new Error('Failed to fetch material sales')

        const data = res.data

        const meta = useMeta(res.meta)

        return { ...res, data, meta }

      } catch (err: any) {
        useHandleError(err)
      }
    },
    getSummary: async () => {
      try {
        const res = await $api('/materials/sales/summary') as any
        return res?.data
      } catch (err: any) {
        useHandleError(err)
      }
    },
    create: async (payload: CreateMaterialSaleDto) => {
      try {
        return await $api('/materials/sales', {
          method: 'POST',
          body: payload
        })
      } catch (err: any) {
        useHandleError(err)
      }
    },
    fulfill: async (id: string, note?: string) => {
      try {
        return await $api(`/materials/sales/${id}/fulfill`, {
          method: 'POST',
          body: { note }
        })
      } catch (err: any) {
        useHandleError(err)
      }
    },
    recordPayment: async (id: string, payload: RecordSalePaymentDto) => {
      try {
        return await $api(`/materials/sales/${id}/payment`, {
          method: 'POST',
          body: payload
        })
      } catch (err: any) {
        useHandleError(err)
      }
    },
    cancel: async (id: string) => {
      try {
        return await $api(`/materials/sales/${id}`, {
          method: 'DELETE'
        })
      } catch (err: any) {
        useHandleError(err)
      }
    }
  }
}
