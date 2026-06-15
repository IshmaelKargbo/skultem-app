<template>
  <div class="mt-6 space-y-6">

    <!-- Header -->
    <UCard class="overflow-hidden">
      <div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

        <div class="flex gap-4">
          <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <UIcon name="i-lucide-school" class="text-3xl text-primary" />
          </div>

          <div>
            <div class="flex items-center gap-3">
              <h1 class="text-2xl font-bold">
                JSS 1 Progress
              </h1>

              <UBadge color="primary" label="On Track" />
            </div>

            <p class="mt-1 text-sm text-muted">
              42 Students • 12 Subjects • 2026/2027
            </p>
          </div>
        </div>

        <div class="flex gap-3">
          <UButton icon="i-lucide-arrow-left" variant="outline" to="/scheme-of-work/class-progress">
            Back
          </UButton>

          <UButton icon="i-lucide-file-down">
            Export Report
          </UButton>
        </div>

      </div>
    </UCard>


    <!-- Top Statistics -->
    <!-- Statistics -->
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

      <!-- Coverage -->
      <UCard class="overflow-hidden">
        <div class="flex items-center justify-between">

          <div class="space-y-1">
            <p class="text-sm text-muted">
              Overall Coverage
            </p>

            <h2 class="text-3xl font-bold text-primary">
              {{ averageCoverage }}%
            </h2>

            <div class="flex items-center gap-1 text-xs text-green-600">
              <UIcon name="i-lucide-trending-up" />
              <span>Curriculum progress</span>
            </div>
          </div>

          <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <UIcon name="i-lucide-chart-column" class="text-2xl text-primary" />
          </div>

        </div>
      </UCard>


      <!-- Subjects -->
      <UCard class="overflow-hidden">
        <div class="flex items-center justify-between">

          <div class="space-y-1">
            <p class="text-sm text-muted">
              Subjects
            </p>

            <h2 class="text-3xl font-bold">
              {{ classInfo.subjects }}
            </h2>

            <div class="flex items-center gap-1 text-xs text-muted">
              <UIcon name="i-lucide-book-open" />
              <span>Assigned subjects</span>
            </div>
          </div>

          <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10">
            <UIcon name="i-lucide-book-open" class="text-2xl text-blue-500" />
          </div>

        </div>
      </UCard>


      <!-- Students -->
      <UCard class="overflow-hidden">
        <div class="flex items-center justify-between">

          <div class="space-y-1">
            <p class="text-sm text-muted">
              Students
            </p>

            <h2 class="text-3xl font-bold">
              {{ classInfo.students }}
            </h2>

            <div class="flex items-center gap-1 text-xs text-muted">
              <UIcon name="i-lucide-users" />
              <span>Class population</span>
            </div>
          </div>

          <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-500/10">
            <UIcon name="i-lucide-users" class="text-2xl text-green-600" />
          </div>

        </div>
      </UCard>


      <!-- Completed Subjects -->
      <UCard class="overflow-hidden">
        <div class="flex items-center justify-between">

          <div class="space-y-1">
            <p class="text-sm text-muted">
              Completed
            </p>

            <h2 class="text-3xl font-bold text-green-600">
              {{ completedSubjects }}
            </h2>

            <div class="flex items-center gap-1 text-xs text-muted">
              <UIcon name="i-lucide-check-circle" />
              <span>Finished subjects</span>
            </div>
          </div>

          <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-500/10">
            <UIcon name="i-lucide-check-circle" class="text-2xl text-green-600" />
          </div>

        </div>
      </UCard>

    </div>


    <div class="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
      <!-- LEFT -->
      <div class="space-y-6 xl:sticky xl:top-6 self-start">

        <!-- Class Summary -->
        <UCard class="overflow-hidden">

          <template #header>
            <div class="flex items-center gap-2">
              <div class="rounded-xl bg-primary/10 p-2">
                <UIcon name="i-lucide-info" class="text-primary" />
              </div>

              <div>
                <h3 class="font-semibold">
                  Class Summary
                </h3>

                <p class="text-xs text-muted">
                  Overview information
                </p>
              </div>
            </div>
          </template>

          <div class="space-y-3">

            <div class="flex items-center justify-between rounded-2xl border border-default p-4">
              <div class="flex items-center gap-3">
                <div class="rounded-xl bg-primary/10 p-3">
                  <UIcon name="i-lucide-user" class="text-primary" />
                </div>

                <div>
                  <p class="text-xs text-muted">
                    Class Teacher
                  </p>

                  <p class="font-medium">
                    {{ classInfo.teacher }}
                  </p>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-between rounded-2xl border border-default p-4">
              <div class="flex items-center gap-3">
                <div class="rounded-xl bg-blue-500/10 p-3">
                  <UIcon name="i-lucide-users" class="text-blue-500" />
                </div>

                <div>
                  <p class="text-xs text-muted">
                    Students
                  </p>

                  <p class="font-medium">
                    {{ classInfo.students }}
                  </p>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-between rounded-2xl border border-default p-4">
              <div class="flex items-center gap-3">
                <div class="rounded-xl bg-green-500/10 p-3">
                  <UIcon name="i-lucide-book-open" class="text-green-500" />
                </div>

                <div>
                  <p class="text-xs text-muted">
                    Subjects
                  </p>

                  <p class="font-medium">
                    {{ classInfo.subjects }}
                  </p>
                </div>
              </div>
            </div>

          </div>

        </UCard>
        <!-- Quick Access -->
        <UCard>

          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-zap" class="text-primary" />

              <span class="font-semibold">
                Quick Access
              </span>
            </div>
          </template>

          <div class="space-y-3">

            <UButton block variant="soft" icon="i-lucide-book-open" trailing-icon="i-lucide-arrow-right">
              Subjects
            </UButton>

            <UButton block color="success" variant="soft" icon="i-lucide-book-check"
              trailing-icon="i-lucide-arrow-right">
              Lesson Plans
            </UButton>

            <UButton block color="warning" variant="soft" icon="i-lucide-calendar-days"
              trailing-icon="i-lucide-arrow-right">
              Weekly Topics
            </UButton>

            <UButton block color="info" variant="soft" icon="i-lucide-file-text" trailing-icon="i-lucide-arrow-right">
              Assessments
            </UButton>

            <UButton block variant="outline" icon="i-lucide-chart-column">
              Progress Report
            </UButton>

          </div>

        </UCard>
      </div>


      <!-- RIGHT -->
      <div class="space-y-5">
        <!-- Overall Progress -->
        <UCard>

          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-chart-column" class="text-primary" />

              <span class="font-semibold">
                Overall Coverage
              </span>
            </div>
          </template>

          <div class="space-y-5">

            <div class="text-center">
              <h2 class="text-5xl font-bold text-primary">
                {{ classInfo.coverage }}%
              </h2>

              <p class="text-sm text-muted">
                Curriculum Completion
              </p>
            </div>

            <UProgress :model-value="classInfo.coverage" size="lg" />

            <div class="grid grid-cols-2 gap-3">

              <div class="rounded-xl bg-green-500/10 p-3 text-center">
                <p class="text-2xl font-bold text-green-600">
                  {{ completedSubjects }}
                </p>

                <p class="text-xs text-muted">
                  Completed
                </p>
              </div>

              <div class="rounded-xl bg-orange-500/10 p-3 text-center">
                <p class="text-2xl font-bold text-orange-500">
                  {{ behindSubjects }}
                </p>

                <p class="text-xs text-muted">
                  Behind
                </p>
              </div>

            </div>

          </div>

        </UCard>

        <UCard>

          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-book-open" class="text-primary" />

              <span class="font-semibold">
                Subject Coverage
              </span>
            </div>
          </template>

          <div class="space-y-4">

            <div v-for="subject in subjects" :key="subject.id"
              class="rounded-2xl border border-default p-5 transition hover:bg-muted/40">

              <div class="flex items-start justify-between">

                <div>

                  <div class="flex items-center gap-3">

                    <h3 class="font-semibold">
                      {{ subject.name }}
                    </h3>

                    <UBadge :color="getStatusColor(subject.status)" :label="getStatusLabel(subject.status)" />

                  </div>

                  <div class="mt-2 text-sm text-muted">
                    {{ subject.teacher }}
                  </div>

                </div>

                <div class="text-right">

                  <div class="text-2xl font-bold text-primary">
                    {{ subject.coverage }}%
                  </div>

                  <div class="text-xs text-muted">
                    {{ subject.completedWeeks }}/{{ subject.totalWeeks }} weeks
                  </div>

                </div>

              </div>

              <UProgress class="mt-5" :model-value="subject.coverage" size="lg" />

            </div>

          </div>

        </UCard>

      </div>

    </div>

  </div>
</template>
<script setup lang="ts">
const route = useRoute()

const classInfo = ref({
  id: Number(route.params.id),
  name: 'JSS 1',
  teacher: 'Mr. Kargbo',
  students: 42,
  subjects: 12,
  coverage: 75,
  academicYear: '2026/2027',
  status: 'ON_TRACK'
})

const stats = computed(() => [
  {
    label: 'Coverage',
    value: `${classInfo.value.coverage}%`,
    icon: 'i-lucide-chart-column'
  },
  {
    label: 'Subjects',
    value: classInfo.value.subjects,
    icon: 'i-lucide-book-open'
  },
  {
    label: 'Students',
    value: classInfo.value.students,
    icon: 'i-lucide-users'
  },
  {
    label: 'Completed',
    value: completedSubjects.value,
    icon: 'i-lucide-check-circle'
  }
])

const subjects = ref([
  {
    id: 1,
    name: 'Mathematics',
    teacher: 'Mr. Kargbo',
    completedWeeks: 9,
    totalWeeks: 12,
    coverage: 75,
    status: 'ON_TRACK'
  },
  {
    id: 2,
    name: 'English Language',
    teacher: 'Mrs. Johnson',
    completedWeeks: 12,
    totalWeeks: 12,
    coverage: 100,
    status: 'COMPLETED'
  },
  {
    id: 3,
    name: 'Integrated Science',
    teacher: 'Mr. Bangura',
    completedWeeks: 5,
    totalWeeks: 12,
    coverage: 42,
    status: 'BEHIND'
  },
  {
    id: 4,
    name: 'Social Studies',
    teacher: 'Mrs. Kamara',
    completedWeeks: 8,
    totalWeeks: 12,
    coverage: 67,
    status: 'ON_TRACK'
  },
  {
    id: 5,
    name: 'Basic Science',
    teacher: 'Mr. Sesay',
    completedWeeks: 10,
    totalWeeks: 12,
    coverage: 83,
    status: 'ON_TRACK'
  }
])

const completedSubjects = computed(() =>
  subjects.value.filter(
    subject => subject.status === 'COMPLETED'
  ).length
)

const onTrackSubjects = computed(() =>
  subjects.value.filter(
    subject => subject.status === 'ON_TRACK'
  ).length
)

const behindSubjects = computed(() =>
  subjects.value.filter(
    subject => subject.status === 'BEHIND'
  ).length
)

const averageCoverage = computed(() => {
  if (!subjects.value.length)
    return 0

  const total = subjects.value.reduce(
    (sum, subject) => sum + subject.coverage,
    0
  )

  return Math.round(total / subjects.value.length)
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

  document.title =
    `${classInfo.value.name} Progress | Skultem`
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