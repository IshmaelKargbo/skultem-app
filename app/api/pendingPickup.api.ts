export const PendingPickupApi = () => {
  const { $api } = useNuxtApp()

  return {
    getAll: async (page: number, size: number) => {
      try {
        const res = await $api(`/materials/pending-pickups?page=${page}&size=${size}`) as any

        if (!res)
          throw new Error('Failed to fetch pending pickups')

        const data = res.data
        const meta = useMeta(res.meta)

        return { ...res, data, meta }
      } catch (err: any) {
        useHandleError(err)
      }
    }
  }
}
