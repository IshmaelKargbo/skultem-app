<script setup lang="ts">
// A student's library record: their own visits and their class library sessions, kept apart (never added
// together). Used on the attendance reports page and on the student's profile.
const props = defineProps<{ studentId: string }>()

const { error: toastError } = useNotify()
const history = ref<StudentLibraryHistory | null>(null)
const loading = ref(false)

async function load() {
  history.value = null
  if (!props.studentId) return
  loading.value = true
  try {
    history.value = await LibraryAttendanceApi().studentHistory(props.studentId)
  } catch (err: any) {
    toastError(err?.message || 'Failed to load the student\'s library record')
  } finally {
    loading.value = false
  }
}

watch(() => props.studentId, load, { immediate: true })
</script>

<template>
  <div v-if="loading" class="space-y-2">
    <USkeleton v-for="i in 3" :key="i" class="h-10 w-full" />
  </div>
  <p v-else-if="!history" class="py-8 text-center text-sm text-muted">Choose a student to see their library record.</p>
  <div v-else class="grid gap-6 lg:grid-cols-2">
    <div class="space-y-2">
      <p class="text-xs font-semibold uppercase tracking-wide text-muted">
        Independent visits ({{ history.visits.length }})
      </p>
      <p v-if="!history.visits.length" class="text-sm text-muted">No visits.</p>
      <ul v-else class="divide-y divide-default rounded-xl border border-default">
        <li v-for="v in history.visits" :key="v.id" class="flex items-center justify-between gap-3 px-3 py-2">
          <div>
            <p class="text-sm">{{ formatDateTime(v.checkedInAt) }}</p>
            <p class="text-xs text-muted">
              <template v-if="v.durationMinutes !== null">{{ formatMinutes(v.durationMinutes) }}</template>
              <template v-else-if="v.status === 'RESOLVED'">Check-out not recorded</template>
            </p>
          </div>
          <UBadge size="sm" variant="soft" :color="visitState(v).color" :label="visitState(v).label" />
        </li>
      </ul>
    </div>
    <div class="space-y-2">
      <p class="text-xs font-semibold uppercase tracking-wide text-muted">
        Class library sessions ({{ history.sessions.length }})
      </p>
      <p v-if="!history.sessions.length" class="text-sm text-muted">No class library sessions.</p>
      <ul v-else class="divide-y divide-default rounded-xl border border-default">
        <li v-for="s in history.sessions" :key="s.sessionId" class="flex items-center justify-between gap-3 px-3 py-2">
          <div>
            <ULink :to="`/library/attendance/sessions/${s.sessionId}`" class="text-sm hover:text-primary">
              {{ formatDayLabel(s.date) }} · {{ s.className }}
            </ULink>
            <p class="text-xs text-muted">
              {{ s.periodName }}
              <template v-if="s.sessionStatus === 'CANCELLED'"> · session cancelled, not counted</template>
              <template v-else-if="s.sessionStatus === 'IN_PROGRESS'"> · not finalized yet</template>
              <template v-if="s.corrected"> · corrected</template>
            </p>
          </div>
          <UBadge size="sm" variant="soft" :color="registerStatusStyle[s.status].color"
            :label="registerStatusStyle[s.status].label" />
        </li>
      </ul>
    </div>
  </div>
</template>
