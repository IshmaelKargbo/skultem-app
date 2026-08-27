export const PromotionApi = () => {
  const { $api } = useNuxtApp()

  return {
    // --- Class master: submit / resume ---
    getPromotionRoster: async (sessionId: string) => {
      try {
        const res = await $api(`/promotion/requests/session/${sessionId}/roster`) as any

        if (!res)
          throw new Error('Failed to fetch promotion roster')

        return res.data as PromotionRoster
      } catch (err: any) {
        useHandleError(err)
      }
    },
    submitPromotionRequest: async (sessionId: string, note: string, items: {
      studentId: string
      enrollmentId: string
      outcome: PromotionOutcome
      remark: string | null
      targetStreamId: string | null
    }[]) => {
      try {
        const res = await $api(`/promotion/requests/session/${sessionId}`, {
          method: 'POST',
          body: { note, items }
        }) as any

        if (!res)
          throw new Error('Failed to submit promotion')

        return res.data as PromotionRequest
      } catch (err: any) {
        useHandleError(err)
      }
    },
    getCurrentPromotionRequestForSession: async (sessionId: string) => {
      try {
        const res = await $api(`/promotion/requests/session/${sessionId}/current`) as any

        if (!res)
          throw new Error('Failed to fetch promotion request')

        return res.data as PromotionRequest | null
      } catch (err: any) {
        useHandleError(err)
      }
    },
    getMyPromotionRequests: async (page: number, size: number) => {
      try {
        const res = await $api(`/promotion/requests/mine?page=${page}&size=${size}`) as any

        if (!res)
          throw new Error('Failed to fetch promotion requests')

        return { data: res.data as PromotionRequest[], meta: useMeta(res.meta) }
      } catch (err: any) {
        useHandleError(err)
      }
    },

    // --- Admin / proprietor: review queue ---
    listPromotionRequests: async (status: string | undefined, page: number, size: number) => {
      try {
        const query = new URLSearchParams({ page: String(page), size: String(size) })
        if (status) query.set('status', status)

        const res = await $api(`/promotion/requests?${query.toString()}`) as any

        if (!res)
          throw new Error('Failed to fetch promotion requests')

        return { data: res.data as PromotionRequest[], meta: useMeta(res.meta) }
      } catch (err: any) {
        useHandleError(err)
      }
    },
    getPromotionRequest: async (id: string) => {
      try {
        const res = await $api(`/promotion/requests/${id}`) as any

        if (!res)
          throw new Error('Failed to fetch promotion request')

        return res.data as PromotionRequest
      } catch (err: any) {
        useHandleError(err)
      }
    },
    returnPromotionRequest: async (id: string, note: string) => {
      try {
        const res = await $api(`/promotion/requests/${id}/return`, {
          method: 'POST',
          body: { note }
        }) as any

        if (!res)
          throw new Error('Failed to return promotion request')

        return res.data as PromotionRequest
      } catch (err: any) {
        useHandleError(err)
      }
    },
    approvePromotionRequest: async (id: string, note?: string, allowToPassEnrollmentIds?: string[]) => {
      try {
        const res = await $api(`/promotion/requests/${id}/approve`, {
          method: 'POST',
          body: { note, allowToPassEnrollmentIds }
        }) as any

        if (!res)
          throw new Error('Failed to approve promotion request')

        return res.data as PromotionRequest
      } catch (err: any) {
        useHandleError(err)
      }
    },
    getPromotionProgress: async () => {
      try {
        const res = await $api('/promotion/progress') as any

        if (!res)
          throw new Error('Failed to fetch promotion progress')

        return res.data as PromotionProgress
      } catch (err: any) {
        useHandleError(err)
      }
    },
    closeAcademicYear: async () => {
      try {
        const res = await $api('/promotion/close-year', { method: 'POST' }) as any

        if (!res)
          throw new Error('Failed to close academic year')

        return res
      } catch (err: any) {
        useHandleError(err)
      }
    },

    // --- Admin / proprietor: promotion rules ---
    getPromotionConfig: async () => {
      try {
        const res = await $api('/promotion/config') as any

        if (!res)
          throw new Error('Failed to fetch promotion rules')

        return res.data as PromotionConfig
      } catch (err: any) {
        useHandleError(err)
      }
    },
    updatePromotionConfig: async (payload: PromotionConfig) => {
      try {
        const res = await $api('/promotion/config', {
          method: 'POST',
          body: payload
        }) as any

        if (!res)
          throw new Error('Failed to update promotion rules')

        return res.data as PromotionConfig
      } catch (err: any) {
        useHandleError(err)
      }
    }
  }
}
