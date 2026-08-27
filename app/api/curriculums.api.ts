function buildSchemeFilterQuery(filter?: SchemeOfWorkFilter) {
  if (!filter) return ''

  const params = new URLSearchParams()

  if (filter.subjectId) params.set('subjectId', filter.subjectId)
  if (filter.sessionId) params.set('sessionId', filter.sessionId)
  if (filter.termId) params.set('termId', filter.termId)
  if (filter.progress) params.set('progress', filter.progress)

  const query = params.toString()
  return query ? `&${query}` : ''
}

export const CurriculumsApi = () => {
  const { $api } = useNuxtApp()

  return {
    createSchemeOfWork: async (payload: CreateSchemeOfWork) => {
      try {
        const res = await $api('/curriculum/scheme', {
          method: 'POST',
          body: payload
        }) as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },
    createWeek: async (payload: CreateWeek) => {
      try {
        const res = await $api('/curriculum/scheme/week', {
          method: 'POST',
          body: payload
        }) as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },
    getWeeks: async (schemeId: string) => {
      try {
        const res = await $api(`/curriculum/scheme/weeks/${schemeId}`) as any

        if (!res)
          throw new Error('Failed to fetch scheme weeks')

        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },
    updateWeekState: async (id: string, state: LessonState) => {
      try {
        const res = await $api(`/curriculum/scheme/week/${id}/state`, {
          method: 'PATCH',
          body: { state }
        }) as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },
    getWeek: async (weekId: string) => {
      try {
        const res = await $api(`/curriculum/scheme/week/${weekId}`) as any

        if (!res)
          throw new Error('Failed to fetch week')

        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },
    getScheme: async (id: string) => {
      try {
        const res = await $api(`/curriculum/scheme/one/${id}`) as any

        if (!res)
          throw new Error('Failed to fetch scheme')

        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },
    getSchemeProgress: async (id: string) => {
      try {
        const res = await $api(`/curriculum/scheme/progress/${id}`) as any

        if (!res)
          throw new Error('Failed to fetch scheme progress')

        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },
    getSchemes: async (page: number, size: number, filter?: SchemeOfWorkFilter) => {
      try {
        const query = buildSchemeFilterQuery(filter)
        const res = await $api(`/curriculum/scheme?page=${page}&size=${size}${query}`) as any

        if (!res)
          throw new Error('Failed to fetch schemes')

        const data = res.data
        const meta = useMeta(res.meta)

        return { ...res, data, meta }
      } catch (err: any) {
        useHandleError(err)
      }
    },
    getMySchemes: async (page: number, size: number, filter?: SchemeOfWorkFilter) => {
      try {
        const query = buildSchemeFilterQuery(filter)
        const res = await $api(`/curriculum/scheme/me?page=${page}&size=${size}${query}`) as any

        if (!res)
          throw new Error('Failed to fetch my schemes')

        const data = res.data
        const meta = useMeta(res.meta)

        return { ...res, data, meta }
      } catch (err: any) {
        useHandleError(err)
      }
    },
    createLesson: async (payload: CreateLesson) => {
      try {
        const res = await $api('/curriculum/scheme/week/lesson', {
          method: 'POST',
          body: payload
        }) as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },
    getWeekLessons: async (weekId: string) => {
      try {
        const res = await $api(`/curriculum/scheme/week/${weekId}/lessons`) as any

        if (!res)
          throw new Error('Failed to fetch lesson notes')

        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },
    getLesson: async (id: string) => {
      try {
        const res = await $api(`/curriculum/lesson/${id}`) as any

        if (!res)
          throw new Error('Failed to fetch lesson note')

        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },
    updateLessonState: async (id: string, state: LessonState) => {
      try {
        const res = await $api(`/curriculum/lesson/${id}/state`, {
          method: 'PATCH',
          body: { state }
        }) as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },
    getMyLessons: async (page: number, size: number) => {
      try {
        const res = await $api(`/curriculum/lesson/me?page=${page}&size=${size}`) as any

        if (!res)
          throw new Error('Failed to fetch my lesson notes')

        const data = res.data
        const meta = useMeta(res.meta)

        return { ...res, data, meta }
      } catch (err: any) {
        useHandleError(err)
      }
    },
    getTeacherProgress: async () => {
      try {
        const res = await $api('/curriculum/teacher-progress') as any

        if (!res)
          throw new Error('Failed to fetch teacher progress')

        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },
    getTeacherProgressDetail: async (teacherId: string) => {
      try {
        const res = await $api(`/curriculum/teacher-progress/${teacherId}`) as any

        if (!res)
          throw new Error('Failed to fetch teacher progress')

        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    }
  }
}
