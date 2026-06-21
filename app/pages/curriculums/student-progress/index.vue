<template>
  <div class="space-y-6 mt-6">

    <!-- Header -->
    <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

      <div>
        <h1 class="text-2xl font-bold">
          Subject Progress
        </h1>

        <p class="text-sm text-muted mt-1">
          Monitor curriculum coverage by subject.
        </p>
      </div>

      <div class="flex gap-3">
        <UButton
          icon="i-lucide-file-down"
          variant="outline"
          color="neutral"
          label="Export Report"
        />

        <UButton
          icon="i-lucide-refresh-cw"
          label="Refresh"
        />
      </div>

    </div>


    <!-- Statistics -->
    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

      <UCard>
        <div class="flex items-center justify-between">

          <div>
            <p class="text-sm text-muted">
              Subjects
            </p>

            <p class="text-3xl font-bold">
              {{ totalSubjects }}
            </p>
          </div>

          <div class="rounded-xl bg-primary/10 p-3">
            <UIcon
              name="i-lucide-book-open"
              class="text-primary text-xl"
            />
          </div>

        </div>
      </UCard>


      <UCard>
        <div class="flex items-center justify-between">

          <div>
            <p class="text-sm text-muted">
              Completed
            </p>

            <p class="text-3xl font-bold text-green-600">
              {{ completedSubjects }}
            </p>
          </div>

          <div class="rounded-xl bg-green-500/10 p-3">
            <UIcon
              name="i-lucide-check-circle"
              class="text-green-500 text-xl"
            />
          </div>

        </div>
      </UCard>


      <UCard>
        <div class="flex items-center justify-between">

          <div>
            <p class="text-sm text-muted">
              Behind Schedule
            </p>

            <p class="text-3xl font-bold text-orange-500">
              {{ behindSubjects }}
            </p>
          </div>

          <div class="rounded-xl bg-orange-500/10 p-3">
            <UIcon
              name="i-lucide-triangle-alert"
              class="text-orange-500 text-xl"
            />
          </div>

        </div>
      </UCard>


      <UCard>
        <div class="flex items-center justify-between">

          <div>
            <p class="text-sm text-muted">
              Average Coverage
            </p>

            <p class="text-3xl font-bold text-primary">
              {{ averageCoverage }}%
            </p>
          </div>

          <div class="rounded-xl bg-primary/10 p-3">
            <UIcon
              name="i-lucide-chart-column"
              class="text-primary text-xl"
            />
          </div>

        </div>
      </UCard>

    </div>


    <!-- Search -->
    <UCard>

      <div class="grid gap-4 md:grid-cols-2">

        <UInput
          v-model="search"
          icon="i-lucide-search"
          placeholder="Search subject..."
        />

        <USelectMenu
          v-model="status"
          :items="statuses"
          value-key="value"
          placeholder="Filter status"
        />

      </div>

    </UCard>

<!-- Subject Cards -->
<div class="space-y-5">
  <UCard
    v-for="subject in filteredSubjects"
    :key="subject.id"
    class="overflow-hidden"
  >
    <!-- Header -->
    <div class="flex items-start justify-between">

      <div class="flex gap-4">

        <div
          class="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10"
        >
          <UIcon
            name="i-lucide-book-open"
            class="text-2xl text-primary"
          />
        </div>

        <div>

          <div class="flex flex-wrap items-center gap-2">

            <h3 class="text-lg font-bold">
              {{ subject.subject }}
            </h3>

            <UBadge
              :color="getStatusColor(subject.status)"
              :label="getStatusLabel(subject.status)"
            />

          </div>

          <p class="mt-1 text-sm text-muted">
            {{ subject.teacher }}
            •
            {{ subject.class }}
          </p>

        </div>

      </div>

      <div class="text-right">

        <p class="text-4xl font-bold text-primary">
          {{ subject.percentage }}%
        </p>

        <p class="text-xs text-muted">
          Coverage
        </p>

      </div>

    </div>


    <!-- Progress -->
    <div class="mt-6">

      <div class="mb-2 flex items-center justify-between">

        <span class="text-sm text-muted">
          Curriculum Progress
        </span>

        <span class="font-medium">
          {{ subject.completedWeeks }}/{{ subject.totalWeeks }}
          weeks
        </span>

      </div>

      <UProgress
        :model-value="subject.percentage"
        size="lg"
      />

    </div>


    <!-- Statistics -->
    <div class="mt-6 grid gap-3 md:grid-cols-3">

      <div class="rounded-2xl bg-primary/5 p-4">

        <div class="flex items-center gap-2">

          <UIcon
            name="i-lucide-calendar-days"
            class="text-primary"
          />

          <span class="text-sm text-muted">
            Completed
          </span>

        </div>

        <p class="mt-2 text-2xl font-bold">
          {{ subject.completedWeeks }}
        </p>

      </div>


      <div class="rounded-2xl bg-green-500/10 p-4">

        <div class="flex items-center gap-2">

          <UIcon
            name="i-lucide-book-check"
            class="text-green-600"
          />

          <span class="text-sm text-muted">
            Total Weeks
          </span>

        </div>

        <p class="mt-2 text-2xl font-bold">
          {{ subject.totalWeeks }}
        </p>

      </div>


      <div class="rounded-2xl bg-orange-500/10 p-4">

        <div class="flex items-center gap-2">

          <UIcon
            name="i-lucide-clock"
            class="text-orange-500"
          />

          <span class="text-sm text-muted">
            Remaining
          </span>

        </div>

        <p class="mt-2 text-2xl font-bold">
          {{ subject.totalWeeks - subject.completedWeeks }}
        </p>

      </div>

    </div>


    <!-- Footer -->
    <div class="mt-6 flex flex-wrap gap-3 border-t border-default pt-5">

      <UButton
        icon="i-lucide-eye"
        :to="`/curriculums/student-progress/${subject.id}`"
      >
        View Progress
      </UButton>

      <UButton
        variant="outline"
        icon="i-lucide-book-open-check"
      >
        Lesson Plans
      </UButton>

      <UButton
        variant="outline"
        icon="i-lucide-pencil"
      >
        Edit Scheme
      </UButton>

    </div>

  </UCard>
</div>
  </div>
</template>
<script setup lang="ts">
const search = ref('')
const status = ref('')

const statuses = [
  {
    label: 'Completed',
    value: 'COMPLETED'
  },
  {
    label: 'On Track',
    value: 'ON_TRACK'
  },
  {
    label: 'Behind Schedule',
    value: 'BEHIND'
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
    completedWeeks: 12,
    totalWeeks: 12,
    percentage: 100,
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

const filteredSubjects = computed(() => {
  return subjectProgress.value.filter(subject => {
    const matchesSearch =
      subject.subject
        .toLowerCase()
        .includes(search.value.toLowerCase())

    const matchesStatus =
      !status.value ||
      subject.status === status.value

    return matchesSearch && matchesStatus
  })
})

const totalSubjects = computed(() =>
  subjectProgress.value.length
)

const completedSubjects = computed(() =>
  subjectProgress.value.filter(
    x => x.status === 'COMPLETED'
  ).length
)

const behindSubjects = computed(() =>
  subjectProgress.value.filter(
    x => x.status === 'BEHIND'
  ).length
)

const averageCoverage = computed(() => {
  const total = subjectProgress.value.reduce(
    (sum, x) => sum + x.percentage,
    0
  )

  return Math.round(
    total / subjectProgress.value.length
  )
})

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
</script>