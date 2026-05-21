export type MaterialCategory = {
    id: string
    name: string
    description: string
    createdAt: string
    updatedAt: string
}

export type Material = {
    id: string
    name: string
    unit: string
    category: MaterialCategory
    inStock: number
    lastRestockedAt: string
    createdAt: string
    updatedAt: string
}

export type Supply = {
    id: string
    student: Student
    material: Material
    qty: number
    status: string
    collectedOn: string
    collectedQty: number
    createdAt: string
    updatedAt: string
}

export type CreateMaterialCategoryDto = {
    name: string
    description: string
}

export type CreateMaterialDto = {
    name: string
    unit: string
    categoryId: string
}

export type RestockDto = {
    id: string
    note: string
    inStock: number
}

export type SupplyDto = {
    id: string
    note: string
    qty: number
}

