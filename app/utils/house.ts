export type House = {
    id: string
    name: string
    color: string
    motto: string
    houseMasters: Teacher[]
    status: string
    createdAt: string
    updatedAt: string
}

export type CreateHouseDto = {
    name: string
    color: string
    motto: string
    masters: string[]
}