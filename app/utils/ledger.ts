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
// A school's platform fee for the year - see backend PlatformFeeReportDTO.
export type PlatformFeeReport = {
    expected: number
    collected: number
    outstanding: number
}

// What the Student Ledger can be narrowed by - all optional; see backend ListStudentLedgerBySchoolUseCase.
export type LedgerFilters = {
    search?: string
    classId?: string
    type?: string
    termId?: string
    sort?: string
}

// What the Transactions page can be narrowed by - all optional; see backend SearchTransactionsUseCase.
// `from` / `to` are yyyy-mm-dd, both inclusive.
export type TransactionFilters = {
    type?: string
    direction?: string
    referenceType?: string
    from?: string
    to?: string
    sort?: string
}
