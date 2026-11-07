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
    isSystem: boolean
    newStudentsOnly: boolean
    oldStudentsOnly: boolean
    gender?: 'MALE' | 'FEMALE' | null
    // Set when a class fee only applies to one stream (e.g. SSS 1 Science vs SSS 1 Art).
    streamId?: string | null
    streamName?: string | null
    createdAt: string
    updatedAt: string
    // The installment plan, in order (empty = none).
    installments?: FeeInstallment[]
}

// One part of a fee's installment plan.
export type FeeInstallment = { label: string, amount: number, dueDate: string }

// A part being edited in the plan editor (amount empty until typed).
export type InstallmentRow = { label: string, amount: number | null, dueDate: string }

// Where a student stands on one part of a plan: their share after discounts and what their payments cover so far.
export type InstallmentStatus = {
    label: string
    amount: number
    paid: number
    dueDate: string
    state: 'PAID' | 'PARTIAL' | 'DUE' | 'OVERDUE'
}

export const INSTALLMENT_STATE: Record<InstallmentStatus['state'], { label: string, color: 'success' | 'info' | 'neutral' | 'error' }> = {
    PAID: { label: 'Paid', color: 'success' },
    PARTIAL: { label: 'Part paid', color: 'info' },
    DUE: { label: 'Due', color: 'neutral' },
    OVERDUE: { label: 'Overdue', color: 'error' },
}

// The plan as the API takes it: rows with an amount, nameless ones left for the server to name.
export function toInstallmentPayload(rows: InstallmentRow[]) {
    return rows.map(r => ({ label: r.label?.trim() || undefined, amount: Number(r.amount) || 0, dueDate: r.dueDate }))
}

// The plan must add up to the fee - checked before saving so the form can say so.
export function installmentPlanProblem(rows: InstallmentRow[], amount: number | null) {
    if (!rows.length) return null
    if (rows.length < 2) return 'An installment plan needs at least two parts.'
    if (rows.some(r => !r.amount || r.amount <= 0)) return 'Give every installment an amount.'
    if (rows.some(r => !r.dueDate)) return 'Give every installment a due date.'
    if (rows.some((r, i) => i > 0 && r.dueDate < rows[i - 1]!.dueDate)) return 'Put the installments in due-date order.'
    const total = Math.round(rows.reduce((n, r) => n + Number(r.amount || 0), 0) * 100)
    if (total !== Math.round((amount || 0) * 100)) return 'The installments have to add up to the fee amount.'
    return null
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
    // One discount can cover several fees (e.g. first and second term school fees).
    fees: { feeName: string, term: string, value: string, saved: string }[]
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

export const PAYMENT_METHOD_LABELS: StringMap = {
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
    // The installment plan (empty = none).
    installments?: { label?: string, amount: number, dueDate: string }[]
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
    // CLASS only, and only for streamed classes (SSS): charge just this stream - e.g. SSS 1
    // Science priced differently from SSS 1 Art. Null/undefined charges every stream.
    streamId?: string | null
}

// What a fee structure applies to (academic year, class, type) can't be changed after
// creation - only these details can, see UpdateFeeStructureUseCase on the backend.
export type UpdateFeeStructureDto = {
    feeCategory: string
    termId: string
    amount: number
    dueDate: string
    allowInstallment: boolean
    // The installment plan (empty = none).
    installments?: { label?: string, amount: number, dueDate: string }[]
    hasSupply: boolean
    supplyItems: FeeStructureSupplyItemInput[]
    description?: string
    newStudentsOnly: boolean
    oldStudentsOnly: boolean
    gender?: 'MALE' | 'FEMALE' | null
}

export type CreateFeeDiscountDto = {
    studentId: string
    fees: { feeId: string, value: number }[]
    name: string
    kind: string
    reason: string
    expiryDate: string
}

export type AssignFeeToStudentDto = {
    studentId: string
    feeId: string
}

// The first part not yet fully paid, if any.
export function nextInstallment(parts?: InstallmentStatus[] | null) {
    return (parts ?? []).find(p => p.state !== 'PAID') ?? null
}

// What clears every overdue part plus the next one: a sensible amount to take today.
export function installmentDueNow(parts?: InstallmentStatus[] | null) {
    const list = parts ?? []
    const overdue = list.filter(p => p.state === 'OVERDUE')
    const upcoming = list.find(p => p.state === 'DUE' || p.state === 'PARTIAL')
    const total = [...overdue, ...(upcoming ? [upcoming] : [])]
        .reduce((n, p) => n + Math.max(0, Number(p.amount) - Number(p.paid)), 0)
    return Math.round(total * 100) / 100
}
