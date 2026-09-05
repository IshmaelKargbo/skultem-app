export const PlatformApi = () => {
  const { $api } = useNuxtApp()

  return {
    // Every school's setting in one call - backs the system-admin schools list. A school missing
    // from the result simply has no amount configured yet.
    listFeeSettings: async () => {
      try {
        const res = await $api('/platform/fee-setting') as any

        if (!res)
          throw new Error('Failed to fetch platform fee settings')

        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },
    getFeeSetting: async (schoolId: string) => {
      try {
        const res = await $api(`/platform/${schoolId}/fee-setting`) as any

        if (!res)
          throw new Error('Failed to fetch platform fee setting')

        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },
    updateFeeSetting: async (schoolId: string, amount: number) => {
      try {
        const res = await $api(`/platform/${schoolId}/fee-setting`, {
          method: 'PUT',
          body: { amount }
        }) as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    }
  }
}
