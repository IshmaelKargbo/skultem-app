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
    status: string
    createdAt: string
    updatedAt: string
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
    lastGradeCompleted: string
}
