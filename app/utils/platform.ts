// Who can do what on the platform, its settings, and the audit log - see backend PlatformGovernanceController.
export type PlatformPermission =
    'DASHBOARD' | 'SCHOOLS' | 'ADMINS' | 'BILLING' | 'MARKETING' | 'COMMUNICATION' | 'SUPPORT' | 'SETTINGS' | 'AUDIT' | 'ROLES' | 'HEALTH'

export type PlatformAccess = {
    role: string
    roleLabel: string
    permissions: PlatformPermission[]
}

export type PlatformRoleInfo = {
    role: string
    label: string
    description: string
    permissions: PlatformPermission[]
    custom: boolean
}

export type PlatformStaff = {
    userId: string
    name: string
    email: string
    status: string
    role: string
    roleLabel: string
    // False for someone who has never been given a role - they are an owner by default.
    explicit: boolean
    lastLoginAt: string | null
}

// A school's own platform fee amount per year (from the Schools page), null when it has none.
export type PlatformFeeSetting = {
    schoolId: string
    amount: number | null
    updatedAt: string | null
}

// The platform fee every student is charged: a flat amount per term, the same for every school.
export type PlatformFeeOverview = {
    perTerm: number
    termsPerYear: number
    perYear: number
    schools: number
    schoolsOnThisFee: number
    // Schools that were given their own amount from the Schools page.
    schoolsOnOtherFees: number
    updatedAt: string | null
}

// What a school owes Skultem in platform fees and how much of it students have paid, from the school's own fee records.
export type SchoolFeeCollection = {
    schoolId: string
    name: string
    domain: string
    status: string
    students: number
    billed: number
    discounts: number
    collected: number
    outstanding: number
    rate: number
    lastPaymentAt: string | null
}

export type PlatformFeeCollections = {
    billed: number
    discounts: number
    collected: number
    outstanding: number
    rate: number
    students: number
    schools: number
    schoolsOwing: number
    items: SchoolFeeCollection[]
}

export type AuditEntry = {
    id: string
    action: string
    status: 'SUCCESS' | 'FAILURE' | 'REJECTED'
    details: string | null
    schoolId: string | null
    schoolName: string | null
    userId: string | null
    userName: string | null
    userEmail: string | null
    ipAddress: string | null
    device: string | null
    os: string | null
    browser: string | null
    createdAt: string | null
}

// The page of the admin portal each permission opens. The server checks the permission on every request; this only
// keeps someone from landing on a page they can't use.
const PAGE_PERMISSIONS: [string, PlatformPermission][] = [
    ['/blog', 'MARKETING'], ['/leads', 'MARKETING'], ['/onboarding', 'MARKETING'], ['/demo-requests', 'MARKETING'],
    ['/contact-messages', 'MARKETING'], ['/testimonials', 'MARKETING'], ['/videos', 'MARKETING'], ['/announcements', 'COMMUNICATION'],
    ['/fee-collection', 'BILLING'], ['/schools', 'SCHOOLS'], ['/calendar', 'SCHOOLS'], ['/users', 'ADMINS'],
    ['/roles', 'ROLES'], ['/platform-settings', 'SETTINGS'], ['/audit-logs', 'AUDIT'],
    ['/support', 'SUPPORT'], ['/notifications', 'COMMUNICATION'], ['/system-health', 'HEALTH']
]

export function permissionForPath(path: string): PlatformPermission | undefined {
    return PAGE_PERMISSIONS.find(([prefix]) => path === prefix || path.startsWith(`${prefix}/`))?.[1]
}
