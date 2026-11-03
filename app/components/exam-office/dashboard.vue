<template>
  <div class="space-y-3">
    <UCard v-if="error">
      <div class="flex flex-col items-center gap-3 py-12 text-center">
        <div class="flex size-14 items-center justify-center rounded-2xl bg-error/10">
          <UIcon name="i-lucide-alert-triangle" class="size-7 text-error" />
        </div>
        <h3 class="font-semibold text-highlighted">Couldn't load the exam office</h3>
        <p class="max-w-sm text-sm text-muted">{{ error }}</p>
        <UButton label="Try again" :icon="REFRESH_ICON" color="primary" variant="soft" @click="load" />
      </div>
    </UCard>

    <template v-else>
      <p v-if="data" class="text-sm text-muted">
        Results for <span class="font-medium text-highlighted">{{ data.termName }}</span>
      </p>
      <USkeleton v-else class="h-5 w-40" />

      <GradesApprovalRouting />

      <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric v-for="m in metrics" :key="m.label" :record="m" />
      </div>

      <div class="grid gap-3 lg:grid-cols-3">
        <!-- Who still owes grades -->
        <UCard class="lg:col-span-2" :ui="{ body: 'p-0 sm:p-0' }">
          <template #header>
            <div class="flex items-center justify-between gap-3">
              <div>
                <p class="font-semibold">Outstanding by teacher</p>
                <p class="text-xs text-muted">Not submitted yet, or returned for corrections</p>
              </div>
              <UButton to="/exam-office/submissions" label="All submissions" variant="ghost" size="sm"
                trailing-icon="i-lucide-arrow-right" />
            </div>
          </template>

          <div v-if="loading" class="divide-y divide-default">
            <div v-for="i in 4" :key="i" class="flex items-center justify-between px-4 py-3">
              <USkeleton class="h-4 w-40" />
              <USkeleton class="h-5 w-16 rounded-full" />
            </div>
          </div>

          <div v-else-if="outstandingByTeacher.length" class="divide-y divide-default">
            <NuxtLink v-for="t in outstandingByTeacher.slice(0, 8)" :key="t.key"
              :to="{ path: '/exam-office/submissions', query: { teacher: t.name, status: 'outstanding' } }"
              class="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted/40">
              <div class="min-w-0">
                <p class="truncate text-sm font-medium text-highlighted">{{ t.name }}</p>
                <p class="truncate text-xs text-muted">{{ t.subjects.join(', ') }}</p>
              </div>
              <div class="flex shrink-0 items-center gap-1.5">
                <UBadge v-if="t.draft" color="warning" variant="subtle" size="sm">{{ t.draft }} not submitted</UBadge>
                <UBadge v-if="t.returned" color="error" variant="subtle" size="sm">{{ t.returned }} returned</UBadge>
              </div>
            </NuxtLink>
          </div>

          <div v-else class="flex flex-col items-center gap-2 px-4 py-12 text-center">
            <div class="flex size-12 items-center justify-center rounded-2xl bg-success/10">
              <UIcon name="i-lucide-check-check" class="size-6 text-success" />
            </div>
            <p class="text-sm font-semibold text-highlighted">Nothing outstanding</p>
            <p class="max-w-xs text-xs text-muted">Every open assessment this term has been submitted.</p>
          </div>
        </UCard>

        <!-- Upcoming papers -->
        <UCard :ui="{ body: 'p-0 sm:p-0' }">
          <template #header>
            <div class="flex items-center justify-between gap-3">
              <div>
                <p class="font-semibold">Upcoming papers</p>
                <p class="text-xs text-muted">The next 7 days</p>
              </div>
              <UButton to="/exam-office/timetable" label="Timetable" variant="ghost" size="sm"
                trailing-icon="i-lucide-arrow-right" />
            </div>
          </template>

          <div v-if="loading" class="divide-y divide-default">
            <div v-for="i in 3" :key="i" class="space-y-2 px-4 py-3">
              <USkeleton class="h-4 w-32" />
              <USkeleton class="h-3 w-24" />
            </div>
          </div>

          <div v-else-if="upcoming.length" class="divide-y divide-default">
            <div v-for="p in upcoming.slice(0, 6)" :key="p.id" class="px-4 py-3">
              <p class="truncate text-sm font-medium text-highlighted">
                {{ p.subjectName }}<span v-if="p.paper" class="text-muted"> · {{ p.paper }}</span>
              </p>
              <p class="truncate text-xs text-muted">
                {{ p.className }} · {{ formatDate(p.examDate) }} · {{ examTime(p.startTime) }}–{{ examTime(p.endTime) }}
              </p>
            </div>
          </div>

          <div v-else class="flex flex-col items-center gap-2 px-4 py-12 text-center">
            <UIcon name="i-lucide-calendar-x" class="size-7 text-muted" />
            <p class="text-sm text-muted">No papers in the next 7 days.</p>
          </div>
        </UCard>
      </div>

      <!-- Progress by class -->
      <UCard>
        <template #header>
          <p class="font-semibold">Progress by class</p>
          <p class="text-xs text-muted">Approved out of every open assessment</p>
        </template>

        <div v-if="loading" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <USkeleton v-for="i in 6" :key="i" class="h-10 w-full" />
        </div>

        <div v-else-if="byClass.length" class="grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          <div v-for="c in byClass" :key="c.name" class="space-y-1.5">
            <div class="flex items-center justify-between gap-2 text-sm">
              <span class="truncate font-medium text-highlighted">{{ c.name }}</span>
              <span class="shrink-0 text-xs text-muted">{{ c.done }}/{{ c.total }}</span>
            </div>
            <UProgress :model-value="c.total ? Math.round((c.done / c.total) * 100) : 0" size="sm"
              :color="c.done === c.total ? 'success' : 'primary'" />
          </div>
        </div>

        <p v-else class="py-6 text-center text-sm text-muted">
          No assessments are open this term yet. They appear here once the assessment cycle starts.
        </p>
      </UCard>
    </template>
  </div>
</template>

<script setup lang="ts">
const api = ExamOfficeApi()
const { load: loadRouting, approverFor, isExamOfficer } = useGradeApproval()

const data = ref<ExamSubmissions | null>(null)
const schedule = ref<ExamSchedule[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const rows = computed(() => data.value?.rows ?? [])
const count = (status: ExamSubmissionStatus) => rows.value.filter(r => r.status === status).length
const done = computed(() => count('APPROVED') + count('COMPLETED'))

const metrics = computed(() => {
  const ready = !loading.value
  const total = rows.value.length
  return [
    { label: 'Approved', value: total ? `${Math.round((done.value / total) * 100)}%` : '—', subtle: `${done.value} of ${total} assessments`, icon: 'i-lucide-circle-check', color: 'success' as const, isReady: ready },
    // The exam officer's number is what waits on them; elsewhere it's everything submitted, whoever approves it.
    isExamOfficer.value
      ? { label: 'Awaiting your approval', value: rows.value.filter(r => r.status === 'SUBMITTED' && approverFor(r.level) === 'EXAM_OFFICER').length, subtle: `${count('SUBMITTED')} submitted in all`, icon: GRADES_APPROVAL_ICON, color: 'info' as const, isReady: ready }
      : { label: 'Awaiting approval', value: count('SUBMITTED'), icon: GRADES_APPROVAL_ICON, color: 'info' as const, isReady: ready },
    { label: 'Not submitted', value: count('DRAFT'), icon: 'i-lucide-hourglass', color: 'warning' as const, isReady: ready },
    { label: 'Returned', value: count('RETURNED'), icon: 'i-lucide-corner-up-left', color: 'error' as const, isReady: ready },
  ]
})

const outstandingByTeacher = computed(() => {
  const map = new Map<string, { key: string, name: string, draft: number, returned: number, subjects: string[] }>()
  for (const r of rows.value) {
    if (r.status !== 'DRAFT' && r.status !== 'RETURNED') continue
    const key = r.teacherId ?? 'none'
    const entry = map.get(key) ?? { key, name: r.teacherName ?? 'No teacher assigned', draft: 0, returned: 0, subjects: [] }
    if (r.status === 'DRAFT') entry.draft++
    else entry.returned++
    const label = `${r.subjectName} (${r.className})`
    if (!entry.subjects.includes(label)) entry.subjects.push(label)
    map.set(key, entry)
  }
  return [...map.values()].sort((a, b) => (b.draft + b.returned) - (a.draft + a.returned))
})

const byClass = computed(() => {
  const map = new Map<string, { name: string, done: number, total: number }>()
  for (const r of rows.value) {
    const entry = map.get(r.className) ?? { name: r.className, done: 0, total: 0 }
    entry.total++
    if (r.status === 'APPROVED' || r.status === 'COMPLETED') entry.done++
    map.set(r.className, entry)
  }
  return [...map.values()]
})

const upcoming = computed(() => {
  const today = new Date()
  const from = today.toISOString().slice(0, 10)
  const to = new Date(today.getTime() + 7 * 86400000).toISOString().slice(0, 10)
  return schedule.value.filter(p => p.examDate >= from && p.examDate <= to)
})

async function load() {
  loading.value = true
  error.value = null
  try {
    data.value = (await api.submissions()) ?? null
    if (data.value?.termId) {
      // The timetable is a nice-to-have here - the rest of the dashboard still shows if it fails.
      schedule.value = (await api.schedule({ termId: data.value.termId }).catch(() => [])) ?? []
    }
  } catch (err: any) {
    error.value = err?.message || 'Something went wrong. Please try again later.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadRouting()
  load()
})
</script>
