export const ReportCardSettingApi = () => {
  const { $api } = useNuxtApp()

  return {
    get: async () => {
      try {
        const res = await $api('/report-card-setting') as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },

    save: async (payload: Record<string, any>) => {
      try {
        const res = await $api('/report-card-setting', {
          method: 'PUT',
          body: payload
        }) as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    }
  }
}
