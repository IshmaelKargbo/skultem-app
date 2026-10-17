export const AnnouncementApi = () => {
  const { $api } = useNuxtApp()

  return {
    // What every signed-in user sees: live announcements only.
    getActive: async () => {
      try {
        const res = await $api('/announcements/active') as any
        return (res?.data ?? []) as PlatformAnnouncement[]
      } catch {
        // The notice board still works without them.
        return [] as PlatformAnnouncement[]
      }
    },
    list: async (page: number, size: number) => {
      try {
        const res = await $api(`/system/announcements?page=${page}&size=${size}`) as any
        if (!res)
          throw new Error('Failed to fetch announcements')
        return { ...res, data: res.data as PlatformAnnouncement[], meta: useMeta(res.meta) }
      } catch (err: any) {
        useHandleError(err)
      }
    },
    create: async (dto: SaveAnnouncementDto) => {
      try {
        return (await $api('/system/announcements', { method: 'POST', body: dto }) as any)?.data
      } catch (err: any) {
        useHandleError(err)
      }
    },
    update: async (id: string, dto: SaveAnnouncementDto) => {
      try {
        return (await $api(`/system/announcements/${id}`, { method: 'PUT', body: dto }) as any)?.data
      } catch (err: any) {
        useHandleError(err)
      }
    },
    remove: async (id: string) => {
      try {
        await $api(`/system/announcements/${id}`, { method: 'DELETE' })
      } catch (err: any) {
        useHandleError(err)
      }
    }
  }
}
