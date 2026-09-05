import { defineStore } from 'pinia'

export const usePayrollStore = defineStore('payroll', {
  state: () => ({
    summary: null as PayrollSummary | null,
    loadingSummary: false,

    salaries: [] as SalaryStructure[],
    salariesMeta: {} as Meta,
    loadingSalaries: false,

    currentSalary: null as SalaryStructure | null,
    salaryHistory: [] as Payslip[],
    loadingSalary: false,

    runs: [] as PayrollRun[],
    runsMeta: {} as Meta,
    loadingRuns: false,

    templates: [] as SalaryTemplate[],
    templatesMeta: {} as Meta,
    loadingTemplates: false,
    currentTemplate: null as SalaryTemplate | null,

    currentRun: null as PayrollRunDetail | null,
    loadingRun: false,

    currentPayslip: null as Payslip | null,

    error: null as string | null
  }),

  actions: {
    async fetchSummary() {
      this.loadingSummary = true
      this.error = null
      try {
        this.summary = await PayrollApi().summary()
      } catch (err: any) {
        this.error = err?.message || 'Failed to fetch payroll summary'
      } finally {
        this.loadingSummary = false
      }
    },

    async fetchSalaries(page: number = 1, size: number = 12, search: string = '', sortBy: string = '', direction: string = '') {
      this.loadingSalaries = true
      this.error = null
      try {
        const res = await PayrollApi().listSalaries(page, size, search, sortBy, direction)
        this.salaries = res?.data || []
        this.salariesMeta = res?.meta || {} as Meta
      } catch (err: any) {
        this.error = err?.message || 'Failed to fetch salary structures'
      } finally {
        this.loadingSalaries = false
      }
    },

    async setSalary(payload: SetSalaryStructureDto) {
      return await PayrollApi().setSalary(payload)
    },

    async fetchSalaryTemplates(page: number = 1, size: number = 12, search: string = '', sortBy: string = '', direction: string = '') {
      this.loadingTemplates = true
      this.error = null
      try {
        const res = await PayrollApi().listSalaryTemplates(page, size, search, sortBy, direction)
        this.templates = res?.data || []
        this.templatesMeta = res?.meta || {} as Meta
      } catch (err: any) {
        this.error = err?.message || 'Failed to fetch salary templates'
      } finally {
        this.loadingTemplates = false
      }
    },

    async fetchSalaryTemplate(id: string) {
      this.error = null
      this.currentTemplate = null
      try {
        this.currentTemplate = await PayrollApi().getSalaryTemplate(id) || null
        return this.currentTemplate
      } catch (err: any) {
        this.error = err?.message || 'Failed to fetch salary template'
      }
    },

    async createSalaryTemplate(payload: SaveSalaryTemplateDto) {
      return await PayrollApi().createSalaryTemplate(payload)
    },

    async updateSalaryTemplate(id: string, payload: SaveSalaryTemplateDto) {
      return await PayrollApi().updateSalaryTemplate(id, payload)
    },

    async deleteSalaryTemplate(id: string) {
      const res = await PayrollApi().deleteSalaryTemplate(id)
      this.templates = this.templates.filter(t => t.id !== id)
      return res
    },

    async fetchSalaryByTeacher(teacherId: string) {
      this.loadingSalary = true
      this.error = null
      this.currentSalary = null
      this.salaryHistory = []
      try {
        const [salary, history] = await Promise.all([
          PayrollApi().getSalaryByTeacher(teacherId),
          PayrollApi().getSalaryHistory(teacherId)
        ])
        this.currentSalary = salary || null
        this.salaryHistory = history || []
      } catch (err: any) {
        this.error = err?.message || 'Failed to fetch salary structure'
      } finally {
        this.loadingSalary = false
      }
    },

    async fetchRuns(page: number = 1, size: number = 10, search: string = '', status: string = '', sortBy: string = '', direction: string = '') {
      this.loadingRuns = true
      this.error = null
      try {
        const res = await PayrollApi().listRuns(page, size, search, status, sortBy, direction)
        this.runs = res?.data || []
        this.runsMeta = res?.meta || {} as Meta
      } catch (err: any) {
        this.error = err?.message || 'Failed to fetch payroll runs'
      } finally {
        this.loadingRuns = false
      }
    },

    async createRun(payload: { period: string, payDate: string }) {
      return await PayrollApi().createRun(payload)
    },

    async fetchRun(runId: string) {
      this.loadingRun = true
      this.error = null
      try {
        this.currentRun = await PayrollApi().getRun(runId)
      } catch (err: any) {
        this.error = err?.message || 'Failed to fetch payroll run'
      } finally {
        this.loadingRun = false
      }
    },

    async setIncluded(runId: string, payslipId: string, included: boolean) {
      const updated = await PayrollApi().setIncluded(runId, payslipId, included)

      if (updated && this.currentRun) {
        const index = this.currentRun.payslips.findIndex(p => p.id === payslipId)
        if (index !== -1) this.currentRun.payslips[index] = updated
      }

      return updated
    },

    async generateRun(runId: string) {
      const updated = await PayrollApi().generateRun(runId)
      if (updated && this.currentRun) this.currentRun.run = updated
      return updated
    },

    async publishRun(runId: string) {
      const updated = await PayrollApi().publishRun(runId)
      if (updated && this.currentRun) this.currentRun.run = updated
      return updated
    },

    async fetchPayslip(runId: string, teacherId: string) {
      this.error = null
      this.currentPayslip = null
      try {
        this.currentPayslip = await PayrollApi().getPayslip(runId, teacherId)
      } catch (err: any) {
        this.error = err?.message || 'Failed to fetch payslip'
      }
    },

    // Self-service versions of fetchSalaryByTeacher/fetchPayslip above.
    async fetchMySalaryHistory() {
      this.loadingSalary = true
      this.error = null
      this.salaryHistory = []
      try {
        this.salaryHistory = await PayrollApi().getMySalaryHistory() || []
      } catch (err: any) {
        this.error = err?.message || 'Failed to fetch payslip history'
      } finally {
        this.loadingSalary = false
      }
    },

    async fetchMyPayslip(runId: string) {
      this.error = null
      this.currentPayslip = null
      try {
        this.currentPayslip = await PayrollApi().getMyPayslip(runId)
      } catch (err: any) {
        this.error = err?.message || 'Failed to fetch payslip'
      }
    }
  }
})
