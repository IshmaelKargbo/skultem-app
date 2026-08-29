<template>
  <div class="space-y-4 px-4 md:px-6">
    <Heading title="Teacher Progress" subtitle="Monitor curriculum coverage by teacher.">
      <div class="flex space-x-2">
        <div class="grid gap-2 md:grid-cols-2">
          <UInput v-model="search" icon="i-lucide-search" placeholder="Search teacher..." />
          <USelectMenu v-model="status" :items="statuses" value-key="value" placeholder="Filter status" />
        </div>
        <UButton icon="i-lucide-refresh-cw" variant="outline" color="neutral" :loading="loading" label="Refresh"
          @click="load" />
      </div>
    </Heading>

    <!-- Statistics -->
    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Metric :record="{
        color: 'neutral',
        label: 'Teachers',
        isReady: !loading,
        value: totalTeachers || '0',
        icon: TEACHER_ICON
      }" />
      <Metric :record="{
        color: 'success',
        label: 'Completed',
        isReady: !loading,
        value: completedTeachers || '0',
        icon: CHECK_ICON
      }" />
      <Metric :record="{
        color: 'error',
        label: 'Remaining',
        isReady: !loading,
        value: behindTeachers || '0',
        icon: PENDING_ICON
      }" />
      <Metric :record="{
        color: 'info',
        label: 'coverage',
        isReady: !loading,
        value: `${averageCoverage || 0}%`,
        icon: COVERAGE_ICON
      }" />
    </div>

    <div v-if="loading" class="space-y-5">
      <USkeleton v-for="i in 3" :key="i" class="h-40 rounded-2xl" />
    </div>

    <div v-else-if="filteredTeachers.length" class="grid grid-cols-2 gap-4">
      <UCard v-for="teacher in filteredTeachers" :key="teacher.id" class="overflow-hidden">
        <template #header>
          <div class="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div class="flex items-center gap-2">
              <UAvatar :alt="teacher.name" size="xl" />
              <div>
                <h3 class="text-base font-bold">{{ teacher.name }}</h3>
                <p class="text-xs-base text-muted">
                  {{ teacher.completedWeeks }} of {{ teacher.totalWeeks }} weeks completed
                </p>
              </div>
            </div>

            <!-- Coverage -->
            <div class="text-left lg:text-right space-y-1">
              <!-- <UBadge size="sm" variant="subtle" :label="getStatusLabel(teacher.status)"
                :color="getStatusColor(teacher.status)" /> -->
              <h2 class="text-3xl font-bold text-primary">{{ teacher.coverage }}%</h2>
            </div>
          </div>
        </template>
        <div class="space-y-5">
          <UProgress color="secondary" :model-value="teacher.coverage" />
          <div class="grid gap-4 md:grid-cols-3">
            <div class="rounded-2xl border border-default p-3 bg-warning-50">
              <div class="flex items-center gap-2">
                <div class="p-1 bg-warning-100  items-center rounded-md flex">
                  <UIcon :name="SUBJECT_ICON" class="text-warning size-5" />
                </div>
                <span class="text-xs uppercase text-muted">Subjects</span>
              </div>
              <p class="mt-0.5 pl-1 text-xl font-bold">{{ teacher.subjects }}</p>
            </div>
            <div class="rounded-2xl border border-default p-3 bg-info-50">
              <div class="flex items-center gap-2">
                <div class="p-1 bg-info-100 items-center rounded-md flex">
                  <UIcon :name="CLASS_ICON" class="text-info size-5" />
                </div>
                <span class="text-xs uppercase text-muted">Classes</span>
              </div>
              <p class="mt-0.5 pl-1 text-xl font-bold">{{ teacher.classes }}</p>
            </div>
            <div class="rounded-2xl border border-default p-3 bg-error-50">
              <div class="flex items-center gap-2">
                <div class="p-1 bg-error-100 items-center rounded-md flex">
                  <UIcon :name="CLASS_ICON" class="text-error size-5" />
                </div>
                <span class="text-xs uppercase text-muted">Weeks</span>
              </div>
              <p class="mt-0.5 pl-1 text-xl font-bold">{{ teacher.completedWeeks }}/{{ teacher.totalWeeks }}</p>
            </div>
          </div>
        </div>
        <template #footer>
          <div class="flex flex-col gap-3 sm:flex-row">
            <UButton icon="i-lucide-eye" size="sm" :to="`/curriculums/teacher-progress/${teacher.id}`">
              View Progress
            </UButton>
          </div>
        </template>
      </UCard>

    </div>

    <!-- Empty -->
    <UCard v-else class="py-16">
      <div class="text-center">
        <UIcon name="i-lucide-users" class="text-5xl text-muted mx-auto" />
        <h3 class="mt-4 text-lg font-semibold">No teachers found</h3>
        <p class="text-sm text-muted mt-2">
          {{ teachers.length ? 'No teacher matches your search or filter.' : NO_ACTIVE_TEACHER }}
        </p>
      </div>
    </UCard>

  </div>
</template>

<script setup lang="ts">
const search = ref('')
const status = ref('')
const loading = ref(true)

const teachers = ref<TeacherProgress[]>([])
const NO_ACTIVE_TEACHER = 'No active teachers with subject assignments yet.'

const statuses = [
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'On Track', value: 'ON_TRACK' },
  { label: 'Behind Schedule', value: 'BEHIND' },
  { label: 'No Data Yet', value: 'NO_DATA' }
]

async function load() {
  loading.value = true
  try {
    teachers.value = await CurriculumsApi().getTeacherProgress() || []
  } finally {
    loading.value = false
  }
}

const filteredTeachers = computed(() => {
  return teachers.value.filter((teacher) => {
    const matchesSearch = teacher.name.toLowerCase().includes(search.value.toLowerCase())
    const matchesStatus = !status.value || teacher.status === status.value
    return matchesSearch && matchesStatus
  })
})

const totalTeachers = computed(() => teachers.value.length)

const completedTeachers = computed(
  () => teachers.value.filter(x => x.status === 'COMPLETED').length
)

const behindTeachers = computed(
  () => teachers.value.filter(x => x.status === 'BEHIND').length
)

const averageCoverage = computed(() => {
  if (!teachers.value.length) return 0
  const total = teachers.value.reduce((sum, item) => sum + item.coverage, 0)
  return Math.round(total / teachers.value.length)
})

function getStatusColor(status: TeacherProgressStatus) {
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

function getStatusLabel(status: TeacherProgressStatus) {
  switch (status) {
    case 'COMPLETED':
      return 'Completed'
    case 'ON_TRACK':
      return 'On Track'
    case 'BEHIND':
      return 'Behind Schedule'
    default:
      return 'No Data Yet'
  }
}

onMounted(() => {
  load()

  useAppStore().setTitle('Teacher Progress')
  useAppStore().setBack(false)
  document.title = 'Teacher Progress | Skultem'
})

definePageMeta({
  role: [
    Role.ADMIN,
    Role.PROPRIETOR,
    Role.OWNER
  ]
})
</script>
