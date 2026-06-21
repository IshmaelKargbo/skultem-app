<template>
  <div class="p-4 sm:p-6  overflow-y-auto h-full space-y-4 sm:space-y-5">
    <!-- Hero -->
    <UCard class="overflow-hidden">
      <div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p class="text-sm font-medium text-primary"> Assessment Cycle Management </p>
          <h1 class="mt-2 text-3xl font-bold"> Assessment Workflow </h1>
          <p class="mt-2 text-sm text-muted"> Monitor assessment progress and control transitions between assessment
            stages. </p>
        </div>
        <div class="flex flex-wrap gap-3">
          <UButton icon="i-lucide-arrow-right-circle" color="warning" :loading="isAdvancingAssessment"
            :disabled="!selectedTermId" @click="advanceAssessmentStage"> Move To Next Assessment </UButton>
          <UButton icon="i-lucide-calendar" variant="outline" to="/settings/terms"> Terms </UButton>
          <UButton icon="i-lucide-clipboard-list" variant="outline" to="/settings/assessment-templates"> Templates
          </UButton>
        </div>
      </div>
    </UCard>

    <div v-if="loadError"
      class="mt-4 rounded-xl dark:bg-gray-950 dark:border-red-600 border border-red-200 bg-red-50 p-3 text-sm text-red-700">
      {{ loadError }}
    </div>

    <!-- Stats -->
    <div class="grid gap-4 md:grid-cols-3">

      <!-- Active Term -->
      <div
        class="group rounded-3xl border border-primary-200/40 bg-white p-6 hover:shadow-sm dark:border-primary-900">
        <div class="flex items-start justify-between">

          <div>
            <p class="text-xs font-medium uppercase tracking-wider text-muted">
              Active Term
            </p>

            <h3 class="mt-2 text-xl font-bold">
              {{ activeTerm?.name || 'Not configured' }}
            </h3>
          </div>

          <div class="flex size-14 items-center justify-center rounded-2xl bg-primary-500/15">
            <UIcon name="i-lucide-calendar" class="text-2xl text-primary" />
          </div>

        </div>

        <div class="mt-6 border-t border-primary-200/30 pt-4">
          <p class="text-sm text-muted">
            this term is active now
          </p>
        </div>
      </div>

      <!-- Template -->
      <div
        class="group rounded-3xl border border-blue-200/40 bg-white p-6  hover:shadow-sm dark:border-blue-900">
        <div class="flex items-start justify-between">

          <div>
            <p class="text-xs font-medium uppercase tracking-wider text-muted">
              Template In Use
            </p>

            <h3 class="mt-2 text-xl font-bold">
              {{ cycle?.templateName || 'No Template' }}
            </h3>
          </div>

          <div class="flex size-14 items-center justify-center rounded-2xl bg-blue-500/15">
            <UIcon name="i-lucide-layout-template" class="text-2xl text-blue-600" />
          </div>

        </div>

        <div class="mt-6 border-t border-blue-200/30 pt-4">
          <p class="line-clamp-2 text-sm text-muted">
            {{ templateDescription }}
          </p>
        </div>
      </div>

      <!-- Weight -->
      <div
        class="group rounded-3xl border border-emerald-200/40 bg-white p-6  hover:shadow-sm dark:border-emerald-900">
        <div class="flex items-start justify-between">

          <div>
            <p class="text-xs font-medium uppercase tracking-wider text-muted">
              Total Weight
            </p>

            <h3 class="mt-2 text-3xl font-bold">
              {{ totalWeight }}%
            </h3>
          </div>

          <div class="flex size-14 items-center justify-center rounded-2xl bg-emerald-500/15">
            <UIcon name="i-lucide-chart-pie" class="text-2xl text-emerald-600" />
          </div>

        </div>

        <div class="mt-6 space-y-3">

          <div class="flex items-center justify-between text-xs">
            <span class="text-muted">Completion</span>

            <UBadge variant="soft" :color="totalWeight === 100
              ? 'success'
              : totalWeight > 100
                ? 'error'
                : 'warning'
              ">
              {{
                totalWeight === 100
                  ? 'Balanced'
                  : totalWeight > 100
                    ? 'Exceeded'
                    : 'Incomplete'
              }}
            </UBadge>
          </div>

          <UProgress :model-value="totalWeight" size="md" :color="totalWeight === 100
            ? 'success'
            : totalWeight > 100
              ? 'error'
              : 'warning'
            " />

        </div>
      </div>

    </div>

    <div class="grid gap-5  lg:grid-cols-3">

      <div>
        <UCard class="lg:col-span-1 h-fit sticky top-1 rounded-3xl">

          <template #header>
            <div class="space-y-4">

              <div class="flex items-center justify-between">

                <div>
                  <h2 class="text-lg font-semibold">
                    Class Cycle Status
                  </h2>

                  <p class="text-sm text-muted">
                    Monitor assessment readiness for each class.
                  </p>
                </div>

                <UBadge variant="soft" color="primary">
                  {{ filteredClasses.length }}
                </UBadge>

              </div>

              <UInput v-model="search" icon="i-lucide-search" placeholder="Search class..." />

            </div>
          </template>

          <!-- Loading -->
          <div v-if="isLoadingOverview" class="space-y-3">
            <USkeleton v-for="i in 5" :key="i" class="h-28 rounded-3xl" />
          </div>

          <!-- Classes -->
          <div v-else class="space-y-3 max-h-[700px] overflow-y-auto pr-1">

            <button v-for="item in filteredClasses" :key="item.classId"
              class="group w-full rounded-3xl border p-5 text-left transition-all duration-200" :class="selectedClassId === item.classId
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-default hover:border-primary/40 hover:bg-muted/30'
                " @click="selectClass(item.classId)">

              <!-- Top -->
              <div class="flex items-start justify-between">

                <div class="flex gap-3">

                  <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                    <UIcon name="i-lucide-school" class="text-xl text-primary" />
                  </div>

                  <div>

                    <h3 class="font-semibold">
                      {{ item.className }}
                    </h3>

                    <p class="mt-1 text-xs text-muted">
                      {{ item.templateName || 'No Template Assigned' }}
                    </p>

                  </div>

                </div>

                <UBadge :color="item.ready ? 'success' : 'warning'" variant="soft">
                  {{ item.ready ? 'Ready' : 'Attention' }}
                </UBadge>

              </div>

            </button>

            <!-- Empty -->
            <div v-if="!filteredClasses.length"
              class="flex flex-col items-center justify-center rounded-3xl border border-dashed py-12">

              <UIcon name="i-lucide-search-x" class="mb-3 text-4xl text-muted" />

              <p class="text-sm text-muted">
                No classes matched your search
              </p>

            </div>

          </div>

        </UCard>

      </div>


      <UCard class="lg:col-span-2 shadow-sm">
        <template #header>
          <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 class="text-lg font-semibold">
                Assessment Cycle
              </h2>

              <p class="mt-1 text-sm text-muted">
                Assessment stages and progression for the selected class.
              </p>
            </div>

            <UBadge variant="soft" :color="activeTerm ? 'success' : 'warning'" :icon="activeTerm
              ? 'i-lucide-check-circle'
              : 'i-lucide-alert-circle'">
              {{ activeTerm ? 'Active Term' : 'No Active Term' }}
            </UBadge>
          </div>
        </template>

        <div class="space-y-6">
          <!-- Sequence Header -->
          <div class="flex items-center justify-between">
            <div>

              <h3 class="font-semibold">
                Assessment Sequence
              </h3>

              <p class="text-sm text-muted">
                {{ assessmentItems.length }} assessment stages
              </p>

            </div>

            <UBadge variant="soft" color="neutral">
              {{ assessmentItems.length }} Steps
            </UBadge>
          </div>

          <!-- Loading -->
          <div v-if="isLoadingCycle" class="space-y-3">
            <USkeleton v-for="i in 4" :key="i" class="h-20 rounded-3xl" />
          </div>

          <!-- Timeline -->
          <div v-else-if="assessmentItems.length" class="space-y-4">
            <div v-for="(assessment, index) in assessmentItems" :key="assessment.id"
              class="group relative overflow-hidden rounded-3xl border  border-default bg-gray-50 p-5 transition hover:border-primary/40 hover:shadow-sm dark:bg-neutral-900">
              <div class="flex items-start justify-between gap-4">

                <div class="flex gap-4">

                  <div class="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    {{ index + 1 }}
                  </div>

                  <div>

                    <h4 class="font-semibold">
                      {{ toOrdinal(index + 1) }}
                      Assessment
                    </h4>

                    <p class="mt-1 text-sm text-muted">
                      {{ assessment.name }}
                    </p>

                    <div class="mt-3 flex items-center gap-2">
                      <UIcon name="i-lucide-percent" class="text-muted" />

                      <span class="text-sm">
                        Weight:
                        <strong>{{ assessment.weight }}%</strong>
                      </span>
                    </div>

                  </div>

                </div>

                <UBadge variant="soft" :color="parseAssessmentStatusColor[assessment.status]">
                  {{ parseAssessmentStatus[assessment.status] }}
                </UBadge>

              </div>
            </div>
          </div>

          <!-- Empty -->
          <div v-else class="rounded-3xl border border-dashed border-default py-16 text-center">
            <div
              class="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-gray-100 dark:bg-neutral-800">
              <UIcon name="i-lucide-clipboard-list" class="text-2xl text-muted" />
            </div>

            <h3 class="font-medium">
              No Assessments Found
            </h3>

            <p class="mt-2 text-sm text-muted">
              Add assessments in Settings → Assessment Templates.
            </p>
          </div>

        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
const appStore = useAppStore()
const assessmentStore = useAssessmentStore()
const termStore = useTermStore()
const route = useRoute()
const router = useRouter()
const { error: toastError, success: toastSuccess, warning } = useNotify()

const overview = ref<AssessmentCycleOverview | null>(null)
const cycle = ref<ActiveAssessmentCycle | null>(null)
const search = ref('')
const loadError = ref('')
const loading = ref(false)
const isRefreshing = ref(false)
const isLoadingOverview = ref(false)
const isLoadingCycle = ref(false)
const isAdvancingAssessment = ref(false)

const academicPeriod = computed(() => activeTerm ? `${formatDate(activeTerm.startDate)} - ${formatDate(activeTerm.endDate)}` : 'Set one term to ACTIVE to start assessment entry.')
const templateDescription = computed(() => cycle?.templateDescription || 'Assign a template to this class first.')

const selectedTermId = ref('')
const selectedTemplateId = ref('')
const gradingBands = ref<GradeBand[]>([])

const parseAssessmentStatus: Record<string, string> = {
  COMPLETED: "Completed",
  ACTIVE: "Active",
  INACTIVE: "Inactive"
}

const parseAssessmentStatusColor: Record<string, string> = {
  COMPLETED: "success",
  ACTIVE: "info",
  INACTIVE: "neutral"
}

const selectedClassId = computed(() => {
  const value = route.query.classId
  return typeof value === 'string' && value.trim().length ? value : ''
})

const selectedClass = computed(() => (overview.value?.classes || []).find((item) => item.classId === selectedClassId.value) || null)

const filteredClasses = computed(() => {
  const all = overview.value?.classes || []
  if (!search.value.trim()) return all

  const q = search.value.toLowerCase().trim()
  return all.filter((item) => item.className.toLowerCase().includes(q) || (item.templateName || '').toLowerCase().includes(q))
})

const activeTerm = computed(() => cycle.value?.activeTerm || overview.value?.activeTerm || null)
const assessmentItems = computed(() => cycle.value?.assessments || [])
const totalWeight = computed(() => cycle.value?.totalWeight || 0)

function toOrdinal(index: number) {
  const remainder = index % 100
  if (remainder >= 11 && remainder <= 13) return `${index}th`

  switch (index % 10) {
    case 1:
      return `${index}st`
    case 2:
      return `${index}nd`
    case 3:
      return `${index}rd`
    default:
      return `${index}th`
  }
}

function selectClass(classId: string) {
  router.replace({
    query: {
      ...route.query,
      classId
    }
  })
}

function syncSelectionsFromData() {
  if (overview.value?.activeTerm?.id) {
    selectedTermId.value = overview.value.activeTerm.id
  }

  if (selectedClass.value?.templateId) {
    selectedTemplateId.value = selectedClass.value.templateId
  } else {
    selectedTemplateId.value = ''
  }
}

async function loadOverview() {
  isLoadingOverview.value = true
  loadError.value = ''

  try {
    overview.value = await assessmentStore.fetchCycleOverview() || null

    if (!overview.value) {
      throw new Error(assessmentStore.error || 'Failed to load assessment overview')
    }

    if (!selectedClassId.value && overview.value?.classes?.length) {
      selectClass(overview.value.classes[0].classId)
    }

    syncSelectionsFromData()
  } catch (error: any) {
    loadError.value = error?.message || 'Failed to load assessment overview'
  } finally {
    isLoadingOverview.value = false
  }
}

async function loadCycle() {
  if (!selectedClassId.value) {
    cycle.value = null
    return
  }

  isLoadingCycle.value = true
  loadError.value = ''

  try {
    cycle.value = await assessmentStore.fetchActiveCycle(selectedClassId.value) || null

    if (!cycle.value) {
      throw new Error(assessmentStore.error || 'Failed to load class assessment cycle')
    }
  } catch (error: any) {
    loadError.value = error?.message || 'Failed to load class assessment cycle'
  } finally {
    isLoadingCycle.value = false
  }
}

async function loadSupportData() {
  await Promise.all([
    termStore.fetchAll(1, 0),
    assessmentStore.fetchAll(1, 0)
  ])
}

async function loadGradingScale() {
  try {
    const res = await assessmentStore.fetchGradingScale()
    gradingBands.value = (res?.bands || []).map(band => ({ ...band }))
  } catch (error: any) {
    gradingBands.value = []
    toastError(error?.message || 'Failed to load grading scale')
  }
}


async function advanceAssessmentStage() {
  if (!selectedTermId.value) return

  isAdvancingAssessment.value = true
  try {
    const res = await assessmentStore.advanceCycle(selectedTermId.value)

    if (!res) {
      throw new Error(assessmentStore.error || 'Failed to advance assessment stage')
    }

    toastSuccess(res.message || 'Assessment stage updated')

    await refreshAll()
  } catch (error: any) {
    toastError(error?.message || 'Failed to advance assessment stage')
  } finally {
    isAdvancingAssessment.value = false
  }
}

async function refreshAll() {
  isRefreshing.value = true
  try {
    await Promise.all([
      loadSupportData(),
      loadOverview(),
      loadGradingScale()
    ])
    await loadCycle()
  } finally {
    isRefreshing.value = false
  }
}

onMounted(async () => {
  appStore.setTitle('Assessment Cycle')
  document.title = 'Assessment Cycle | Academics | Skultem'
  loading.value = true
  await refreshAll()
  loading.value = false
})

watch(() => selectedClassId.value, async () => {
  syncSelectionsFromData()
  await loadCycle()
})

definePageMeta({
  role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER]
})
</script>
