export type BookCategory = {
    id: string
    name: string
    description: string
    createdAt: string
    updatedAt: string
}

export type Book = {
    id: string
    title: string
    author: string
    isbn: string
    publisher: string
    category: BookCategory
    totalCopies: number
    availableCopies: number
    shelf: string
    addedAt: string
    updatedAt: string
}

export type LoanStatus = 'ISSUED' | 'RETURNED' | 'OVERDUE'

export type BookLoan = {
    id: string
    book: Book
    borrowerName: string
    borrowerType: 'STUDENT' | 'TEACHER'
    borrowerClass: string
    issueDate: string
    dueDate: string
    returnDate: string | null
    status: LoanStatus
    notifiedAt: string | null
}

export type CreateBookCategoryDto = {
    name: string
    description: string
}

export type UpdateBookCategoryDto = CreateBookCategoryDto & {
    id: string
}

export type CreateBookDto = {
    title: string
    author: string
    isbn: string
    publisher: string
    categoryId: string
    totalCopies: number
    shelf: string
}

export type UpdateBookDto = CreateBookDto & {
    id: string
}

export type IssueBookDto = {
    bookId: string
    borrowerName: string
    borrowerType: 'STUDENT' | 'TEACHER'
    borrowerClass: string
    dueDate: string
}

export const borrowerTypes = [
    { label: 'Student', value: 'STUDENT' },
    { label: 'Teacher', value: 'TEACHER' }
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

export function daysOverdue(dueDate: string): number {
    const diff = Date.now() - new Date(dueDate).getTime()
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)))
}

export const FINE_RATE_PER_DAY = 5

export function loanFine(loan: BookLoan): number {
    const against = loan.returnDate ? new Date(loan.returnDate).getTime() : Date.now()
    const due = new Date(loan.dueDate).getTime()
    const daysLate = Math.max(0, Math.floor((against - due) / (1000 * 60 * 60 * 24)))
    return daysLate * FINE_RATE_PER_DAY
}
