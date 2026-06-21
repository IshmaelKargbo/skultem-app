<template>
  <div class="mt-6 space-y-6">

    <!-- Header -->
    <UCard>
      <div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

        <div class="flex gap-4">

          <div
            class="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10"
          >
            <UIcon
              name="i-lucide-book-open"
              class="text-3xl text-primary"
            />
          </div>

          <div>

            <div class="flex flex-wrap items-center gap-3">

              <h1 class="text-2xl font-bold tracking-tight">
                {{ lesson.subject }}
              </h1>

              <UBadge
                :color="getStatusColor(lesson.status)"
                variant="subtle"
                :label="lesson.status"
              />

            </div>

            <div class="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">

              <div class="flex items-center gap-1.5">
                <UIcon name="i-lucide-school" class="size-4" />
                {{ lesson.class }}
              </div>

              <div class="flex items-center gap-1.5">
                <UIcon name="i-lucide-calendar" class="size-4" />
                Week {{ lesson.week }}
              </div>

              <div class="flex items-center gap-1.5">
                <UIcon name="i-lucide-user" class="size-4" />
                {{ lesson.teacher }}
              </div>

            </div>

          </div>

        </div>

        <div class="flex gap-3">

          <UButton
            variant="outline"
            color="neutral"
            icon="i-lucide-arrow-left"
            to="/curriculums/lesson-plans"
          >
            Back
          </UButton>

          <UButton
            icon="i-lucide-pencil"

          >
            Edit
          </UButton>

        </div>

      </div>
    </UCard>


    <!-- Statistics -->
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

      <UCard
        v-for="stat in stats"
        :key="stat.label"
        :ui="{ body: 'p-5' }"
      >
        <div class="flex items-center gap-4">

          <div
            class="flex size-12 shrink-0 items-center justify-center rounded-xl"
            :class="stat.bg"
          >
            <UIcon
              :name="stat.icon"
              :class="stat.color"
              class="size-6"
            />
          </div>

          <div>
            <p class="text-2xl font-bold leading-tight">
              {{ stat.value }}
            </p>

            <p class="text-sm text-muted">
              {{ stat.label }}
            </p>
          </div>

        </div>
      </UCard>

    </div>


    <div class="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">

      <!-- Sidebar -->
      <div class="space-y-6 xl:sticky xl:top-6 self-start">

        <!-- Lesson Information -->
        <UCard>

          <template #header>
            <div class="flex items-center gap-2">

              <UIcon
                name="i-lucide-info"
                class="text-primary size-5"
              />

              <span class="font-semibold">
                Lesson Information
              </span>

            </div>
          </template>

          <dl class="divide-y divide-default">

            <div class="flex items-center justify-between py-2.5">
              <dt class="text-sm text-muted">Subject</dt>
              <dd class="text-sm font-medium">{{ lesson.subject }}</dd>
            </div>

            <div class="flex items-center justify-between py-2.5">
              <dt class="text-sm text-muted">Class</dt>
              <dd class="text-sm font-medium">{{ lesson.class }}</dd>
            </div>

            <div class="flex items-center justify-between py-2.5">
              <dt class="text-sm text-muted">Week</dt>
              <dd class="text-sm font-medium">Week {{ lesson.week }}</dd>
            </div>

            <div class="flex items-center justify-between py-2.5">
              <dt class="text-sm text-muted">Teacher</dt>
              <dd class="text-sm font-medium">{{ lesson.teacher }}</dd>
            </div>

          </dl>

        </UCard>


        <!-- Progress -->
        <UCard>

          <template #header>
            <div class="flex items-center gap-2">
              <UIcon
                name="i-lucide-chart-column"
                class="text-primary size-5"
              />

              <span class="font-semibold">
                Overall Progress
              </span>
            </div>
          </template>

          <div class="space-y-4">

            <div class="text-center">

              <h2 class="text-5xl font-bold text-primary">
                {{ lesson.progress }}%
              </h2>

              <p class="text-sm text-muted">
                Completion
              </p>

            </div>

            <UProgress
              :model-value="lesson.progress"
              size="sm"
            />

          </div>

        </UCard>

      </div>


      <!-- Main -->
      <div class="space-y-6">

        <!-- Topic -->
        <UCard>

          <template #header>
            <div class="flex items-center gap-2">
              <UIcon
                name="i-lucide-bookmark"
                class="text-primary size-5"
              />

              <span class="font-semibold">
                Topic
              </span>
            </div>
          </template>

          <div class="rounded-xl border border-default bg-primary/5 p-5">

            <h2 class="text-xl font-bold">
              {{ lesson.topic }}
            </h2>

          </div>

        </UCard>


        <!-- Objectives -->
        <UCard>

          <template #header>
            <div class="flex items-center gap-2">
              <UIcon
                name="i-lucide-target"
                class="text-primary size-5"
              />

              <span class="font-semibold">
                Learning Objectives
              </span>
            </div>
          </template>

          <ul class="space-y-2.5">

            <li
              v-for="objective in lesson.objectives"
              :key="objective"
              class="flex items-start gap-3 rounded-xl border border-default p-3.5"
            >

              <UIcon
                name="i-lucide-check-circle"
                class="mt-0.5 size-5 shrink-0 text-green-500"
              />

              <span class="text-sm">
                {{ objective }}
              </span>

            </li>

          </ul>

        </UCard>


        <!-- Activities -->
        <UCard>

          <template #header>
            <div class="flex items-center gap-2">
              <UIcon
                name="i-lucide-users"
                class="text-primary size-5"
              />

              <span class="font-semibold">
                Teaching Activities
              </span>
            </div>
          </template>

          <div class="flex flex-wrap gap-2">

            <UBadge
              v-for="activity in lesson.activities"
              :key="activity"
              size="lg"
              variant="subtle"
              color="neutral"
            >
              {{ activity }}
            </UBadge>

          </div>

        </UCard>


        <!-- Materials -->
        <UCard>

          <template #header>
            <div class="flex items-center gap-2">
              <UIcon
                name="i-lucide-package"
                class="text-primary size-5"
              />

              <span class="font-semibold">
                Materials & Resources
              </span>
            </div>
          </template>

          <div class="grid gap-2.5 sm:grid-cols-2">

            <div
              v-for="material in lesson.materials"
              :key="material"
              class="flex items-center gap-2.5 rounded-xl border border-default p-3.5 text-sm"
            >
              <UIcon name="i-lucide-box" class="size-4 shrink-0 text-muted" />
              {{ material }}
            </div>

          </div>

        </UCard>


        <!-- Assessment -->
        <UCard>

          <template #header>
            <div class="flex items-center gap-2">
              <UIcon
                name="i-lucide-clipboard-check"
                class="text-primary size-5"
              />

              <span class="font-semibold">
                Assessment
              </span>
            </div>
          </template>

          <div class="rounded-xl border border-warning/20 bg-warning/10 p-5">

            <div class="flex gap-4">

              <UIcon
                name="i-lucide-clipboard-check"
                class="size-6 shrink-0 text-warning"
              />

              <div>

                <h3 class="font-semibold">
                  Student Evaluation
                </h3>

                <p class="mt-1.5 text-sm text-muted">
                  {{ lesson.assessment }}
                </p>

              </div>

            </div>

          </div>

        </UCard>


        <!-- Homework -->
        <UCard>

          <template #header>
            <div class="flex items-center gap-2">
              <UIcon
                name="i-lucide-pencil"
                class="text-primary size-5"
              />

              <span class="font-semibold">
                Homework
              </span>
            </div>
          </template>

          <div class="rounded-xl border border-green-500/20 bg-green-500/10 p-5">

            <div class="flex gap-4">

              <UIcon
                name="i-lucide-book-marked"
                class="size-6 shrink-0 text-green-600"
              />

              <div>

                <h3 class="font-semibold">
                  Take Home Exercise
                </h3>

                <p class="mt-1.5 text-sm text-muted">
                  {{ lesson.homework }}
                </p>

              </div>

            </div>

          </div>

        </UCard>

      </div>

    </div>

  </div>
</template>

<script setup lang="ts">
const route = useRoute()

const lesson = ref({
  id: Number(route.params.id),

  subject: 'Mathematics',
  class: 'JSS 1',
  week: 4,
  teacher: 'Mr. Kargbo',

  topic: 'Fractions',

  progress: 80,

  status: 'Published',

  objectives: [
    'Define fractions and their components',
    'Identify proper and improper fractions',
    'Compare fractions using visual examples'
  ],

  activities: [
    'Discussion',
    'Group Work',
    'Class Exercise',
    'Examples'
  ],

  materials: [
    'Textbook',
    'Whiteboard',
    'Charts',
    'Fraction Cards'
  ],

  assessment:
    'Students complete a short quiz and class exercise on fractions.',

  homework:
    'Complete Exercise 4A from the Mathematics textbook.'
})

const stats = computed(() => [
  {
    label: 'Objectives',
    value: lesson.value.objectives.length,
    icon: 'i-lucide-target',
    bg: 'bg-primary/10',
    color: 'text-primary'
  },

  {
    label: 'Activities',
    value: lesson.value.activities.length,
    icon: 'i-lucide-users',
    bg: 'bg-green-500/10',
    color: 'text-green-600'
  },

  {
    label: 'Materials',
    value: lesson.value.materials.length,
    icon: 'i-lucide-package',
    bg: 'bg-orange-500/10',
    color: 'text-orange-500'
  },

  {
    label: 'Completion',
    value: `${lesson.value.progress}%`,
    icon: 'i-lucide-chart-column',
    bg: 'bg-blue-500/10',
    color: 'text-blue-600'
  }
])

function getStatusColor(status: string) {
  switch (status) {
    case 'Published':
      return 'primary'

    case 'Completed':
      return 'success'

    case 'Draft':
      return 'warning'

    default:
      return 'neutral'
  }
}

onMounted(() => {
  useAppStore().setTitle(
    `${lesson.value.subject} Lesson`
  )

  document.title =
    `${lesson.value.subject} Lesson | Skultem`
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