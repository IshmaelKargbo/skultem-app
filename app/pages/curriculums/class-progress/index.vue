<template>
  <div class="space-y-6 mt-6">

    <!-- Header -->
    <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

      <div>
        <h1 class="text-2xl font-bold">
          Class Progress
        </h1>

        <p class="mt-1 text-sm text-muted">
          Monitor curriculum coverage across all classes.
        </p>
      </div>

      <div class="flex gap-3">

        <UButton
          icon="i-lucide-file-down"
          variant="outline"
        >
          Export Report
        </UButton>

        <UButton
          icon="i-lucide-refresh-cw"
        >
          Refresh
        </UButton>

      </div>

    </div>


    <!-- Statistics -->
    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

      <UCard>
        <div class="flex items-center justify-between">

          <div>
            <p class="text-sm text-muted">
              Classes
            </p>

            <p class="text-3xl font-bold">
              {{ totalClasses }}
            </p>
          </div>

          <div class="rounded-2xl bg-primary/10 p-3">
            <UIcon
              name="i-lucide-school"
              class="text-xl text-primary"
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
              {{ completedClasses }}
            </p>
          </div>

          <div class="rounded-2xl bg-green-500/10 p-3">
            <UIcon
              name="i-lucide-check-circle"
              class="text-xl text-green-600"
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
              {{ behindClasses }}
            </p>
          </div>

          <div class="rounded-2xl bg-orange-500/10 p-3">
            <UIcon
              name="i-lucide-triangle-alert"
              class="text-xl text-orange-500"
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

          <div class="rounded-2xl bg-primary/10 p-3">
            <UIcon
              name="i-lucide-chart-column"
              class="text-xl text-primary"
            />
          </div>

        </div>
      </UCard>

    </div>


    <!-- Filters -->
    <UCard>

      <div class="grid gap-4 md:grid-cols-2">

        <UInput
          v-model="search"
          icon="i-lucide-search"
          placeholder="Search class..."
        />

        <USelectMenu
          v-model="status"
          :items="statuses"
          value-key="value"
          placeholder="Filter status"
        />

      </div>

    </UCard>


    <!-- Class Cards -->
    <div class="space-y-5">

      <UCard
        v-for="item in filteredClasses"
        :key="item.id"
        class="overflow-hidden"
      >

        <div class="space-y-6">

          <!-- Top -->
          <div class="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

            <div class="flex gap-4">

              <div
                class="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10"
              >
                <UIcon
                  name="i-lucide-school"
                  class="text-2xl text-primary"
                />
              </div>

              <div>

                <div class="flex flex-wrap items-center gap-3">

                  <h3 class="text-xl font-semibold">
                    {{ item.class }}
                  </h3>

                  <UBadge
                    :color="getStatusColor(item.status)"
                    :label="getStatusLabel(item.status)"
                  />

                </div>

                <p class="mt-1 text-sm text-muted">
                  Class Teacher: {{ item.teacher }}
                </p>

              </div>

            </div>


            <div class="text-center">

              <p class="text-4xl font-bold text-primary">
                {{ item.coverage }}%
              </p>

              <p class="text-sm text-muted">
                Coverage
              </p>

            </div>

          </div>


          <!-- Progress -->
          <div>

            <div class="mb-2 flex justify-between">

              <span class="text-sm text-muted">
                Curriculum Progress
              </span>

              <span class="font-medium">
                {{ item.completedWeeks }}/{{ item.totalWeeks }}
                Weeks
              </span>

            </div>

            <UProgress
              :model-value="item.coverage"
              size="lg"
            />

          </div>


          <!-- Statistics -->
          <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <div class="rounded-2xl bg-primary/5 p-4">
              <p class="text-xs text-muted">
                Subjects
              </p>

              <p class="mt-2 text-2xl font-bold">
                {{ item.subjects }}
              </p>
            </div>


            <div class="rounded-2xl bg-green-500/10 p-4">
              <p class="text-xs text-muted">
                Teachers
              </p>

              <p class="mt-2 text-2xl font-bold">
                {{ item.teachers }}
              </p>
            </div>


            <div class="rounded-2xl bg-orange-500/10 p-4">
              <p class="text-xs text-muted">
                Students
              </p>

              <p class="mt-2 text-2xl font-bold">
                {{ item.students }}
              </p>
            </div>


            <div class="rounded-2xl bg-purple-500/10 p-4">
              <p class="text-xs text-muted">
                Lesson Plans
              </p>

              <p class="mt-2 text-2xl font-bold">
                {{ item.lessonPlans }}
              </p>
            </div>

          </div>


          <!-- Footer -->
          <div class="flex flex-wrap gap-3 border-t border-default pt-5">

            <UButton
              icon="i-lucide-eye"
              :to="`/curriculums/class-progress/${item.id}`"
            >
              View Progress
            </UButton>

            <UButton
              variant="outline"
              icon="i-lucide-book-open"
            >
              Subjects
            </UButton>

            <UButton
              variant="outline"
              icon="i-lucide-users"
            >
              Students
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

const classProgress = ref([
  {
    id: 1,
    class: 'JSS 1',
    teacher: 'Mr. Kargbo',
    subjects: 12,
    teachers: 8,
    students: 42,
    lessonPlans: 28,
    completedWeeks: 9,
    totalWeeks: 12,
    coverage: 75,
    status: 'ON_TRACK'
  },
  {
    id: 2,
    class: 'JSS 2',
    teacher: 'Mrs. Johnson',
    subjects: 12,
    teachers: 9,
    students: 38,
    lessonPlans: 30,
    completedWeeks: 12,
    totalWeeks: 12,
    coverage: 100,
    status: 'COMPLETED'
  },
  {
    id: 3,
    class: 'SSS 1',
    teacher: 'Mr. Bangura',
    subjects: 13,
    teachers: 10,
    students: 35,
    lessonPlans: 21,
    completedWeeks: 6,
    totalWeeks: 12,
    coverage: 50,
    status: 'BEHIND'
  }
])

const filteredClasses = computed(() => {
  return classProgress.value.filter(item => {
    const matchesSearch =
      item.class
        .toLowerCase()
        .includes(search.value.toLowerCase())

    const matchesStatus =
      !status.value ||
      item.status === status.value

    return matchesSearch && matchesStatus
  })
})

const totalClasses = computed(() =>
  classProgress.value.length
)

const completedClasses = computed(() =>
  classProgress.value.filter(
    item => item.status === 'COMPLETED'
  ).length
)

const behindClasses = computed(() =>
  classProgress.value.filter(
    item => item.status === 'BEHIND'
  ).length
)

const averageCoverage = computed(() => {
  const total = classProgress.value.reduce(
    (sum, item) => sum + item.coverage,
    0
  )

  return Math.round(
    total / classProgress.value.length
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
  useAppStore().setTitle('Class Progress')

  document.title = 'Class Progress | Skultem'
})

definePageMeta({
  role: [
    Role.ADMIN,
    Role.PROPRIETOR,
    Role.OWNER
  ]
})
</script>