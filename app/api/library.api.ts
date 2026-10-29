export const LibraryApi = () => {
  const { $api } = useNuxtApp()

  function query(params: Record<string, string | number | boolean | undefined>) {
    return Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== '')
      .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
      .join('&')
  }

  async function list(path: string, params: Record<string, string | number | boolean | undefined>) {
    try {
      const res = await $api(`${path}?${query(params)}`) as any
      return { ...res, data: res.data || [], meta: useMeta(res.meta) }
    } catch (err: any) {
      useHandleError(err)
    }
  }

  async function send(path: string, method: 'POST' | 'PUT' | 'DELETE', body?: object) {
    try {
      const res = await $api(path, { method, body }) as any
      return res?.data
    } catch (err: any) {
      useHandleError(err)
    }
  }

  return {
    summary: async (): Promise<LibrarySummary> => {
      try {
        const res = await $api('/library/summary') as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
        throw err
      }
    },

    getSettings: async (): Promise<LibrarySettings> => {
      try {
        const res = await $api('/library/settings') as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
        throw err
      }
    },
    updateSettings: (payload: LibrarySettings) => send('/library/settings', 'PUT', payload),
    borrowerStatus: async (type: BorrowerType, id: string): Promise<BorrowerStatus> => {
      try {
        const res = await $api(`/library/borrowers/${type}/${id}/status`) as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
        throw err
      }
    },

    listCategories: (page: number, size: number, search?: string) =>
      list('/library/categories', { page, size, search }),
    createCategory: (payload: SaveBookCategoryDto) => send('/library/categories', 'POST', payload),
    updateCategory: (id: string, payload: SaveBookCategoryDto) => send(`/library/categories/${id}`, 'PUT', payload),
    deleteCategory: (id: string) => send(`/library/categories/${id}`, 'DELETE'),

    listBooks: (page: number, size: number, filters: BookFilters = {}) =>
      list('/library/books', { page, size, ...filters }),
    getBook: async (id: string): Promise<Book> => {
      try {
        const res = await $api(`/library/books/${id}`) as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
        throw err
      }
    },
    listBookLoans: (id: string, page: number, size: number) =>
      list(`/library/books/${id}/loans`, { page, size }),
    createBook: (payload: SaveBookDto) => send('/library/books', 'POST', payload),
    updateBook: (id: string, payload: SaveBookDto) => send(`/library/books/${id}`, 'PUT', payload),
    deleteBook: (id: string) => send(`/library/books/${id}`, 'DELETE'),

    listLoans: (page: number, size: number, filters: LoanFilters = {}) =>
      list('/library/loans', { page, size, ...filters }),
    issueBook: (payload: IssueBookDto) => send('/library/loans', 'POST', payload),
    returnBook: (loanId: string) => send(`/library/loans/${loanId}/return`, 'POST'),
    remindBorrower: (loanId: string) => send(`/library/loans/${loanId}/remind`, 'POST')
  }
}
