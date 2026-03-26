export type Parent = {
    id: string
    phone: string
    name: string
    givenNames: string
    familyName: string
    email: string
    street: string
    city: string
    fatherName: string
    motherName: string
    feeDetail?: {
        total: number
        balance: number
        paid: number
        status: string
    }
    status: string
    students: number
    createdAt: string
    updatedAt: string
}

export type CreateParentDto = {
    phone: string
    givenNames: string
    familyName: string
    email: string
    street: string
    city: string
    fatherName: string
    motherName: string
}
