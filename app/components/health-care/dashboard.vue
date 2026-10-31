<script setup lang="ts">
// Health Care at a glance (docs/HEALTH_CARE.md §8): who is in the sick bay now (long stays highlighted), visits nobody
// closed before the school day ended, and today in numbers. The nurse starts visits from here.
const { canRecord } = useHealthCareAccess()
const { changeVersion } = useHealthCare()
const { error: toastError } = useNotify()

const overview = ref<HealthCareOverview | null>(null)
const ready = computed(() => !!overview.value)

async function load() {
  try {
    overview.value = await HealthCareApi().overview()
  } catch (err: any) {
    toastError(err?.message || 'Failed to load health care')
  }
}

// Minutes in the sick bay tick on while the page is open.
let timer: ReturnType<typeof setInterval>
onMounted(() => {
  load()
  timer = setInterval(load, 60_000)
})
onBeforeUnmount(() => clearInterval(timer))
watch(changeVersion, load)
</script>

<template>
  <div class="space-y-3">
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      <Metric :record="{
        color: 'info',
        label: 'In the Sick Bay Now',
        isReady: ready,
        value: overview?.inSickBay.length ?? 0,
        subtle: `${overview?.today.visits ?? 0} visits today`,
        icon: 'i-lucide-bed'
      }" />
      <Metric :record="{
        color: 'warning',
        label: 'Needs Follow-up',
        isReady: ready,
        value: overview?.followUp.length ?? 0,
        subtle: 'Never closed, school day over',
        icon: FOLLOW_UP_ICON
      }" />
      <Metric :record="{
        color: 'error',
        label: 'Sent Home or Referred',
        isReady: ready,
        value: (overview?.today.sentHome ?? 0) + (overview?.today.referred ?? 0),
        subtle: `${overview?.today.sentHome ?? 0} sent home · ${overview?.today.referred ?? 0} referred today`,
        icon: 'i-lucide-ambulance'
      }" />
      <Metric :record="{
        color: 'neutral',
        label: 'Turned Away Today',
        isReady: ready,
        value: overview?.today.turnedAway ?? 0,
        subtle: 'Stopped by a visit limit',
        icon: 'i-lucide-ban'
      }" />
    </div>

    <UCard>
      <template #header>
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 class="font-semibold">In the Sick Bay</h3>
            <p class="text-xs text-muted">
              Open visits.<template v-if="overview?.longStayMinutes"> Amber after {{ formatMinutes(overview.longStayMinutes) }}.</template>
            </p>
          </div>
          <HealthCareStartVisit v-if="canRecord" />
        </div>
      </template>

      <div v-if="!ready" class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <USkeleton v-for="i in 3" :key="i" class="h-24 w-full rounded-xl" />
      </div>
      <div v-else-if="!overview?.inSickBay.length" class="flex flex-col items-center gap-3 py-12 text-center">
        <div class="flex h-16 w-16 items-center justify-center rounded-[24px] bg-primary-50 dark:bg-primary-500/10">
          <UIcon :name="HEALTH_CARE_ICON" class="text-3xl text-primary-500" />
        </div>
        <p class="font-semibold">Nobody is in the sick bay</p>
        <p class="text-sm text-muted">Students you start a visit for appear here until you close it.</p>
      </div>
      <div v-else class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <NuxtLink v-for="v in overview.inSickBay" :key="v.id" :to="`/health-care/visits/${v.id}`"
          class="block rounded-xl border-2 p-4 transition-colors hover:border-primary"
          :class="v.longStay ? 'border-warning bg-warning/5' : 'border-default'">
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <p class="truncate font-semibold">{{ v.studentName }}</p>
              <p class="truncate text-xs text-muted">{{ v.studentClass }}</p>
            </div>
            <UBadge v-if="v.urgent" size="sm" color="error" variant="soft" :icon="URGENT_ICON" label="Urgent" />
          </div>
          <p class="mt-2 line-clamp-2 text-sm">{{ complaintText(v) }}</p>
          <p class="mt-2 flex items-center gap-1.5 text-xs" :class="v.longStay ? 'font-medium text-warning' : 'text-muted'">
            <UIcon name="i-lucide-clock" class="size-3.5" />
            In since {{ formatTime(v.arrivedAt) }} · {{ formatMinutes(v.minutesIn) }}
          </p>
        </NuxtLink>
      </div>
    </UCard>

    <UCard v-if="overview?.followUp.length">
      <template #header>
        <h3 class="font-semibold">Needs Follow-up</h3>
        <p class="text-xs text-muted">
          These visits were never closed and the student's school day has ended. Follow each one up with what
          happened - no departure time is made up.
        </p>
      </template>
      <ul class="divide-y divide-default">
        <li v-for="v in overview.followUp" :key="v.id" class="flex items-center justify-between gap-3 py-2.5">
          <div class="min-w-0">
            <p class="truncate text-sm font-medium">{{ v.studentName }} <span class="font-normal text-muted">· {{ v.studentClass }}</span></p>
            <p class="truncate text-xs text-muted">{{ formatDateTime(v.arrivedAt) }} · {{ complaintText(v) }}</p>
          </div>
          <UButton :to="`/health-care/visits/${v.id}`" size="sm" color="warning" variant="soft" label="Follow Up" />
        </li>
      </ul>
    </UCard>
  </div>
</template>
