export type Ledger = {
    date: string
    type: string
    student: string
    clazz: string
    description: string
    debit: number | null
    credit: number | null
    balance: number
}

export type Transaction = {
    id: string
    academicYearId: string
    termId: string
    type: string
    direction: string,
    amount: number
    balance: number
    referenceId: string
    referenceType: string
    createdAt: string
}

export type LedgerReport = {
    totalDebit: number,
    totalCredit: number,
    finalBalance: number
}