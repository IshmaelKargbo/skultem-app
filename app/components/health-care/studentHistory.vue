<script setup lang="ts">
const props = defineProps<{ studentId: string }>()
const { error: toastError } = useNotify()

const history = ref<HealthCareStudentHistory | null>(null)
const loading = ref(false)

async function load() {
  history.value = null
  if (!props.studentId) return
  loading.value = true
  try {
    history.value = await HealthCareApi().studentHistory(props.studentId)
  } catch (err: any) {
    toastError(err?.message || 'Failed to load the student\'s health care record')
  } finally {
    loading.value = false
  }
}

const counted = computed(() => history.value?.visits.filter(v => v.status !== 'VOIDED') ?? [])

watch(() => props.studentId, load, { immediate: true })
</script>

<template>
  <div v-if="loading" class="space-y-2">
    <USkeleton v-for="i in 3" :key="i" class="h-12 w-full" />
  </div>
  <div v-else-if="history" class="space-y-6">
    <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
      <div class="rounded-xl border border-default p-3">
        <p class="text-[11px] uppercase tracking-wide text-muted">Visits</p>
        <p class="text-xl font-semibold">{{ counted.length }}</p>
      </div>
      <div class="rounded-xl border border-default p-3">
        <p class="text-[11px] uppercase tracking-wide text-muted">Sent home</p>
        <p class="text-xl font-semibold">{{ counted.filter(v => v.outcome === 'SENT_HOME').length }}</p>
      </div>
      <div class="rounded-xl border border-default p-3">
        <p class="text-[11px] uppercase tracking-wide text-muted">Referred</p>
        <p class="text-xl font-semibold">{{ counted.filter(v => v.outcome === 'REFERRED').length }}</p>
      </div>
      <div class="rounded-xl border border-default p-3">
        <p class="text-[11px] uppercase tracking-wide text-muted">Turned away</p>
        <p class="text-xl font-semibold">{{ history.turnedAway.length }}</p>
      </div>
    </div>

    <div class="space-y-2">
      <p class="text-xs font-semibold uppercase tracking-wide text-muted">Visits</p>
      <p v-if="!history.visits.length" class="py-6 text-center text-sm text-muted">No sick bay visits.</p>
      <ul v-else class="divide-y divide-default rounded-xl border border-default">
        <li v-for="v in history.visits" :key="v.id" class="flex items-center justify-between gap-3 px-3 py-2.5"
          :class="v.status === 'VOIDED' ? 'opacity-60' : ''">
          <div class="min-w-0">
            <ULink :to="`/health-care/visits/${v.id}`" class="text-sm font-medium hover:text-primary"
              :class="v.status === 'VOIDED' ? 'line-through' : ''">
              {{ formatDateTime(v.arrivedAt) }}
            </ULink>
            <p class="truncate text-xs text-muted">
              {{ complaintText(v) }}
              <template v-if="v.overLimit"> · over limit ({{ v.overLimit.ruleName }})</template>
            </p>
          </div>
          <UBadge size="sm" variant="soft" :color="visitBadge(v).color" :label="visitBadge(v).label" />
        </li>
      </ul>
    </div>

    <div v-if="history.turnedAway.length" class="space-y-2">
      <p class="text-xs font-semibold uppercase tracking-wide text-muted">Turned away by a limit</p>
      <ul class="divide-y divide-default rounded-xl border border-default">
        <li v-for="t in history.turnedAway" :key="t.id" class="px-3 py-2.5">
          <p class="text-sm">{{ formatDateTime(t.at) }} · {{ t.complaints }}</p>
          <p class="text-xs text-muted">{{ t.ruleName }} ({{ t.maxVisits }} a {{ periodLabel[t.period] }})</p>
        </li>
      </ul>
    </div>
  </div>
</template>
