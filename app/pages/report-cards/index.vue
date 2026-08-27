<template>
  <div class="space-y-6 mt-6 p-4 md:px-6">

    <!-- Header -->
    <Heading title="Report Cards" subtitle="Generate, preview and export student report cards.">
      <UButton icon="i-lucide-plus" label="Generate Report Cards" class="justify-center" to="/report-cards/generate" />

      <UButton icon="i-lucide-settings-2" variant="outline" label="Design" class="justify-center"
        to="/report-cards/templates" />
    </Heading>

    <!-- Stats -->
    <div class="grid gap-4 md:grid-cols-4">

      <UCard>
        <div class="flex items-center gap-4">
          <div class="flex size-12 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-500/10">
            <UIcon name="i-lucide-file-text" class="text-xl text-primary-500" />
          </div>

          <div>
            <p class="text-xs text-muted">Total Reports</p>
            <h3 class="text-2xl font-bold">{{ stats?.total ?? 0 }}</h3>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center gap-4">
          <div class="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10">
            <UIcon name="i-lucide-check-circle" class="text-xl text-emerald-600" />
          </div>

          <div>
            <p class="text-xs text-muted">Passed</p>
            <h3 class="text-2xl font-bold">{{ stats?.passed ?? 0 }}</h3>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center gap-4">
          <div class="flex size-12 items-center justify-center rounded-2xl bg-amber-500/10">
            <UIcon name="i-lucide-alert-circle" class="text-xl text-amber-600" />
          </div>

          <div>
            <p class="text-xs text-muted">Needs Attention</p>
            <h3 class="text-2xl font-bold">{{ stats?.failed ?? 0 }}</h3>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center gap-4">
          <div class="flex size-12 items-center justify-center rounded-2xl bg-blue-500/10">
            <UIcon name="i-lucide-download" class="text-xl text-blue-600" />
          </div>

          <div>
            <p class="text-xs text-muted">Downloads</p>
            <h3 class="text-2xl font-bold">{{ stats?.downloads ?? 0 }}</h3>
          </div>
        </div>
      </UCard>

    </div>

    <!-- Filters -->
    <UCard>
      <div class="grid gap-4 lg:grid-cols-5">
        <UInput v-model="search" icon="i-lucide-search" placeholder="Search student..." class="lg:col-span-2" />

        <USelectMenu v-model="selectedTerm" value-key="value" :items="terms" :loading="termStore.loading"
          placeholder="Term" />

        <USelectMenu v-model="selectedClass" value-key="value" :items="classes" :loading="classStore.loading"
          placeholder="Class" />

        <UButton icon="i-lucide-x" variant="outline" label="Clear" @click="resetFilters" />
      </div>
    </UCard>

    <!-- Loading -->
    <div v-if="loading && !records.length" class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      <UCard v-for="i in 6" :key="i" variant="outline" class="rounded-3xl">
        <div class="flex items-center gap-3">
          <USkeleton class="size-12 rounded-full" />
          <div class="flex-1 space-y-2">
            <USkeleton class="h-4 w-2/3" />
            <USkeleton class="h-3 w-1/2" />
          </div>
        </div>
        <USkeleton class="mt-5 h-20 w-full rounded-2xl" />
      </UCard>
    </div>

    <div v-else-if="records.length" class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      <UCard v-for="item in records" :key="item.id" variant="outline"
        class="overflow-hidden rounded-3xl transition hover:-translate-y-0.5 hover:shadow-lg">
        <!-- Header -->
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <UAvatar :src="item.photo" :alt="item.studentName" size="lg" class="ring-2 ring-primary/20" />

            <div>
              <h3 class="font-semibold text-base">{{ item.studentName }}</h3>

              <div class="flex items-center gap-1 text-sm text-muted">
                <UIcon name="i-lucide-graduation-cap" />
                {{ item.className }}
              </div>
            </div>
          </div>

          <UBadge :label="item.passed ? 'Passed' : 'Attention'" :color="item.passed ? 'success' : 'warning'"
            variant="soft" />
        </div>

        <!-- Highlight -->
        <div class="mt-5 rounded-2xl bg-primary/5 border border-primary/10 p-5 text-center">
          <p class="text-xs uppercase tracking-wide text-muted">Average Score</p>
          <h2 class="mt-2 text-3xl font-bold text-primary">{{ item.average.toFixed(1) }}%</h2>
          <p class="mt-1 text-sm text-muted">{{ item.termName }}</p>
        </div>

        <!-- Stats -->
        <div class="mt-5 grid grid-cols-2 gap-3">
          <div class="rounded-2xl border border-default p-4">
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-award" class="text-primary" />
              <span class="text-xs text-muted">Grade</span>
            </div>
            <p class="mt-2 font-semibold">{{ item.overallGrade || 'N/A' }}</p>
          </div>

          <div class="rounded-2xl border border-default p-4">
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-trophy" class="text-amber-500" />
              <span class="text-xs text-muted">Position</span>
            </div>
            <p class="mt-2 font-semibold">{{ item.position ? ordinal(item.position) : 'N/A' }}</p>
          </div>
        </div>

        <!-- Footer -->
        <div class="mt-6 flex gap-3">
          <UButton block icon="i-lucide-eye" variant="soft" :to="`/report-cards/${item.id}`">
            Preview
          </UButton>

          <UBadge v-if="item.downloadCount" color="neutral" variant="subtle" class="shrink-0 self-center">
            {{ item.downloadCount }} download{{ item.downloadCount === 1 ? '' : 's' }}
          </UBadge>
        </div>
      </UCard>
    </div>

    <UCard v-else>
      <div class="flex flex-col items-center justify-center py-16 text-center">
        <UIcon name="i-lucide-file-text" class="mb-3 size-12 text-muted" />
        <h3 class="text-base font-semibold">No report cards match these filters</h3>
        <p class="mt-1 text-sm text-muted">Try adjusting your search, clearing the filters, or generating new report cards.</p>
      </div>
    </UCard>

    <div v-if="meta.total" class="flex items-center justify-between">
      <Showing :meta="meta" />
      <UPagination v-model:page="page" size="sm" :page-size="meta.size" :items-per-page="meta.size"
        :total="meta.total" show-edges />
    </div>

  </div>
</template>
<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const reportCardStore = useReportCardStore()
const classStore = useClassStore()
const termStore = useTermStore()

const { records, meta, loading, stats } = storeToRefs(reportCardStore)

const search = ref('')
const selectedTerm = ref('')
const selectedClass = ref('')

const classes = computed(() => [{ label: 'All Classes', value: '' }, ...classStore.records.map(e => ({ label: e.name, value: e.id }))])
const terms = computed(() => [{ label: 'All Terms', value: '' }, ...termStore.records.map(e => ({ label: e.name, value: e.id }))])

const page = computed<number>({
  get: () => Number(route.query.page ?? 1),
  set: (val) => router.replace({ query: { ...route.query, page: val } })
})

const size = ref(runtimeConf().limit)

function ordinal(n: number) {
  const suffixes = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0])
}

async function fetchRecords() {
  await reportCardStore.fetchAll(page.value, size.value, {
    classId: selectedClass.value || undefined,
    termId: selectedTerm.value || undefined,
    search: search.value || undefined
  })
}

watch([page, size, search, selectedTerm, selectedClass], fetchRecords, { immediate: true })

function resetFilters() {
  search.value = ''
  selectedTerm.value = ''
  selectedClass.value = ''
}

onMounted(() => {
  useAppStore().setTitle('Report Cards')
  document.title = 'Report Cards | Skultem'
  classStore.fetchAll(1, 100)
  termStore.fetchAll(1, 100)
  reportCardStore.fetchStats()
})

definePageMeta({
  role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER]
})
</script>
