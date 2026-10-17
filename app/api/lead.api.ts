// The system admin's sales pipeline: leads and the onboarding of the ones that become schools.
export const LeadApi = () => {
  const { $api } = useNuxtApp()

  const get = async <T>(url: string) => {
    try {
      const res = await $api(url) as any
      if (!res)
        throw new Error('Failed to fetch')
      // Only paged lists carry a meta block; plain reads (a summary, the plans, the roles) don't.
      return { ...res, data: res.data as T, meta: res.meta ? useMeta(res.meta) : undefined }
    } catch (err: any) {
      useHandleError(err)
    }
  }

  const send = async <T>(url: string, method: 'POST' | 'PUT' | 'DELETE', body?: unknown) => {
    try {
      const res = await $api(url, { method, body }) as any
      return res?.data as T
    } catch (err: any) {
      useHandleError(err)
    }
  }

  return {
    list: (params: { page: number, size: number, status?: string, assignedTo?: string, search?: string, view?: string }) => {
      const q = new URLSearchParams({ page: String(params.page), size: String(params.size) })
      if (params.status) q.set('status', params.status)
      if (params.assignedTo) q.set('assignedTo', params.assignedTo)
      if (params.search) q.set('search', params.search)
      if (params.view) q.set('view', params.view)
      return get<Lead[]>(`/system/leads?${q}`)
    },
    summary: async () => (await get<LeadSummary>('/system/leads/summary'))?.data,
    staff: async () => (await get<StaffMember[]>('/system/staff'))?.data ?? [],
    detail: async (id: string) => (await get<LeadDetail>(`/system/leads/${id}`))?.data,
    create: (dto: SaveLeadDto) => send<Lead>('/system/leads', 'POST', dto),
    update: (id: string, dto: SaveLeadDto) => send<Lead>(`/system/leads/${id}`, 'PUT', dto),
    changeStatus: (id: string, status: string, reason?: string) => send<Lead>(`/system/leads/${id}/status`, 'POST', { status, reason }),
    demo: (id: string, status: string, at?: string) => send<Lead>(`/system/leads/${id}/demo`, 'POST', { status, at }),
    addNote: (id: string, kind: string, body: string) => send<Lead>(`/system/leads/${id}/notes`, 'POST', { kind, body }),
    convert: (id: string, schoolId: string) => send<Lead>(`/system/leads/${id}/convert`, 'POST', { schoolId }),
    startOnboarding: (id: string) => send<Onboarding>(`/system/leads/${id}/onboarding`, 'POST'),

    onboardings: (params: { page: number, size: number, status?: string, search?: string }) => {
      const q = new URLSearchParams({ page: String(params.page), size: String(params.size) })
      if (params.status) q.set('status', params.status)
      if (params.search) q.set('search', params.search)
      return get<Onboarding[]>(`/system/onboardings?${q}`)
    },
    onboarding: async (id: string) => (await get<Onboarding>(`/system/onboardings/${id}`))?.data,
    updateOnboarding: (id: string, dto: { assignedToId: string | null, schoolId: string | null }) =>
      send<Onboarding>(`/system/onboardings/${id}`, 'PUT', dto),
    updateStep: (id: string, stepId: string, dto: OnboardingStepUpdate) =>
      send<Onboarding>(`/system/onboardings/${id}/steps/${stepId}`, 'PUT', dto),
    addStep: (id: string, label: string) => send<Onboarding>(`/system/onboardings/${id}/steps`, 'POST', { label }),
    removeStep: (id: string, stepId: string) => send<Onboarding>(`/system/onboardings/${id}/steps/${stepId}`, 'DELETE')
  }
}
