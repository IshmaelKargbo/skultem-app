export type SkullyReminderSettings = { examReminders: boolean, eventReminders: boolean, feeReminders: boolean }
export type SkullySettingsView = {
  enabled: boolean
  settings: SkullyReminderSettings
  sentThisMonth: number
  optedOut: number
}

// Skully, the parents' WhatsApp assistant: the school's reminder settings.
export const SkullyApi = () => {
  const { $api } = useNuxtApp()

  return {
    settings: async (): Promise<SkullySettingsView | undefined> => {
      try {
        const res = await $api('/skully/settings') as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },

    save: async (settings: SkullyReminderSettings): Promise<SkullySettingsView> => {
      const res = await $api('/skully/settings', { method: 'PUT', body: settings }) as any
      return res.data
    }
  }
}
