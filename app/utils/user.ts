export type User = {
    id: string
    givenNames: string
    familyName: string
    email: string
    roles: string[]
    status: string
    createdAt: string
    updatedAt: string
}

export type CreateUserDto = {
    givenNames: string
    familyName: string
    email: string
    role: string
}

export type LoginDto = {
    domain: string
    email: string
    password: string
}

export type RefreshDto = {
    refreshToken: string
}