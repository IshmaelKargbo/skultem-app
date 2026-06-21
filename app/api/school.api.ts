export const SchoolApi = () => {
  const { $api } = useNuxtApp()

  return {
    checkTenant: async (domain: string) => {
      try {
        const res = await $api(`/auth/tenant?domain=${domain}`) as any

        if (!res)
          throw new Error('Failed to fetch auth')

        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },
    get: async (id: string) => {
      try {
        const res = await $api(`/school/${id}`) as any

        if (!res)
          throw new Error('Failed to fetch school')

        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    }
  }
}
