export type Student = {
    id: string
    givenNames: string
    familyName: string
    enrollmentId: string
    admissionNumber: string
    dateOfBirth: string
    photo: string
    guardian: Parent
    relationship: string
    nationality: string
    religion: string
    city: string
    family: Family
    street: string
    gender: string
    className: string
    classId: string
    feeDetail: {
        total: number
        balance: number
        paid: number
        status: string
    }
    classSize: number
    sessionId: string
    classTeacher: string
    rank: string
    house?: House
    status: string
    // Why/when a WITHDRAWN or EXPELLED student left - empty for everyone else.
    exitReason?: string | null
    exitDate?: string | null
    exitNote?: string | null
    createdAt: string
    updatedAt: string
}

// Withdrawing (stopping enrollment) or expelling a student. exitDate defaults to today server-side.
export type EndStudentDto = {
    reason?: string
    exitDate?: string
    note?: string
}

// Plain strings, sent as the "reason" text - "Other" lets the note carry the detail.
export const WITHDRAW_REASONS: string[] = [
    'Relocated',
    'Transferred to another school',
    'Fees / financial difficulty',
    'Health reasons',
    'Family decision',
    'Other'
]

export const EXPEL_REASONS: string[] = [
    'Serious misconduct',
    'Repeated indiscipline',
    'Violence or threat to others',
    'Academic dishonesty',
    'Other'
]

export function studentHasLeft(status?: string | null): boolean {
    return status === 'WITHDRAWN' || status === 'EXPELLED'
}

export type EditStudentDTO = {
    admissionNumber: string
    givenNames: string
    familyName: string
    gender: string
    dateOfBirth: string
    nationality: string
    religion: string
    city: string
    street: string
}

export type Family = {
    fatherName: string
    motherName: string
    fatherOccupation: string
    motherOccupation: string
    fatherContact: string
    motherContact: string
}

export type ActiveCycle = {
    id: string
    year: string
    clazz: string
    terms: Term[]
}

export type StudentFee = {
    id: string
    feeId: string
    feeName: string
    total: number
    paid: number
    outstanding: number
    discount: number
    term: string
    dueDate: string
    status: string
    allowInstallment: boolean
}

export type StudentSubject = {
    id: string
    studentId: string
    subjectId: string
    createdAt: string
    updatedAt: string
}

export type CreateStudentDto = {
    givenNames: string
    familyName: string
    dateOfBirth: string
    gender: string
    nationality: string
    religion: string
    city: string
    street: string
    parent: {
        fatherName: string
        motherName: string
        givenNames: string
        familyName: string
        relationship: string
        phone: string
        email: string
        occupation: string
        city: string
        street: string
    }
    enrollmentType: string
    admissionDate: string
    classId: string
    admissionNumber: string
    previousSchool: string
    lastClass: string
}


export type ChangeClassDto = {
    classId: string
    sectionId: string
    streamId?: string
}

export type ChangeClassResult = {
    enrollmentId: string
    requiresSubjectSelection: boolean
}

// Result of a bulk student import - see StudentApi().bulkImport. A dry run only has READY/FAILED
// rows; a real run has CREATED/FAILED.
export type BulkStudentImportRow = {
    row: number
    name: string
    className: string
    admissionNumber: string | null
    guardianPhone: string
    // Linked to a guardian already at the school (or an earlier row - siblings).
    existingGuardian: boolean
    outcome: 'READY' | 'CREATED' | 'FAILED'
    message: string | null
    // Set when the row failed on its subjects: the elective groups of its class to pick from.
    subjectChoices: BulkSubjectChoice[] | null
}

export type BulkSubjectChoice = {
    group: string
    select: number
    subjects: string[]
}

export type BulkStudentImportResult = {
    dryRun: boolean
    ready: number
    created: number
    failed: number
    rows: BulkStudentImportRow[]
}
