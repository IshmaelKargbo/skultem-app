export type SkullyReminderSettings = { examReminders: boolean, eventReminders: boolean, feeReminders: boolean }
export type SkullySettingsView = {
  enabled: boolean
  settings: SkullyReminderSettings
  sentThisMonth: number
  optedOut: number
}

// Parents who haven't had Skully's WhatsApp welcome (how to sign in) yet, and why.
export type SkullyWelcomeWaiting = { parentId: string, name: string, phone: string, children: string, reason: string }
export type SkullyWelcomeTracking = { sent: number, waiting: number, parents: SkullyWelcomeWaiting[] }

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

    welcome: async (): Promise<SkullyWelcomeTracking | undefined> => {
      try {
        const res = await $api('/skully/welcome') as any
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
