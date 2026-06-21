<template>
  <div class="mt-6 space-y-6">

    <!-- Header -->
    <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

      <div>
        <h1 class="text-2xl font-bold tracking-tight">
          Lesson Plans
        </h1>

        <p class="mt-1 text-sm text-muted">
          Manage and monitor lesson plans across all classes and subjects.
        </p>
      </div>

      <div class="flex gap-3">

        <UButton
          icon="i-lucide-file-down"
          variant="outline"
          color="neutral"
        >
          Export
        </UButton>

        <UButton
          icon="i-lucide-plus"
          to="/curriculums/lesson-plans/add"
        >
          New Lesson Plan
        </UButton>

      </div>

    </div>

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
            :class="stat.iconBg"
          >
            <UIcon
              :name="stat.icon"
              class="size-6"
              :class="stat.iconColor"
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

    <!-- Filters -->
    <UCard :ui="{ body: 'p-4 sm:p-5' }">

      <div class="grid gap-3 lg:grid-cols-[1fr_repeat(3,200px)]">

        <UInput
          v-model="search"
          icon="i-lucide-search"
          placeholder="Search by subject or topic..."
          size="lg"
        />

        <USelectMenu
          v-model="selectedSubject"
          :items="subjects"
          placeholder="Subject"
          icon="i-lucide-book"
          size="lg"
        />

        <USelectMenu
          v-model="selectedClass"
          :items="classes"
          placeholder="Class"
          icon="i-lucide-school"
          size="lg"
        />

        <USelectMenu
          v-model="selectedStatus"
          :items="statuses"
          placeholder="Status"
          icon="i-lucide-flag"
          size="lg"
        />

      </div>

    </UCard>

    <!-- Lesson Plans -->
    <div
      v-if="filteredPlans.length"
      class="space-y-4"
    >

      <UCard
        v-for="plan in filteredPlans"
        :key="plan.id"
        class="overflow-hidden transition-shadow hover:shadow-md"
        :ui="{ body: 'p-5 sm:p-6' }"
      >

        <div class="space-y-5">

          <!-- Top -->
          <div class="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">

            <div class="space-y-2">

              <div class="flex flex-wrap items-center gap-3">

                <h3 class="text-lg font-semibold">
                  {{ plan.subject }}
                </h3>

                <UBadge
                  :color="getStatusColor(plan.status)"
                  variant="subtle"
                  size="sm"
                >
                  {{ plan.status }}
                </UBadge>

              </div>

              <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">

                <div class="flex items-center gap-1.5">
                  <UIcon name="i-lucide-school" class="size-4" />
                  {{ plan.class }}
                </div>

                <div class="flex items-center gap-1.5">
                  <UIcon name="i-lucide-calendar" class="size-4" />
                  Week {{ plan.week }}
                </div>

                <div class="flex items-center gap-1.5">
                  <UIcon name="i-lucide-user" class="size-4" />
                  {{ plan.teacher }}
                </div>

              </div>

            </div>

            <div class="flex items-center gap-3 xl:flex-col xl:items-end xl:gap-1">

              <p class="text-3xl font-bold text-primary">
                {{ plan.progress }}%
              </p>

              <p class="text-sm text-muted">
                Completion
              </p>

            </div>

          </div>

          <!-- Topic -->
          <div class="flex items-center gap-3 rounded-xl border border-default bg-muted/40 px-4 py-3">

            <UIcon name="i-lucide-bookmark" class="size-4 shrink-0 text-muted" />

            <div>
              <p class="text-xs font-medium uppercase tracking-wide text-muted">
                Topic
              </p>

              <h4 class="font-semibold">
                {{ plan.topic }}
              </h4>
            </div>

          </div>

          <!-- Progress -->
          <UProgress
            :model-value="plan.progress"
            size="sm"
          />

          <!-- Summary -->
          <div class="grid gap-3 sm:grid-cols-3">

            <div class="flex items-center gap-3 rounded-xl border border-default p-4">
              <div class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <UIcon name="i-lucide-target" class="size-4 text-primary" />
              </div>
              <div>
                <p class="text-xs text-muted">Objectives</p>
                <p class="text-xl font-bold leading-tight">{{ plan.objectives }}</p>
              </div>
            </div>

            <div class="flex items-center gap-3 rounded-xl border border-default p-4">
              <div class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-green-500/10">
                <UIcon name="i-lucide-activity" class="size-4 text-green-500" />
              </div>
              <div>
                <p class="text-xs text-muted">Activities</p>
                <p class="text-xl font-bold leading-tight">{{ plan.activities }}</p>
              </div>
            </div>

            <div class="flex items-center gap-3 rounded-xl border border-default p-4">
              <div class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-orange-500/10">
                <UIcon name="i-lucide-package" class="size-4 text-orange-500" />
              </div>
              <div>
                <p class="text-xs text-muted">Materials</p>
                <p class="text-xl font-bold leading-tight">{{ plan.materials }}</p>
              </div>
            </div>

          </div>

          <!-- Actions -->
          <div class="flex flex-wrap items-center gap-2 border-t border-default pt-4">

            <UButton
              icon="i-lucide-eye"
              size="sm"
              :to="`/curriculums/lesson-plans/${plan.id}`"
            >
              View
            </UButton>

            <UButton
              icon="i-lucide-pencil"
              variant="outline"
              color="neutral"
              size="sm"
              :to="`/curriculums/lesson-plans/${plan.id}/edit`"
            >
              Edit
            </UButton>

            <UButton
              icon="i-lucide-copy"
              variant="ghost"
              color="neutral"
              size="sm"
            >
              Duplicate
            </UButton>

          </div>

        </div>

      </UCard>

    </div>

    <!-- Empty state -->
    <UCard v-else>
      <div class="flex flex-col items-center gap-3 py-12 text-center">

        <div class="flex size-14 items-center justify-center rounded-full bg-muted/50">
          <UIcon name="i-lucide-file-search" class="size-6 text-muted" />
        </div>

        <div>
          <p class="font-semibold">No lesson plans found</p>
          <p class="mt-1 text-sm text-muted">
            Try adjusting your filters or search term.
          </p>
        </div>

      </div>
    </UCard>

  </div>
</template>
<script setup lang="ts">
const search = ref('')
const selectedSubject = ref()
const selectedClass = ref()
const selectedStatus = ref()

const subjects = [
  'Mathematics',
  'English Language',
  'Integrated Science',
  'Social Studies'
]

const classes = [
  'JSS 1',
  'JSS 2',
  'JSS 3'
]

const statuses = [
  'Published',
  'Draft',
  'Completed'
]

const lessonPlans = ref([
  {
    id: 1,
    subject: 'Mathematics',
    class: 'JSS 1',
    week: 4,
    topic: 'Fractions',
    teacher: 'Mr. Kargbo',
    objectives: 3,
    activities: 4,
    materials: 2,
    progress: 80,
    status: 'Published'
  },
  {
    id: 2,
    subject: 'English Language',
    class: 'JSS 2',
    week: 5,
    topic: 'Parts of Speech',
    teacher: 'Mrs. Johnson',
    objectives: 4,
    activities: 3,
    materials: 2,
    progress: 100,
    status: 'Completed'
  },
  {
    id: 3,
    subject: 'Integrated Science',
    class: 'JSS 1',
    week: 3,
    topic: 'Living Things',
    teacher: 'Mr. Bangura',
    objectives: 2,
    activities: 5,
    materials: 3,
    progress: 45,
    status: 'Draft'
  }
])

const filteredPlans = computed(() => {
  return lessonPlans.value.filter((plan) => {
    const matchesSearch =
      plan.subject.toLowerCase().includes(search.value.toLowerCase()) ||
      plan.topic.toLowerCase().includes(search.value.toLowerCase())

    const matchesSubject =
      !selectedSubject.value ||
      plan.subject === selectedSubject.value

    const matchesClass =
      !selectedClass.value ||
      plan.class === selectedClass.value

    const matchesStatus =
      !selectedStatus.value ||
      plan.status === selectedStatus.value

    return (
      matchesSearch &&
      matchesSubject &&
      matchesClass &&
      matchesStatus
    )
  })
})

const totalPlans = computed(() =>
  lessonPlans.value.length
)

const publishedPlans = computed(() =>
  lessonPlans.value.filter(
    plan => plan.status === 'Published'
  ).length
)

const draftPlans = computed(() =>
  lessonPlans.value.filter(
    plan => plan.status === 'Draft'
  ).length
)

const completedPlans = computed(() =>
  lessonPlans.value.filter(
    plan => plan.status === 'Completed'
  ).length
)

const stats = computed(() => [
  {
    label: 'Total Plans',
    value: totalPlans.value,
    icon: 'i-lucide-book-open',
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary'
  },
  {
    label: 'Published',
    value: publishedPlans.value,
    icon: 'i-lucide-check-circle',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-500'
  },
  {
    label: 'Draft',
    value: draftPlans.value,
    icon: 'i-lucide-file-pen',
    iconBg: 'bg-orange-500/10',
    iconColor: 'text-orange-500'
  },
  {
    label: 'Completed',
    value: completedPlans.value,
    icon: 'i-lucide-badge-check',
    iconBg: 'bg-green-500/10',
    iconColor: 'text-green-500'
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
  useAppStore().setTitle('Lesson Plans')

  document.title =
    'Lesson Plans | Skultem'
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