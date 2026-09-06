import { defineStore } from 'pinia'

export const useSystemStore = defineStore('system', {
  state: () => ({
    stats: { totalSchools: 0, totalUsers: 0, totalStudents: 0 } as SystemStats,
    statsLoading: false,

    schools: [] as SystemSchool[],
    schoolsMeta: {} as Meta,
    schoolsLoading: false,

    users: [] as SystemUser[],
    usersMeta: {} as Meta,
    usersLoading: false
  }),

  actions: {
    async fetchStats() {
      this.statsLoading = true
      try {
        const response = await SystemApi().getStats() as any
        this.stats = response || this.stats
      } finally {
        this.statsLoading = false
      }
    },

    async fetchSchools(page: number = 1, size: number = 10, query?: string) {
      this.schoolsLoading = true
      try {
        const response = await SystemApi().listSchools(page, size, query) as any
        this.schools = response?.data || []
        this.schoolsMeta = response?.meta || {} as Meta
      } finally {
        this.schoolsLoading = false
      }
    },

    async updateSchoolStatus(schoolId: string, status: string) {
      const response = await SystemApi().updateSchoolStatus(schoolId, status) as any
      const index = this.schools.findIndex(s => s.id === schoolId)
      if (index !== -1 && response) {
        this.schools[index] = response
      }
      return response
    },

    async createSchool(payload: OnboardSchoolPayload) {
      const response = await SystemApi().createSchool(payload) as any
      if (response) {
        this.schools.unshift(response)
        this.stats.totalSchools += 1
      }
      return response
    },

    async updateSchool(schoolId: string, payload: EditSchoolPayload) {
      const response = await SystemApi().updateSchool(schoolId, payload) as any
      const index = this.schools.findIndex(s => s.id === schoolId)
      if (index !== -1 && response) {
        this.schools[index] = response
      }
      return response
    },

    async searchUsers(query: string, page: number = 1, size: number = 10) {
      this.usersLoading = true
      try {
        const response = await SystemApi().searchUsers(query, page, size) as any
        this.users = response?.data || []
        this.usersMeta = response?.meta || {} as Meta
      } finally {
        this.usersLoading = false
      }
    },

    async updateSchoolUserStatus(schoolId: string, userId: string, status: string) {
      const response = await SystemApi().updateSchoolUserStatus(schoolId, userId, status) as any
      if (!response) return response

      // Patch just that one membership in place, on that one user - a full re-fetch would lose
      // the caller's current page/search position for a change this small.
      const user = this.users.find(u => u.id === userId)
      const membership = user?.schools.find(s => s.schoolId === schoolId)
      if (membership) membership.status = response.status

      return response
    }
  }
})
