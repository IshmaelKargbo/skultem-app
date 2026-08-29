export const ReceiptSettingApi = () => {
  const { $api } = useNuxtApp()

  return {
    get: async () => {
      try {
        const res = await $api('/receipt-setting') as any
        return res.data as ReceiptSetting
      } catch (err: any) {
        useHandleError(err)
      }
    },

    save: async (payload: ReceiptSetting) => {
      try {
        const res = await $api('/receipt-setting', {
          method: 'PUT',
          body: payload
        }) as any
        return res.data as ReceiptSetting
      } catch (err: any) {
        useHandleError(err)
      }
    }
  }
}
