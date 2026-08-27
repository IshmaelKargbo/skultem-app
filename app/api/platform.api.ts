export const PlatformApi = () => {
  const { $api } = useNuxtApp()

  return {
    getFeeSetting: async () => {
      try {
        const res = await $api('/platform/fee-setting') as any

        if (!res)
          throw new Error('Failed to fetch platform fee setting')

        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },
    updateFeeSetting: async (amount: number) => {
      try {
        const res = await $api('/platform/fee-setting', {
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
