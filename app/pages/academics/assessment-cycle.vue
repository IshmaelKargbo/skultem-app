<template>
  <div class="px-4 md:px-6 space-y-4">
    <Heading title="Assessment Cycle"
      subtitle="Monitor assessment progress and control transitions between assessment stages">
      <UBadge v-if="allTermsCompleted" variant="soft" color="success" size="lg">
        All terms completed for this year
      </UBadge>
      <div v-else class="grid w-full gap-2 md:flex md:w-auto md:items-center">
        <!-- Sections run their assessments separately, so a section moves on its own. -->
        <USelectMenu v-if="isSectionBased" v-model="advanceSectionId" value-key="value" :items="advanceSections"
          placeholder="Choose section" class="w-full md:w-44" />
        <UTooltip :text="isSectionBased
          ? 'Moves only the chosen section to its next assessment - the other sections stay where they are.'
          : 'Advances every class on the selected term at once - not just the class you\'re viewing.'">
          <UButton class="w-full justify-center md:w-auto" icon="i-lucide-arrow-right-circle" color="warning" :loading="isAdvancingAssessment"
            :disabled="!selectedTermId || isRefreshing || (isSectionBased && !advanceSectionId)"
            @click="advanceAssessmentStage">
            {{ isSectionBased && advanceSectionName ? `Move ${advanceSectionName} To Next Assessment` : 'Move To Next Assessment' }}
          </UButton>
        </UTooltip>
      </div>
    </Heading>

    <AcademicsSectionNav />

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
            <button v-for="item in paginatedClasses" :key="item.classId"
              class="group w-full rounded-xl border-2 p-4 text-left transition-all duration-200" :class="selectedClassId === item.classId
                ? 'border-secondary bg-secondary/5 shadow-sm'
                : 'border-default hover:border-secondary/40 hover:bg-muted/30'
                " @click="openClass(item.classId)">

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

          <template v-if="!isLoadingOverview && filteredClasses.length" #footer>
            <div class="flex items-center justify-between gap-3">
              <Showing :meta="classesMeta" />
              <UPagination v-model:page="classesPage" size="sm" :page-size="CLASSES_PAGE_SIZE"
                :items-per-page="CLASSES_PAGE_SIZE" :total="filteredClasses.length" show-edges />
            </div>
          </template>

        </UCard>

      </div>


      <UCard class="hidden lg:col-span-2 lg:block">
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

          <AcademicsCycleTimeline :assessments="assessmentItems" :loading="isLoadingCycle" />

        </div>
      </UCard>
    </div>

    <!-- Mobile: only the class list shows; a class's cycle opens here -->
    <!-- Full screen: `content` overrides the drawer's default height/margin, the footer stays pinned to
         the bottom of the scrolling area, and the safe-area padding keeps it clear of the home bar -->
    <UDrawer v-model:open="drawerOpen" direction="bottom" :handle="false"
      description="Assessment stages and progression for this class." :ui="{
        content: 'mt-0 h-dvh max-h-dvh rounded-none',
        container: 'gap-5 p-5',
        description: 'mt-2 text-xs',
        footer: 'sticky bottom-0 -mx-5 -mb-5 border-t border-default bg-default px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]'
      }">
      <template #title>
        <span class="flex items-center gap-3">
          <span class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary/10 ring-1 ring-secondary/20">
            <UIcon :name="CLASS_ICON" class="size-5 text-secondary" />
          </span>

          <span class="min-w-0 flex-1">
            <span class="block truncate font-display text-lg font-semibold leading-tight text-highlighted">
              {{ selectedClass?.className || 'Assessment Cycle' }}
            </span>
            <span class="mt-0.5 block truncate text-xs font-normal text-muted">
              {{ selectedClass?.templateName || 'No template assigned' }}
            </span>
          </span>

          <UBadge v-if="selectedClass" size="sm" variant="soft" :color="selectedClass.ready ? 'success' : 'warning'"
            :icon="selectedClass.ready ? 'i-lucide-check-circle' : 'i-lucide-alert-triangle'"
            :label="selectedClass.ready ? 'Ready' : 'Attention'" />

          <UButton icon="i-lucide-x" color="neutral" variant="ghost" size="sm" class="shrink-0"
            aria-label="Close" @click.stop="drawerOpen = false" />
        </span>
      </template>

      <template #body>
        <div class="space-y-5">
          <!-- At a glance -->
          <div class="grid grid-cols-3 gap-2">
            <div class="min-w-0 rounded-xl bg-elevated/50 p-3">
              <p class="text-[11px] uppercase tracking-wide text-muted">Term</p>
              <p class="mt-1 truncate text-sm font-semibold text-highlighted">{{ activeTerm?.name || 'None' }}</p>
            </div>
            <div class="min-w-0 rounded-xl bg-elevated/50 p-3">
              <p class="text-[11px] uppercase tracking-wide text-muted">Stages</p>
              <p class="mt-1 text-sm font-semibold text-highlighted">{{ assessmentItems.length }}</p>
            </div>
            <div class="min-w-0 rounded-xl bg-elevated/50 p-3">
              <p class="text-[11px] uppercase tracking-wide text-muted">Weight</p>
              <p class="mt-1 text-sm font-semibold" :class="totalWeight === 100 ? 'text-success' : 'text-warning'">
                {{ totalWeight }}%
              </p>
            </div>
          </div>

          <UAlert v-if="selectedClass && !selectedClass.ready" color="warning" variant="soft"
            icon="i-lucide-alert-triangle" title="Needs attention" :description="selectedClass.note" />

          <div>
            <div class="mb-3 flex items-center justify-between">
              <h3 class="text-sm font-semibold text-highlighted">Assessment sequence</h3>
              <UBadge variant="subtle" color="neutral" size="sm" :label="`${assessmentItems.length} steps`" />
            </div>

            <AcademicsCycleTimeline :assessments="assessmentItems" :loading="isLoadingCycle" />
          </div>
        </div>
      </template>

      <template #footer>
        <UButton label="Close" color="neutral" variant="outline" size="lg" block @click="drawerOpen = false" />
      </template>
    </UDrawer>
  </div>
</template>

<script setup lang="ts">
const appStore = useAppStore()
const assessmentStore = useAssessmentStore()
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

const CLASSES_PAGE_SIZE = 5
const classesPage = ref(1)

const selectedClassId = computed(() => {
  const value = route.query.classId
  return typeof value === 'string' && value.trim().length ? value : ''
})

const filteredClasses = computed(() => {
  const all = overview.value?.classes || []
  if (!search.value.trim()) return all

  const q = search.value.toLowerCase().trim()
  return all.filter((item) => item.className.toLowerCase().includes(q) || (item.templateName || '').toLowerCase().includes(q))
})

// Client-side pagination - the overview endpoint already hands back every class in one shot,
// so there's no server page to request; slice the (already search-filtered) list instead.
const paginatedClasses = computed(() => {
  const start = (classesPage.value - 1) * CLASSES_PAGE_SIZE
  return filteredClasses.value.slice(start, start + CLASSES_PAGE_SIZE)
})

const classesMeta = computed(() => useMeta({
  page: classesPage.value,
  size: CLASSES_PAGE_SIZE,
  count: filteredClasses.value.length
}))

// A new search query means a different set of results - always jump back to page 1 rather than
// staying on, say, page 2 of what is now a completely different filtered list.
watch(search, () => {
  classesPage.value = 1
})

// The overview can also reload with fewer classes for other reasons (a template unassigned,
// etc.) - if that leaves the current page past the end, snap back rather than rendering an
// empty page with visible pagination.
watch(filteredClasses, () => {
  const maxPage = Math.max(1, Math.ceil(filteredClasses.value.length / CLASSES_PAGE_SIZE))
  if (classesPage.value > maxPage) classesPage.value = maxPage
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

// --- Mobile drawer ------------------------------------------------------------------------------
// Below the lg breakpoint the class list is all that shows; tapping a class opens its cycle in a
// drawer. The first class gets selected automatically on load (see loadOverview) - that must not
// pop the drawer open, so it only opens from an actual tap.
const drawerOpen = ref(false)
const isMobile = ref(false)

let mobileQuery: MediaQueryList | null = null
const updateIsMobile = () => { isMobile.value = !!mobileQuery?.matches }

onMounted(() => {
  mobileQuery = window.matchMedia('(max-width: 1023px)')
  updateIsMobile()
  mobileQuery.addEventListener('change', updateIsMobile)
})

onBeforeUnmount(() => mobileQuery?.removeEventListener('change', updateIsMobile))

// Growing past the breakpoint (rotating a tablet, say) swaps the drawer for the side-by-side layout.
watch(isMobile, (mobile) => {
  if (!mobile) drawerOpen.value = false
})

const selectedClass = computed(() =>
  overview.value?.classes?.find((item) => item.classId === selectedClassId.value) ?? null)

async function openClass(classId: string) {
  await selectClass(classId)
  if (isMobile.value) drawerOpen.value = true
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

// Management sections (Primary, Secondary...) are managed separately, so each moves on its own. A section-limited
// admin only sees their own.
const { isSectionBased, sectionOptions, load: loadStructure } = useSchoolStructure()
const { scope, load: loadScope } = useMyScope()
const advanceSectionId = ref('')
const advanceSections = computed(() => sectionOptions.value.filter(s =>
  !scope.value || scope.value.wholeSchool || scope.value.sectionIds.includes(s.value)))
const advanceSectionName = computed(() => advanceSections.value.find(s => s.value === advanceSectionId.value)?.label || '')
onMounted(async () => {
  await Promise.all([loadStructure(), loadScope()])
  if (!advanceSectionId.value && advanceSections.value.length === 1) advanceSectionId.value = advanceSections.value[0]!.value
})

async function advanceAssessmentStage() {
  if (!selectedTermId.value) return

  isAdvancingAssessment.value = true
  try {
    const res = await assessmentStore.advanceCycle(selectedTermId.value, isSectionBased.value ? advanceSectionId.value : null)

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
    await loadOverview()
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
