// Who can do what in Health Care (backend: HealthCareController, docs/HEALTH_CARE.md §4): the nurse records visits;
// principal-level roles see everything, add follow-up notes, void and follow up visits, and change the rules. A
// plain admin, teachers and accountants get nothing - medical details stay with the nurse and principal-level.
// SUPER_ADMIN is listed where the backend lets it through (its SUPER_ADMIN_COVERS includes NURSE), because the
// frontend's roleAllows only covers OWNER/PROPRIETOR for it.
export function useHealthCareAccess() {
    const { can } = useAuth()
    const principalLevel = [Role.PRINCIPAL, Role.OWNER, Role.PROPRIETOR, Role.SUPER_ADMIN]
    return {
        canView: computed(() => can([Role.NURSE, ...principalLevel])),
        canRecord: computed(() => can([Role.NURSE, Role.SUPER_ADMIN])),
        canSupervise: computed(() => can([Role.NURSE, ...principalLevel])),
        canManageSettings: computed(() => can(principalLevel))
    }
}
