<script setup lang="ts">
const { format } = useMoney()
const { error: toastError } = useNotify()

const data = ref<PlatformFeeCollections>()
const fee = ref<PlatformFeeOverview>()
const loading = ref(true)
const failed = ref(false)

// Filters live here, not in the URL.
const search = ref('')
const show = ref<'all' | 'owing' | 'paid'>('all')
const filters = [
  { label: 'All schools', value: 'all' },
  { label: 'Still owing', value: 'owing' },
  { label: 'Fully paid', value: 'paid' }
]

async function load() {
  failed.value = false
  loading.value = true
  try {
    const [c, f] = await Promise.all([PlatformApi().feeCollections(), PlatformApi().platformFee().catch(() => undefined)])
    data.value = c
    fee.value = f
  } catch (err: any) {
    failed.value = true
    toastError(err?.message || 'Could not load the platform fees')
  } finally {
    loading.value = false
  }
}

const rows = computed(() => {
  const q = search.value.trim().toLowerCase()
  return (data.value?.items ?? []).filter((s) => {
    if (q && !`${s.name} ${s.domain}`.toLowerCase().includes(q)) return false
    if (show.value === 'owing') return s.outstanding > 0
    if (show.value === 'paid') return s.billed > 0 && s.outstanding <= 0
    return true
  })
})

const columns = [
  { accessorKey: 'name', header: 'School' },
  { accessorKey: 'students', header: 'Students' },
  { accessorKey: 'billed', header: 'Billed' },
  { accessorKey: 'collected', header: 'Collected' },
  { accessorKey: 'outstanding', header: 'Still to collect' },
  { accessorKey: 'rate', header: 'Paid' },
  { accessorKey: 'lastPaymentAt', header: 'Last payment' }
]

const barColor = (rate: number) => rate >= 100 ? 'success' : rate >= 50 ? 'primary' : 'warning'

onMounted(() => {
  useAppStore().setTitle('System Admin · Platform Fee Collection')
  useAppStore().setBack(false)
  document.title = 'Platform Fee Collection | System Admin | Skultem'
  load()
})

definePageMeta({ role: [Role.SYSTEM_ADMIN] })
</script>

<template>
  <div class="space-y-3 px-4 md:px-6">
    <UAlert v-if="failed" color="error" variant="soft" icon="i-lucide-circle-alert" title="Platform fees could not be loaded">
      <template #actions>
        <UButton size="xs" color="error" variant="outline" label="Try again" @click="load" />
      </template>
    </UAlert>

    <div class="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
      <Metric :record="{
        color: 'primary', icon: 'i-lucide-receipt', label: 'Billed to students',
        value: format(data?.billed ?? 0),
        subtle: data ? `${data.students} student${data.students === 1 ? '' : 's'} across ${data.schools} school${data.schools === 1 ? '' : 's'}` : '',
        isReady: !loading
      }" />
      <Metric :record="{
        color: 'success', icon: 'i-lucide-hand-coins', label: 'Collected',
        value: format(data?.collected ?? 0),
        subtle: data ? `${data.rate}% of what was billed` : '',
        isReady: !loading
      }" />
      <Metric :record="{
        color: 'warning', icon: 'i-lucide-hourglass', label: 'Still to collect',
        value: format(data?.outstanding ?? 0),
        subtle: data ? `${data.schoolsOwing} school${data.schoolsOwing === 1 ? '' : 's'} with a balance` : '',
        isReady: !loading
      }" />
    </div>

    <UCard :ui="{ body: 'p-0 sm:p-0' }">
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <h2 class="text-sm font-semibold text-highlighted">By school</h2>
          <div class="flex flex-wrap gap-2">
            <UInput v-model="search" icon="i-lucide-search" placeholder="Search schools" class="w-56" />
            <USelect v-model="show" :items="filters" value-key="value" class="w-40" />
          </div>
        </div>
      </template>

      <UTable class="hidden md:block" :columns="columns" :data="rows" :loading="loading">
        <template #empty>
          <div class="flex flex-col items-center gap-2 py-10">
            <UIcon name="i-lucide-hand-coins" class="size-9 text-muted" />
            <p class="text-sm text-muted">{{ data?.items.length ? 'No school matches.' : 'No live schools yet.' }}</p>
          </div>
        </template>
        <template #loading><TableLoading :size="columns.length" /></template>

        <template #name-cell="{ row }">
          <p class="font-medium text-highlighted">{{ clean(row.original.name) }}</p>
          <p class="text-xs text-muted">{{ row.original.domain }}</p>
        </template>
        <template #billed-cell="{ row }">
          <p>{{ format(row.original.billed) }}</p>
          <p v-if="row.original.discounts" class="text-xs text-muted">{{ format(row.original.discounts) }} in discounts</p>
        </template>
        <template #collected-cell="{ row }">{{ format(row.original.collected) }}</template>
        <template #outstanding-cell="{ row }">
          <span :class="row.original.outstanding > 0 ? 'font-medium text-warning' : 'text-muted'">
            {{ format(row.original.outstanding) }}
          </span>
        </template>
        <template #rate-cell="{ row }">
          <div v-if="row.original.billed > 0" class="flex w-32 items-center gap-2">
            <UProgress :model-value="row.original.rate" :color="barColor(row.original.rate)" size="sm" class="flex-1" />
            <span class="text-xs text-muted">{{ row.original.rate }}%</span>
          </div>
          <span v-else class="text-xs text-muted">Nothing billed</span>
        </template>
        <template #lastPaymentAt-cell="{ row }">
          <span class="text-xs text-muted">{{ row.original.lastPaymentAt ? formatDateTime(row.original.lastPaymentAt) : '—' }}</span>
        </template>
      </UTable>

      <!-- Mobile -->
      <div class="space-y-3 p-4 md:hidden">
        <USkeleton v-if="loading" class="h-24 w-full" />
        <p v-else-if="!rows.length" class="py-8 text-center text-sm text-muted">No school matches.</p>
        <UCard v-for="s in rows" :key="s.schoolId" :ui="{ body: 'p-3 sm:p-3 space-y-2' }">
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <p class="truncate text-sm font-semibold text-highlighted">{{ clean(s.name) }}</p>
              <p class="truncate text-xs text-muted">{{ s.students }} student{{ s.students === 1 ? '' : 's' }}</p>
            </div>
            <span class="text-xs text-muted">{{ s.rate }}%</span>
          </div>
          <UProgress v-if="s.billed > 0" :model-value="s.rate" :color="barColor(s.rate)" size="sm" />
          <div class="flex justify-between text-xs">
            <span class="text-muted">Collected {{ format(s.collected) }} of {{ format(s.billed) }}</span>
            <span :class="s.outstanding > 0 ? 'font-medium text-warning' : 'text-muted'">{{ format(s.outstanding) }} left</span>
          </div>
        </UCard>
      </div>
    </UCard>
  </div>
</template>
