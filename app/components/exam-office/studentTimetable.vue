<!-- A parent's view: their child's papers on every published exam timetable this year. -->
<template>
  <div class="space-y-3 px-4 md:px-6">
    <div class="print:hidden">
      <Heading title="Exam Timetable" subtitle="When and where your child sits each paper.">
        <div class="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <USelectMenu v-model="studentId" :items="childOptions" value-key="value" label-key="label"
            placeholder="Choose a child" class="w-full sm:w-72" :loading="parentStore.loading" />
          <UButton v-if="current" icon="i-lucide-printer" variant="soft" color="neutral" label="Print" @click="print" />
        </div>
      </Heading>
    </div>

    <div v-if="loading" class="space-y-3">
      <UCard v-for="i in 2" :key="i" :ui="{ body: 'p-0 sm:p-0' }">
        <template #header><USkeleton class="h-5 w-48" /></template>
        <div class="divide-y divide-default">
          <div v-for="j in 3" :key="j" class="flex gap-3 px-4 py-3">
            <USkeleton class="h-4 w-24" />
            <USkeleton class="h-4 w-44" />
          </div>
        </div>
      </UCard>
    </div>

    <UCard v-else-if="error">
      <div class="flex flex-col items-center gap-3 py-12 text-center">
        <UIcon name="i-lucide-alert-triangle" class="size-8 text-error" />
        <h3 class="font-semibold text-highlighted">Couldn't load the exam timetable</h3>
        <p class="max-w-sm text-sm text-muted">{{ error }}</p>
        <UButton label="Try again" :icon="REFRESH_ICON" variant="soft" @click="load" />
      </div>
    </UCard>

    <UCard v-else-if="!timetables.length">
      <div class="flex flex-col items-center gap-3 py-14 text-center">
        <div class="flex size-14 items-center justify-center rounded-2xl bg-primary/10">
          <UIcon name="i-lucide-calendar-clock" class="size-7 text-primary" />
        </div>
        <h3 class="font-semibold text-highlighted">{{ studentId ? 'No exam timetable yet' : 'Choose a child' }}</h3>
        <p v-if="studentId" class="max-w-sm text-sm text-muted">
          You'll get a notification when the school publishes one for {{ childName }}'s class.
        </p>
      </div>
    </UCard>

    <template v-else>
      <div v-if="timetables.length > 1" class="flex gap-1.5 overflow-x-auto print:hidden">
        <UButton v-for="t in timetables" :key="t.id" size="sm" class="shrink-0" :label="t.title"
          :color="t.id === current?.id ? 'primary' : 'neutral'" :variant="t.id === current?.id ? 'solid' : 'soft'"
          @click="() => { currentId = t.id }" />
      </div>

      <template v-if="current">
        <UCard class="print:hidden">
          <h2 class="text-lg font-semibold text-highlighted">{{ current.title }}</h2>
          <p class="text-sm text-muted">
            {{ childName }} · {{ current.classes[0]?.name }} · {{ current.termName }}
            <template v-if="current.startDate && current.endDate">
              · {{ formatDate(current.startDate) }} – {{ formatDate(current.endDate) }}
            </template>
          </p>
          <div v-if="current.instructions" class="mt-3 rounded-lg bg-elevated/50 p-3">
            <p class="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">Instructions to candidates</p>
            <ul class="ml-4 list-disc space-y-0.5 text-sm">
              <li v-for="(line, i) in lines(current.instructions)" :key="i">{{ line }}</li>
            </ul>
          </div>
        </UCard>

        <ExamOfficePapersByDay class="print:hidden" :papers="current.papers" :show-classes="false"
          :show-invigilators="false" />
        <ExamOfficeClassSheets :timetable="current" />
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
const api = ExamOfficeApi()
const parentStore = useParentStore()

const studentId = ref<string | undefined>()
const timetables = ref<ExamTimetable[]>([])
const currentId = ref<string | undefined>()
const loading = ref(false)
const error = ref<string | null>(null)

const childOptions = computed(() => parentStore.students.map((s: any) => ({
  label: `${s.givenNames} ${s.familyName}${s.className ? ` (${s.className})` : ''}`,
  value: s.id as string,
})))
const childName = computed(() => {
  const s: any = parentStore.students.find((c: any) => c.id === studentId.value)
  return s ? s.givenNames : 'your child'
})
const current = computed(() => timetables.value.find(t => t.id === currentId.value) ?? timetables.value[0] ?? null)

function lines(text: string) {
  return text.split('\n').map(l => l.trim()).filter(Boolean)
}

function print() {
  window.print()
}

async function load() {
  if (!studentId.value) {
    timetables.value = []
    return
  }
  loading.value = true
  error.value = null
  try {
    timetables.value = (await api.studentTimetables(studentId.value)) ?? []
    // Start on the most recent one.
    currentId.value = timetables.value[timetables.value.length - 1]?.id
  } catch (err: any) {
    error.value = err?.message || 'Something went wrong. Please try again later.'
  } finally {
    loading.value = false
  }
}

watch(studentId, load)

onMounted(async () => {
  useAppStore().setTitle('Exam Timetable')
  document.title = 'Exam Timetable | Skultem'
  if (!parentStore.students.length) await parentStore.fetchAllStudents(1, 50)
  studentId.value = childOptions.value[0]?.value
})
</script>
