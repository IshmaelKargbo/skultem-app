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

    async searchUsers(query: string, page: number = 1, size: number = 10) {
      this.usersLoading = true
      try {
        const response = await SystemApi().searchUsers(query, page, size) as any
        this.users = response?.data || []
        this.usersMeta = response?.meta || {} as Meta
      } finally {
        this.usersLoading = false
      }
    }
  }
})
