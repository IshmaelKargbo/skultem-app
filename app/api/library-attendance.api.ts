// /library/attendance endpoints. Errors go through useHandleError, which throws an Error with the backend's
// message, so callers can show it as-is.
export const LibraryAttendanceApi = () => {
  const { $api } = useNuxtApp()
  const base = '/library/attendance'

  function query(params: Record<string, string | number | boolean | undefined | null>) {
    return Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
      .join('&')
  }

  async function get<T>(path: string, params: Record<string, string | number | boolean | undefined | null> = {}): Promise<T> {
    try {
      const qs = query(params)
      const res = await $api(`${base}${path}${qs ? `?${qs}` : ''}`) as any
      return res.data as T
    } catch (err: any) {
      useHandleError(err)
      throw err
    }
  }

  async function send<T>(path: string, method: 'POST' | 'PUT', body?: object, headers?: Record<string, string>): Promise<T> {
    try {
      const res = await $api(`${base}${path}`, { method, body, headers }) as any
      return res?.data as T
    } catch (err: any) {
      useHandleError(err)
      throw err
    }
  }

  // Same approach as ReportApi.download: a plain fetch with the access token, saved under the server's file name.
  async function download(path: string, params: Record<string, string | undefined>) {
    const config = useRuntimeConfig()
    const configured = (config.public.apiBase || 'http://localhost:8080').replace(/\/+$/, '')
    const apiBase = /\/api\/v\d+$/.test(configured) ? configured : `${configured}/api/v1`
    const { accessToken } = useAuthCookies()

    const res = await fetch(`${apiBase}${base}${path}?${query(params)}`, {
      headers: accessToken.value ? { Authorization: `Bearer ${accessToken.value}` } : {}
    })
    if (!res.ok) throw new Error(`Failed to download the report (${res.status})`)

    const disposition = res.headers.get('content-disposition') || ''
    const filename = disposition.includes('filename=')
      ? disposition.split('filename=')[1]!.replace(/"/g, '').trim()
      : `library-report.${params.format || 'csv'}`
    downloadBlob(await res.blob(), filename)
  }

  return {
    overview: () => get<LibraryAttendanceOverview>('/overview'),

    listVisits: async (page: number, size: number, filters: { from?: string, to?: string, studentId?: string, search?: string, status?: VisitFilter } = {}) => {
      try {
        const res = await $api(`${base}/visits?${query({ page, size, ...filters })}`) as any
        return { data: (res.data || []) as LibraryVisit[], meta: useMeta(res.meta) }
      } catch (err: any) {
        useHandleError(err)
        throw err
      }
    },
    // The key makes a retried check-in (e.g. after a dropped connection) safe: the backend answers it once.
    checkIn: (studentIds: string[], eligibleOnly: boolean, idempotencyKey: string) =>
      send<CheckInResult>('/visits/check-in', 'POST', { studentIds, eligibleOnly }, { 'Idempotency-Key': idempotencyKey }),
    checkOut: (visitId: string) => send<LibraryVisit>(`/visits/${visitId}/check-out`, 'POST'),
    resolveVisit: (visitId: string, reason: string) => send<LibraryVisit>(`/visits/${visitId}/resolve`, 'POST', { reason }),

    listSessions: (from: string, to: string, filters: { classSessionId?: string, status?: SessionFilter } = {}) =>
      get<LibrarySession[]>('/sessions', { from, to, ...filters }),
    session: (id: string) => get<LibrarySessionDetail>(`/sessions/${id}`),
    openSession: (timetableEntryId: string, date: string) =>
      send<LibrarySessionDetail>('/sessions/open', 'POST', { timetableEntryId, date }),
    cancelUpcoming: (timetableEntryId: string, date: string, reason: string) =>
      send<LibrarySessionDetail>('/sessions/cancel', 'POST', { timetableEntryId, date, reason }),
    cancelSession: (id: string, reason: string) => send<LibrarySessionDetail>(`/sessions/${id}/cancel`, 'POST', { reason }),
    saveMarks: (id: string, marks: { recordId: string, status: FinalStatus, excuseReason?: string | null }[]) =>
      send<LibrarySessionDetail>(`/sessions/${id}/marks`, 'PUT', { marks }),
    addToRoster: (id: string, studentId: string, reason: string) =>
      send<LibrarySessionDetail>(`/sessions/${id}/roster`, 'POST', { studentId, reason }),
    removeFromRoster: (id: string, recordId: string, reason: string) =>
      send<LibrarySessionDetail>(`/sessions/${id}/roster/${recordId}/remove`, 'POST', { reason }),
    finalize: (id: string) => send<LibrarySessionDetail>(`/sessions/${id}/finalize`, 'POST'),
    correct: (id: string, recordId: string, status: FinalStatus, reason: string, excuseReason?: string | null) =>
      send<LibrarySessionDetail>(`/sessions/${id}/records/${recordId}/correct`, 'POST', { status, reason, excuseReason }),

    studentHistory: (studentId: string) => get<StudentLibraryHistory>(`/students/${studentId}/history`),
    totals: (from: string, to: string, classSessionId?: string) =>
      get<LibraryAttendanceTotals>('/totals', { from, to, classSessionId }),

    exportVisits: (format: 'csv' | 'pdf', filters: { from?: string, to?: string, status?: VisitFilter }) =>
      download('/export/visits', { format, ...filters }),
    exportSessions: (format: 'csv' | 'pdf', from: string, to: string, status?: SessionFilter) =>
      download('/export/sessions', { format, from, to, status }),
    exportTotals: (format: 'csv' | 'pdf', from: string, to: string) =>
      download('/export/totals', { format, from, to }),
    exportStudent: (format: 'csv' | 'pdf', studentId: string) =>
      download(`/export/students/${studentId}`, { format })
  }
}
