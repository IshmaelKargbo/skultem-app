export type User = {
    id: string
    givenNames: string
    familyName: string
    email: string
    photo: string | null
    roles: string[]
    status: string
    createdAt: string
    updatedAt: string
}

export type UserPayrollStatus = {
    onPayroll: boolean
    teacherId: string | null
    staffId: string | null
    designation: string | null
    teaching: boolean
}

export type IncludeUserInPayrollDto = {
    staffId: string
    phone: string
    street: string
    city: string
    gender: string
    title: string
    designation?: string
}

export type CreateUserDto = {
    givenNames: string
    familyName: string
    email: string
    role: string
    // Opts this account holder (Admin/Accountant/Proprietor/Owner) into payroll too - an account
    // role alone doesn't put someone on payroll. The fields below are only required when true.
    includeInPayroll?: boolean
    staffId?: string
    phone?: string
    street?: string
    city?: string
    gender?: string
    title?: string
    designation?: string
}

export type ResetPasswordDto = {
    password: string
}

export type AssignRoleDTO = {
    userId: string
    role: string
}

export type LoginDto = {
    domain: string
    email: string
    password: string
}

// No domain - see the backend's SystemAdminLoginUseCase for why a SYSTEM_ADMIN sign-in isn't
// scoped to a school the way LoginDto is.
export type SystemAdminLoginDto = {
    email: string
    password: string
}

export type RefreshDto = {
    refreshToken: string
}