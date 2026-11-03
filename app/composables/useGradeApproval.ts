// Who approves grades where - the school's choice (class master, admin or exam officer), per section when the
// school has sections. Loaded once and shared, so the grades screens, the approval queue and the exam office all
// describe the same routing and offer "Review" only to the person who can act.
let inflight: Promise<GradeApprovalRouting | null> | null = null

export function useGradeApproval() {
  const { can } = useAuth()
  const routing = useState<GradeApprovalRouting | null>('grade-approval-routing', () => null)
  const loading = useState<boolean>('grade-approval-routing-loading', () => false)

  async function load(force = false): Promise<GradeApprovalRouting | null> {
    if (routing.value && !force) return routing.value
    if (inflight) return inflight
    loading.value = true
    inflight = AssessmentApi().getApprovalRouting()
      .then(res => { routing.value = res ?? null; return routing.value })
      .catch(() => routing.value)
      .finally(() => { loading.value = false; inflight = null })
    return inflight
  }

  // The approver for a class level ("JSS_1"); the school's choice when no section claims the level.
  function approverFor(level?: string | null): GradeApprover {
    const route = level ? routing.value?.routes.find(r => r.levels.includes(level)) : undefined
    return route?.approver ?? routing.value?.schoolApprover ?? 'CLASS_MASTER'
  }

  // Does any part of the school send grades to this approver?
  function routesTo(approver: GradeApprover) {
    return !!routing.value?.routes.some(r => r.approver === approver && r.levels.length)
  }

  const isManagement = computed(() => can([Role.ADMIN, Role.OWNER, Role.PROPRIETOR, Role.PRINCIPAL, Role.SUPER_ADMIN]))
  const isExamOfficer = computed(() => !isManagement.value && can(Role.EXAM_OFFICER))

  // The approver the signed-in person acts as: management can sign off anything, the exam officer only what's
  // routed to the exam office. null = everything.
  const myApprover = computed<GradeApprover | null>(() => isExamOfficer.value ? 'EXAM_OFFICER' : null)

  // Can the signed-in person approve grades for this level? (Class masters are handled by their own queue.)
  function canApproveLevel(level?: string | null) {
    if (isManagement.value) return true
    if (isExamOfficer.value) return approverFor(level) === 'EXAM_OFFICER'
    return false
  }

  // The approvers actually in use, in a fixed order - for filters.
  const approversInUse = computed<GradeApprover[]>(() =>
    (['CLASS_MASTER', 'ADMIN', 'EXAM_OFFICER'] as GradeApprover[]).filter(routesTo))

  return { routing, loading, load, approverFor, routesTo, myApprover, canApproveLevel, approversInUse, isManagement, isExamOfficer }
}
