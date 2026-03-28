export type ExpenseCategory = {
    id: string
    name: string
    description: string
    createdAt: string
    updatedAt: string
}

export type Expense = {
    id: string
    title: string
    category: string
    amount: number
    expenseDate: string
    description: string
    createdAt: string
    updatedAt: string
}

export type CreateExpenseCategoryDTO = {
    name: string
    description: string
}

export type CreateExpenseDTO = {
    title: string
    category: string
    amount: number
    expenseDate: string
    description: string
}