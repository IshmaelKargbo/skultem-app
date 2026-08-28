<template>
  <div class="px-4 md:px-6 space-y-4">
    <Heading title="Assessment Cycle"
      subtitle="Monitor assessment progress and control transitions between assessment stages">
      <UBadge v-if="allTermsCompleted" variant="soft" color="success" size="lg">
        All terms completed for this year
      </UBadge>
      <UTooltip v-else text="Advances every class on the selected term at once - not just the class you're viewing.">
        <UButton icon="i-lucide-arrow-right-circle" color="warning" :loading="isAdvancingAssessment"
          :disabled="!selectedTermId || isRefreshing" @click="advanceAssessmentStage">
          Move To Next Assessment
        </UButton>
      </UTooltip>
    </Heading>

    <UAlert v-if="loadError" color="error" variant="soft" icon="i-lucide-alert-circle" :description="loadError" />

    <!-- Stats -->
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <Metric :record="{
        color: 'info',
        icon: CALANDA_ICON,
        label: 'Active Term',
        value: activeTerm?.name || 'Not configured',
        isReady: !loading
      }" />
      <Metric :record="{
        color: 'warning',
        icon: TEMPLATE_ICON,
        label: 'Template In Use',
        value: cycle?.templateName || 'No Template',
        isReady: !loading
      }" />
      <Metric :record="{
        color: notReadyClasses > 0 ? 'warning' : 'success',
        icon: 'i-lucide-list-checks',
        label: 'Classes Ready',
        value: `${readyClasses}/${totalClasses}`,
        subtle: notReadyClasses > 0 ? `${notReadyClasses} need attention` : undefined,
        subtileColor: 'warning',
        isReady: !loading
      }" />
    </div>

    <div class="grid gap-5 lg:grid-cols-3">

      <div>
        <UCard class="lg:col-span-1 h-fit sticky top-1">

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
            <USkeleton v-for="i in 5" :key="i" class="h-28 rounded-xl" />
          </div>

          <!-- Classes -->
          <div v-else class="space-y-3 max-h-175 overflow-y-auto pr-1">
            <button v-for="item in filteredClasses" :key="item.classId"
              class="group w-full rounded-xl border-2 p-4 text-left transition-all duration-200" :class="selectedClassId === item.classId
                ? 'border-secondary bg-secondary/5 shadow-sm'
                : 'border-default hover:border-secondary/40 hover:bg-muted/30'
                " @click="selectClass(item.classId)">

              <!-- Top -->
              <div class="flex items-start justify-between">

                <div class="flex gap-3">

                  <div class="flex size-10 items-center justify-center rounded-xl bg-secondary/10">
                    <UIcon :name="CLASS_ICON" class="size-5 text-secondary" />
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

                <UBadge :color="item.ready ? 'success' : 'warning'" variant="soft"
                  :icon="item.templateLocked ? 'i-lucide-lock' : undefined">
                  {{ item.ready ? 'Ready' : 'Attention' }}
                </UBadge>

              </div>

              <!-- Why it needs attention -->
              <p v-if="!item.ready" class="mt-3 flex items-start gap-1.5 text-xs text-warning">
                <UIcon name="i-lucide-alert-triangle" class="mt-0.5 shrink-0" />
                {{ item.note }}
              </p>

            </button>

            <!-- Empty -->
            <div v-if="!filteredClasses.length"
              class="flex flex-col items-center justify-center rounded-xl border border-dashed py-12">

              <UIcon name="i-lucide-search-x" class="mb-3 text-4xl text-muted" />

              <p class="text-sm text-muted">
                No classes matched your search
              </p>

            </div>

          </div>

        </UCard>

      </div>


      <UCard class="lg:col-span-2">
        <template #header>
          <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 class="text-base font-semibold">
                Assessment Cycle
              </h2>

              <p class="text-xs text-muted">
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
            <USkeleton v-for="i in 4" :key="i" class="h-20 rounded-xl" />
          </div>

          <!-- Timeline -->
          <div v-else-if="assessmentItems.length" class="space-y-4">
            <div v-for="(assessment, index) in assessmentItems" :key="assessment.id"
              class="group relative overflow-hidden rounded-xl border border-default bg-elevated/40 p-3">
              <div class="flex items-center justify-between gap-3">

                <div class="flex gap-3">
                  <div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 border border-primary-200 text-primary">
                    {{ index + 1 }}
                  </div>

                  <div>

                    <h4 class="font-semibold">
                      {{ toOrdinal(index + 1) }}
                      Assessment
                    </h4>

                    <p class="text-xs text-muted">
                      <span>{{ assessment.name }}</span> <span>-</span> <span>
                        Weight:
                        <strong>({{ assessment.weight }}%)</strong>
                      </span>
                    </p>

                    <div class="mt-3 flex items-center gap-2">

                    </div>

                  </div>

                </div>

                <UBadge variant="soft" size="lg" :color="assessmentStatusColor(assessment.status)">
                  {{ assessmentStatusLabel(assessment.status) }}
                </UBadge>

              </div>
            </div>
          </div>

          <!-- Empty -->
          <div v-else class="rounded-xl border border-dashed border-default py-16 text-center">
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

const selectedTermId = ref('')

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

// Statuses the cycle endpoint doesn't currently send fall back to a neutral "Pending" badge
// instead of rendering blank, so an unrecognised value can't disappear from the timeline.
function assessmentStatusLabel(status: string) {
  return parseAssessmentStatus[status] || 'Pending'
}

function assessmentStatusColor(status: string) {
  return parseAssessmentStatusColor[status] || 'neutral'
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

// ResolveActiveTermUseCase (backend) only ever hands back a CLOSED term as "active" once every
// term in the academic year has been closed out - so this is the signal that there's nothing
// left to advance, school-wide.
const allTermsCompleted = computed(() => activeTerm.value?.status === 'CLOSED')

const totalClasses = computed(() => overview.value?.totalClasses ?? 0)
const readyClasses = computed(() => overview.value?.readyClasses ?? 0)
const notReadyClasses = computed(() => overview.value?.notReadyClasses ?? 0)

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
  return router.replace({
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
      // Awaited so the class query param lands before loadCycle() (called right after this in
      // refreshAll) reads selectedClassId - otherwise the very first cycle fetch races the
      // still-pending navigation and silently loads nothing.
      await selectClass(overview.value.classes[0].classId)
    }

    syncSelectionsFromData()
  } catch (error: any) {
    loadError.value = error?.message || 'Failed to load assessment overview'
  } finally {
    isLoadingOverview.value = false
  }
}

// Bumped on every call so a slower, now-stale request can't overwrite the screen with data for
// a class the user has since clicked away from.
let cycleRequestId = 0

async function loadCycle() {
  const requestId = ++cycleRequestId

  if (!selectedClassId.value) {
    cycle.value = null
    return
  }

  isLoadingCycle.value = true
  loadError.value = ''

  try {
    const result = await assessmentStore.fetchActiveCycle(selectedClassId.value) || null
    if (requestId !== cycleRequestId) return

    cycle.value = result

    if (!cycle.value) {
      throw new Error(assessmentStore.error || 'Failed to load class assessment cycle')
    }
  } catch (error: any) {
    if (requestId !== cycleRequestId) return
    loadError.value = error?.message || 'Failed to load class assessment cycle'
  } finally {
    if (requestId === cycleRequestId) {
      isLoadingCycle.value = false
    }
  }
}

async function loadSupportData() {
  await Promise.all([
    termStore.fetchAll(1, 0),
    assessmentStore.fetchAll(1, 0)
  ])
}

async function advanceAssessmentStage() {
  if (!selectedTermId.value) return

  isAdvancingAssessment.value = true
  try {
    const res = await assessmentStore.advanceCycle(selectedTermId.value)

    if (!res) {
      throw new Error(assessmentStore.error || 'Failed to advance assessment stage')
    }

    if (res.advanced) {
      toastSuccess(res.message || 'Assessment stage updated')
    } else {
      // e.g. "All assessments are already completed for this term" - nothing actually moved.
      warning(res.message || 'Nothing to advance')
    }

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
      loadOverview()
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
