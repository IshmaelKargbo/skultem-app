// Editing a guardian's own details. email is optional: blank leaves it alone, and it only applies to a
// parent who already has one (a parent without one uses "Add Email").
export type EditParentDto = {
    givenNames: string
    familyName: string
    phone: string
    street: string
    city: string
    email?: string
}

export type Parent = {
    id: string
    phone: string
    name: string
    givenNames: string
    familyName: string
    // Nullable - a parent enrolled without one has no portal access until an admin adds it.
    email: string | null
    street: string
    city: string
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
    // The guardian's login account - see "Give login" on the parents page.
    userId: string
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
