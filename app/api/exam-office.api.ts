export const ExamOfficeApi = () => {
  const { $api } = useNuxtApp()

  return {
    schedule: async (params: { termId: string, classId?: string, mine?: boolean }) => {
      try {
        const query = new URLSearchParams({ termId: params.termId })
        if (params.classId) query.set('classId', params.classId)
        if (params.mine) query.set('mine', 'true')
        const res = await $api(`/exam-office/schedule?${query}`) as any
        return (res?.data || []) as ExamSchedule[]
      } catch (err: any) {
        useHandleError(err)
      }
    },

    createSchedule: async (payload: SaveExamScheduleDto) => {
      try {
        const res = await $api('/exam-office/schedule', { method: 'POST', body: payload }) as any
        return res?.data as ExamSchedule
      } catch (err: any) {
        useHandleError(err)
      }
    },

    updateSchedule: async (id: string, payload: SaveExamScheduleDto) => {
      try {
        const res = await $api(`/exam-office/schedule/${id}`, { method: 'PUT', body: payload }) as any
        return res?.data as ExamSchedule
      } catch (err: any) {
        useHandleError(err)
      }
    },

    deleteSchedule: async (id: string) => {
      try {
        await $api(`/exam-office/schedule/${id}`, { method: 'DELETE' })
      } catch (err: any) {
        useHandleError(err)
      }
    },

    submissions: async (termId?: string) => {
      try {
        const res = await $api(`/exam-office/submissions${termId ? `?termId=${termId}` : ''}`) as any
        return res?.data as ExamSubmissions
      } catch (err: any) {
        useHandleError(err)
      }
    },

    broadsheet: async (params: { classId: string, termId: string, streamId?: string }) => {
      try {
        const query = new URLSearchParams({ classId: params.classId, termId: params.termId })
        if (params.streamId) query.set('streamId', params.streamId)
        const res = await $api(`/exam-office/broadsheet?${query}`) as any
        return res?.data as Broadsheet
      } catch (err: any) {
        useHandleError(err)
      }
    },
  }
}
