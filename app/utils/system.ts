// Cross-tenant system-admin area - see backend SystemAdminController. Distinct from utils/school.ts's
// `School` (a school viewing its own record) since these come back from endpoints only SYSTEM_ADMIN
// can reach and carry the owner contact details that matter for platform support.
export type SystemStats = {
    totalSchools: number
    totalUsers: number
    totalStudents: number
}

export type InsightDelta = { current: number, previous: number }

export type InsightSchoolRow = {
    id: string
    name: string
    domain: string
    students: number
    playground: boolean
    // Only on the needs-attention list.
    reason: string | null
    createdAt: string | null
}

export type InsightRecentSchool = {
    id: string
    name: string
    domain: string
    status: string
    playground: boolean
    ownerName: string | null
    createdAt: string | null
}

export type InsightActivity = {
    id: string
    action: string
    status: 'SUCCESS' | 'FAILURE' | 'REJECTED'
    schoolName: string | null
    userName: string | null
    createdAt: string | null
}

// What the dashboard reads beyond the headline totals - see backend SystemInsightsUseCase.
export type SystemInsights = {
    // The period the growth numbers and demo count cover.
    days: number
    recentSchools: InsightRecentSchool[]
    recentActivity: InsightActivity[]
    leads: { open: number, awaitingFollowUp: number, unassigned: number, overdue: number } | null
    onboarding: { inProgress: number, completed: number, overdueSteps: number } | null
    // Null for an admin whose role has no support access.
    support: { open: number, unassigned: number, urgent: number } | null
    schools: { total: number, live: number, playground: number, inactive: number }
    growth: { schools: InsightDelta, students: InsightDelta, users: InsightDelta, demoRequests: InsightDelta }
    monthly: { month: string, schools: number, students: number, demoRequests: number }[]
    topSchools: InsightSchoolRow[]
    needsAttention: InsightSchoolRow[]
    // The marketing figures are null for an admin whose role has no marketing access.
    demos: { total: number, inPeriod: number } | null
    content: { unreadMessages: number, publishedPosts: number, draftPosts: number, publishedTestimonials: number } | null
}

export type SystemSchoolOwner = {
    givenNames: string
    familyName: string
    email: string
    phone: string
}

export type SystemSchoolAddress = {
    region: string
    district: string
    chiefdom: string
    city: string
    street: string
}

export type SystemSchool = {
    id: string
    name: string
    domain: string
    address: SystemSchoolAddress
    status: 'ACTIVE' | 'INACTIVE' | 'DELETED'
    owner: SystemSchoolOwner
    // Playground mode - see utils/playground.ts.
    testSchool: boolean
    createdAt: string
    updatedAt: string
}

// Body for onboarding a school from the system-admin portal - same shape CreateSchoolDTO expects
// on the backend (POST /api/v1/school, public by design - see SecurityConfig - since it's also
// how a school signs itself up outside this portal).
export type OnboardSchoolPayload = {
    name: string
    domain: string
    region: string
    district: string
    chiefdom: string
    city: string
    street: string
    givenNames: string
    familyName: string
    email: string
    phone: string
    password: string
    // Levels offered and how they're managed (see utils/schoolStructure.ts).
    structure?: SchoolStructurePayload
}

// Body for editing an existing school's profile from the system-admin portal - matches
// UpdateSchoolDTO. No owner/branding fields here; those stay self-service (see settings/school.vue).
export type EditSchoolPayload = {
    name: string
    domain: string
    region: string
    district: string
    chiefdom: string
    city: string
    street: string
}

export type SystemUserSchoolMembership = {
    schoolId: string
    schoolName: string
    domain: string | null
    role: string
    status: string
}

export type SystemUser = {
    id: string
    givenNames: string
    familyName: string
    email: string
    photo: string | null
    schools: SystemUserSchoolMembership[]
}


// The platform-wide (ministry) academic year every newly-created school starts from - see backend
// NationalAcademicYear. Terms are numbered by order on the backend, so a payload only carries
// their names and dates.
export type NationalTerm = {
    termNumber: number
    name: string
    startDate: string
    endDate: string
}

export type NationalCalendar = {
    id: string
    name: string
    startDate: string
    endDate: string
    current: boolean
    terms: NationalTerm[]
    updatedAt: string
}

export type SaveNationalCalendarPayload = {
    name: string
    startDate: string
    endDate: string
    terms: { name: string, startDate: string, endDate: string }[]
}

// What the Schools list can be narrowed by - sent as is, the backend ignores whatever is empty.
export type SchoolFilters = {
    query?: string
    status?: string
    // LIVE or PLAYGROUND
    type?: string
}
