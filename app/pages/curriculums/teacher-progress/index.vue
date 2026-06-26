```vue
<template>
  <div class="space-y-6 mt-6 p-4">

    <!-- Header -->
    <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

      <div>
        <h1 class="text-2xl font-bold">
          Teacher Progress
        </h1>

        <p class="text-sm text-muted mt-1">
          Monitor curriculum coverage and performance by teacher.
        </p>
      </div>

      <div class="flex gap-3">
        <UButton icon="i-lucide-file-down" variant="outline" color="neutral" label="Export Report" />

        <UButton icon="i-lucide-refresh-cw" label="Refresh" />
      </div>

    </div>

    <!-- Statistics -->
    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted">
              Teachers
            </p>

            <p class="text-3xl font-bold">
              {{ totalTeachers }}
            </p>
          </div>

          <div class="rounded-xl bg-primary/10 p-3">
            <UIcon name="i-lucide-users" class="text-primary text-xl" />
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
              {{ completedTeachers }}
            </p>
          </div>

          <div class="rounded-xl bg-green-500/10 p-3">
            <UIcon name="i-lucide-check-circle" class="text-green-500 text-xl" />
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
              {{ behindTeachers }}
            </p>
          </div>

          <div class="rounded-xl bg-orange-500/10 p-3">
            <UIcon name="i-lucide-triangle-alert" class="text-orange-500 text-xl" />
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
            <UIcon name="i-lucide-chart-column" class="text-primary text-xl" />
          </div>
        </div>
      </UCard>

    </div>

    <!-- Search -->
    <UCard>

      <div class="grid gap-4 md:grid-cols-2">

        <UInput v-model="search" icon="i-lucide-search" placeholder="Search teacher..." />

        <USelectMenu v-model="status" :items="statuses" value-key="value" placeholder="Filter status" />

      </div>

    </UCard>

<div class="space-y-5">

  <UCard
    v-for="teacher in filteredTeachers"
    :key="teacher.id"
    class="overflow-hidden"
  >
    <div class="space-y-6">

      <!-- Top -->
      <div class="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        <div class="flex items-center gap-4">

          <UAvatar
            :alt="teacher.name"
            size="3xl"
          />

          <div>

            <div class="flex flex-wrap items-center gap-2">

              <h3 class="text-xl font-bold">
                {{ teacher.name }}
              </h3>

              <UBadge
                :label="getStatusLabel(teacher.status)"
                :color="getStatusColor(teacher.status)"
              />

            </div>

            <p class="mt-1 text-sm text-muted">
              {{ teacher.completedWeeks }} of {{ teacher.totalWeeks }} weeks completed
            </p>

          </div>

        </div>


        <!-- Coverage -->
        <div class="text-left lg:text-right">

          <p class="text-sm text-muted">
            Curriculum Coverage
          </p>

          <h2 class="text-4xl font-bold text-primary">
            {{ teacher.percentage }}%
          </h2>

        </div>

      </div>


      <!-- Progress -->
      <div>

        <div class="mb-2 flex justify-between">

          <span class="text-sm text-muted">
            Progress
          </span>

          <span class="font-medium">
            {{ teacher.percentage }}%
          </span>

        </div>

        <UProgress
          :model-value="teacher.percentage"
          size="lg"
        />

      </div>


      <!-- Statistics -->
      <div class="grid gap-4 md:grid-cols-3">

        <div
          class="rounded-2xl border border-default p-4"
        >
          <div class="flex items-center gap-2">

            <UIcon
              name="i-lucide-book-open"
              class="text-primary"
            />

            <span class="text-sm text-muted">
              Subjects
            </span>

          </div>

          <p class="mt-2 text-2xl font-bold">
            {{ teacher.subjects }}
          </p>
        </div>


        <div
          class="rounded-2xl border border-default p-4"
        >
          <div class="flex items-center gap-2">

            <UIcon
              name="i-lucide-school"
              class="text-green-600"
            />

            <span class="text-sm text-muted">
              Classes
            </span>

          </div>

          <p class="mt-2 text-2xl font-bold">
            {{ teacher.classes }}
          </p>
        </div>


        <div
          class="rounded-2xl border border-default p-4"
        >
          <div class="flex items-center gap-2">

            <UIcon
              name="i-lucide-calendar-days"
              class="text-orange-500"
            />

            <span class="text-sm text-muted">
              Weeks
            </span>

          </div>

          <p class="mt-2 text-2xl font-bold">
            {{ teacher.completedWeeks }}/{{ teacher.totalWeeks }}
          </p>
        </div>

      </div>


      <!-- Actions -->
      <div class="flex flex-col gap-3 sm:flex-row">

        <UButton
          icon="i-lucide-eye"
          :to="`/curriculums/teacher-progress/${teacher.id}`"
        >
          View Progress
        </UButton>

        <UButton
          variant="outline"
          icon="i-lucide-pencil"
        >
          Edit
        </UButton>

      </div>

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

const teacherProgress = ref([
  {
    id: 1,
    name: 'Mr. Kargbo',
    subjects: 3,
    classes: 2,
    completedWeeks: 24,
    totalWeeks: 30,
    percentage: 80,
    status: 'ON_TRACK'
  },
  {
    id: 2,
    name: 'Mrs. Johnson',
    subjects: 2,
    classes: 3,
    completedWeeks: 30,
    totalWeeks: 30,
    percentage: 100,
    status: 'COMPLETED'
  },
  {
    id: 3,
    name: 'Mr. Bangura',
    subjects: 2,
    classes: 1,
    completedWeeks: 15,
    totalWeeks: 30,
    percentage: 50,
    status: 'BEHIND'
  }
])

const filteredTeachers = computed(() => {
  return teacherProgress.value.filter((teacher) => {
    const matchesSearch =
      teacher.name
        .toLowerCase()
        .includes(search.value.toLowerCase())

    const matchesStatus =
      !status.value ||
      teacher.status === status.value

    return matchesSearch && matchesStatus
  })
})

const totalTeachers = computed(
  () => teacherProgress.value.length
)

const completedTeachers = computed(
  () =>
    teacherProgress.value.filter(
      x => x.status === 'COMPLETED'
    ).length
)

const behindTeachers = computed(
  () =>
    teacherProgress.value.filter(
      x => x.status === 'BEHIND'
    ).length
)

const averageCoverage = computed(() => {
  const total = teacherProgress.value.reduce(
    (sum, item) => sum + item.percentage,
    0
  )

  return Math.round(
    total / teacherProgress.value.length
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

onMounted(() => {
  useAppStore().setTitle(
    'Teacher Progress'
  )

  document.title =
    'Teacher Progress | Skultem'
})

definePageMeta({
  role: [
    Role.ADMIN,
    Role.PROPRIETOR,
    Role.OWNER
  ]
})
</script>
```
