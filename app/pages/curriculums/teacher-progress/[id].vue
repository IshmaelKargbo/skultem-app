<template>
  <div class="space-y-6 mt-6 md:px-5">

    <!-- Header -->
    <UCard>
      <div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

        <div class="flex items-center gap-4">

          <UAvatar size="xl" alt="Mr. Kargbo" />

          <div>

            <div class="flex items-center gap-3">

              <h1 class="text-2xl font-bold">
                Mr. Kargbo
              </h1>

              <UBadge color="success" label="Active" />

            </div>

            <p class="text-sm text-muted mt-1">
              Mathematics Teacher • 2026/2027
            </p>

          </div>

        </div>

        <div class="flex gap-3">

          <UButton icon="i-lucide-arrow-left" variant="outline" color="neutral" to="/curriculums/teacher-progress">
            Back
          </UButton>

          <UButton icon="i-lucide-file-down">
            Export PDF
          </UButton>

        </div>

      </div>
    </UCard>

    <!-- Statistics -->
    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

      <UCard>
        <div class="flex items-center justify-between">

          <div>
            <p class="text-sm text-muted">
              Coverage
            </p>

            <p class="text-3xl font-bold text-primary">
              82%
            </p>
          </div>

          <UIcon name="i-lucide-chart-column" class="text-2xl text-primary" />

        </div>
      </UCard>


      <UCard>
        <div class="flex items-center justify-between">

          <div>
            <p class="text-sm text-muted">
              Subjects
            </p>

            <p class="text-3xl font-bold">
              3
            </p>
          </div>

          <UIcon name="i-lucide-book-open" class="text-2xl text-blue-500" />

        </div>
      </UCard>


      <UCard>
        <div class="flex items-center justify-between">

          <div>
            <p class="text-sm text-muted">
              Classes
            </p>

            <p class="text-3xl font-bold">
              6
            </p>
          </div>

          <UIcon name="i-lucide-school" class="text-2xl text-orange-500" />

        </div>
      </UCard>


      <UCard>
        <div class="flex items-center justify-between">

          <div>
            <p class="text-sm text-muted">
              Pending Weeks
            </p>

            <p class="text-3xl font-bold text-red-500">
              2
            </p>
          </div>

          <UIcon name="i-lucide-triangle-alert" class="text-2xl text-red-500" />

        </div>
      </UCard>

    </div>



    <div class="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">

      <!-- LEFT SIDEBAR -->
      <div class="space-y-6 xl:sticky xl:top-6 self-start">

        <!-- Teacher Summary -->
        <UCard class="overflow-hidden">

          <template #header>
            <div class="flex items-center gap-2">

              <div class="rounded-xl bg-primary/10 p-2">
                <UIcon name="i-lucide-user" class="text-primary" />
              </div>

              <div>
                <h3 class="font-semibold">
                  Teacher Summary
                </h3>

                <p class="text-xs text-muted">
                  Performance overview
                </p>
              </div>

            </div>
          </template>


          <div class="space-y-4">

            <!-- Statistics -->
            <div class="grid gap-3">

              <div class="flex items-center justify-between rounded-xl border border-default p-4">
                <div class="flex items-center gap-3">

                  <div class="rounded-lg bg-primary/10 p-2">
                    <UIcon name="i-lucide-book-open" class="text-primary" />
                  </div>

                  <div>
                    <p class="text-xs text-muted">
                      Subjects
                    </p>

                    <p class="font-medium">
                      Teaching Subjects
                    </p>
                  </div>

                </div>

                <span class="text-xl font-bold">
                  3
                </span>

              </div>


              <div class="flex items-center justify-between rounded-xl border border-default p-4">
                <div class="flex items-center gap-3">

                  <div class="rounded-lg bg-green-500/10 p-2">
                    <UIcon name="i-lucide-school" class="text-green-600" />
                  </div>

                  <div>
                    <p class="text-xs text-muted">
                      Classes
                    </p>

                    <p class="font-medium">
                      Assigned Classes
                    </p>
                  </div>

                </div>

                <span class="text-xl font-bold">
                  6
                </span>

              </div>


              <div class="flex items-center justify-between rounded-xl border border-default p-4">
                <div class="flex items-center gap-3">

                  <div class="rounded-lg bg-orange-500/10 p-2">
                    <UIcon name="i-lucide-book-check" class="text-orange-500" />
                  </div>

                  <div>
                    <p class="text-xs text-muted">
                      Lesson Plans
                    </p>

                    <p class="font-medium">
                      Created Plans
                    </p>
                  </div>

                </div>

                <span class="text-xl font-bold">
                  24
                </span>

              </div>

            </div>
          </div>

        </UCard>

            <!-- Progress -->
        <UCard>

          <template #header>
            <span class="font-semibold">
              Overall Progress
            </span>
          </template>

          <div class="space-y-5">

            <div>

              <div class="flex justify-between mb-2">

                <span class="text-sm text-muted">
                  Curriculum Coverage
                </span>

                <span class="font-semibold">
                  82%
                </span>

              </div>

              <UProgress :model-value="82" size="lg" />

            </div>

          </div>

        </UCard>

      </div>


      <!-- RIGHT CONTENT -->
      <div class="space-y-6">
    

        <!-- Subject Coverage -->
        <UCard>

          <template #header>
            <span class="font-semibold">
              Subject Coverage
            </span>
          </template>

          <div class="space-y-6">

            <div v-for="subject in subjects" :key="subject.name">

              <div class="flex justify-between mb-2">

                <div>

                  <p class="font-medium">
                    {{ subject.name }}
                  </p>

                  <p class="text-sm text-muted">
                    {{ subject.classes }}
                  </p>

                </div>

                <span class="font-semibold">
                  {{ subject.progress }}%
                </span>

              </div>

              <UProgress :model-value="subject.progress" />

            </div>

          </div>

        </UCard>


        <!-- Recent Activities -->
        <UCard>

          <template #header>
            <span class="font-semibold">
              Recent Activities
            </span>
          </template>

          <div class="space-y-4">

            <div v-for="activity in activities" :key="activity.title" class="rounded-xl border border-default p-4">

              <div class="flex items-center gap-3">

                <div class="rounded-xl bg-primary/10 p-3">
                  <UIcon :name="activity.icon" class="text-primary" />
                </div>

                <div>

                  <p class="font-medium">
                    {{ activity.title }}
                  </p>

                  <p class="text-sm text-muted">
                    {{ activity.time }}
                  </p>

                </div>

              </div>

            </div>

          </div>

        </UCard>


        <!-- Quick Actions -->
        <UCard>

          <template #header>
            <span class="font-semibold">
              Quick Actions
            </span>
          </template>

          <div class="space-y-3">

            <UButton block variant="soft" icon="i-lucide-book-open">
              Subjects
            </UButton>

            <UButton block variant="soft" color="success" icon="i-lucide-file-text">
              Lesson Plans
            </UButton>

            <UButton block variant="soft" color="warning" icon="i-lucide-calendar-days">
              Weekly Topics
            </UButton>

          </div>

        </UCard>
      </div>

    </div>

  </div>
</template>
<script setup lang="ts">
const subjects = ref([
  {
    name: 'Mathematics',
    classes: 'JSS 1, JSS 2',
    progress: 92
  },

  {
    name: 'English Language',
    classes: 'JSS 3',
    progress: 76
  },

  {
    name: 'Integrated Science',
    classes: 'JSS 1',
    progress: 81
  }
])

const activities = ref([
  {
    title: 'Week 9 completed for Mathematics',
    time: 'Today · 09:30 AM',
    icon: 'i-lucide-check-circle'
  },

  {
    title: 'Lesson plan uploaded',
    time: 'Yesterday · 03:45 PM',
    icon: 'i-lucide-book-open-check'
  },

  {
    title: 'Assessment created',
    time: 'Yesterday · 11:20 AM',
    icon: 'i-lucide-file-text'
  },

  {
    title: 'Week 10 pending for English Language',
    time: '2 days ago',
    icon: 'i-lucide-triangle-alert'
  }
])

const teacher = ref({
  id: 1,
  name: 'Mr. Kargbo',
  department: 'Mathematics Department',
  email: 'kargbo@school.com',
  phone: '+23276123456',
  status: 'ACTIVE',
  subjects: 3,
  classes: 6,
  lessonPlans: 24,
  coverage: 82,
  pendingWeeks: 2
})

const stats = computed(() => [
  {
    label: 'Coverage',
    value: `${teacher.value.coverage}%`,
    icon: 'i-lucide-chart-column',
    color: 'text-primary'
  },

  {
    label: 'Subjects',
    value: teacher.value.subjects,
    icon: 'i-lucide-book-open',
    color: 'text-blue-500'
  },

  {
    label: 'Classes',
    value: teacher.value.classes,
    icon: 'i-lucide-school',
    color: 'text-orange-500'
  },

  {
    label: 'Pending Weeks',
    value: teacher.value.pendingWeeks,
    icon: 'i-lucide-triangle-alert',
    color: 'text-red-500'
  }
])

const totalSubjects = computed(() =>
  subjects.value.length
)

const averageCoverage = computed(() => {
  if (!subjects.value.length)
    return 0

  const total = subjects.value.reduce(
    (sum, subject) => sum + subject.progress,
    0
  )

  return Math.round(
    total / subjects.value.length
  )
})

const bestSubject = computed(() => {
  return [...subjects.value].sort(
    (a, b) => b.progress - a.progress
  )[0]
})

const lowestSubject = computed(() => {
  return [...subjects.value].sort(
    (a, b) => a.progress - b.progress
  )[0]
})

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
    Role.OWNER,
    Role.TEACHER
  ]
})
</script>
