<template>
  <div class="mt-6 space-y-6">

    <!-- Header -->
    <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

      <div>
        <h1 class="text-2xl font-bold">
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
          to="/scheme-of-work/lesson-plans/add"
        >
          New Lesson Plan
        </UButton>

      </div>

    </div>

    <!-- Statistics -->
    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

      <UCard
        v-for="stat in stats"
        :key="stat.label"
      >
        <div class="flex items-center justify-between">

          <div>
            <p class="text-sm text-muted">
              {{ stat.label }}
            </p>

            <h2 class="mt-1 text-3xl font-bold">
              {{ stat.value }}
            </h2>
          </div>

          <div class="rounded-2xl bg-primary/10 p-3">
            <UIcon
              :name="stat.icon"
              class="text-xl text-primary"
            />
          </div>

        </div>
      </UCard>

    </div>

    <!-- Filters -->
    <UCard>

      <div class="grid gap-4 lg:grid-cols-4">

        <UInput
          v-model="search"
          icon="i-lucide-search"
          placeholder="Search lesson plans..."
        />

        <USelectMenu
          v-model="selectedSubject"
          :items="subjects"
          placeholder="Subject"
        />

        <USelectMenu
          v-model="selectedClass"
          :items="classes"
          placeholder="Class"
        />

        <USelectMenu
          v-model="selectedStatus"
          :items="statuses"
          placeholder="Status"
        />

      </div>

    </UCard>

    <!-- Lesson Plans -->
    <div class="space-y-5">

      <UCard
        v-for="plan in filteredPlans"
        :key="plan.id"
        class="overflow-hidden"
      >

        <div class="space-y-5">

          <!-- Top -->
          <div class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

            <div>

              <div class="flex items-center gap-3">

                <h3 class="text-lg font-semibold">
                  {{ plan.subject }}
                </h3>

                <UBadge
                  :color="getStatusColor(plan.status)"
                >
                  {{ plan.status }}
                </UBadge>

              </div>

              <div class="mt-2 flex flex-wrap gap-4 text-sm text-muted">

                <div class="flex items-center gap-1">
                  <UIcon name="i-lucide-school" />
                  {{ plan.class }}
                </div>

                <div class="flex items-center gap-1">
                  <UIcon name="i-lucide-calendar" />
                  Week {{ plan.week }}
                </div>

                <div class="flex items-center gap-1">
                  <UIcon name="i-lucide-user" />
                  {{ plan.teacher }}
                </div>

              </div>

            </div>

            <div class="text-right">

              <p class="text-3xl font-bold text-primary">
                {{ plan.progress }}%
              </p>

              <p class="text-sm text-muted">
                Completion
              </p>

            </div>

          </div>

          <!-- Topic -->
          <div class="rounded-2xl bg-muted/50 p-5">

            <p class="text-xs uppercase text-muted">
              Topic
            </p>

            <h4 class="mt-1 font-semibold">
              {{ plan.topic }}
            </h4>

          </div>

          <!-- Summary -->
          <div class="grid gap-4 md:grid-cols-3">

            <div class="rounded-xl bg-primary/5 p-4">
              <p class="text-xs text-muted">
                Objectives
              </p>

              <p class="mt-2 text-2xl font-bold">
                {{ plan.objectives }}
              </p>
            </div>

            <div class="rounded-xl bg-green-500/10 p-4">
              <p class="text-xs text-muted">
                Activities
              </p>

              <p class="mt-2 text-2xl font-bold">
                {{ plan.activities }}
              </p>
            </div>

            <div class="rounded-xl bg-orange-500/10 p-4">
              <p class="text-xs text-muted">
                Materials
              </p>

              <p class="mt-2 text-2xl font-bold">
                {{ plan.materials }}
              </p>
            </div>

          </div>

          <UProgress
            :model-value="plan.progress"
            size="lg"
          />

          <!-- Actions -->
          <div class="flex flex-wrap gap-3">

            <UButton
              icon="i-lucide-eye"
              :to="`/lesson-plans/${plan.id}`"
            >
              View
            </UButton>

            <UButton
              icon="i-lucide-pencil"
              variant="outline"
              :to="`/lesson-plans/${plan.id}/edit`"
            >
              Edit
            </UButton>

            <UButton
              icon="i-lucide-copy"
              variant="soft"
            >
              Duplicate
            </UButton>

          </div>

        </div>

      </UCard>

    </div>

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
    icon: 'i-lucide-book-open'
  },
  {
    label: 'Published',
    value: publishedPlans.value,
    icon: 'i-lucide-check-circle'
  },
  {
    label: 'Draft',
    value: draftPlans.value,
    icon: 'i-lucide-file-pen'
  },
  {
    label: 'Completed',
    value: completedPlans.value,
    icon: 'i-lucide-badge-check'
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