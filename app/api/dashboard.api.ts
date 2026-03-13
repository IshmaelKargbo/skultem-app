export const DashboardApi = () => {
  const { $api } = useNuxtApp()

  return {
    getAdminReport: async () => {
      try {
        const res = await $api('/dashboard/admin/report') as any

        if (!res)
          throw new Error('Failed to fetch admin report')

        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },
    getAdminWeekly: async () => {
      try {
        const res = await $api('/dashboard/admin/weekly-attendance') as any

        if (!res)
          throw new Error('Failed to fetch admin weekly-attendance')
        
        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },
    getAdminRevenue: async () => {
      try {
        const res = await $api('/dashboard/admin/revenue') as any

        if (!res)
          throw new Error('Failed to fetch admin revenue')
        
        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },
    getAdminStudentEnrollment: async () => {
      try {
        const res = await $api('/dashboard/admin/student-enrollment') as any

        if (!res)
          throw new Error('Failed to fetch admin student-enrollment')
        
        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },
    getAdminActivities: async (size: number = 10) => {
      try {
        const res = await $api('/dashboard/admin/activities', { query: { size } }) as any

        if (!res)
          throw new Error('Failed to fetch admin activities')

        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },
  }
}
