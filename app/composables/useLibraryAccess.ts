// Who runs the library: they add books, issue and return, and change settings. Teachers don't use the
// library screens at all (the backend refuses them too) - the librarian issues their books. Staff limited to
// management sections only see their sections' books (see useLibrarySections).
//
// Library Attendance has its own split (backend: LibraryAttendanceController, docs/LIBRARY_ATTENDANCE.md §4):
// the librarian records; principal-level roles follow up visits, cancel sessions, export and are the only ones
// who correct a finalized register; a plain admin can look; teachers don't see it at all.
// SUPER_ADMIN is listed where the backend lets it through (its SUPER_ADMIN_COVERS includes LIBRARIAN),
// because the frontend's roleAllows only covers OWNER/PROPRIETOR for it.
//
// Kept inside this function rather than exported from utils: Nuxt's auto-import scanner misreads
// an exported `[Role.ADMIN, ...]` constant as re-exporting Role, which shadows the real Role enum
// for the whole app.
export function useLibraryAccess() {
    const { can } = useAuth()
    const managerRoles = [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.PRINCIPAL, Role.SUPER_ADMIN, Role.LIBRARIAN]
    const principalLevel = [Role.PRINCIPAL, Role.OWNER, Role.PROPRIETOR, Role.SUPER_ADMIN]
    return {
        canManage: computed(() => can(managerRoles)),
        canViewAttendance: computed(() => can(managerRoles)),
        canRecordAttendance: computed(() => can([Role.LIBRARIAN, Role.SUPER_ADMIN])),
        canSuperviseAttendance: computed(() => can([Role.LIBRARIAN, ...principalLevel])),
        canCorrectAttendance: computed(() => can(principalLevel))
    }
}
