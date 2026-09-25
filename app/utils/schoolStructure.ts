// School structure: which levels a school offers, and whether it's managed as one unit or in
// school-defined management sections. Mirrors the backend (Level enum, SchoolStructureDTO,
// UpdateSchoolStructureUseCase). A management section is NOT a class Section ("A") or a Stream.

// Matches com.moriba.skultem.domain.vo.Level exactly (the raw API value).
export type LevelCode = 'DAYCARE' | 'NURSERY' | 'PRIMARY' | 'JSS' | 'SSS'

export type ManagementModel = 'UNIFIED' | 'SECTION_BASED'

export type LevelInfo = {
    value: LevelCode
    label: string
    description: string
    // Classes split into streams (Science/Arts/Commercial) - see Level#isStreamed.
    streamed: boolean
    // Every subject is core; no optional subjects or subject groups - see Level#isAllSubjectsCore.
    allSubjectsCore: boolean
}

// Youngest to oldest - the same order the backend declares them in.
export const LEVEL_CATALOG: LevelInfo[] = [
    { value: 'DAYCARE', label: 'Daycare', description: 'Infants and toddlers', streamed: false, allSubjectsCore: true },
    { value: 'NURSERY', label: 'Nursery', description: 'Pre-school / kindergarten', streamed: false, allSubjectsCore: true },
    { value: 'PRIMARY', label: 'Primary', description: 'Class 1 - 6', streamed: false, allSubjectsCore: true },
    { value: 'JSS', label: 'JSS', description: 'Junior Secondary', streamed: false, allSubjectsCore: false },
    { value: 'SSS', label: 'SSS', description: 'Senior Secondary', streamed: true, allSubjectsCore: false },
]

export function levelInfo(level?: string | null): LevelInfo | undefined {
    const code = level?.toUpperCase()
    return LEVEL_CATALOG.find(l => l.value === code)
}

export function levelLabel(level?: string | null): string {
    return levelInfo(level)?.label ?? level ?? ''
}

export function sortLevels<T extends string>(levels: T[]): T[] {
    const order = (l: string) => LEVEL_CATALOG.findIndex(c => c.value === l)
    return [...levels].sort((a, b) => order(a) - order(b))
}

export type SchoolStructureLevel = {
    level: LevelCode
    label: string
    managementSectionId: string | null
    classCount: number
}

export type BrandingTarget = {
    level?: string | null
    studentId?: string | null
    teacherId?: string | null
    referenceNo?: string | null
    inline?: boolean
}

export type SectionAddress = {
    region?: string | null
    district?: string | null
    chiefdom?: string | null
    city?: string | null
    street?: string | null
}

// logo / principalName / principalSignature / address are the section's OWN values - null means it
// uses the school's (see the backend's SchoolBrandingResolver).
export type ManagementSectionView = {
    id: string
    name: string
    displayOrder: number
    levels: LevelCode[]
    logo?: string | null
    principalName?: string | null
    principalSignature?: string | null
    address?: SectionAddress | null
}

export type SchoolStructure = {
    managementModel: ManagementModel
    levels: SchoolStructureLevel[]
    sections: ManagementSectionView[]
}

// What the editor works on and what PUT /school/structure (and school creation) takes. `key` is
// client-only - a stable v-for key for sections that don't have a server id yet.
export type ManagementSectionDraft = {
    key: string
    id: string | null
    name: string
    levels: LevelCode[]
}

export type SchoolStructureDraft = {
    managementModel: ManagementModel
    levels: LevelCode[]
    sections: ManagementSectionDraft[]
}

export type SchoolStructurePayload = {
    managementModel: ManagementModel
    levels: LevelCode[]
    sections: { id: string | null, name: string, levels: LevelCode[] }[]
}

let draftKey = 0
export function newSectionDraft(name = '', levels: LevelCode[] = [], id: string | null = null): ManagementSectionDraft {
    draftKey += 1
    return { key: `section-${draftKey}`, id, name, levels }
}

export function structureToDraft(structure: SchoolStructure): SchoolStructureDraft {
    return {
        managementModel: structure.managementModel,
        levels: structure.levels.map(l => l.level),
        sections: structure.sections.map(s => newSectionDraft(s.name, [...s.levels], s.id))
    }
}

export function draftToPayload(draft: SchoolStructureDraft): SchoolStructurePayload {
    const offered = sortLevels(draft.levels)
    return {
        managementModel: draft.managementModel,
        levels: offered,
        sections: draft.managementModel === 'SECTION_BASED'
            ? draft.sections.map(s => ({
                id: s.id,
                name: s.name.trim(),
                // A level unticked at the top can linger on a section - never send it.
                levels: sortLevels(s.levels.filter(l => offered.includes(l)))
            }))
            : []
    }
}

// Roles that can be limited to one or more management sections - matches the backend's
// SectionScopeService#SCOPABLE_ROLES exactly. Everyone else (Owner, Proprietor, Super Admin,
// Parent) always has whole-school access regardless of the school's management model. Plain
// strings (not the Role enum) - utils files can't reference each other's auto-imports.
export const SCOPABLE_ROLES: string[] = ['ADMIN', 'ACCOUNTANT', 'TEACHER']

export function isScopableRole(role?: string | null): boolean {
    return !!role && SCOPABLE_ROLES.includes(role)
}

// A staff member's management-section scope under one role - mirrors the backend's StaffScopeDTO.
// Empty sectionIds means whole school.
export type StaffScope = {
    userId: string
    role: string
    sectionIds: string[]
}

// The signed-in user's own effective scope - mirrors the backend's StaffScopeDTO.Current. `levels`
// is empty when wholeSchool is true (nothing to restrict).
export type MyScope = {
    wholeSchool: boolean
    levels: LevelCode[]
    sectionIds: string[]
    sectionNames: string[]
}

// Client-side copy of the backend's rules, so problems show up while editing rather than as an
// error after Save. The backend still enforces all of them.
export function validateSchoolStructure(draft: SchoolStructureDraft): string[] {
    const errors: string[] = []
    if (!draft.levels.length) {
        errors.push('Select at least one school level.')
        return errors
    }
    if (draft.managementModel !== 'SECTION_BASED') return errors

    if (!draft.sections.length) {
        errors.push('Add at least one management section.')
        return errors
    }

    const names = new Set<string>()
    const owner = new Map<LevelCode, string>()
    for (const section of draft.sections) {
        const name = section.name.trim()
        if (!name) {
            errors.push('Every management section needs a name.')
            continue
        }
        if (names.has(name.toLowerCase())) errors.push(`There is more than one section named "${name}".`)
        names.add(name.toLowerCase())

        const levels = section.levels.filter(l => draft.levels.includes(l))
        if (!levels.length) errors.push(`"${name}" needs at least one school level.`)
        for (const level of levels) {
            const previous = owner.get(level)
            if (previous) errors.push(`${levelLabel(level)} is in both "${previous}" and "${name}".`)
            owner.set(level, name)
        }
    }

    const unassigned = sortLevels(draft.levels.filter(l => !owner.has(l)))
    if (unassigned.length) {
        errors.push(`Assign ${unassigned.map(levelLabel).join(', ')} to a management section.`)
    }
    return errors
}
