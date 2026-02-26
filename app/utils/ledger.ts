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

export type LedgerReport = {
    totalDebit: number,
    totalCredit: number,
    finalBalance: number
}