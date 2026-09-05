// Payroll - built on top of the existing Teacher entity (this school system has no separate
// non-teaching "employee" concept yet), replacing the previously mock-only HR/Payroll frontend.

export type PayComponentType = 'FIXED' | 'PERCENTAGE'

// One named allowance/deduction line - "Housing Allowance: 20%" or "Transport: 50 flat".
// resolvedAmount is only present when the API resolved it against a basicSalary (SalaryStructure/
// SalaryTemplate responses) - build forms compute their own preview instead, see
// resolvePayComponent below.
export type PayComponent = {
    name: string
    type: PayComponentType
    value: number
    resolvedAmount?: number
}

// A row while a form is being edited - a client-only `key` so v-for has something stable to key
// on across add/remove, since PayComponent itself carries no identity (see the backend's
// PayComponent value object).
export type PayComponentRow = PayComponent & { key: string }

export function resolvePayComponent(item: { type: PayComponentType, value: number }, basicSalary: number) {
    if (item.type === 'PERCENTAGE') {
        return Math.round(((basicSalary || 0) * (item.value || 0)) / 100 * 100) / 100
    }
    return item.value || 0
}

// A reusable starting point ("Grade A Teacher", "Support Staff", ...) for a teacher's
// SalaryStructure - see SetSalaryStructureDto.templateId. Editing/deleting one never reaches back
// into a structure already built from it.
export type SalaryTemplate = {
    id: string
    schoolId: string
    name: string
    basicSalary: number
    allowances: PayComponent[]
    deductions: PayComponent[]
    totalAllowances: number
    totalDeductions: number
    grossSalary: number
    netSalary: number
    createdAt: string
    updatedAt: string
}

export type SetSalaryStructureDto = {
    teacherId: string
    templateId?: string | null
    basicSalary: number
    allowances: PayComponent[]
    deductions: PayComponent[]
}

export type SaveSalaryTemplateDto = {
    name: string
    basicSalary: number
    allowances: PayComponent[]
    deductions: PayComponent[]
}

export type SalaryStructure = {
    id: string
    schoolId: string
    teacher: Teacher
    templateId: string | null
    templateName: string | null
    basicSalary: number
    allowances: PayComponent[]
    deductions: PayComponent[]
    totalAllowances: number
    totalDeductions: number
    grossSalary: number
    netSalary: number
    createdAt: string
    updatedAt: string
}

export type PayrollRunStatus = 'DRAFT' | 'GENERATED' | 'PUBLISHED'

export type PayrollRun = {
    id: string
    schoolId: string
    period: string
    payDate: string
    status: PayrollRunStatus
    createdAt: string
    updatedAt: string
}

export type Payslip = {
    id: string
    schoolId: string
    payrollRunId: string
    payrollRunPeriod: string | null
    teacher: Teacher
    basicSalary: number
    allowances: number
    deductions: number
    grossSalary: number
    netSalary: number
    included: boolean
    createdAt: string
    updatedAt: string
}

export type PayrollRunDetail = {
    run: PayrollRun
    payslips: Payslip[]
    grossTotal: number
    deductionTotal: number
    netTotal: number
    includedCount: number
    totalCount: number
}

export type PayrollSummary = {
    teacherCount: number
    totalGross: number
    averageSalary: number
    highestSalary: number
    lowestSalary: number
    latestRun: PayrollRun | null
}

export type PayslipSetting = {
    accentColor: string
    logoUrl: string
    footerNote: string
    showWatermark: boolean
    showAmountInWords: boolean
}

export function payrollRunStatusColor(status?: PayrollRunStatus) {
    switch (status) {
        case 'PUBLISHED':
            return 'success'
        case 'GENERATED':
            return 'info'
        default:
            return 'warning'
    }
}
