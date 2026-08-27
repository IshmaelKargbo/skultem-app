import { defineStore } from 'pinia'

function uid() {
    return Math.random().toString(36).slice(2, 10)
}

function daysFromNow(days: number) {
    const date = new Date()
    date.setDate(date.getDate() + days)
    return date.toISOString()
}

const seedCategories: BookCategory[] = [
    { id: 'cat-1', name: 'Fiction', description: 'Novels, short stories and other imaginative writing.', createdAt: daysFromNow(-120), updatedAt: daysFromNow(-30) },
    { id: 'cat-2', name: 'Science', description: 'Physics, biology, chemistry and general science texts.', createdAt: daysFromNow(-110), updatedAt: daysFromNow(-20) },
    { id: 'cat-3', name: 'Mathematics', description: 'Textbooks and workbooks covering the maths curriculum.', createdAt: daysFromNow(-100), updatedAt: daysFromNow(-15) },
    { id: 'cat-4', name: 'History', description: 'World and local history references.', createdAt: daysFromNow(-90), updatedAt: daysFromNow(-10) },
    { id: 'cat-5', name: 'Reference', description: 'Dictionaries, encyclopedias and atlases.', createdAt: daysFromNow(-80), updatedAt: daysFromNow(-5) }
]

const seedBooks: Book[] = [
    { id: 'bk-1', title: 'Things Fall Apart', author: 'Chinua Achebe', isbn: '978-0385474542', publisher: 'Heinemann', category: seedCategories[0]!, totalCopies: 6, availableCopies: 2, shelf: 'A1', addedAt: daysFromNow(-95), updatedAt: daysFromNow(-2) },
    { id: 'bk-2', title: 'Long Walk to Freedom', author: 'Nelson Mandela', isbn: '978-0316548182', publisher: 'Little, Brown and Company', category: seedCategories[3]!, totalCopies: 4, availableCopies: 4, shelf: 'D2', addedAt: daysFromNow(-88), updatedAt: daysFromNow(-8) },
    { id: 'bk-3', title: 'Basic Physics for Schools', author: 'A. K. Turner', isbn: '978-0198432101', publisher: 'Oxford University Press', category: seedCategories[1]!, totalCopies: 10, availableCopies: 6, shelf: 'B3', addedAt: daysFromNow(-70), updatedAt: daysFromNow(-1) },
    { id: 'bk-4', title: 'New General Mathematics', author: 'M. F. Macrae', isbn: '978-0582501277', publisher: 'Pearson Education', category: seedCategories[2]!, totalCopies: 12, availableCopies: 9, shelf: 'C1', addedAt: daysFromNow(-60), updatedAt: daysFromNow(-3) },
    { id: 'bk-5', title: 'Oxford Junior Atlas', author: 'Oxford University Press', isbn: '978-0192800919', publisher: 'Oxford University Press', category: seedCategories[4]!, totalCopies: 5, availableCopies: 5, shelf: 'E1', addedAt: daysFromNow(-40), updatedAt: daysFromNow(-4) },
    { id: 'bk-6', title: 'A Brief History of West Africa', author: 'J. B. Webster', isbn: '978-0582603292', publisher: 'Longman', category: seedCategories[3]!, totalCopies: 3, availableCopies: 1, shelf: 'D3', addedAt: daysFromNow(-30), updatedAt: daysFromNow(-1) }
]

const seedLoans: BookLoan[] = [
    { id: 'ln-1', book: seedBooks[0]!, borrowerName: 'Aminata Kamara', borrowerType: 'STUDENT', borrowerClass: 'JSS 2A', issueDate: daysFromNow(-10), dueDate: daysFromNow(4), returnDate: null, status: 'ISSUED', notifiedAt: null },
    { id: 'ln-2', book: seedBooks[0]!, borrowerName: 'Foday Sesay', borrowerType: 'STUDENT', borrowerClass: 'JSS 2B', issueDate: daysFromNow(-16), dueDate: daysFromNow(-2), returnDate: null, status: 'OVERDUE', notifiedAt: null },
    { id: 'ln-3', book: seedBooks[2]!, borrowerName: 'Mr. Ibrahim Bangura', borrowerType: 'TEACHER', borrowerClass: 'Staff', issueDate: daysFromNow(-5), dueDate: daysFromNow(9), returnDate: null, status: 'ISSUED', notifiedAt: null },
    { id: 'ln-4', book: seedBooks[5]!, borrowerName: 'Isata Conteh', borrowerType: 'STUDENT', borrowerClass: 'SSS 1C', issueDate: daysFromNow(-20), dueDate: daysFromNow(-6), returnDate: null, status: 'OVERDUE', notifiedAt: daysFromNow(-1) },
    { id: 'ln-5', book: seedBooks[3]!, borrowerName: 'Mohamed Turay', borrowerType: 'STUDENT', borrowerClass: 'JSS 3A', issueDate: daysFromNow(-25), dueDate: daysFromNow(-11), returnDate: daysFromNow(-9), status: 'RETURNED', notifiedAt: null }
]

export const useLibraryStore = defineStore('library', {
    state: () => ({
        categories: [...seedCategories] as BookCategory[],
        books: [...seedBooks] as Book[],
        loans: [...seedLoans] as BookLoan[]
    }),

    getters: {
        listCategories(state): { label: string, value: string }[] {
            return state.categories.map(e => ({ label: e.name, value: e.id }))
        },
        listBooks(state): { label: string, value: string }[] {
            return state.books.map(e => ({ label: `${e.title} (${e.availableCopies} available)`, value: e.id }))
        },
        getBook: (state) => {
            return (id: string): Book | undefined => state.books.find(e => e.id === id)
        },
        loansByBook: (state) => {
            return (bookId: string): BookLoan[] => state.loans
                .filter(e => e.book.id === bookId)
                .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())
        },
        activeLoans(state): BookLoan[] {
            return state.loans.filter(e => e.status !== 'RETURNED')
        },
        overdueLoans(state): BookLoan[] {
            return state.loans.filter(e => e.status === 'OVERDUE')
        },
        totalCopies(state): number {
            return state.books.reduce((sum, b) => sum + b.totalCopies, 0)
        },
        availableCopies(state): number {
            return state.books.reduce((sum, b) => sum + b.availableCopies, 0)
        },
        issuedCopies(): number {
            return this.totalCopies - this.availableCopies
        }
    },

    actions: {
        refreshOverdue() {
            const now = Date.now()
            this.loans.forEach(loan => {
                if (loan.status === 'ISSUED' && new Date(loan.dueDate).getTime() < now) {
                    loan.status = 'OVERDUE'
                }
            })
        },

        createCategory(payload: CreateBookCategoryDto) {
            const category: BookCategory = {
                id: uid(),
                name: payload.name,
                description: payload.description,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
            this.categories.unshift(category)
        },

        updateCategory(payload: UpdateBookCategoryDto) {
            const category = this.categories.find(e => e.id === payload.id)
            if (!category) return

            category.name = payload.name
            category.description = payload.description
            category.updatedAt = new Date().toISOString()

            this.books
                .filter(b => b.category.id === category.id)
                .forEach(b => { b.category = category })
        },

        deleteCategory(id: string) {
            if (this.books.some(b => b.category.id === id)) {
                throw new Error('Cannot delete a category that still has books assigned to it')
            }
            this.categories = this.categories.filter(e => e.id !== id)
        },

        createBook(payload: CreateBookDto) {
            const category = this.categories.find(e => e.id === payload.categoryId)
            if (!category) throw new Error('Select a valid category')

            const book: Book = {
                id: uid(),
                title: payload.title,
                author: payload.author,
                isbn: payload.isbn,
                publisher: payload.publisher,
                category,
                totalCopies: payload.totalCopies,
                availableCopies: payload.totalCopies,
                shelf: payload.shelf,
                addedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
            this.books.unshift(book)
        },

        updateBook(payload: UpdateBookDto) {
            const book = this.books.find(e => e.id === payload.id)
            if (!book) return

            const category = this.categories.find(e => e.id === payload.categoryId)
            if (!category) throw new Error('Select a valid category')

            const issuedCopies = book.totalCopies - book.availableCopies
            if (payload.totalCopies < issuedCopies) {
                throw new Error(`Total copies cannot be less than the ${issuedCopies} copies currently issued`)
            }

            book.title = payload.title
            book.author = payload.author
            book.isbn = payload.isbn
            book.publisher = payload.publisher
            book.category = category
            book.availableCopies = payload.totalCopies - issuedCopies
            book.totalCopies = payload.totalCopies
            book.shelf = payload.shelf
            book.updatedAt = new Date().toISOString()
        },

        deleteBook(id: string) {
            if (this.loans.some(l => l.book.id === id && l.status !== 'RETURNED')) {
                throw new Error('Cannot delete a book that has copies currently on loan')
            }
            this.books = this.books.filter(e => e.id !== id)
        },

        issueBook(payload: IssueBookDto) {
            const book = this.books.find(e => e.id === payload.bookId)
            if (!book) throw new Error('Select a valid book')
            if (book.availableCopies < 1) throw new Error('No copies of this book are available')

            book.availableCopies -= 1

            const loan: BookLoan = {
                id: uid(),
                book,
                borrowerName: payload.borrowerName,
                borrowerType: payload.borrowerType,
                borrowerClass: payload.borrowerClass,
                issueDate: new Date().toISOString(),
                dueDate: payload.dueDate,
                returnDate: null,
                status: 'ISSUED',
                notifiedAt: null
            }
            this.loans.unshift(loan)
        },

        returnBook(loanId: string) {
            const loan = this.loans.find(e => e.id === loanId)
            if (!loan || loan.status === 'RETURNED') return

            const book = this.books.find(e => e.id === loan.book.id)
            if (book) book.availableCopies = Math.min(book.totalCopies, book.availableCopies + 1)

            loan.status = 'RETURNED'
            loan.returnDate = new Date().toISOString()
        },

        notifyBorrower(loanId: string) {
            const loan = this.loans.find(e => e.id === loanId)
            if (!loan) throw new Error('Loan not found')

            loan.notifiedAt = new Date().toISOString()
        }
    }
})
