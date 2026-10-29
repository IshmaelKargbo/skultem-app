// Who runs the library: they add books, issue and return, and change settings. Teachers can open
// the library to look things up but don't see those actions (the backend enforces the same split).
//
// Kept inside this function rather than exported from utils: Nuxt's auto-import scanner misreads
// an exported `[Role.ADMIN, ...]` constant as re-exporting Role, which shadows the real Role enum
// for the whole app.
export function useLibraryAccess() {
    const { can } = useAuth()
    const managerRoles = [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.PRINCIPAL, Role.SUPER_ADMIN, Role.LIBRARIAN]
    return {
        canManage: computed(() => can(managerRoles))
    }
}
