<template>
  <div class="space-y-3 px-4 md:px-6">
    <div class="print:hidden space-y-3">
      <Heading title="Exam Timetable" :subtitle="canManage
        ? 'When and where each class sits its papers, and who invigilates.'
        : 'When and where each class sits its papers.'" />
      <GradesSectionNav />

      <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div class="flex flex-col gap-2 sm:flex-row">
          <USelectMenu v-model="termId" :items="termOptions" value-key="value" label-key="label"
            placeholder="Choose a term" class="w-full sm:w-44" :loading="termStore.loading" />
          <USelectMenu v-model="classId" :items="classOptions" value-key="value" label-key="label"
            placeholder="All classes" class="w-full sm:w-44" />
          <USwitch v-if="isTeacher" v-model="mine" label="Only my invigilation" class="sm:ml-2 sm:self-center" />
        </div>
        <div class="flex gap-2">
          <UButton v-if="schedule.length" icon="i-lucide-printer" variant="soft" color="neutral" label="Print"
            @click="printPage" />
          <UButton v-if="canManage" :icon="ADD_ICON" label="Add Paper" :disabled="!currentTerm" @click="openForm(null)" />
        </div>
      </div>
    </div>

    <!-- Printed heading -->
    <div class="hidden print:block">
      <h1 class="text-xl font-bold">Exam Timetable · {{ currentTerm?.name }}</h1>
      <p v-if="classId" class="text-sm">{{ classOptions.find(c => c.value === classId)?.label }}</p>
    </div>

    <div v-if="loading" class="space-y-3">
      <!-- Shaped like a day's card: date header, then papers (time | subject + class line). -->
      <UCard v-for="i in 2" :key="i" :ui="{ body: 'p-0 sm:p-0' }">
        <template #header>
          <div class="flex items-center justify-between">
            <USkeleton class="h-5 w-48" />
            <USkeleton class="h-5 w-16 rounded-full" />
          </div>
        </template>
        <div class="divide-y divide-default">
          <div v-for="j in 3" :key="j" class="flex items-start gap-3 px-4 py-3">
            <USkeleton class="h-4 w-24 shrink-0" />
            <div class="min-w-0 flex-1 space-y-1.5">
              <USkeleton class="h-4 w-44" />
              <USkeleton class="h-3 w-64 max-w-full" />
            </div>
          </div>
        </div>
      </UCard>
    </div>

    <UCard v-else-if="error">
      <div class="flex flex-col items-center gap-3 py-12 text-center">
        <div class="flex size-14 items-center justify-center rounded-2xl bg-error/10">
          <UIcon name="i-lucide-alert-triangle" class="size-7 text-error" />
        </div>
        <h3 class="font-semibold text-highlighted">Couldn't load the timetable</h3>
        <p class="max-w-sm text-sm text-muted">{{ error }}</p>
        <UButton label="Try again" :icon="REFRESH_ICON" color="primary" variant="soft" @click="load" />
      </div>
    </UCard>

    <template v-else-if="byDate.length">
      <UCard v-for="day in byDate" :key="day.date" :ui="{ body: 'p-0 sm:p-0' }" class="break-inside-avoid">
        <template #header>
          <div class="flex items-center justify-between">
            <p class="font-semibold">{{ formatDay(day.date) }}</p>
            <UBadge variant="subtle" color="neutral">{{ day.papers.length }} {{ day.papers.length === 1 ? 'paper' : 'papers' }}</UBadge>
          </div>
        </template>
        <div class="divide-y divide-default">
          <div v-for="p in day.papers" :key="p.id" class="flex items-start justify-between gap-3 px-4 py-3">
            <div class="flex min-w-0 gap-3">
              <div class="w-24 shrink-0 text-sm font-semibold tabular-nums text-highlighted">
                {{ examTime(p.startTime) }}–{{ examTime(p.endTime) }}
              </div>
              <div class="min-w-0">
                <p class="truncate text-sm font-medium text-highlighted">
                  {{ p.subjectName }}<span v-if="p.paper" class="text-muted"> · {{ p.paper }}</span>
                </p>
                <p class="truncate text-xs text-muted">
                  {{ p.className }}
                  <template v-if="p.venue"> · {{ p.venue }}</template>
                  <template v-if="p.invigilatorName"> · Invigilator: {{ p.invigilatorName }}</template>
                </p>
                <p v-if="p.notes" class="mt-0.5 text-xs text-muted italic">{{ p.notes }}</p>
              </div>
            </div>
            <div v-if="canManage" class="flex shrink-0 gap-1 print:hidden">
              <UButton :icon="SCHEME_EDIT_ICON" size="xs" variant="ghost" color="neutral" aria-label="Edit"
                @click="openForm(p)" />
              <UButton :icon="DELETE_ICON" size="xs" variant="ghost" color="error" aria-label="Remove"
                @click="() => { deleting = p }" />
            </div>
          </div>
        </div>
      </UCard>
    </template>

    <UCard v-else>
      <div class="flex flex-col items-center gap-3 py-14 text-center">
        <div class="flex size-14 items-center justify-center rounded-2xl bg-primary/10">
          <UIcon name="i-lucide-calendar-clock" class="size-7 text-primary" />
        </div>
        <h3 class="font-semibold text-highlighted">
          {{ !termId ? 'Choose a term' : mine ? 'You have no papers to invigilate' : 'No papers scheduled yet' }}
        </h3>
        <p class="max-w-sm text-sm text-muted">
          <template v-if="canManage && termId">Add each paper with its date, time, venue and invigilator.</template>
          <template v-else-if="termId">The exam office hasn't published papers for this term yet.</template>
        </p>
        <UButton v-if="canManage && termId" :icon="ADD_ICON" label="Add Paper" @click="openForm(null)" />
      </div>
    </UCard>

    <ExamOfficePaperForm v-model:open="formOpen" :record="editing" :term="currentTerm" :class-options="classOptions"
      :subject-options="subjectOptions" :teacher-options="teacherOptions" @saved="load" />

    <UModal :open="!!deleting" title="Remove this paper?" @update:open="(v) => { if (!v) deleting = null }">
      <template #body>
        <p class="text-sm text-muted">
          {{ deleting?.subjectName }}<span v-if="deleting?.paper"> · {{ deleting?.paper }}</span> for
          {{ deleting?.className }} on {{ deleting ? formatDay(deleting.examDate) : '' }} comes off the timetable.
        </p>
      </template>
      <template #footer>
        <div class="flex gap-3">
          <UButton color="error" :loading="removing" label="Remove" @click="remove" />
          <UButton variant="outline" color="neutral" label="Cancel" :disabled="removing" @click="() => { deleting = null }" />
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
const { can } = useAuth()
const api = ExamOfficeApi()
const termStore = useTermStore()
const classStore = useClassStore()
const subjectStore = useSubjectStore()
const teacherStore = useTeacherStore()
const { error: toastError, success: toastSuccess } = useNotify()

const canManage = computed(() => can(EXAM_OFFICE_ROLES))
const isTeacher = computed(() => can(Role.TEACHER))

const termId = ref<string | undefined>()
const classId = ref<string | undefined>()
const mine = ref(false)
const schedule = ref<ExamSchedule[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const formOpen = ref(false)
const editing = ref<ExamSchedule | null>(null)
const deleting = ref<ExamSchedule | null>(null)
const removing = ref(false)

const currentTerm = computed(() => termStore.records.find(t => t.id === termId.value) ?? null)
const termOptions = computed(() => termStore.records.map(t => ({ label: t.name, value: t.id })))
const classOptions = computed(() => classStore.records.map(c => ({ label: c.name, value: c.id })))
const subjectOptions = computed(() => subjectStore.records.map(s => ({ label: s.name, value: s.id })))
const teacherOptions = computed(() => teacherStore.records
  .filter(t => t.status === 'ACTIVE')
  .map(t => ({ label: `${t.user?.givenNames ?? ''} ${t.user?.familyName ?? ''}`.trim(), value: t.id })))

const byDate = computed(() => {
  const days = new Map<string, ExamSchedule[]>()
  for (const p of schedule.value) days.set(p.examDate, [...(days.get(p.examDate) ?? []), p])
  return [...days.entries()].map(([date, papers]) => ({ date, papers }))
})

function formatDay(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function printPage() {
  window.print()
}

function openForm(paper: ExamSchedule | null) {
  editing.value = paper
  formOpen.value = true
}

async function load() {
  if (!termId.value) {
    loading.value = false
    schedule.value = []
    return
  }
  loading.value = true
  error.value = null
  try {
    schedule.value = (await api.schedule({ termId: termId.value, classId: classId.value, mine: mine.value })) ?? []
  } catch (err: any) {
    error.value = err?.message || 'Something went wrong. Please try again later.'
  } finally {
    loading.value = false
  }
}

async function remove() {
  if (!deleting.value) return
  removing.value = true
  try {
    await api.deleteSchedule(deleting.value.id)
    toastSuccess('Paper removed')
    deleting.value = null
    await load()
  } catch (err: any) {
    toastError(err?.message || 'Could not remove the paper')
  } finally {
    removing.value = false
  }
}

watch([termId, classId, mine], load)

onMounted(async () => {
  useAppStore().setTitle('Exam Timetable')
  document.title = 'Exam Timetable | Skultem'
  classStore.fetchAll(1, 200)
  if (canManage.value) {
    subjectStore.fetchAll(1, 500)
    teacherStore.fetchAll(1, 500)
  }
  await termStore.fetchAll(1, 100)
  // Start on the term that's running now.
  termId.value = termStore.records.find(t => t.status === 'ACTIVE')?.id ?? termStore.records[0]?.id
  if (!termId.value) loading.value = false
})

definePageMeta({
  role: [Role.EXAM_OFFICER, Role.ADMIN, Role.PRINCIPAL, Role.OWNER, Role.PROPRIETOR, Role.SUPER_ADMIN, Role.TEACHER]
})
</script>
