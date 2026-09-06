// Cross-tenant system-admin area - see backend SystemAdminController. Distinct from utils/school.ts's
// `School` (a school viewing its own record) since these come back from endpoints only SYSTEM_ADMIN
// can reach and carry the owner contact details that matter for platform support.
export type SystemStats = {
    totalSchools: number
    totalUsers: number
    totalStudents: number
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
