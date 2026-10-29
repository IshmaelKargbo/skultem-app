import { defineStore } from 'pinia'

// Library data from the backend's /library endpoints. Each list remembers the page and filters it
// was last loaded with, so a create/update/delete can reload what's on screen without the
// component passing them back in.
export const useLibraryStore = defineStore('library', {
    state: () => ({
        summary: null as LibrarySummary | null,
        settings: null as LibrarySettings | null,
        summaryLoading: false,

        categories: [] as BookCategory[],
        categoriesMeta: {} as Meta,
        categoriesLoading: false,
        categoriesQuery: { page: 1, size: 10, search: '' },

        books: [] as Book[],
        booksMeta: {} as Meta,
        booksLoading: false,
        booksQuery: { page: 1, size: 10, filters: {} as BookFilters },

        loans: [] as BookLoan[],
        loansMeta: {} as Meta,
        loansLoading: false,
        loansQuery: { page: 1, size: 10, filters: {} as LoanFilters },

        overdueLoans: [] as BookLoan[],
        overdueMeta: {} as Meta,
        overdueLoading: false,

        book: null as Book | null,
        bookLoading: false,
        bookLoans: [] as BookLoan[],
        bookLoansMeta: {} as Meta,
        bookLoansLoading: false,
        bookLoansPage: 1,

        // Every category, for the book form's and the book list's category pickers.
        categoryOptions: [] as { label: string, value: string }[],

        // Goes up after every issue, return or catalog change. Views that show totals (the
        // dashboard, overdue alerts) watch it and reload, so they never show stale counts.
        changeVersion: 0
    }),

    actions: {
        async fetchSummary() {
            this.summaryLoading = true
            try {
                this.summary = await LibraryApi().summary()
            } finally {
                this.summaryLoading = false
            }
        },

        async fetchSettings() {
            this.settings = await LibraryApi().getSettings()
            return this.settings
        },

        async saveSettings(payload: LibrarySettings) {
            this.settings = await LibraryApi().updateSettings(payload) as LibrarySettings
            return this.settings
        },

        // Categories

        // Called with no arguments, reloads the last page and search.
        async fetchCategories(page?: number, size?: number, search?: string) {
            this.categoriesQuery = {
                page: page ?? this.categoriesQuery.page,
                size: size ?? this.categoriesQuery.size,
                search: search ?? this.categoriesQuery.search
            }
            const q = this.categoriesQuery
            this.categoriesLoading = true
            try {
                const res = await LibraryApi().listCategories(q.page, q.size, q.search)
                this.categories = res?.data || []
                this.categoriesMeta = res?.meta || {} as Meta
            } finally {
                this.categoriesLoading = false
            }
        },

        async fetchCategoryOptions() {
            const res = await LibraryApi().listCategories(1, 0)
            this.categoryOptions = (res?.data || []).map((c: BookCategory) => ({ label: c.name, value: c.id }))
        },

        async saveCategory(payload: SaveBookCategoryDto, id?: string) {
            if (id) await LibraryApi().updateCategory(id, payload)
            else await LibraryApi().createCategory(payload)
            await Promise.all([this.fetchCategories(), this.fetchCategoryOptions()])
        },

        async deleteCategory(id: string) {
            await LibraryApi().deleteCategory(id)
            await Promise.all([this.fetchCategories(), this.fetchCategoryOptions()])
        },

        // Books

        // Called with no arguments, reloads the last page and filters.
        async fetchBooks(page?: number, size?: number, filters?: BookFilters) {
            this.booksQuery = {
                page: page ?? this.booksQuery.page,
                size: size ?? this.booksQuery.size,
                filters: filters ?? this.booksQuery.filters
            }
            const q = this.booksQuery
            this.booksLoading = true
            try {
                const res = await LibraryApi().listBooks(q.page, q.size, q.filters)
                this.books = res?.data || []
                this.booksMeta = res?.meta || {} as Meta
            } finally {
                this.booksLoading = false
            }
        },

        // A short search for pickers (e.g. the issue form). Doesn't touch the book list on screen.
        async searchBooks(search: string, size = 25): Promise<Book[]> {
            const res = await LibraryApi().listBooks(1, size, { search })
            return res?.data || []
        },

        async fetchBook(id: string) {
            this.bookLoading = true
            try {
                this.book = await LibraryApi().getBook(id)
            } catch {
                this.book = null
            } finally {
                this.bookLoading = false
            }
        },

        async fetchBookLoans(id: string, page?: number, size = 10) {
            this.bookLoansPage = page ?? this.bookLoansPage
            this.bookLoansLoading = true
            try {
                const res = await LibraryApi().listBookLoans(id, this.bookLoansPage, size)
                this.bookLoans = res?.data || []
                this.bookLoansMeta = res?.meta || {} as Meta
            } finally {
                this.bookLoansLoading = false
            }
        },

        async saveBook(payload: SaveBookDto, id?: string) {
            const saved = id
                ? await LibraryApi().updateBook(id, payload) as Book
                : await LibraryApi().createBook(payload) as Book

            if (saved && this.book?.id === saved.id) this.book = saved
            this.changeVersion++
            await this.fetchBooks()
            return saved
        },

        async deleteBook(id: string) {
            await LibraryApi().deleteBook(id)
            if (this.book?.id === id) this.book = null
            this.changeVersion++
            await this.fetchBooks()
        },

        // Loans

        // Called with no arguments, reloads the last page and filters.
        async fetchLoans(page?: number, size?: number, filters?: LoanFilters) {
            this.loansQuery = {
                page: page ?? this.loansQuery.page,
                size: size ?? this.loansQuery.size,
                filters: filters ?? this.loansQuery.filters
            }
            const q = this.loansQuery
            this.loansLoading = true
            try {
                const res = await LibraryApi().listLoans(q.page, q.size, q.filters)
                this.loans = res?.data || []
                this.loansMeta = res?.meta || {} as Meta
            } finally {
                this.loansLoading = false
            }
        },

        async fetchOverdue(size = 10) {
            this.overdueLoading = true
            try {
                const res = await LibraryApi().listLoans(1, size, { status: 'OVERDUE' })
                this.overdueLoans = res?.data || []
                this.overdueMeta = res?.meta || {} as Meta
            } finally {
                this.overdueLoading = false
            }
        },

        async issueBook(payload: IssueBookDto) {
            const loan = await LibraryApi().issueBook(payload) as BookLoan
            this.changeVersion++
            await this.fetchLoans()
            return loan
        },

        async returnBook(loanId: string) {
            const loan = await LibraryApi().returnBook(loanId) as BookLoan
            this.changeVersion++
            this.replaceLoan(loan)
            this.overdueLoans = this.overdueLoans.filter(l => l.id !== loanId)
            if (this.book && loan?.book.id === this.book.id) this.book = loan.book
            return loan
        },

        async remindBorrower(loanId: string) {
            const loan = await LibraryApi().remindBorrower(loanId) as BookLoan
            this.changeVersion++
            this.replaceLoan(loan)
            return loan
        },

        replaceLoan(loan?: BookLoan) {
            if (!loan) return
            for (const list of [this.loans, this.overdueLoans, this.bookLoans]) {
                const index = list.findIndex(l => l.id === loan.id)
                if (index !== -1) list[index] = loan
            }
        }
    }
})
