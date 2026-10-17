// Support tickets, notification history and platform health - see backend SupportController and
// PlatformOperationsController.
export const SupportApi = () => {
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

  const send = async <T>(url: string, method: 'POST' | 'PUT', body?: unknown) => {
    try {
      return (await $api(url, { method, body }) as any)?.data as T
    } catch (err: any) {
      useHandleError(err)
    }
  }

  const base = '/system/support'

  return {
    tickets: (params: { page: number, size: number, status?: string, priority?: string, assignedTo?: string, search?: string, view?: string }) => {
      const q = new URLSearchParams({ page: String(params.page), size: String(params.size) })
      for (const key of ['status', 'priority', 'assignedTo', 'search', 'view'] as const) {
        if (params[key]) q.set(key, params[key]!)
      }
      return get<SupportTicket[]>(`${base}/tickets?${q}`)
    },
    summary: async () => (await get<SupportSummary>(`${base}/summary`))?.data,
    ticket: async (id: string) => (await get<TicketDetail>(`${base}/tickets/${id}`))?.data,
    create: (dto: CreateTicketDto) => send<TicketDetail>(`${base}/tickets`, 'POST', dto),
    update: (id: string, dto: { category?: string, priority?: string, assignedToId?: string, clearAssignee?: boolean }) =>
      send<TicketDetail>(`${base}/tickets/${id}`, 'PUT', dto),
    changeStatus: (id: string, status: string, resolutionNote?: string) =>
      send<TicketDetail>(`${base}/tickets/${id}/status`, 'POST', { status, resolutionNote }),
    addMessage: (id: string, kind: string, body: string) => send<TicketDetail>(`${base}/tickets/${id}/messages`, 'POST', { kind, body }),

    notificationOverview: async (days = 30) => (await get<NotificationOverview>(`/system/notifications/overview?days=${days}`))?.data,
    broadcasts: (params: { page: number, size: number, search?: string }) => {
      const q = new URLSearchParams({ page: String(params.page), size: String(params.size) })
      if (params.search) q.set('search', params.search)
      return get<BroadcastRecord[]>(`/system/notifications/broadcasts?${q}`)
    },
    health: async () => (await get<PlatformHealth>('/system/health'))?.data
  }
}
