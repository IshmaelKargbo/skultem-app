<template>
  <div class="space-y-6 mt-6 p-4">

    <!-- Header -->
    <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

      <div>
        <h1 class="text-2xl font-bold tracking-tight">
          Student Report Card
        </h1>

        <p class="mt-1 text-sm text-muted">
          Academic performance summary.
        </p>
      </div>

      <div class="flex flex-wrap gap-3">

        <UButton icon="i-lucide-arrow-left" variant="outline" color="neutral" to="/report-cards">
          Back
        </UButton>

        <UButton icon="i-lucide-printer" variant="outline" color="neutral" @click="printCard">
          Print
        </UButton>

        <UButton icon="i-lucide-download" color="primary" :loading="downloading" @click="downloadPdf">
          Download PDF
        </UButton>

      </div>

    </div>

    <!-- Student Info -->
    <UCard>
      <div class="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

        <div class="flex items-center gap-4">

          <UAvatar :alt="student.name" size="xl" class="rounded-2xl" />

          <div>
            <h2 class="text-lg font-semibold">
              {{ student.name }}
            </h2>

            <div class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
              <span class="flex items-center gap-1">
                <UIcon name="i-lucide-hash" class="size-3.5" />
                {{ student.admissionNo }}
              </span>

              <span class="text-gray-300">•</span>

              <span class="flex items-center gap-1">
                <UIcon name="i-lucide-school" class="size-3.5" />
                {{ student.className }}
              </span>
            </div>
          </div>

        </div>

        <div class="flex items-center gap-2 rounded-xl border border-default px-4 py-2.5">
          <UIcon name="i-lucide-trophy" class="size-5 text-warning" />
          <div>
            <p class="text-xs text-muted leading-none">Class Position</p>
            <p class="mt-0.5 font-semibold leading-none">{{ ordinal(student.position) }}</p>
          </div>
        </div>

      </div>
    </UCard>

    <!-- Summary -->
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

      <UCard :ui="{ body: 'p-5' }">
        <div class="flex items-center gap-4">
          <div class="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <UIcon name="i-lucide-percent" class="size-6 text-primary" />
          </div>
          <div>
            <p class="text-2xl font-bold leading-tight">{{ student.average }}%</p>
            <p class="text-sm text-muted">Average</p>
          </div>
        </div>
      </UCard>

      <UCard :ui="{ body: 'p-5' }">
        <div class="flex items-center gap-4">
          <div class="flex size-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
            <UIcon name="i-lucide-award" class="size-6 text-blue-500" />
          </div>
          <div>
            <p class="text-2xl font-bold leading-tight">{{ overallGrade }}</p>
            <p class="text-sm text-muted">Grade</p>
          </div>
        </div>
      </UCard>

      <UCard :ui="{ body: 'p-5' }">
        <div class="flex items-center gap-4">
          <div class="flex size-12 shrink-0 items-center justify-center rounded-xl bg-orange-500/10">
            <UIcon name="i-lucide-calendar-check" class="size-6 text-orange-500" />
          </div>
          <div>
            <p class="text-2xl font-bold leading-tight">{{ student.attendance }}%</p>
            <p class="text-sm text-muted">Attendance</p>
          </div>
        </div>
      </UCard>

      <UCard :ui="{ body: 'p-5' }">
        <div class="flex items-center gap-4">
          <div class="flex size-12 shrink-0 items-center justify-center rounded-xl bg-green-500/10">
            <UIcon name="i-lucide-check-circle" class="size-6 text-green-500" />
          </div>
          <div>
            <UBadge color="success" variant="subtle" size="lg">
              {{ student.status }}
            </UBadge>
            <p class="mt-1 text-sm text-muted">Status</p>
          </div>
        </div>
      </UCard>

    </div>

    <!-- Subject Scores -->
    <UCard :ui="{ body: 'p-0 sm:p-0' }">

      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-book-open" class="size-5 text-primary" />
          <h2 class="font-semibold">
            Subject Results
          </h2>
        </div>
      </template>

      <UTable :columns="columns" :data="subjects">

        <template #score-cell="{ row }">
          <div class="flex items-center gap-2.5">
            <UProgress :model-value="row.original.score" size="sm" class="w-20" />
            <span class="font-medium">{{ row.original.score }}</span>
          </div>
        </template>

        <template #grade-cell="{ row }">
          <UBadge :color="gradeColor(row.original.grade)" variant="subtle">
            {{ row.original.grade }}
          </UBadge>
        </template>

      </UTable>

      <template #footer>
        <div class="flex items-center justify-between text-sm">
          <span class="font-medium">Total / Average</span>
          <span class="font-semibold">{{ totalScore }} / {{ student.average }}%</span>
        </div>
      </template>

    </UCard>

    <!-- Remarks -->
    <UCard>

      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-message-square" class="size-5 text-primary" />
          <h2 class="font-semibold">
            Teacher's Remarks
          </h2>
        </div>
      </template>

      <div class="flex gap-3 rounded-xl bg-muted/40 p-4">
        <UIcon name="i-lucide-quote" class="size-5 shrink-0 text-muted" />
        <p class="text-sm text-muted">
          {{ student.remark }}
        </p>
      </div>

    </UCard>

    <!-- Signatures -->
    <div class="grid gap-4 sm:grid-cols-2">

      <UCard>
        <div class="flex flex-col items-center gap-3 py-6 text-center">
          <UIcon name="i-lucide-signature" class="size-5 text-muted" />
          <div class="w-40 border-t border-default" />
          <p class="text-sm font-medium">
            Class Teacher
          </p>
        </div>
      </UCard>

      <UCard>
        <div class="flex flex-col items-center gap-3 py-6 text-center">
          <UIcon name="i-lucide-signature" class="size-5 text-muted" />
          <div class="w-40 border-t border-default" />
          <p class="text-sm font-medium">
            Principal
          </p>
        </div>
      </UCard>

    </div>

  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { success } = useNotify()

const studentId = route.params.id
const downloading = ref(false)

const student = ref({
  id: studentId,
  name: 'John Kamara',
  admissionNo: 'KWIS001',
  className: 'JSS1',
  position: 1,
  average: 81,
  attendance: 96,
  status: 'Passed',
  remark: "Excellent performance. Keep up the good work."
})

const subjects = ref([
  {
    subject: 'English Language',
    score: 82,
    grade: 'A'
  },
  {
    subject: 'Mathematics',
    score: 90,
    grade: 'A'
  },
  {
    subject: 'Integrated Science',
    score: 78,
    grade: 'B'
  },
  {
    subject: 'Social Studies',
    score: 84,
    grade: 'A'
  },
  {
    subject: 'ICT',
    score: 88,
    grade: 'A'
  }
])

const columns = [
  {
    accessorKey: 'subject',
    header: 'Subject'
  },
  {
    accessorKey: 'score',
    header: 'Score'
  },
  {
    accessorKey: 'grade',
    header: 'Grade'
  }
]

const totalScore = computed(() =>
  subjects.value.reduce((sum, s) => sum + s.score, 0)
)

const overallGrade = computed(() => {
  const avg = student.value.average

  if (avg >= 90) return 'A+'
  if (avg >= 80) return 'A'
  if (avg >= 70) return 'B'
  if (avg >= 60) return 'C'
  return 'D'
})

function gradeColor(grade: string) {
  if (grade.startsWith('A')) return 'success'
  if (grade.startsWith('B')) return 'primary'
  if (grade.startsWith('C')) return 'warning'
  return 'error'
}

function ordinal(n: number) {
  const suffixes = ['th', 'st', 'nd', 'rd']
  const v = n % 100

  return n + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0])
}

function printCard() {
  window.print()
}

async function downloadPdf() {
  try {
    downloading.value = true

    // TODO: Replace with actual PDF generation/export request
    await new Promise(resolve => setTimeout(resolve, 600))

    success('Report card downloaded')
  } finally {
    downloading.value = false
  }
}

definePageMeta({
  role: [
    Role.ADMIN,
    Role.PROPRIETOR,
    Role.OWNER
  ]
})
</script>