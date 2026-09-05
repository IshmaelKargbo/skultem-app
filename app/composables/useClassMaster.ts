// Whether the signed-in teacher is a class master of any session, and their assignments if so.
// Shared (via useState) across every component that needs it - the teacher dashboard, the nav
// menus, and the grade-approval page all gate teacher-only, class-master-only features on this,
// so it's fetched once per session instead of once per component.
export function useClassMaster() {
    const { can } = useAuth()

    const assignments = useState<TeacherClassMaster[] | null>('class-master-assignments', () => null)
    const loading = useState<boolean>('class-master-loading', () => false)
    // Distinguishes "haven't successfully determined this yet" from "checked, and there are
    // none" - assignments.value can be [] either way (still loading, a failed fetch, or a
    // confirmed empty result), so a page must gate on `checked` (not on assignments/isClassMaster
    // alone) before it's safe to show a "you're not a class master" message - otherwise a
    // still-loading or errored check reads as a confirmed no.
    const checked = useState<boolean>('class-master-checked', () => false)
    const error = useState<string | null>('class-master-error', () => null)

    const isClassMaster = computed(() => (assignments.value?.length ?? 0) > 0)

    async function ensureLoaded() {
        if (!can(Role.TEACHER)) return
        // Only a confirmed success skips a retry - unlike checking assignments.value (which the
        // old version of this did), a failed attempt must be retried on the next call rather than
        // being mistaken for "checked, and there are none".
        if (checked.value || loading.value) return

        loading.value = true
        error.value = null
        try {
            assignments.value = await TeacherApi().getMyClassMasterAssignments() || []
            checked.value = true
        } catch (err: any) {
            error.value = err?.message || 'Failed to check class master status'
        } finally {
            loading.value = false
        }
    }

    return { assignments, isClassMaster, loading, checked, error, ensureLoaded }
}
