<template>
  <div class="space-y-6 mt-6 md:px-5">

    <!-- Header -->
    <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 class="text-2xl font-bold">
          Weekly Topics & Objectives
        </h1>

        <p class="text-sm text-muted mt-1">
          Manage weekly curriculum coverage and lesson objectives.
        </p>
      </div>

      <div class="flex flex-wrap gap-3">
        <UButton
          icon="i-lucide-plus"
          label="Add Week"
          to="/curriculums/weeks/add"
        />

        <UButton
          icon="i-lucide-file-down"
          variant="outline"
          color="neutral"
          label="Export PDF"
        />
      </div>
    </div>


    <!-- Statistics -->
    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted">
              Total Weeks
            </p>

            <p class="text-3xl font-bold mt-2">
              {{ totalWeeks }}
            </p>
          </div>

          <div class="rounded-xl bg-primary/10 p-3">
            <UIcon
              name="i-lucide-calendar-days"
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

            <p class="text-3xl font-bold text-green-600 mt-2">
              {{ completedWeeks }}
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
              Remaining
            </p>

            <p class="text-3xl font-bold text-orange-500 mt-2">
              {{ remainingWeeks }}
            </p>
          </div>

          <div class="rounded-xl bg-orange-500/10 p-3">
            <UIcon
              name="i-lucide-clock"
              class="text-orange-500 text-xl"
            />
          </div>
        </div>
      </UCard>


      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted">
              Coverage
            </p>

            <p class="text-3xl font-bold text-primary mt-2">
              {{ coverage }}%
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


    <!-- Filters -->
    <UCard>
      <div class="grid gap-4 md:grid-cols-4">

        <UInput
          v-model="search"
          icon="i-lucide-search"
          placeholder="Search topic..."
        />

        <USelectMenu
          v-model="selectedSubject"
          :items="subjects"
          value-key="value"
          placeholder="Subject"
        />

        <USelectMenu
          v-model="selectedClass"
          :items="classes"
          value-key="value"
          placeholder="Class"
        />

        <USelectMenu
          v-model="selectedStatus"
          :items="statuses"
          value-key="value"
          placeholder="Status"
        />

      </div>
    </UCard>


    <!-- Weeks -->
    <div
      v-if="filteredWeeks.length"
      class="grid gap-5"
    >

      <UCard
        v-for="week in filteredWeeks"
        :key="week.id"
      >

        <template #header>

          <div class="flex items-center justify-between">

            <div>
              <h3 class="text-lg font-semibold">
                Week {{ week.week }}
              </h3>

              <p class="text-sm text-muted">
                {{ week.topic }}
              </p>
            </div>

            <UBadge
              :color="getStatusColor(week.status)"
              :label="week.statusLabel"
            />

          </div>

        </template>


        <div class="space-y-5">

          <!-- Objectives -->
          <div>

            <p class="font-medium mb-3">
              Learning Objectives
            </p>

            <div class="space-y-2">

              <div
                v-for="objective in week.objectives"
                :key="objective"
                class="flex gap-2 text-sm text-muted"
              >
                <UIcon
                  name="i-lucide-check"
                  class="text-primary mt-0.5"
                />

                {{ objective }}
              </div>

            </div>

          </div>


          <!-- Activities -->
          <div>

            <p class="font-medium mb-3">
              Teaching Activities
            </p>

            <div class="flex flex-wrap gap-2">

              <UBadge
                v-for="activity in week.activities"
                :key="activity"
                variant="soft"
                :label="activity"
              />

            </div>

          </div>


          <!-- Assessment -->
          <div>

            <p class="font-medium mb-2">
              Assessment
            </p>

            <UBadge
              variant="soft"
              color="warning"
              :label="week.assessment"
            />

          </div>

        </div>


        <template #footer>

          <div class="flex flex-wrap gap-3">

            <UButton
              size="sm"
              icon="i-lucide-eye"
              label="View"
              :to="`/curriculums/weeks/${week.id}`"
            />

            <UButton
              size="sm"
              variant="outline"
              icon="i-lucide-pencil"
              label="Edit"
            />

            <UButton
              size="sm"
              variant="outline"
              color="error"
              icon="i-lucide-trash"
              label="Delete"
            />

          </div>

        </template>

      </UCard>

    </div>


    <!-- Empty -->
    <UCard
      v-else
      class="py-20"
    >
      <div class="text-center">

        <UIcon
          name="i-lucide-book-open"
          class="text-6xl text-muted mx-auto"
        />

        <h3 class="mt-4 text-lg font-semibold">
          No weeks found
        </h3>

        <p class="text-sm text-muted mt-2">
          Create your first weekly topic.
        </p>

      </div>
    </UCard>

  </div>
</template>
<script setup lang="ts">

const search = ref('')
const selectedSubject = ref('')
const selectedClass = ref('')
const selectedStatus = ref('')

const subjects = [
  { label: 'Mathematics', value: 'MATH' },
  { label: 'English Language', value: 'ENG' }
]

const classes = [
  { label: 'JSS 1', value: 'JSS1' },
  { label: 'JSS 2', value: 'JSS2' }
]

const statuses = [
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Pending', value: 'PENDING' }
]


const weeks = ref([
  {
    id: '1',
    week: 1,
    topic: 'Whole Numbers',
    objectives: [
      'Understand whole numbers',
      'Compare numbers',
      'Write numbers in words'
    ],
    activities: [
      'Discussion',
      'Group Work',
      'Examples'
    ],
    assessment: 'Quiz',
    status: 'COMPLETED',
    statusLabel: 'Completed',
    subject: 'MATH',
    class: 'JSS1'
  },

  {
    id: '2',
    week: 2,
    topic: 'Fractions',
    objectives: [
      'Understand fractions',
      'Solve problems'
    ],
    activities: [
      'Practical Work',
      'Examples'
    ],
    assessment: 'Homework',
    status: 'IN_PROGRESS',
    statusLabel: 'In Progress',
    subject: 'MATH',
    class: 'JSS1'
  }
])


const filteredWeeks = computed(() => {
  return weeks.value.filter((week) => {

    const matchesSearch =
      week.topic.toLowerCase()
        .includes(search.value.toLowerCase())

    const matchesSubject =
      !selectedSubject.value ||
      week.subject === selectedSubject.value

    const matchesClass =
      !selectedClass.value ||
      week.class === selectedClass.value

    const matchesStatus =
      !selectedStatus.value ||
      week.status === selectedStatus.value

    return (
      matchesSearch &&
      matchesSubject &&
      matchesClass &&
      matchesStatus
    )

  })
})


const totalWeeks = computed(
  () => weeks.value.length
)

const completedWeeks = computed(
  () =>
    weeks.value.filter(
      week => week.status === 'COMPLETED'
    ).length
)

const remainingWeeks = computed(
  () => totalWeeks.value - completedWeeks.value
)

const coverage = computed(() => {
  if (!totalWeeks.value)
    return 0

  return Math.round(
    (completedWeeks.value /
      totalWeeks.value) * 100
  )
})


function getStatusColor(status: string) {

  switch (status) {

    case 'COMPLETED':
      return 'success'

    case 'IN_PROGRESS':
      return 'warning'

    default:
      return 'neutral'

  }

}


onMounted(() => {

  useAppStore().setTitle(
    'Weekly Topics & Objectives'
  )

  document.title =
    'Weeks | Scheme of Work | Skultem'

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