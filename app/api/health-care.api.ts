// /health-care endpoints (docs/HEALTH_CARE.md). Errors go through useHandleError, which throws an Error with the
// backend's message, so callers can show it as-is.
export const HealthCareApi = () => {
  const { $api } = useNuxtApp()
  const base = '/health-care'

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

  async function send<T>(path: string, method: 'POST' | 'PUT' | 'DELETE', body?: object, headers?: Record<string, string>): Promise<T> {
    try {
      const res = await $api(`${base}${path}`, { method, body, headers }) as any
      return res?.data as T
    } catch (err: any) {
      useHandleError(err)
      throw err
    }
  }

  // Same approach as LibraryAttendanceApi.download: a plain fetch with the access token, saved under the server's name.
  async function download(path: string, params: Record<string, string | undefined>) {
    const config = useRuntimeConfig()
    const configured = (config.public.apiBase || 'http://localhost:8080').replace(/\/+$/, '')
    const apiBase = /\/api\/v\d+$/.test(configured) ? configured : `${configured}/api/v1`
    const { accessToken } = useAuthCookies()

    const res = await fetchOrExplain(`${apiBase}${base}${path}?${query(params)}`, {
      headers: accessToken.value ? { Authorization: `Bearer ${accessToken.value}` } : {}
    })
    if (!res.ok) throw await downloadError(res, 'Failed to download the report')

    const disposition = res.headers.get('content-disposition') || ''
    const filename = disposition.includes('filename=')
      ? disposition.split('filename=')[1]!.replace(/"/g, '').trim()
      : `health-care.${params.format || 'csv'}`
    downloadBlob(await res.blob(), filename)
  }

  type Format = 'csv' | 'pdf'

  return {
    overview: () => get<HealthCareOverview>('/overview'),

    listVisits: async (page: number, size: number, filters: {
      from?: string, to?: string, status?: HealthCareVisitFilter, outcome?: HealthCareOutcome | '', complaint?: string,
      overLimit?: boolean, studentId?: string, search?: string
    } = {}) => {
      try {
        const res = await $api(`${base}/visits?${query({ page, size, ...filters })}`) as any
        return { data: (res.data || []) as HealthCareVisit[], meta: useMeta(res.meta) }
      } catch (err: any) {
        useHandleError(err)
        throw err
      }
    },
    visit: (id: string) => get<HealthCareVisit>(`/visits/${id}`),
    check: (studentId: string, complaints: string[]) =>
      get<HealthCareVisitCheck>('/check', { studentId, complaints: complaints.join(',') }),
    // The key makes a retried start (e.g. after a dropped connection) safe: the backend answers it once.
    start: (body: {
      studentId: string, arrivedAt?: string | null, complaints: string[], complaintOther?: string | null,
      broughtBy?: string | null, temperature?: number | null, notes?: string | null, continuesVisitId?: string | null,
      overLimitReason?: string | null
    }, idempotencyKey: string) => send<HealthCareStartResult>('/visits', 'POST', body, { 'Idempotency-Key': idempotencyKey }),
    update: (id: string, body: {
      complaints: string[], complaintOther?: string | null, broughtBy?: string | null, temperature?: number | null,
      notes?: string | null, treatment?: string | null
    }) => send<HealthCareVisit>(`/visits/${id}`, 'PUT', body),
    addMedication: (id: string, body: { name: string, dose: string, givenAt?: string | null, repeatReason?: string | null }) =>
      send<HealthCareVisit>(`/visits/${id}/medications`, 'POST', body),
    removeMedication: (id: string, medicationId: string) =>
      send<HealthCareVisit>(`/visits/${id}/medications/${medicationId}`, 'DELETE'),
    medicationCheck: (id: string, name: string) => get<HealthCareMedicationCheck | null>(`/visits/${id}/medication-check`, { name }),
    close: (id: string, body: HealthCareCloseBody) => send<HealthCareVisit>(`/visits/${id}/close`, 'POST', body),
    followUp: (id: string, body: HealthCareCloseBody & { reason: string }) => send<HealthCareVisit>(`/visits/${id}/follow-up`, 'POST', body),
    addNote: (id: string, text: string) => send<HealthCareVisit>(`/visits/${id}/notes`, 'POST', { text }),
    voidVisit: (id: string, reason: string) => send<HealthCareVisit>(`/visits/${id}/void`, 'POST', { reason }),
    notifyParents: (id: string) => send<HealthCareVisit>(`/visits/${id}/notify-parents`, 'POST'),

    settings: () => get<HealthCareSettings>('/settings'),
    saveSettings: (body: Omit<HealthCareSettings, 'complaintList' | 'customized' | 'updatedByName' | 'updatedAt'>) =>
      send<HealthCareSettings>('/settings', 'PUT', body),

    dailyLog: (date: string) => get<HealthCareVisit[]>('/reports/daily', { date }),
    summary: (from: string, to: string) => get<HealthCareSummary>('/reports/summary', { from, to }),
    frequent: (from: string, to: string) => get<HealthCareFrequentVisitor[]>('/reports/frequent', { from, to }),
    limits: (from: string, to: string) => get<HealthCareLimitsReport>('/reports/limits', { from, to }),
    periods: () => get<HealthCarePeriods>('/reports/periods'),
    trends: (scope: HealthCareTrendScope, p: { month?: string, termId?: string, yearId?: string }) =>
      get<HealthCareTrends>('/reports/trends', { scope, ...p }),
    exportTrends: (format: Format, scope: HealthCareTrendScope, p: { month?: string, termId?: string, yearId?: string }) =>
      download('/export/trends', { format, scope, ...p }),
    studentHistory: (studentId: string) => get<HealthCareStudentHistory>(`/students/${studentId}/history`),

    exportDaily: (format: Format, date: string) => download('/export/daily', { format, date }),
    exportSummary: (format: Format, from: string, to: string) => download('/export/summary', { format, from, to }),
    exportFrequent: (format: Format, from: string, to: string) => download('/export/frequent', { format, from, to }),
    exportLimits: (format: Format, from: string, to: string) => download('/export/limits', { format, from, to }),
    exportStudent: (format: Format, studentId: string) => download(`/export/students/${studentId}`, { format })
  }
}

export type HealthCareCloseBody = {
  outcome: HealthCareOutcome
  leftAt?: string | null
  treatment?: string | null
  collectedBy?: string | null
  collectedByRelation?: string | null
  referredTo?: string | null
  ambulanceCalled?: boolean | null
  accompaniedBy?: string | null
  notes?: string | null
  notifyParents?: boolean
}
