import { number, string } from "yup"

export type FeeCategory = {
    id: string
    name: string
    description: string
    createdAt: string
    updatedAt: string
}

export type FeeStructure = {
    id: string
    term: Term
    clazz?: Clazz
    category: FeeCategory
    allowInstallment: boolean
    amount: number
    dueDate: string
    description: string
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
    feeId: string
    studentId: string
    amount: number
    method: string
    referenceNo: string,
    note: string
}

export type FeePayment = {
    id: string
    fee: FeeStructure
    student: Student
    amount: number
    paymentMethod: string
    paidAt: string
    referenceNo: string
    note: string
    createdAt: string
    updatedAt: string
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
    allowInstallment: boolean,
    description?: string
    dueDate: string
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
