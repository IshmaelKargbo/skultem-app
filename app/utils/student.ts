export type Student = {
    id: string
    givenNames: string
    familyName: string
    admissionNumber: string
    dateOfBirth: string
    gender: string
    status: string
    createdAt: string
    updatedAt: string
}

export type StudentFee = {
    feeId: string
    feeName: string
    total: number
    paid: number
    outstanding: number
    discount: number
    term: string
    dueDate: string
    status: string
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
    academicNumber: string
    dateOfBirth: string
    gender: string
}