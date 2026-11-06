export const ExamOfficeApi = () => {
  const { $api } = useNuxtApp()

  return {
    // Every assessment that runs in the term, with its timetable once it's set up.
    timetables: async (termId: string) => {
      try {
        const res = await $api(`/exam-office/timetables?termId=${termId}`) as any
        return (res?.data || []) as ExamTimetableSummary[]
      } catch (err: any) {
        useHandleError(err)
      }
    },

    timetable: async (id: string, params: { classId?: string, mine?: boolean } = {}) => {
      try {
        const query = new URLSearchParams()
        if (params.classId) query.set('classId', params.classId)
        if (params.mine) query.set('mine', 'true')
        const res = await $api(`/exam-office/timetables/${id}?${query}`) as any
        return res?.data as ExamTimetable
      } catch (err: any) {
        useHandleError(err)
      }
    },

    // A parent's child: their class's papers on every published timetable this year.
    studentTimetables: async (studentId: string) => {
      try {
        const res = await $api(`/exam-office/timetables/student/${studentId}`) as any
        return (res?.data || []) as ExamTimetable[]
      } catch (err: any) {
        useHandleError(err)
      }
    },

    createTimetable: async (payload: SaveExamTimetableDto) => {
      try {
        const res = await $api('/exam-office/timetables', { method: 'POST', body: payload }) as any
        return res?.data as ExamTimetable
      } catch (err: any) {
        useHandleError(err)
      }
    },

    updateTimetable: async (id: string, payload: SaveExamTimetableDto) => {
      try {
        const res = await $api(`/exam-office/timetables/${id}`, { method: 'PUT', body: payload }) as any
        return res?.data as ExamTimetable
      } catch (err: any) {
        useHandleError(err)
      }
    },

    publishTimetable: async (id: string, publish: boolean) => {
      try {
        const res = await $api(`/exam-office/timetables/${id}/${publish ? 'publish' : 'unpublish'}`, { method: 'POST' }) as any
        return res?.data as ExamTimetable
      } catch (err: any) {
        useHandleError(err)
      }
    },

    deleteTimetable: async (id: string) => {
      try {
        await $api(`/exam-office/timetables/${id}`, { method: 'DELETE' })
      } catch (err: any) {
        useHandleError(err)
      }
    },

    addPaper: async (timetableId: string, payload: SaveExamPaperDto) => {
      try {
        const res = await $api(`/exam-office/timetables/${timetableId}/papers`, { method: 'POST', body: payload }) as any
        return res?.data as ExamTimetable
      } catch (err: any) {
        useHandleError(err)
      }
    },

    updatePaper: async (id: string, payload: SaveExamPaperDto) => {
      try {
        const res = await $api(`/exam-office/papers/${id}`, { method: 'PUT', body: payload }) as any
        return res?.data as ExamTimetable
      } catch (err: any) {
        useHandleError(err)
      }
    },

    deletePaper: async (id: string) => {
      try {
        const res = await $api(`/exam-office/papers/${id}`, { method: 'DELETE' }) as any
        return res?.data as ExamTimetable
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
