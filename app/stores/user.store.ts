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
        // this.loading = false
      }
    },
    create(payload: CreateUserDto) {
      return UserApi().create(payload)
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
      const accessToken = useCookie("access_token")
      const refreshToken = useCookie("refresh_token")

      accessToken.value = res.accessToken
      refreshToken.value = res.refreshToken

      return res
    },
    async logout() {
      await UserApi().logout()

      const accessToken = useCookie("access_token")
      const refreshToken = useCookie("refresh_token")
      const activeRole = useCookie("active_role")

      accessToken.value = null
      refreshToken.value = null
      activeRole.value = null
    },
    findOne(id: string) {
      return UserApi().getOne(id)
    }
  }
})
