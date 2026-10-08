export const HouseApi = () => {
  const { $api } = useNuxtApp()

  return {
    getAll: async (page: number, size: number, search: string = "") => {
      try {
        const res = await $api(`/house?page=${page}&size=${size}&search=${search}`) as any

        if (!res)
          throw new Error('Failed to fetch houses')

        const data = res.data
        const meta = useMeta(res.meta)

        return { ...res, data, meta }

      } catch (err: any) {
        useHandleError(err)
      }
    },

    create: async (payload: CreateHouseDto) => {
      try {
        return await $api('/house', {
          method: 'POST',
          body: payload
        })
      } catch (err: any) {
        useHandleError(err)
      }
    },

    update: async (id: string, payload: CreateHouseDto) => {
      try {
        return await $api(`/house/${id}`, {
          method: 'PUT',
          body: payload
        })
      } catch (err: any) {
        useHandleError(err)
      }
    },

    delete: async (id: string) => {
      try {
        return await $api(`/house/${id}`, { method: 'DELETE' })
      } catch (err: any) {
        useHandleError(err)
      }
    },

    assign: async (payload: AssignHouseDto) => {
      try {
        return await $api('/house/assignment', {
          method: 'POST',
          body: payload
        })
      } catch (err: any) {
        useHandleError(err)
      }
    },

    randomAssign: async (classId: string) => {
      try {
        return await $api(`/house/assignment/random/${classId}`, {
          method: 'POST'
        })
      } catch (err: any) {
        useHandleError(err)
      }
    }
  }
}
