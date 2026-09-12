export type MaterialCategory = {
    id: string
    name: string
    description: string
    createdAt: string
    updatedAt: string
}

export type Material = {
    id: string
    name: string
    unit: string
    category: MaterialCategory
    inStock: number
    price: number
    lastRestockedAt: string
    createdAt: string
    updatedAt: string
}

export type Supply = {
    id: string
    student: Student | null
    customerName: string | null
    material: Material
    qty: number
    status: string
    collectedOn: string
    collectedQty: number
    createdAt: string
    updatedAt: string
}

export type CreateMaterialCategoryDto = {
    name: string
    description: string
}

export type CreateMaterialDto = {
    name: string
    unit: string
    price: number
    categoryId: string
}

export type RestockDto = {
    id: string
    note: string
    inStock: number
}

export type SupplyDto = {
    id: string
    note: string
    qty: number
}

export type MaterialSale = {
    id: string
    student: Student | null
    customerName: string | null
    material: Material
    quantity: number
    unitPrice: number
    totalAmount: number
    amountPaid: number
    balance: number
    paymentStatus: 'UNPAID' | 'PARTIAL' | 'PAID'
    paymentMethod: 'CASH' | 'BANK' | 'MOBILE_MONEY' | null
    note: string | null
    status: 'PENDING_SUPPLY' | 'FULFILLED' | 'CANCELLED'
    fulfilledAt: string | null
    createdAt: string
    updatedAt: string
}

export type MaterialSaleSummary = {
    totalSales: number
    pendingSettlement: number
    totalCollected: number
    totalOutstanding: number
    paidAwaitingPickup: number
}

export type CreateMaterialSaleDto = {
    materialId: string
    studentId?: string
    customerName?: string
    quantity: number
    unitPrice: number
    amountPaid?: number
    paymentMethod?: string
    note?: string
    collectNow?: boolean
}

export type RecordSalePaymentDto = {
    amount: number
    paymentMethod?: string
}

export type PendingPickup = {
    id: string
    source: 'SUPPLY' | 'SALE'
    buyerName: string
    admissionNumber: string | null
    buyerPhoto: string | null
    materialName: string
    categoryName: string
    quantity: number
    collectedQuantity: number
    paymentStatus: string
    since: string
}

