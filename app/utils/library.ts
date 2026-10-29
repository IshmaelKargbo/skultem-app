// Library module - shapes match the backend's /library endpoints (see LibraryController).

export type BookCategory = {
    id: string
    name: string
    description: string
    bookCount: number
    createdAt: string
    updatedAt: string
}

export type Book = {
    id: string
    title: string
    author: string
    isbn: string | null
    publisher: string | null
    shelf: string | null
    category: BookCategory
    totalCopies: number
    availableCopies: number
    addedAt: string
    updatedAt: string
}

// OVERDUE isn't stored on the backend - it's an issued loan past its due date, worked out when read.
export type LoanStatus = 'ISSUED' | 'RETURNED' | 'OVERDUE'

export type BorrowerType = 'STUDENT' | 'TEACHER'

export type BookLoan = {
    id: string
    book: Book
    borrowerType: BorrowerType
    borrowerId: string
    borrowerName: string
    borrowerClass: string | null
    issueDate: string
    dueDate: string
    returnDate: string | null
    status: LoanStatus
    daysOverdue: number
    notifiedAt: string | null
}

export type LibrarySummary = {
    titles: number
    totalCopies: number
    availableCopies: number
    issuedCopies: number
    overdueLoans: number
    categories: number
}

// A school's borrowing rules (see LibrarySetting on the backend).
export type LibrarySettings = {
    maxStudentLoans: number
    maxTeacherLoans: number
    blockWhenOverdue: boolean
    defaultLoanDays: number
}

// Where a borrower stands before a new loan; reason is set when canBorrow is false.
export type BorrowerStatus = {
    activeLoans: number
    overdueLoans: number
    maxLoans: number
    canBorrow: boolean
    reason: string | null
}

export type SaveBookCategoryDto = {
    name: string
    description: string
}

export type SaveBookDto = {
    title: string
    author: string
    isbn: string
    publisher: string
    categoryId: string
    totalCopies: number
    shelf: string
}

export type IssueBookDto = {
    bookId: string
    borrowerType: BorrowerType
    borrowerId: string
    // yyyy-mm-dd
    dueDate: string
}

export type BookFilters = {
    search?: string
    categoryId?: string
    outOfStock?: boolean
}

export type LoanFilters = {
    search?: string
    status?: 'ALL' | LoanStatus
}

export const borrowerTypes = [
    { label: 'Student', value: 'STUDENT' },
    { label: 'Teacher', value: 'TEACHER' }
]

export const loanStatusOptions = [
    { label: 'All', value: 'ALL' },
    { label: 'Issued', value: 'ISSUED' },
    { label: 'Overdue', value: 'OVERDUE' },
    { label: 'Returned', value: 'RETURNED' }
]

type LoanStatusStyle = {
    label: string
    color: 'info' | 'success' | 'error'
}

export const loanStatusStyle: Record<LoanStatus, LoanStatusStyle> = {
    ISSUED: { label: 'Issued', color: 'info' },
    RETURNED: { label: 'Returned', color: 'success' },
    OVERDUE: { label: 'Overdue', color: 'error' }
}

export function borrowerLabel(loan: BookLoan): string {
    const type = loan.borrowerType === 'TEACHER' ? 'Teacher' : 'Student'
    return loan.borrowerClass ? `${type} · ${loan.borrowerClass}` : type
}

// Fines aren't charged or stored yet - this is a display-only estimate at a flat daily rate.
export const FINE_RATE_PER_DAY = 5

const DAY_MS = 1000 * 60 * 60 * 24

export function loanFine(loan: BookLoan): number {
    const against = loan.returnDate ? new Date(loan.returnDate).getTime() : Date.now()
    const due = new Date(`${loan.dueDate}T23:59:59`).getTime()
    const daysLate = Math.max(0, Math.ceil((against - due) / DAY_MS))
    return daysLate * FINE_RATE_PER_DAY
}
