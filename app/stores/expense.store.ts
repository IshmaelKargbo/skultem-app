import { defineStore } from 'pinia'

export const useExpenseStore = defineStore('expenses', {
  state: () => ({
    records: [] as Expense[],
    categories: [] as ExpenseCategory[],
    meta: {} as Meta,
    loading: false,
    error: null as string | null
  }),
  actions: {
    async fetchAllCategories(page: number = 1, size: number = 6) {
      this.loading = true
      this.error = null
      try {
        const response = await ExpenseApi().getAllCategories(page, size) as any
        this.categories = response.data || []
        this.meta = response.meta || {} as Meta
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to fetch expense categories'
      } finally {
        this.loading = false
      }
    },
    async fetchAll(page: number = 1, size: number = 6) {
      this.loading = true
      this.error = null
      try {
        const response = await ExpenseApi().getAll(page, size) as any
        this.records = response.data || []
        this.meta = response.meta || {} as Meta
      } catch (err: any) {
        throw err.data?.message || 'Failed to fetch expenses'
      } finally {
        this.loading = false
      }
    },
    create(payload: CreateExpenseDTO) {
      return ExpenseApi().create(payload)
    },
    createCreate(payload: CreateExpenseCategoryDTO) {
      return ExpenseApi().createCategory(payload)
    }
  }
})
