export const TimetableSettingApi = () => {
  const { $api } = useNuxtApp()

  return {
    get: async () => {
      try {
        const res = await $api('/timetable-setting') as any
        return res.data as TimetableSetting
      } catch (err: any) {
        useHandleError(err)
      }
    },

    save: async (payload: TimetableSetting) => {
      try {
        const res = await $api('/timetable-setting', {
          method: 'PUT',
          body: { ...payload, accentColor: payload.accentColor || '' }
        }) as any
        return res.data as TimetableSetting
      } catch (err: any) {
        useHandleError(err)
      }
    }
  }
}
