import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    records: [] as User[],
    meta: {} as Meta,
    loading: false,
    meLoading: true,
    user: {} as User,
    error: null as string | null
  }),
  actions: {
    async fetchAll(page: number = 1, size: number = 6) {
      this.loading = true
      this.error = null
      try {
        const response = await UserApi().getAll(page, size) as any
        this.records = response.data || []
        this.meta = response.meta || {} as Meta
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch users'
      } finally {
        this.loading = false
      }
    },
    create(payload: CreateUserDto) {
      return UserApi().create(payload)
    },
    resetPassword(payload: ResetPasswordDto) {
      return UserApi().resetPassword(payload)
    },
    assignRole(payload: AssignRoleDTO) {
      return UserApi().assign(payload)
    },
    async me() {
      try {
        this.meLoading = true
        const res = await UserApi().me()
        if (res == null) return
        this.user = res
      } finally {
        this.meLoading = false
      }
    },
    async login(payload: LoginDto) {
      const res = await UserApi().login(payload)
      const { accessToken, refreshToken } = useAuthCookies()

      accessToken.value = res.accessToken
      refreshToken.value = res.refreshToken

      return res
    },
    async systemAdminLogin(payload: SystemAdminLoginDto) {
      const res = await UserApi().systemAdminLogin(payload)
      const { accessToken, refreshToken } = useAuthCookies()

      accessToken.value = res.accessToken
      refreshToken.value = res.refreshToken

      return res
    },
    async logout() {
      await UserApi().logout()

      const { accessToken, refreshToken, activeRole } = useAuthCookies()

      accessToken.value = null
      refreshToken.value = null
      activeRole.value = null
    },
    findOne(id: string) {
      return UserApi().getOne(id)
    },
    payrollStatus(id: string) {
      return UserApi().payrollStatus(id)
    },
    includeInPayroll(id: string, payload: IncludeUserInPayrollDto) {
      return UserApi().includeInPayroll(id, payload)
    },
    updatePhoto(id: string, photo: File) {
      return UserApi().updatePhoto(id, photo)
    },
    async updateMyPhoto(photo: File) {
      const res = await UserApi().updateMyPhoto(photo)
      if (res) this.user = res
      return res
    }
  }
})
