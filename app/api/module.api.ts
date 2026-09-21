export const ModuleApi = () => {
  const { $api } = useNuxtApp()

  return {
    // Every optional module with whether the caller's school has it installed.
    list: async () => {
      try {
        const res = await $api('/modules') as any

        if (!res)
          throw new Error('Failed to fetch modules')

        return res.data as SchoolModule[]
      } catch (err: any) {
        useHandleError(err)
      }
    },
    // Both return the refreshed catalog, so the page can redraw (including any requirement that
    // came along with an install) without a second request.
    install: async (key: string) => {
      try {
        const res = await $api(`/modules/${key}/install`, { method: 'PUT' }) as any

        if (!res)
          throw new Error('Failed to install module')

        return res.data as SchoolModule[]
      } catch (err: any) {
        useHandleError(err)
      }
    },
    disable: async (key: string) => {
      try {
        const res = await $api(`/modules/${key}/disable`, { method: 'PUT' }) as any

        if (!res)
          throw new Error('Failed to disable module')

        return res.data as SchoolModule[]
      } catch (err: any) {
        useHandleError(err)
      }
    }
  }
}
