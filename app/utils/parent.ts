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

// PATCH /student/{id}/guardian - exactly one of parentId / userId. phone/street/city are only used when
// userId has no guardian profile at the school yet; relationship blank keeps the previous one.
export type ChangeGuardianDto = {
    parentId?: string
    userId?: string
    phone?: string
    street?: string
    city?: string
    relationship?: string
}

// How a guardian is related to a student - stored as the code (value). Shared by the add-student form
// and Change guardian so both offer the same choices.
export const RELATIONSHIPS = [
    { label: 'Father', value: 'FATHER' },
    { label: 'Mother', value: 'MOTHER' },
    { label: 'Brother', value: 'BROTHER' },
    { label: 'Sister', value: 'SISTER' },
    { label: 'Guardian', value: 'GUARDIAN' },
    { label: 'Grandparent', value: 'GRANDPARENT' },
    { label: 'Other', value: 'OTHER' }
]
