export type Student = {
    id: string
    givenNames: string
    familyName: string
    enrollmentId: string
    admissionNumber: string
    dateOfBirth: string
    guardianName: string
    fatherName: string
    motherName: string
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
    status: string
    createdAt: string
    updatedAt: string
}

export type ActiveCycle = {
    id: string
    year: string
    clazz: string
    terms: Term[]
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
    classSessionId: string
    selectedOptionIds?: string[]
}
