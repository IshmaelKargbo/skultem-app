export type House = {
    id: string
    name: string
    color: string
    motto: string
    houseMaster: Teacher
    status: string
    createdAt: string
    updatedAt: string
}

export type CreateHouseDto = {
    name: string
    color: string
    motto: string
    master: string
}