export type ClassFeeDetails = {
    sessionId?: string
    termId?: string
    summery: {
        paid: number
        partial: number
        pending: number
    }
    meta?: Meta
    records: {
        id: string
        name: string
        admission: string
        status: string
    }[]
}


export type FeeCategory = {
    id: string
    name: string
    description: string
    // Seeded by the platform itself (see SeedPlatformFeeForAcademicYearUseCase) - never something a
    // school creates by hand, so it's kept out of pickers and locked against edit/delete.
    system: boolean
    createdAt: string
    updatedAt: string
}

export type Fee = {
    id: string
    term: string
    clazz: string
    student: string
    amount: number
    amountPaid: number
    fee: string
    dueDate: string
    outstanding: number
    status: string
    createdAt: string
    updatedAt: string
}


export type FeeStructure = {
    id: string
    term: Term
    clazz?: Clazz
    type: string
    hasSupply: boolean
    totalSupply: number
    material?: Material
    category: FeeCategory
    allowInstallment: boolean
    amount: number
    dueDate: string
    description: string
    // The platform fee the system seeds automatically - see the backend's FeeStructure.system.
    // Locked against edit/delete regardless of role.
    isSystem: boolean
    createdAt: string
    updatedAt: string
}

export type FeeDiscount = {
    id: string
    name: string
    reason: string
    student: string
    clazz: string
    type: string
    value: string
    applied: string
    expires: string
    totalSaved: string
}

export type RecordPaymentDto = {
    studentId: string
    method: string
    allocations: any
    referenceNo: string,
    note: string
}

export type FeePayment = {
    id: string
    fee: string
    term: string
    student: string
    photo: string
    amount: number
    paymentMethod: string
    paidAt: string
    referenceNo: string
    externalReference: string | null
    note: string
    createdAt: string
    updatedAt: string
}

export type Payment = {
    id: string
    fee: string
    student: string
    amount: number
    paymentMethod: string
    paidAt: string
    referenceNo: string
    externalReference: string | null
    note: string
    createdAt: string
    updatedAt: string
}

export type ReceiptSetting = {
    accentColor: string
    logoUrl: string
    footerNote: string
    showWatermark: boolean
    showAmountInWords: boolean
}

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
    CASH: 'Cash',
    BANK: 'Bank Transfer',
    MOBILE_MONEY: 'Mobile Money'
}

// Shared by the "record payment" flow (which just got a fresh batch of PaymentDTOs back from the
// API) and the "view/download a past receipt" flow (which re-fetched every PaymentDTO sharing a
// receipt number) - both need the same {header fields + line items + total} shape to hand to
// <ReceiptPayment>.
export function buildPaymentReceipt(payments: (Payment | FeePayment)[], fallback?: { method?: string, studentName?: string }) {
    const first = (payments[0] || {}) as Partial<FeePayment>
    const fallbackReference = (first as any).id || Date.now().toString()

    return {
        referenceNo: first.referenceNo || fallbackReference,
        externalReference: first.externalReference || null,
        student: first.student || fallback?.studentName || 'Student',
        term: first.term || 'N/A',
        paymentMethod: first.paymentMethod || fallback?.method || '',
        paidAt: first.paidAt,
        payments,
        total: payments.reduce((sum, p: any) => sum + Number(p.amount || 0), 0),
    }
}

export type CreateFeeCategoryDto = {
    name: string
    description: string
}

export type CreateFeeStructureDto = {
    termId: string
    classId?: string | null,
    feeCategory: string
    amount: number,
    type: string
    studentIds: string[]
    hasSupply: boolean
    totalSupply: number
    materialId: string
    allowInstallment: boolean,
    description?: string
    dueDate: string
}

// What a fee structure applies to (academic year, class, type) can't be changed after
// creation - only these details can, see UpdateFeeStructureUseCase on the backend.
export type UpdateFeeStructureDto = {
    feeCategory: string
    termId: string
    amount: number
    dueDate: string
    allowInstallment: boolean
    hasSupply: boolean
    totalSupply: number
    materialId: string
    description?: string
}

export type CreateFeeDiscountDto = {
    studentId: string
    feeId: string
    name: string
    value: number
    kind: string
    reason: string
    expiryDate: string
}

export type AssignFeeToStudentDto = {
    studentId: string
    feeId: string
}
