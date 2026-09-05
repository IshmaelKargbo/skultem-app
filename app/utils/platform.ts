// One per school now - see the backend's PlatformFeeSetting. schoolId is missing (null) only for
// a not-yet-persisted default returned locally while nothing has loaded yet.
export type PlatformFeeSetting = {
    schoolId: string | null
    amount: number | null
    updatedAt: string | null
}
