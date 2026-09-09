<template>
  <div class="space-y-4">
    <Heading title="Report Cards" :subtitle="subtitle">
      <USelectMenu @change="change" :loading="loading" :items="children" value-key="value" v-model="state.student"
        placeholder="Select Student" />
    </Heading>

    <div v-if="cardsLoading" class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      <UCard v-for="i in 3" :key="i" variant="outline">
        <USkeleton class="h-4 w-2/3" />
        <USkeleton class="mt-5 h-20 w-full rounded-2xl" />
      </UCard>
    </div>

    <div v-else-if="records.length" class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      <UCard v-for="item in records" :key="item.id" variant="outline"
        class="overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg">

        <div class="flex items-start justify-between">
          <div>
            <h4 class="font-semibold">{{ item.termName }}</h4>
            <p class="text-xs text-muted">{{ item.academicYearName }} · {{ item.className }}</p>
          </div>

          <UBadge :label="item.passed ? 'Passed' : 'Attention'" :color="item.passed ? 'success' : 'warning'"
            variant="soft" />
        </div>

        <div class="mt-5 rounded-2xl border border-primary/10 bg-primary/5 p-5 text-center">
          <p class="text-xs uppercase tracking-wide text-muted">Average Score</p>
          <h2 class="mt-2 text-3xl font-bold text-primary">{{ item.average.toFixed(1) }}%</h2>
        </div>

        <div class="mt-5 grid grid-cols-2 gap-3">
          <div class="rounded-2xl border border-default p-4">
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-award" class="text-primary" />
              <span class="text-xs text-muted">Grade</span>
            </div>
            <p class="mt-2 font-semibold">{{ item.overallGrade || 'N/A' }}</p>
          </div>

          <div class="rounded-2xl border border-default p-4">
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-trophy" class="text-warning" />
              <span class="text-xs text-muted">Position</span>
            </div>
            <p class="mt-2 font-semibold">{{ item.position ? ordinal(item.position) : 'N/A' }}</p>
          </div>
        </div>

        <UButton block class="mt-6" icon="i-lucide-eye" variant="soft" :to="`/report-cards/${item.id}`">
          View Report Card
        </UButton>
      </UCard>
    </div>

    <UCard v-else>
      <div class="flex flex-col items-center justify-center py-16 text-center">
        <UIcon name="i-lucide-file-text" class="mb-3 size-12 text-muted" />
        <h3 class="text-base font-semibold">No Report Cards Yet</h3>
        <p class="mt-1 text-sm text-muted">
          {{ studentFirstName ? `${studentFirstName}'s` : "Your child's" }} report cards will appear here once the
          school generates them.
        </p>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const parentStore = useParentStore()
const reportCardStore = useReportCardStore()

const { students, loading } = storeToRefs(parentStore)
const { studentRecords: records, loadingStudent: cardsLoading } = storeToRefs(reportCardStore)

const selected = ref<Student | undefined>()

const state = reactive({
  student: ''
})

const children = computed(() =>
  students.value.map(e => ({
    label: `${e.givenNames} ${e.familyName} - ${e.className}`,
    value: e.id
  }))
)

const studentFirstName = computed(() => selected.value?.givenNames || '')

const subtitle = computed(() =>
  studentFirstName.value
    ? `Every report card generated for ${studentFirstName.value}, across terms`
    : "Every report card generated for your child, across terms"
)

function ordinal(n: number) {
  const s = ["th", "st", "nd", "rd"]
  const v = n % 100
  return `${n}${(s[(v - 20) % 10] || s[v] || s[0])}`
}

function change() {
  const select = students.value.find(e => e.id === state.student)
  selected.value = select
}

async function fetchRecord() {
  await parentStore.fetchAllStudents(0, 0)
}

watch(
  () => children.value,
  () => {
    state.student = children.value[0]?.value || ''
    change()
  },
  { immediate: true }
)

watch(
  () => state.student,
  (id) => {
    if (id) reportCardStore.fetchByStudent(id)
  },
  { immediate: true }
)

onMounted(async () => {
  await fetchRecord()
})
</script>
