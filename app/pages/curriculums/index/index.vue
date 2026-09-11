<template>
  <div class="space-y-4 px-4 md:px-6">
    <!-- A parent has no use for the staff scheme-builder UI below (Quick Actions to create a
         scheme, teacher coverage cards, the full school/teacher scheme list) - they get a
         dedicated, read-only view of their own child's published curriculum instead. -->
    <CurriculumParentView v-if="can(Role.PARENT)" />

    <!-- Main Grid -->
    <div v-else class="grid gap-4 xl:grid-cols-3">
      <!-- Left column -->
      <div class="space-y-4 xl:sticky xl:top-6 self-start">

        <!-- Quick Actions -->
        <UCard :ui="{ body: 'space-y-2' }">
          <template #header>
            <div>
              <h3 class="font-semibold">
                Quick Actions
              </h3>

              <p class="text-sm text-muted">
                Frequently used actions.
              </p>
            </div>
          </template>

          <UButton v-for="action in quickActions" :key="action.label" block variant="soft" :color="action.color"
            :icon="action.icon" :label="action.label" :to="action.to" @click="action.onClick?.()" />
        </UCard>

        <!-- My Progress - teacher only: their own coverage (getTeacherProgress below is the
             school-wide admin view, restricted server-side to admin/owner/proprietor). -->
        <UCard v-if="can(Role.TEACHER)" class="overflow-hidden">
          <template #header>
            <div class="flex items-center gap-2">
              <div class="flex items-center rounded-xl bg-primary/10 p-2.5">
                <UIcon :name="COVERAGE_ICON" class="size-5 text-primary" />
              </div>

              <div>
                <h3 class="font-semibold">My Progress</h3>
                <p class="text-xs text-muted">Your curriculum coverage this term</p>
              </div>
            </div>
          </template>

          <div v-if="myProgressLoading" class="space-y-3">
            <USkeleton class="h-20 w-full rounded-2xl" />
            <USkeleton v-for="i in 2" :key="i" class="h-12 w-full rounded-xl" />
          </div>

          <div v-else-if="myProgress" class="space-y-3">
            <div class="rounded-2xl bg-gray-50 p-4 dark:bg-neutral-800">
              <div class="flex items-center justify-between">
                <p class="text-xs uppercase text-muted">Coverage</p>
                <span class="text-2xl font-bold text-primary">{{ myProgress.coverage }}%</span>
              </div>

              <UProgress :model-value="myProgress.coverage" class="mt-2" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="rounded-xl border border-default p-3 text-center">
                <p class="text-lg font-bold text-highlighted">{{ myProgress.subjects }}</p>
                <p class="text-xs text-muted">Subject{{ myProgress.subjects === 1 ? '' : 's' }}</p>
              </div>

              <div class="rounded-xl border border-default p-3 text-center">
                <p class="text-lg font-bold text-highlighted">{{ myProgress.classes }}</p>
                <p class="text-xs text-muted">Class{{ myProgress.classes === 1 ? '' : 'es' }}</p>
              </div>
            </div>

            <div class="flex items-center justify-between rounded-xl border border-default p-3">
              <div class="flex items-center gap-2">
                <UIcon :name="CHECK_ICON" class="size-4 text-success" />
                <span class="text-sm text-muted">Weeks Completed</span>
              </div>
              <span class="font-semibold">{{ myProgress.completedWeeks }}/{{ myProgress.totalWeeks }}</span>
            </div>
          </div>

          <div v-else class="py-6 text-center">
            <UIcon :name="COVERAGE_ICON" class="mx-auto text-3xl text-muted" />
            <p class="mt-2 text-sm text-muted">No coverage data yet.</p>
          </div>
        </UCard>

        <!-- Coverage Overview - admin/owner only: getTeacherProgress() is restricted server-side -->
        <UCard v-if="isAdmin" class="overflow-hidden">
          <template #header>
            <div class="flex items-center gap-2">
              <div class="flex items-center rounded-xl bg-primary/10 p-2.5">
                <UIcon :name="COVERAGE_ICON" class="size-5 text-primary" />
              </div>

              <div>
                <h3 class="font-semibold">Coverage Overview</h3>
                <p class="text-xs text-muted">How teachers are tracking this term</p>
              </div>
            </div>
          </template>

          <div v-if="overviewLoading" class="space-y-3">
            <USkeleton class="h-20 w-full rounded-2xl" />
            <USkeleton v-for="i in 3" :key="i" class="h-12 w-full rounded-xl" />
          </div>

          <div v-else-if="teacherProgress.length" class="space-y-3">
            <div class="rounded-2xl bg-gray-50 p-4 dark:bg-neutral-800">
              <div class="flex items-center justify-between">
                <p class="text-xs uppercase text-muted">Average Coverage</p>
                <span class="text-2xl font-bold text-primary">{{ averageCoverage }}%</span>
              </div>

              <UProgress :model-value="averageCoverage" class="mt-2" />
            </div>

            <div class="flex items-center justify-between rounded-xl border border-default p-3">
              <div class="flex items-center gap-2">
                <UIcon :name="CHECK_ICON" class="size-4 text-success" />
                <span class="text-sm text-muted">Completed</span>
              </div>
              <span class="font-semibold">{{ completedTeachers }}</span>
            </div>

            <div class="flex items-center justify-between rounded-xl border border-default p-3">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-clock" class="size-4 text-warning" />
                <span class="text-sm text-muted">On Track</span>
              </div>
              <span class="font-semibold">{{ onTrackTeachers }}</span>
            </div>

            <div class="flex items-center justify-between rounded-xl border border-default p-3">
              <div class="flex items-center gap-2">
                <UIcon :name="PENDING_ICON" class="size-4 text-error" />
                <span class="text-sm text-muted">Behind Schedule</span>
              </div>
              <span class="font-semibold">{{ behindTeachers }}</span>
            </div>

            <UButton block variant="ghost" color="neutral" size="sm" trailing-icon="i-lucide-arrow-right"
              label="View Teacher Progress" to="/curriculums/teacher-progress" />
          </div>

          <div v-else class="py-6 text-center">
            <UIcon :name="TEACHER_ICON" class="mx-auto text-3xl text-muted" />
            <p class="mt-2 text-sm text-muted">No teacher coverage data yet.</p>
          </div>
        </UCard>
      </div>

      <CurriculumSchemeOfWorkSchemes :key="schemesKey" :mine="!isAdmin" />
    </div>

    <CurriculumBulkUploadModal v-model:open="showBulkUpload" @uploaded="onBulkUploaded" />
  </div>
</template>

<script setup lang="ts">
const { can } = useAuth()

const showBulkUpload = ref(false)
const schemesKey = ref(0)

// CurriculumSchemeOfWorkSchemes owns its own fetch on mount - bump a key to remount it (and the
// overview cards) after a bulk upload actually created something, rather than reaching into its
// internals.
function onBulkUploaded() {
  schemesKey.value++
  if (isAdmin.value) loadOverview()
}

const isAdmin = computed(() => can([Role.ADMIN, Role.PROPRIETOR, Role.OWNER]))

const teacherProgress = ref<TeacherProgress[]>([])
const overviewLoading = ref(true)

const completedTeachers = computed(() => teacherProgress.value.filter(t => t.status === 'COMPLETED').length)
const onTrackTeachers = computed(() => teacherProgress.value.filter(t => t.status === 'ON_TRACK').length)
const behindTeachers = computed(() => teacherProgress.value.filter(t => t.status === 'BEHIND').length)

const averageCoverage = computed(() => {
  if (!teacherProgress.value.length) return 0
  const total = teacherProgress.value.reduce((sum, t) => sum + t.coverage, 0)
  return Math.round(total / teacherProgress.value.length)
})

async function loadOverview() {
  overviewLoading.value = true
  try {
    teacherProgress.value = await CurriculumsApi().getTeacherProgress() || []
  } finally {
    overviewLoading.value = false
  }
}

const myProgress = ref<TeacherProgressDetail | undefined>()
const myProgressLoading = ref(true)

async function loadMyProgress() {
  myProgressLoading.value = true
  try {
    myProgress.value = await CurriculumsApi().getMyTeacherProgress()
  } finally {
    myProgressLoading.value = false
  }
}

onMounted(async () => {
  useAppStore().setTitle(can(Role.PARENT) ? 'Curriculum' : 'Scheme of Work')
  useAppStore().setBack(false)
  document.title = `${can(Role.PARENT) ? 'Curriculum' : 'Scheme of Work'} | Skultem`

  if (isAdmin.value) loadOverview()
  else if (can(Role.TEACHER)) loadMyProgress()
})

definePageMeta({
  role: [
    Role.ADMIN,
    Role.PROPRIETOR,
    Role.OWNER,
    Role.TEACHER,
    Role.PARENT
  ]
})

type QuickAction = {
  label: string
  icon: string
  color: 'neutral' | 'primary'
  to?: string
  onClick?: () => void
}

const quickActions = computed(() => {
  const actions: QuickAction[] = [
    { label: 'Subjects', icon: 'i-lucide-book-open', to: '/subjects', color: 'neutral' }
  ]

  if (isAdmin.value) {
    // Teacher Progress is otherwise only reachable via the Coverage Overview card below, which
    // needs teacherProgress to finish loading (and have data) before its own button renders -
    // this gives admins/owners a direct, always-present way in.
    actions.push({ label: 'Teacher Progress', icon: COVERAGE_ICON, to: '/curriculums/teacher-progress', color: 'neutral' })
    actions.push({ label: 'Bulk Upload', icon: 'i-lucide-upload', color: 'neutral', onClick: () => { showBulkUpload.value = true } })
    actions.unshift({ label: 'Create Scheme', icon: 'i-lucide-book-plus', to: '/curriculums/add', color: 'primary' })
  }

  return actions
})
</script>
