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

export type SystemSchool = {
    id: string
    name: string
    domain: string
    status: 'ACTIVE' | 'INACTIVE' | 'DELETED'
    owner: SystemSchoolOwner
    createdAt: string
    updatedAt: string
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
