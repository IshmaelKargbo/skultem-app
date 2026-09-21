// Optional feature modules a school can install - mirrors the backend's FeatureModule catalog. The
// list itself (labels, descriptions, requirements) always comes from GET /modules; only what the
// frontend needs to know statically lives here: which routes belong to which module, and an icon
// per module.

export type SchoolModule = {
    key: string
    label: string
    description: string
    category: string
    categoryLabel: string
    installed: boolean
    starter: boolean
    requires: string[]
    requiredBy: string[]
}

// Keys as the API sends them (FeatureModule.key() on the backend).
export const ModuleKey = {
    GRADING: 'grading',
    REPORT_CARDS: 'report-cards',
    CURRICULUM: 'curriculum',
    BEHAVIOUR: 'behaviour',
    TIMETABLE: 'timetable',
    EXPENSES: 'expenses',
    PAYROLL: 'payroll',
    STAFF_HR: 'staff-hr',
    COMMUNICATION: 'communication',
    ID_CARDS: 'id-cards',
    ATHLETIC_HOUSES: 'athletic-houses',
    MATERIALS_AND_SUPPLIES: 'materials-and-supplies',
    ANALYTICS: 'analytics',
} as const

export const MODULE_ICON: Record<string, string> = {
    [ModuleKey.GRADING]: 'i-lucide-graduation-cap',
    [ModuleKey.REPORT_CARDS]: 'i-lucide-file-text',
    [ModuleKey.CURRICULUM]: 'i-lucide-book-open-check',
    [ModuleKey.BEHAVIOUR]: 'i-lucide-smile',
    [ModuleKey.TIMETABLE]: 'i-lucide-calendar-clock',
    [ModuleKey.EXPENSES]: 'i-lucide-receipt',
    [ModuleKey.PAYROLL]: 'i-lucide-wallet',
    [ModuleKey.STAFF_HR]: 'i-lucide-user-cog',
    [ModuleKey.COMMUNICATION]: 'i-lucide-megaphone',
    [ModuleKey.ID_CARDS]: 'i-lucide-id-card',
    [ModuleKey.ATHLETIC_HOUSES]: 'i-lucide-trophy',
    [ModuleKey.MATERIALS_AND_SUPPLIES]: 'i-lucide-package',
    [ModuleKey.ANALYTICS]: 'i-lucide-bar-chart-3',
}

// What every school always has, shown on the Modules page so nobody wonders where these went.
export const CORE_FEATURES: { label: string, icon: string }[] = [
    { label: 'School settings', icon: 'i-lucide-settings' },
    { label: 'Users & roles', icon: 'i-lucide-users' },
    { label: 'Academic year & terms', icon: 'i-lucide-calendar-range' },
    { label: 'Classes, sections & streams', icon: 'i-lucide-school' },
    { label: 'Students & enrollment', icon: 'i-lucide-graduation-cap' },
    { label: 'Teachers & parents', icon: 'i-lucide-user-round' },
    { label: 'Subjects', icon: 'i-lucide-book-open' },
    { label: 'Student attendance', icon: 'i-lucide-clipboard-check' },
    { label: 'Fees & payments', icon: 'i-lucide-banknote' },
    { label: 'Dashboard & notifications', icon: 'i-lucide-layout-dashboard' },
]

// Which module owns which route - the single source of truth for both the menus (an item or
// sub-item disappears when its module isn't installed) and the route guard (see
// auth.global.ts). Longest matching prefix wins, so a more specific route can carve itself out of
// its parent: a `null` value means "core - always available" (e.g. notifications sit under
// /communicate but aren't part of the Communication module).
const ROUTE_MODULES: [string, string | null][] = [
    ['/grades', ModuleKey.GRADING],
    ['/performance', ModuleKey.GRADING],
    ['/academics/assessment-templates', ModuleKey.GRADING],
    ['/academics/assessment-cycle', ModuleKey.GRADING],
    ['/academics/grade-scale', ModuleKey.GRADING],
    ['/report-cards', ModuleKey.REPORT_CARDS],
    ['/curriculums', ModuleKey.CURRICULUM],
    ['/behaviours', ModuleKey.BEHAVIOUR],
    ['/timetable', ModuleKey.TIMETABLE],
    ['/expenses', ModuleKey.EXPENSES],
    ['/payroll', ModuleKey.PAYROLL],
    ['/hr', ModuleKey.STAFF_HR],
    ['/communicate', ModuleKey.COMMUNICATION],
    ['/communicate/events', null],
    ['/communicate/notifications', null],
    ['/id-cards', ModuleKey.ID_CARDS],
    ['/athletic-house', ModuleKey.ATHLETIC_HOUSES],
    ['/material', ModuleKey.MATERIALS_AND_SUPPLIES],
    ['/analytics', ModuleKey.ANALYTICS],
    ['/analytics/financial-reports', null],
]

// Detail pages carry an id in the middle of the path, so a plain prefix can't describe them:
// the tabs on a student's or teacher's profile that belong to a module.
const ROUTE_PATTERNS: [RegExp, string][] = [
    [/^\/students\/[^/]+\/performance$/, ModuleKey.GRADING],
    [/^\/students\/[^/]+\/report-card$/, ModuleKey.REPORT_CARDS],
    [/^\/students\/[^/]+\/behaviours$/, ModuleKey.BEHAVIOUR],
    [/^\/teachers\/[^/]+\/attendance$/, ModuleKey.STAFF_HR],
]

/** The module a route belongs to, or null when it's core (or not part of any module). */
export function moduleForPath(fullPath: string): string | null {
    // Links carry back-navigation query strings; only the path decides the module.
    const path = fullPath.split(/[?#]/)[0] ?? ''

    const pattern = ROUTE_PATTERNS.find(([regex]) => regex.test(path))
    if (pattern) return pattern[1]

    let match: [string, string | null] | undefined

    for (const entry of ROUTE_MODULES) {
        const [prefix] = entry
        const matches = path === prefix || path.startsWith(`${prefix}/`)
        if (matches && (!match || prefix.length > match[0].length)) {
            match = entry
        }
    }

    return match?.[1] ?? null
}

/**
 * The module every one of these routes belongs to - or null if any is core, or they span several
 * modules. What decides whether a whole menu group is "a module's" or stays with the essentials
 * (a group like Communicate mixes the Communication module with core notifications and events).
 */
export function moduleForPaths(paths: string[]): string | null {
    const keys = paths.map(moduleForPath)
    const first = keys[0]
    return first && keys.every((key) => key === first) ? first : null
}

// Icon per category, shown on the Modules page's section headers.
export const CATEGORY_ICON: Record<string, string> = {
    academics: 'i-lucide-graduation-cap',
    finance: 'i-lucide-banknote',
    people: 'i-lucide-users',
    communication: 'i-lucide-megaphone',
    operations: 'i-lucide-boxes',
    insights: 'i-lucide-bar-chart-3',
}
