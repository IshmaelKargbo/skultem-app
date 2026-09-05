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


// One material bundled into a supply fee - e.g. a Uniform fee carrying the Uniform itself, a
// House Colour, and a Necktie, each its own line with its own quantity.
export type FeeStructureSupplyItem = {
    material: Material
    quantity: number
}

export type FeeStructure = {
    id: string
    term: Term
    clazz?: Clazz
    type: string
    hasSupply: boolean
    supplyItems: FeeStructureSupplyItem[]
    category: FeeCategory
    allowInstallment: boolean
    amount: number
    dueDate: string
    description: string
    // The platform fee the system seeds automatically - see the backend's FeeStructure.system.
    // Locked against edit/delete regardless of role.
    isSystem: boolean
    // Only ever charged the first time a student enrolls (e.g. Uniform Fee) - never to a student
    // who's simply continuing/being promoted/re-enrolled into what this fee targets.
    newStudentsOnly: boolean
    // Mirror image of newStudentsOnly - only ever charged to a student who is re-enrolling
    // (a returning student), never a first-time NEW/TRANSFER admission.
    oldStudentsOnly: boolean
    // Null/undefined reaches every gender. Set when a fee only applies to one - most commonly a
    // supply fee (hasSupply) priced differently for boys vs girls.
    gender?: 'MALE' | 'FEMALE' | null
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

// One material line submitted when creating/editing a supply fee - e.g. Uniform + House Colour +
// Necktie, each its own materialId/quantity pair.
export type FeeStructureSupplyItemInput = {
    materialId: string
    quantity: number
}

export type CreateFeeStructureDto = {
    termId: string
    // A CLASS-type fee can target several classes at once - e.g. Class 1 and Class 2 sharing the
    // same Tuition amount - creating one independent FeeStructure per class (see
    // CreateFeeStructureUseCase on the backend). Ignored for ALL/SELECTION.
    classIds?: string[] | null,
    feeCategory: string
    amount: number,
    type: string
    studentIds: string[]
    hasSupply: boolean
    supplyItems: FeeStructureSupplyItemInput[]
    allowInstallment: boolean,
    description?: string
    dueDate: string
    // Only ever charged the first time a student enrolls (e.g. Uniform Fee) - never to a student
    // who's simply continuing/being promoted/re-enrolled into what this fee targets. Not allowed
    // when type is SELECTION - an explicit student list is already a deliberate assignment.
    newStudentsOnly?: boolean
    // Mirror image of newStudentsOnly - only ever charged to a student who is re-enrolling (a
    // returning student). Mutually exclusive with newStudentsOnly, and not allowed when type is
    // SELECTION for the same reason newStudentsOnly isn't.
    oldStudentsOnly?: boolean
    // Null/undefined reaches every gender - most useful for a supply fee (hasSupply) priced
    // differently for boys vs girls (two fees, same category/term/class, one MALE and one FEMALE).
    gender?: 'MALE' | 'FEMALE' | null
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
    supplyItems: FeeStructureSupplyItemInput[]
    description?: string
    newStudentsOnly: boolean
    oldStudentsOnly: boolean
    gender?: 'MALE' | 'FEMALE' | null
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
