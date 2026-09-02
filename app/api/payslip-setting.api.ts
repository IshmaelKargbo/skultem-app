export const PayslipSettingApi = () => {
  const { $api } = useNuxtApp()

  return {
    get: async () => {
      try {
        const res = await $api('/payslip-setting') as any
        return res.data as PayslipSetting
      } catch (err: any) {
        useHandleError(err)
      }
    },

    save: async (payload: PayslipSetting) => {
      try {
        const res = await $api('/payslip-setting', {
          method: 'PUT',
          body: payload
        }) as any
        return res.data as PayslipSetting
      } catch (err: any) {
        useHandleError(err)
      }
    }
  }
}
