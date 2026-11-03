<template>
  <div v-if="routing" class="rounded-lg border border-default bg-elevated/40 px-4 py-3">
    <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <div class="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5">
        <span class="text-xs font-semibold uppercase tracking-wide text-muted">Who approves grades</span>
        <span v-for="route in visibleRoutes" :key="route.sectionId ?? route.name"
          class="inline-flex items-center gap-1.5 text-sm">
          <span v-if="routing.sectionBased || routing.routes.length > 1" class="text-muted">{{ route.name }}:</span>
          <UBadge :icon="GRADE_APPROVER_ICON[route.approver]" :color="approverColor(route.approver)" variant="subtle"
            size="sm" :label="GRADE_APPROVER_LABEL[route.approver]" />
        </span>
      </div>
      <UButton v-if="canChange" to="/settings/school" size="xs" variant="ghost" color="neutral"
        trailing-icon="i-lucide-arrow-right" label="Change" class="self-start md:self-auto" />
    </div>

    <p v-if="note" class="mt-1.5 text-xs text-muted">{{ note }}</p>
  </div>
  <USkeleton v-else-if="loading" class="h-12 w-full rounded-lg" />
</template>

<script setup lang="ts">
// One line saying who signs off grades in each part of the school, and what that means for the viewer. Shown on the
// approval queue, the exam office and the submissions tracker so they all tell the same story.
const { can } = useAuth()
const { routing, loading, load, routesTo, isExamOfficer, isManagement } = useGradeApproval()

// Sections with no levels have nothing to approve.
const visibleRoutes = computed(() => (routing.value?.routes ?? []).filter(r => r.levels.length))

// Settings > School is where the choice is made (owner, proprietor, principal or admin).
const canChange = computed(() => can([Role.ADMIN, Role.OWNER, Role.PROPRIETOR, Role.PRINCIPAL, Role.SUPER_ADMIN]))

function approverColor(approver: GradeApprover) {
  return approver === 'EXAM_OFFICER' ? 'warning' : approver === 'ADMIN' ? 'info' : 'primary'
}

const note = computed(() => {
  if (!routing.value) return ''
  if (isExamOfficer.value) {
    return routesTo('EXAM_OFFICER')
      ? 'You approve grades where the exam officer is shown. Elsewhere you can follow progress, but the approval is someone else\'s.'
      : 'No part of the school sends grades to the exam officer yet, so you can follow progress but not approve. The school can change this in settings.'
  }
  if (isManagement.value) {
    const parts: string[] = []
    if (routesTo('CLASS_MASTER')) parts.push('class masters approve their own classes')
    if (routesTo('EXAM_OFFICER')) parts.push('the exam officer approves where shown')
    const intro = parts.length ? `Day to day, ${parts.join(' and ')}. ` : ''
    const own = routesTo('CLASS_MASTER') ? ' Where class masters approve, a subject the class master teaches goes to an admin.' : ''
    return `${intro}Admins can step in on any class.${own}`
  }
  return ''
})

onMounted(() => { load() })
</script>
