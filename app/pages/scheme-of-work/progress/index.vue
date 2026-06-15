<template>
  <div class="space-y-6 mt-6">

    <!-- Header -->
    <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

      <div>
        <h1 class="text-2xl font-bold">
          Curriculum Progress
        </h1>

        <p class="mt-1 text-sm text-muted">
          Monitor curriculum coverage across subjects and classes.
        </p>
      </div>

      <div class="flex gap-3">
        <UButton icon="i-lucide-file-down" variant="outline" color="neutral" label="Export Report" />

        <UButton icon="i-lucide-refresh-cw" label="Refresh" />
      </div>

    </div>

    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

      <!-- Scheme Coverage -->
      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted">Coverage</p>
            <p class="text-3xl font-bold text-primary">67%</p>
          </div>

          <div class="rounded-xl bg-primary/10 p-3">
            <UIcon name="i-lucide-chart-column" class="text-primary text-xl" />
          </div>
        </div>
      </UCard>

      <!-- Subjects -->
      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted">
              Subjects
            </p>

            <p class="text-3xl font-bold">
              12
            </p>
          </div>

          <div class="rounded-xl bg-blue-500/10 p-3">
            <UIcon name="i-lucide-book-open" class="text-blue-500 text-xl" />
          </div>
        </div>
      </UCard>

      <!-- Teachers -->
      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted">
              Teachers
            </p>

            <p class="text-3xl font-bold">
              25
            </p>
          </div>

          <div class="rounded-xl bg-purple-500/10 p-3">
            <UIcon name="i-lucide-users" class="text-purple-500 text-xl" />
          </div>
        </div>
      </UCard>

      <!-- Classes -->
      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted">
              Classes
            </p>

            <p class="text-3xl font-bold">
              18
            </p>
          </div>

          <div class="rounded-xl bg-orange-500/10 p-3">
            <UIcon name="i-lucide-school" class="text-orange-500 text-xl" />
          </div>
        </div>
      </UCard>

      <!-- Overdue Weeks -->
      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted">
              Overdue
            </p>

            <p class="text-3xl font-bold text-red-500">
              4
            </p>
          </div>

          <div class="rounded-xl bg-red-500/10 p-3">
            <UIcon name="i-lucide-triangle-alert" class="text-red-500 text-xl" />
          </div>
        </div>
      </UCard>

      <!-- Reports -->
      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted">
              Reports
            </p>

            <p class="text-3xl font-bold">
              32
            </p>
          </div>

          <div class="rounded-xl bg-green-500/10 p-3">
            <UIcon name="i-lucide-file-text" class="text-green-500 text-xl" />
          </div>
        </div>
      </UCard>

    </div>

    <!-- teacher -->
    <UCard>

      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-users" class="text-primary" />

          <span class="font-semibold">
            Teacher Progress
          </span>
        </div>
      </template>

      <div class="space-y-5">

        <div v-for="teacher in teacherProgress" :key="teacher.teacher" class="rounded-xl border border-default p-4">
          <div class="flex items-center justify-between">

            <div>
              <p class="font-medium">
                {{ teacher.teacher }}
              </p>

              <p class="text-sm text-muted">
                {{ teacher.subjects }} subjects
              </p>
            </div>

            <div class="text-right">
              <p class="font-semibold">
                {{ teacher.percentage }}%
              </p>

              <p class="text-sm text-muted">
                {{ teacher.completed }} weeks completed
              </p>
            </div>

          </div>

          <UProgress class="mt-4" :model-value="teacher.percentage" />
        </div>

      </div>

    </UCard>

    <div class="grid gap-4 md:grid-cols-2">
      <!-- Subject Progress -->
      <UCard>

        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-book-open" class="text-primary" />

            <span class="font-semibold">
              Subject Progress
            </span>
          </div>
        </template>

        <div class="space-y-6">

          <div v-for="subject in subjects" :key="subject.id" class="space-y-2">

            <div class="flex justify-between">

              <div>

                <p class="font-medium">
                  {{ subject.name }}
                </p>

                <p class="text-sm text-muted">
                  {{ subject.class }}
                </p>

              </div>

              <div class="font-semibold">
                {{ subject.progress }}%
              </div>

            </div>

            <UProgress :model-value="subject.progress" />

          </div>

        </div>

      </UCard>

      <!-- Term Comparison -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">

            <UIcon name="i-lucide-bar-chart-3" class="text-primary" />

            <span class="font-semibold">
              Term Comparison
            </span>

          </div>
        </template>

        <div class="space-y-4">

          <div v-for="term in termComparison" :key="term.term">
            <div class="flex justify-between mb-2">

              <span>
                {{ term.term }}
              </span>

              <span class="font-semibold">
                {{ term.coverage }}%
              </span>

            </div>

            <UProgress :model-value="term.coverage" />
          </div>

        </div>

      </UCard>
    </div>

    <!-- Class Progress -->
    <UCard>

      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-school" class="text-primary" />

          <span class="font-semibold">
            Class Progress
          </span>
        </div>
      </template>

      <div class="space-y-5">

        <div v-for="item in classProgress" :key="item.class">
          <div class="flex justify-between mb-2">

            <span class="font-medium">
              {{ item.class }}
            </span>

            <span class="font-semibold">
              {{ item.coverage }}%
            </span>

          </div>

          <UProgress :model-value="item.coverage" />
        </div>

      </div>

    </UCard>


    <!-- Overdue Weeks -->
    <UCard>

      <template #header>

        <div class="flex items-center gap-2">

          <UIcon name="i-lucide-triangle-alert" class="text-red-500" />

          <span class="font-semibold">
            Overdue Weeks
          </span>

        </div>

      </template>

      <div class="space-y-4">

        <div v-for="week in overdueWeeks" :key="week.id" class="rounded-xl border border-red-200 bg-red-50 p-4">
          <div class="flex justify-between">

            <div>

              <p class="font-medium">
                {{ week.subject }}
              </p>

              <p class="text-sm text-muted">
                Week {{ week.week }}
              </p>

            </div>

            <UBadge color="error" label="Overdue" />

          </div>
        </div>

      </div>

    </UCard>

    <!-- Weekly Progress -->
    <UCard>

      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-list-checks" class="text-primary" />

          <span class="font-semibold">
            Weekly Coverage
          </span>
        </div>
      </template>

      <div class="space-y-4">

        <div v-for="week in weeks" :key="week.id"
          class="flex items-center justify-between rounded-xl border border-gray-200 dark:border-gray-800 p-4">

          <div>

            <p class="font-medium">
              Week {{ week.week }}
            </p>

            <p class="text-sm text-muted">
              {{ week.topic }}
            </p>

          </div>

          <UBadge :color="week.status === 'COMPLETED'
            ? 'success'
            : week.status === 'IN_PROGRESS'
              ? 'warning'
              : 'neutral'
            " :label="week.statusLabel" />

        </div>

      </div>

    </UCard>

  </div>
</template>

<script setup lang="ts">
const selectedTerm = ref('TERM_1')
const subjects = ref([
  {
    id: 1,
    name: 'Mathematics',
    class: 'JSS 1',
    progress: 80
  },

  {
    id: 2,
    name: 'English Language',
    class: 'JSS 1',
    progress: 65
  },

  {
    id: 3,
    name: 'Integrated Science',
    class: 'JSS 2',
    progress: 50
  }
])

const weeks = ref([
  {
    id: 1,
    week: 1,
    topic: 'Whole Numbers',
    status: 'COMPLETED',
    statusLabel: 'Completed'
  },

  {
    id: 2,
    week: 2,
    topic: 'Factors and Multiples',
    status: 'COMPLETED',
    statusLabel: 'Completed'
  },

  {
    id: 3,
    week: 3,
    topic: 'Fractions',
    status: 'IN_PROGRESS',
    statusLabel: 'In Progress'
  },

  {
    id: 4,
    week: 4,
    topic: 'Decimals',
    status: 'PENDING',
    statusLabel: 'Pending'
  }
])

const terms = [
  {
    label: 'Term 1',
    value: 'TERM_1'
  },
  {
    label: 'Term 2',
    value: 'TERM_2'
  },
  {
    label: 'Term 3',
    value: 'TERM_3'
  }
]

const subjectProgress = ref([
  {
    id: 1,
    subject: 'Mathematics',
    teacher: 'Mr. Kargbo',
    class: 'JSS 1',
    completedWeeks: 9,
    totalWeeks: 12,
    percentage: 75,
    status: 'ON_TRACK'
  },
  {
    id: 2,
    subject: 'English Language',
    teacher: 'Mrs. Johnson',
    class: 'JSS 2',
    completedWeeks: 11,
    totalWeeks: 12,
    percentage: 92,
    status: 'COMPLETED'
  },
  {
    id: 3,
    subject: 'Integrated Science',
    teacher: 'Mr. Bangura',
    class: 'JSS 1',
    completedWeeks: 5,
    totalWeeks: 12,
    percentage: 42,
    status: 'BEHIND'
  }
])

const teacherProgress = ref([
  {
    teacher: 'Mr. Kargbo',
    subjects: 3,
    completed: 24,
    percentage: 80
  },
  {
    teacher: 'Mrs. Johnson',
    subjects: 2,
    completed: 21,
    percentage: 92
  },
  {
    teacher: 'Mr. Bangura',
    subjects: 2,
    completed: 12,
    percentage: 50
  }
])

const classProgress = ref([
  {
    class: 'JSS 1',
    coverage: 68
  },
  {
    class: 'JSS 2',
    coverage: 87
  },
  {
    class: 'JSS 3',
    coverage: 74
  }
])

const overdueWeeks = ref([
  {
    week: 8,
    subject: 'Integrated Science',
    class: 'JSS 1',
    teacher: 'Mr. Bangura'
  },
  {
    week: 10,
    subject: 'Mathematics',
    class: 'JSS 2',
    teacher: 'Mr. Kamara'
  }
])

const termComparison = ref([
  {
    term: 'Term 1',
    coverage: 91
  },
  {
    term: 'Term 2',
    coverage: 84
  },
  {
    term: 'Term 3',
    coverage: 76
  }
])

const totalSubjects = computed(() =>
  subjectProgress.value.length
)

const completedSubjects = computed(() =>
  subjectProgress.value.filter(
    x => x.status === 'COMPLETED'
  ).length
)

const averageCoverage = computed(() => {
  const total =
    subjectProgress.value.reduce(
      (sum, item) => sum + item.percentage,
      0
    )

  return Math.round(
    total / subjectProgress.value.length
  )
})

const behindSubjects = computed(() =>
  subjectProgress.value.filter(
    x => x.status === 'BEHIND'
  ).length
)

function getStatusColor(status: string) {
  switch (status) {
    case 'COMPLETED':
      return 'success'

    case 'ON_TRACK':
      return 'primary'

    case 'BEHIND':
      return 'warning'

    default:
      return 'neutral'
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'COMPLETED':
      return 'Completed'

    case 'ON_TRACK':
      return 'On Track'

    case 'BEHIND':
      return 'Behind Schedule'

    default:
      return status
  }
}

onMounted(() => {
  useAppStore().setTitle(
    'Curriculum Progress'
  )

  document.title =
    'Curriculum Progress | Skultem'
})

definePageMeta({
  role: [
    Role.ADMIN,
    Role.PROPRIETOR,
    Role.OWNER,
    Role.TEACHER
  ]
})
</script>