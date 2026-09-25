export type User = {
    id: string
    givenNames: string
    familyName: string
    email: string
    photo: string | null
    roles: string[]
    status: string
    // The SchoolUser membership status at the currently-active school - distinct from status
    // above (the account itself, shared across every school it belongs to). Null wherever the
    // backend hasn't resolved a school context for this record.
    schoolStatus: string | null
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

// Response from an admin issuing a staff member a new temporary password - temporaryPassword
// is plaintext, shown once so it can be copied and shared with them directly.
export type AdminResetPasswordResult = {
    user: User
    temporaryPassword: string
}

export type AssignRoleDTO = {
    userId: string
    role: string
}

export type LoginDto = {
    domain: string
    // Email or phone number - the backend tells them apart (see LoginUseCase).
    identifier: string
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