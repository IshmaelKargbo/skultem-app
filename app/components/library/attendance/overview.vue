<script setup lang="ts">
const store = useLibraryAttendanceStore()
const { overview } = storeToRefs(store)
const ready = computed(() => !!overview.value)
// Same roles the backend lets edit the timetable (TimetableController).
const { can } = useAuth()
const canEditTimetable = computed(() => can([Role.ADMIN, Role.PRINCIPAL, Role.SUPER_ADMIN, Role.OWNER, Role.PROPRIETOR]))

function load() {
  store.fetchOverview().catch(() => { })
}

watch(() => store.changeVersion, load)
onMounted(load)
</script>

<template>
  <div class="space-y-3">
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      <Metric :record="{
        color: 'success',
        label: 'In the Library Now',
        isReady: ready,
        value: overview?.openVisits ?? 0,
        subtle: `${overview?.visitsToday ?? 0} visits today`,
        icon: CHECK_IN_ICON
      }" />
      <Metric :record="{
        color: 'warning',
        label: 'Not Checked Out',
        isReady: ready,
        value: overview?.unresolvedVisits ?? 0,
        subtle: 'Visits needing follow-up',
        icon: FOLLOW_UP_ICON
      }" />
      <Metric :record="{
        color: 'primary',
        label: 'Class Sessions Today',
        isReady: ready,
        value: overview?.sessionsToday ?? 0,
        subtle: overview?.libraryPeriods ? `${overview.libraryPeriods} Library periods a week on the timetable` : 'No Library periods on the timetable',
        icon: LIBRARY_SESSION_ICON
      }" />
      <Metric :record="{
        color: 'error',
        label: 'Incomplete Registers',
        isReady: ready,
        value: overview?.incompleteSessions ?? 0,
        subtle: 'This term, period over, not finalized',
        icon: 'i-lucide-clipboard-x'
      }" />
    </div>

    <UAlert v-if="ready && !overview?.libraryPeriods" color="warning" variant="soft" icon="i-lucide-info"
      title="No Library periods on the timetable yet"
      :description="canEditTimetable
        ? 'On the timetable, click a period for a class and choose Library period. Each one shows up here every week for the librarian to start.'
        : 'Ask the school admin to add Library periods to the timetable. Each one shows up here every week for you to start.'">
      <template v-if="canEditTimetable" #actions>
        <UButton to="/timetable" size="xs" color="warning" variant="solid" label="Open Timetable" />
      </template>
    </UAlert>
  </div>
</template>
