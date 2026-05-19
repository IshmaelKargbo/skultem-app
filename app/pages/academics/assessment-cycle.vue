<template>
  <div class="md:p-7 overflow-y-auto p-4 h-full md:space-y-5 space-y-3">
    <UCard>
      <template #header>
        <p class="text-xs uppercase tracking-wide text-slate-500">Assessment stage control</p>
      </template>
      <template #footer>
        <div class="space-y-3">
          <p class="text-xs text-slate-500">
            Moves the term from current assessment to the next one. Allowed only when all class assessments for the
            current stage are approved.
          </p>
          <div class="flex flex-wrap gap-2">
            <UButton label="Move to Next Assessment" icon="i-lucide-arrow-right-circle" color="warning"
              variant="outline" :loading="isAdvancingAssessment" :disabled="!selectedTermId"
              @click="advanceAssessmentStage" />
            <UButton label="Manage Terms" icon="i-lucide-calendar" color="neutral" variant="outline"
              to="/settings/terms" />
            <UButton label="Manage Templates" icon="i-lucide-clipboard-list" color="neutral" variant="outline"
              to="/settings/assessment-templates" />
          </div>
        </div>
      </template>
    </UCard>

    <div v-if="loadError"
      class="mt-4 rounded-xl dark:bg-gray-950 dark:border-red-600 border border-red-200 bg-red-50 p-3 text-sm text-red-700">
      {{ loadError }}
    </div>

    <div class="grid gap-5 mt-5 lg:grid-cols-3">
      <UCard class="lg:col-span-1">
        <template #header>
          <div class="flex items-center justify-between gap-3">
            <div>
              <p class="text-base font-medium">Class Cycle Status</p>
              <p class="text-xs text-muted">Control every class setup from one place.</p>
            </div>
            <UBadge variant="subtle" color="neutral" :label="`${filteredClasses.length} class(es)`" />
          </div>
        </template>
        <div>
          <UInput v-model="search" icon="i-lucide-search" placeholder="Search class..." />
          <div v-if="isLoadingOverview" class="mt-3 space-y-2">
            <USkeleton v-for="i in 4" :key="i" class="h-20 w-full" />
          </div>

          <div v-else class="mt-3 space-y-2 max-h-140 overflow-auto pr-1">
            <button v-for="item in filteredClasses" :key="item.classId"
              class="w-full text-left rounded-xl cursor-pointer border-2 p-3.5 transition"
              :class="selectedClassId === item.classId ? 'bg-primary-200 dark:border-primary-600 dark:bg-gray-950 border-app-100' : 'border-gray-200 bg-white  dark:bg-gray-900 dark:border-gray-700 dark:hover:border-primary-600 hover:border-gray-300'"
              @click="selectClass(item.classId)">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <p class="text-sm font-medium">{{ item.className }}</p>
                  <p class="text-xs text-muted">{{ item.templateName || 'No template assigned' }}</p>
                </div>
                <UBadge :color="item.ready ? 'success' : 'warning'" variant="subtle"
                  :label="item.ready ? 'Ready' : 'Fix'" />
              </div>

              <div class="mt-2 flex items-center justify-between text-xs text-muted">
                <p>{{ item.assessmentCount }} assessment(s)</p>
                <p>{{ item.totalWeight }}%</p>
              </div>
              <p class="mt-1 text-xs" :class="item.ready ? 'text-success-600' : 'text-warning-700'">{{ item.note }}</p>
            </button>

            <div v-if="!filteredClasses.length"
              class="rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 p-4 text-sm text-muted text-center">
              No class matched your search.
            </div>
          </div>
        </div>
      </UCard>
      <UCard class="lg:col-span-2">
        <template #header>
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-lg font-normal">Selected Class Assessment Cycle</p>
              <p class="text-xs text-muted">Detailed assessment order for the selected class template.</p>
            </div>
            <UBadge :variant="'outline'" :color="activeTerm ? 'success' : 'warning'"
              :icon="activeTerm ? 'i-lucide-check-circle' : 'i-lucide-alert-circle'"
              :label="activeTerm ? 'Active term set' : 'No active term'" />
          </div>
        </template>
        <div>
          <div class="mt-4 rounded-xl border-2 dark:border-gray-700 border-gray-200 bg-gray-50 dark:bg-gray-950 p-4">
            <p class="text-xs uppercase tracking-wide text-muted">Active Term</p>
            <p class="mt-1 text-xl font-semibold">{{ activeTerm?.name || 'Not configured' }}</p>
            <p class="mt-1 text-sm text-muted">{{ academicPeriod }}</p>
          </div>
          <div class="mt-4 grid gap-4 sm:grid-cols-2">
            <div class="rounded-xl border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-950 p-3">
              <p class="text-xs uppercase tracking-wide">Template in use</p>
              <p class="mt-1 text-sm font-semibold text-muted">{{ cycle?.templateName || 'No template' }}</p>
              <p class="mt-1 text-xs text-slate-500">{{ templateDescription }}</p>
            </div>

            <div class="rounded-xl border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-950 p-3 space-y-2">
              <div class="flex items-center justify-between text-sm">
                <p>Assessments</p>
                <UBadge variant="subtle" color="neutral" :label="`${assessmentItems.length}`" />
              </div>
              <div class="flex items-center justify-between text-sm">
                <p class="text-muted">Total weight</p>
                <UBadge :variant="'subtle'"
                  :color="totalWeight === 100 ? 'success' : totalWeight > 100 ? 'error' : 'warning'"
                  :label="`${totalWeight}%`" />
              </div>
            </div>
          </div>

          <div v-if="isLoadingCycle" class="mt-4 space-y-2">
            <USkeleton v-for="i in 3" :key="`cycle-${i}`" class="h-14 w-full" />
          </div>

          <div v-else class="mt-4">
            <div class="flex items-center justify-between">
              <p class="text-sm font-medium">Assessment Sequence</p>
              <p class="text-xs text-muted">{{ assessmentItems.length }} step(s)</p>
            </div>

            <div v-if="assessmentItems.length" class="mt-3 space-y-3">
              <div v-for="(assessment, index) in assessmentItems" :key="assessment.id"
                class="rounded-xl border-2 border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-950 px-3 py-2 flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <span
                    class="h-7 w-7 rounded-full bg-primary-50 dark:bg-gray-900 text-primary-700 text-xs font-semibold grid place-content-center">
                    {{ index + 1 }}
                  </span>
                  <div>
                    <p class="text-sm font-medium">{{ toOrdinal(index + 1) }} Assessment - {{
                      assessment.name }}</p>
                    <p class="text-xs text-muted">Weight: {{ assessment.weight }}%</p>
                  </div>
                </div>
                <UBadge variant="outline" :color="parseAssessmentStatusColor[assessment.status]"
                  :label="parseAssessmentStatus[assessment.status]" />
              </div>
            </div>

            <div v-else class="mt-3 rounded-lg border-2 dark:border-gray-700 border-dashed border-slate-300 p-5 text-center">
              <p class="text-sm text-slate-600">No assessments found for this class template.</p>
              <p class="text-xs text-slate-500 mt-1">Add assessments in Settings -> Assessment Templates.</p>
            </div>
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
  document.title = 'Assessment Cycle | Settings | Skultem'
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
