<template>
  <div class="space-y-5 p-4">
    <Heading title="Weekly Topics & Objectives" subtitle="Manage weekly curriculum coverage and lesson objectives.">
      <UButton icon="i-lucide-plus" label="Add Week" @click="add" />
    </Heading>

    <!-- Statistics -->
    <CurriculumSchemeOfWorkStatistics />
    
    <!-- Weeks -->
    <div v-if="records.length" class="grid gap-5">

      <UCard v-for="week in records" :key="week.id">

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

            <UBadge variant="outline" :color="getStatusColor(week.state)" :label="clean(week.state)" />

          </div>

        </template>


        <div class="space-y-5">
          <p class="bg-gray-50 p-3 border-2 rounded-xl border-dashed border-gray-200 dark:border-gray-900">{{
            week.subTopic }}
          </p>
          <!-- Objectives -->
          <div>
            <p class="font-medium mb-3">
              Learning Objectives
            </p>

            <div class="space-y-2">

              <div v-for="objective in week.objectives" :key="objective" class="flex gap-2 text-sm text-muted">
                <UIcon name="i-lucide-check" class="text-primary mt-0.5" />

                {{ objective }}
              </div>

            </div>

          </div>
        </div>


        <template #footer>

          <div class="flex flex-wrap gap-3">

            <UButton size="sm" icon="i-lucide-eye" label="View" :to="`/curriculums/weeks/${week.id}`" />

            <UButton size="sm" variant="outline" icon="i-lucide-pencil" label="Edit" />

            <UButton size="sm" variant="outline" color="error" icon="i-lucide-trash" label="Delete" />

          </div>

        </template>

      </UCard>
    </div>


    <!-- Empty -->
    <UCard v-else class="py-20">
      <div class="text-center">

        <UIcon name="i-lucide-book-open" class="text-6xl text-muted mx-auto" />

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
const store = useWeekStore()
const { records } = storeToRefs(store)

const route = useRoute()
const search = ref('')
const selectedSubject = ref('')
const selectedClass = ref('')
const selectedStatus = ref('')

const id = route.params.id as string
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

    case 'NOT_STARTED':
      return 'neutral'

    case 'COMPLETED':
      return 'success'

    case 'IN_PROGRESS':
      return 'warning'

    default:
      return 'neutral'

  }

}

function add() {
  navigateTo(`${id}/week/add`)
}

onMounted(() => {
  if (id) store.fetchAll(id)
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