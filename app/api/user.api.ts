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
    openNotifications: async () => {
      try {
        const res = await $api(`/user/notifications`) as any

        if (!res)
          throw new Error('Failed to fetch user notifications')

        return res.data
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
    resetPassword: async (payload: ResetPasswordDto) => {
      try {
        return await $api('/user/reset-password', {
          method: 'POST',
          body: payload
        })
      } catch (err: any) {
        useHandleError(err)
      }
    },
    assign: async (payload: AssignRoleDTO) => {
      try {
        return await $api('/user/assign', {
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
    logout: async () => {
      try {
        const res = await $api('/auth/logout', {
          method: 'POST'
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
    payrollStatus: async (id: string) => {
      try {
        const res = await $api(`/user/${id}/payroll-status`) as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },
    includeInPayroll: async (id: string, payload: IncludeUserInPayrollDto) => {
      try {
        const res = await $api(`/user/${id}/include-in-payroll`, { method: 'POST', body: payload }) as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },
    updatePhoto: async (id: string, photo: File) => {
      try {
        const formData = new FormData()
        formData.append('photo', photo)

        const res = await $api(`/user/${id}/photo`, { method: 'PATCH', body: formData }) as any
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
    },
    // Self-service - the signed-in user uploading their own photo, from My Profile.
    updateMyPhoto: async (photo: File) => {
      try {
        const formData = new FormData()
        formData.append('photo', photo)

        const res = await $api('/user/me/photo', { method: 'PATCH', body: formData }) as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    }
  }
}
