export type User = {
    id: string
    givenNames: string
    familyName: string
    email: string
    role: string
    createdAt: string
    updatedAt: string
}

export type CreateUserDto = {
    givenNames: string
    familyName: string
    email: string
    role: string,
    password: string
}