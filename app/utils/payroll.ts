// Payroll - built on top of the existing Teacher entity (this school system has no separate
// non-teaching "employee" concept yet), replacing the previously mock-only HR/Payroll frontend.

export type SalaryStructure = {
    id: string
    schoolId: string
    teacher: Teacher
    basicSalary: number
    allowances: number
    deductions: number
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
