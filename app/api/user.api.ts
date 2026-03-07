import type Login from "~/pages/login.vue"

export const UserApi = () => {
  const { $api } = useNuxtApp()

  return {
    getAll: async (page: number, size: number) => {
      try {
        const res = await $api(`/user?page=${page}&size=${size}`) as any

        if (!res)
          throw new Error('Failed to fetch users')

        const data = res.data
        const meta = useMeta(res.meta)

        return { ...res, data, meta }

      } catch (err: any) {
        useHandleError(err)
      }
    },
    create: async (payload: CreateUserDto) => {
      try {
        return await $api('/user', {
          method: 'POST',
          body: payload
        })
      } catch (err: any) {
        useHandleError(err)
      }
    },
    login: async (payload: LoginDto) => {
      try {
        const res = await $api('/auth/login', {
          method: 'POST',
          body: payload
        })
        if (res == null) return
        return (res as any).data
      } catch (err: any) {
        useHandleError(err)
      }
    },
    refresh: async (payload: RefreshDto) => {
      try {
        const res = await $api('/auth/refresh', {
          method: 'POST',
          body: payload
        })
        if (res == null) return
        return (res as any).data
      } catch (err: any) {
        useHandleError(err)
      }
    },
    getOne: async (id: string) => {
      try {
        const res = await $api(`/user/${id}`) as any

        if (!res)
          throw new Error('Failed to fetch user')

        return res.data

      } catch (err: any) {
        useHandleError(err)
      }
    },
    me: async () => {
      try {
        const res = await $api('/user/me') as any

        if (!res)
          throw new Error('Failed to fetch user')

        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    }
  }
}
