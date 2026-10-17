// Roles, platform settings and the audit log - see backend PlatformGovernanceController.
export const PlatformApi = () => {
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

  const put = async <T>(url: string, body: unknown) => {
    try {
      return (await $api(url, { method: 'PUT', body }) as any)?.data as T
    } catch (err: any) {
      useHandleError(err)
    }
  }

  return {
    // National calendar and each school's platform fee override - see backend PlatformSettingController.
    getCalendar: async () => (await get<NationalCalendar>('/platform/calendar'))?.data,
    saveCalendar: (payload: SaveNationalCalendarPayload) => put<NationalCalendar>('/platform/calendar', payload),
    listFeeSettings: async () => (await get<PlatformFeeSetting[]>('/platform/fee-setting'))?.data,
    updateFeeSetting: (schoolId: string, amount: number) => put<PlatformFeeSetting>(`/platform/${schoolId}/fee-setting`, { amount }),
    me: async () => (await get<PlatformAccess>('/system/me/access'))?.data,
    roles: async () => (await get<{ roles: PlatformRoleInfo[], staff: PlatformStaff[] }>('/system/roles'))?.data,
    assignRole: (userId: string, role: string) => put<PlatformStaff>(`/system/roles/${userId}`, { role }),
    platformFee: async () => (await get<PlatformFeeOverview>('/system/platform-fee'))?.data,
    feeCollections: async () => (await get<PlatformFeeCollections>('/system/platform-fee/collections'))?.data,
    setPlatformFee: (perTerm: number) => put<PlatformFeeOverview>('/system/platform-fee', { perTerm }),
    auditLogs: (params: { page: number, size: number, search?: string, status?: string, from?: string, to?: string }) => {
      const q = new URLSearchParams({ page: String(params.page), size: String(params.size) })
      if (params.search) q.set('search', params.search)
      if (params.status) q.set('status', params.status)
      if (params.from) q.set('from', params.from)
      if (params.to) q.set('to', params.to)
      return get<AuditEntry[]>(`/system/audit-logs?${q}`)
    }
  }
}
