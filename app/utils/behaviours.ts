export type Behaviour = {
    id: string
    enrollment: string
    kind: string
    category: string
    note: string
    updatedAt: string
}

export type CreateBehaviourDto = {
    enrollment: string
    kind: string
    category: string
    note: string
}

export type BehaviourCategory = {
    id: string
    name: string
    description: string
    createdAt: string
    updatedAt: string
}

export type CreateBehaviourCategoryDto = {
    name: string
    description: string
}