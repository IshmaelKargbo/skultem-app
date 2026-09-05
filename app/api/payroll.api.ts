export const PayrollApi = () => {
  const { $api } = useNuxtApp()

  return {
    summary: async () => {
      try {
        const res = await $api('/payroll/salary/summary') as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },

    setSalary: async (payload: { teacherId: string, basicSalary: number, allowances: number, deductions: number }) => {
      try {
        const res = await $api('/payroll/salary', { method: 'POST', body: payload }) as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },

    listSalaries: async (page: number, size: number, search: string = '') => {
      try {
        const res = await $api(`/payroll/salary?page=${page}&size=${size}&search=${search}`) as any
        const meta = useMeta(res.meta)
        return { ...res, meta }
      } catch (err: any) {
        useHandleError(err)
      }
    },

    getSalaryByTeacher: async (teacherId: string) => {
      try {
        const res = await $api(`/payroll/salary/teacher/${teacherId}`) as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },

    getSalaryHistory: async (teacherId: string) => {
      try {
        const res = await $api(`/payroll/salary/teacher/${teacherId}/history`) as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },

    createRun: async (payload: { period: string, payDate: string }) => {
      try {
        const res = await $api('/payroll/run', { method: 'POST', body: payload }) as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },

    listRuns: async (page: number, size: number) => {
      try {
        const res = await $api(`/payroll/run?page=${page}&size=${size}`) as any
        const meta = useMeta(res.meta)
        return { ...res, meta }
      } catch (err: any) {
        useHandleError(err)
      }
    },

    getRun: async (runId: string) => {
      try {
        const res = await $api(`/payroll/run/${runId}`) as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },

    setIncluded: async (runId: string, payslipId: string, included: boolean) => {
      try {
        const res = await $api(`/payroll/run/${runId}/item/${payslipId}`, { method: 'PATCH', body: { included } }) as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },

    generateRun: async (runId: string) => {
      try {
        const res = await $api(`/payroll/run/${runId}/generate`, { method: 'PATCH' }) as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },

    publishRun: async (runId: string) => {
      try {
        const res = await $api(`/payroll/run/${runId}/publish`, { method: 'PATCH' }) as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },

    getPayslip: async (runId: string, teacherId: string) => {
      try {
        const res = await $api(`/payroll/run/${runId}/payslip/${teacherId}`) as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },

    // Self-service versions - the signed-in teacher's own history/payslip.
    getMySalaryHistory: async () => {
      try {
        const res = await $api('/payroll/me/history') as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    },

    getMyPayslip: async (runId: string) => {
      try {
        const res = await $api(`/payroll/me/payslip/${runId}`) as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    }
  }
}
