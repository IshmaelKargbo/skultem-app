<template>
  <div class="space-y-4 md:px-6 px-4">

    <!-- Header -->
    <UCard>
      <div v-if="loading" class="flex items-center gap-4">
        <USkeleton class="size-16 rounded-full" />
        <div class="space-y-2">
          <USkeleton class="h-5 w-40" />
          <USkeleton class="h-4 w-56" />
        </div>
      </div>

      <div v-else-if="teacher" class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex items-center gap-4">
          <UAvatar size="2xl" :alt="teacher.name" />
          <div>
            <h1 class="text-lg font-bold">{{ teacher.name }}</h1>
            <p class="text-xs text-muted">
              {{ subjectNames || 'No subjects assigned yet' }}
            </p>
          </div>
        </div>

        <UBadge :label="getStatusLabel(teacher.status)" :color="getStatusColor(teacher.status)" />
      </div>
    </UCard>

    <template v-if="loading">
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <USkeleton v-for="i in 4" :key="i" class="h-24 rounded-2xl" />
      </div>
    </template>

    <template v-else-if="teacher">

      <!-- Statistics -->
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric :record="{
          icon: COVERAGE_ICON,
          label: 'Coverage',
          value: `${teacher.coverage}%`,
          isReady: !loading,
          color: 'success'
        }" />
        <Metric :record="{
          icon: SUBJECT_ICON,
          label: 'Subjects',
          value: teacher.subjects,
          isReady: !loading,
          color: 'warning'
        }" />
        <Metric :record="{
          icon: CLASS_ICON,
          label: 'Classes',
          value: teacher.classes,
          isReady: !loading,
          color: 'info'
        }" />
        <Metric :record="{
          icon: WEEKS_ICON,
          label: 'Pending Weeks',
          value: teacher.totalWeeks - teacher.completedWeeks,
          isReady: !loading,
          color: 'error'
        }" />
      </div>

      <div class="grid gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">

        <!-- LEFT SIDEBAR -->
        <div class="space-y-4 xl:sticky xl:top-6 self-start">
          <UCard class="overflow-hidden">
            <template #header>
              <div class="flex items-center gap-2">
                <div class="rounded-xl flex items-center bg-primary/10 p-2.5">
                  <UIcon name="i-lucide-user" class="text-primary size-5" />
                </div>

                <div>
                  <h3 class="font-semibold">Teacher Summary</h3>
                  <p class="text-xs-base text-muted">Curriculum activity overview</p>
                </div>
              </div>
            </template>

            <div class="grid gap-3">
              <div class="flex items-center justify-between rounded-xl border border-default p-3">
                <div class="flex items-center gap-3">
                  <div class="rounded-lg flex items-center bg-primary/10 p-2.5">
                    <UIcon :name="SUBJECT_ICON" class="text-primary size-5" />
                  </div>
                  <div>
                    <p class="text-xs text-muted">Subjects</p>
                    <p class="font-medium">Teaching Subjects</p>
                  </div>
                </div>
                <span class="text-xl font-bold">{{ teacher.subjects }}</span>
              </div>
              <div class="flex items-center justify-between rounded-xl border border-default p-3">
                <div class="flex items-center gap-3">
                  <div class="rounded-lg bg-success-500/10 flex p-2.5">
                    <UIcon :name="CLASS_ICON" class="text-success size-5" />
                  </div>
                  <div>
                    <p class="text-xs text-muted">Classes</p>
                    <p class="font-medium">Assigned Classes</p>
                  </div>
                </div>
                <span class="text-xl font-bold">{{ teacher.classes }}</span>
              </div>

              <div class="flex items-center justify-between rounded-xl border border-default p-3">
                <div class="flex items-center gap-3">
                  <div class="rounded-lg flex items-center bg-warning-50 p-2">
                    <UIcon :name="LESSON_PLAN_ICON" class="text-warning size-5" />
                  </div>
                  <div>
                    <p class="text-xs text-muted">Lesson Notes</p>
                    <p class="font-medium">Written this far</p>
                  </div>
                </div>
                <span class="text-xl font-bold">{{ teacher.lessonNotes }}</span>
              </div>
            </div>
          </UCard>

          <UCard>
            <template #header>
              <span class="font-semibold">Overall Progress</span>
            </template>

            <div class="flex justify-between mb-2">
              <span class="text-sm text-muted">Curriculum Coverage</span>
              <span class="font-semibold">{{ teacher.coverage }}%</span>
            </div>

            <UProgress :model-value="teacher.coverage" size="lg" />
          </UCard>

        </div>

        <!-- RIGHT CONTENT -->
        <div class="space-y-6">

          <UCard>
            <template #header>
              <span class="font-semibold">Subject Coverage</span>
            </template>

            <div v-if="teacher.subjectCoverage.length" class="space-y-6">
              <div v-for="subject in teacher.subjectCoverage" :key="subject.subject">
                <div class="flex justify-between mb-2">
                  <div>
                    <p class="font-medium">{{ subject.subject }}</p>
                    <p class="text-sm text-muted">{{ subject.classes }}</p>
                  </div>
                  <span class="font-semibold">{{ subject.coverage }}%</span>
                </div>

                <UProgress :model-value="subject.coverage" />
              </div>
            </div>

            <p v-else class="text-sm text-muted">No scheme of work assigned to this teacher yet.</p>
          </UCard>

        </div>

      </div>
    </template>

    <UCard v-else class="py-16">
      <div class="text-center">
        <UIcon name="i-lucide-user-x" class="text-5xl text-muted mx-auto" />
        <h3 class="mt-4 text-lg font-semibold">Teacher not found</h3>
      </div>
    </UCard>

  </div>
</template>
<script setup lang="ts">
const route = useRoute()

const loading = ref(true)
const teacher = ref<TeacherProgressDetail>()

const subjectNames = computed(
  () => teacher.value?.subjectCoverage.map(s => s.subject).join(', ') ?? ''
)

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

watch(
  () => route.params.id,
  async (teacherId) => {
    if (!teacherId) return

    loading.value = true
    teacher.value = undefined
    try {
      teacher.value = await CurriculumsApi().getTeacherProgressDetail(teacherId as string)
    } finally {
      loading.value = false
    }

    useAppStore().setTitle('Teacher Progress')
    useAppStore().setBack('/curriculums/teacher-progress')

    document.title = 'Teacher Progress | Skultem'
  },
  { immediate: true }
)

definePageMeta({
  role: [
    Role.ADMIN,
    Role.PROPRIETOR,
    Role.OWNER
  ]
})
</script>
