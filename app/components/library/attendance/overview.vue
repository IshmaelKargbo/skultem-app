<script setup lang="ts">
const store = useLibraryAttendanceStore()
const { overview } = storeToRefs(store)
const ready = computed(() => !!overview.value)

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
        subtle: overview?.librarySubjectName ? `From ${overview.librarySubjectName} periods` : 'No Library subject chosen',
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

    <UAlert v-if="ready && !overview?.librarySubjectId" color="warning" variant="soft" icon="i-lucide-info"
      title="Choose the school's Library subject"
      description="Class library sessions come from the timetable periods for that subject. Pick it in Library Settings.">
      <template #actions>
        <UButton to="/library/settings" size="xs" color="warning" variant="solid" label="Library Settings" />
      </template>
    </UAlert>
  </div>
</template>
