<script setup lang="ts">
const view = ref<'table' | 'card'>('table')
const route = useRoute()
const router = useRouter()
const store = useReportStore()
const { teachers: data, report, meta, loading } = storeToRefs(store)

const scrollContainer = inject<Ref<HTMLElement | null>>('scrollContainer')

const parseStaus: Record<string, string> = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  DELETED: 'Deleted'
}

const parseStatusColor: Record<string, 'success' | 'warning' | 'error'> = {
  ACTIVE: 'success',
  INACTIVE: 'warning',
  DELETED: 'error'
}

// Desktop columns are trimmed to what fits without horizontal scroll - gender/city/street live in
// the detail modal opened via "actions" / tapping a row.
const columns = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }: any) => `${parseTitle[row.original.title]} ${row.original.user.givenNames} ${row.original.user.familyName}`
  },
  {
    accessorKey: 'email',
    header: 'Email'
  },
  {
    accessorKey: 'phone',
    header: 'Phone'
  },
  {
    accessorKey: 'status',
    header: 'Status'
  },
  { id: 'actions', meta: { class: { td: 'text-right' } } }
]

const page = computed<number>({
  get: () => Number(route.query.page ?? 1),
  set: (val) => updateQuery({ page: val })
})

const size = computed<number>({
  get: () => Number(route.query.size ?? runtimeConf().limit),
  set: (val) => updateQuery({ size: val })
})

function updateQuery(newQuery: Record<string, any>) {
  const merged = { ...route.query, ...newQuery }

  if (
    merged.page === route.query.page &&
    merged.size === route.query.size
  ) {
    return
  }

  router.replace({ query: merged })
}

function fetchReport() {
  if (report.value == null) return
  store.runReport(report.value, page.value, size.value)
}

watch(() => page.value, async () => {
  nextTick(() => {
    scrollContainer?.value?.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  })
  router.replace({
    query: {
      ...route.query,
      page: page.value
    }
  })

  await fetchReport()
}, { immediate: true })

const selected = ref<any | null>(null)
const detailOpen = ref(false)

function openDetail(item: any) {
  selected.value = item
  detailOpen.value = true
}

const detailFields = computed<ReportDetailField[]>(() => {
  const item = selected.value
  if (!item) return []
  return [
    { label: 'Email', value: item.user?.email || 'No email' },
    { label: 'Phone', value: item.phone || 'N/A' },
    { label: 'Gender', value: parseGender[item.gender] || 'N/A' },
    { label: 'City', value: item.city || 'N/A' },
    { label: 'Street', value: item.street || 'N/A' }
  ]
})
</script>

<template>
  <div class="space-y-4">
    <UCard :ui="{ body: 'p-0 sm:p-0' }">
      <template #header>
        <div class="flex justify-end">
          <TableViewToggle v-model="view" />
        </div>
      </template>

      <UTable v-if="view === 'table'" class="hidden md:block" :columns="columns" :data="data" :loading="loading">
      <template #empty-state>
        <div class="flex flex-col items-center gap-2 py-10">
          <UIcon name="ph:books-light" class="text-4xl text-gray-400" />
          <p class="text-gray-500">No teachers found.</p>
        </div>
      </template>
      <template #email-cell="{ row }">
        {{ row.original.user.email }}
      </template>
      <template #status-cell="{ row }">
        <UBadge :label="parseStaus[row.original.status]" :color="parseStatusColor[row.original.status]"
          variant="outline" />
      </template>
      <template #actions-cell="{ row }">
        <UButton icon="i-lucide-eye" size="xs" variant="ghost" color="neutral" aria-label="View details"
          @click="openDetail(row.original)" />
      </template>
      </UTable>

      <!-- Mobile compact list (default view, mirrors /transactions and /transactions/student-ledger mobile design) -->
      <div v-if="view === 'table'" class="md:hidden">
        <template v-if="loading">
          <div v-for="i in 6" :key="i" class="flex items-center justify-between gap-3 border-b border-default px-4 py-3 last:border-0">
            <div class="flex min-w-0 items-center gap-3">
              <USkeleton class="size-10 shrink-0 rounded-full" />
              <div class="min-w-0 space-y-2">
                <USkeleton class="h-4 w-32 rounded-md" />
                <USkeleton class="h-3 w-24 rounded-md" />
              </div>
            </div>
            <USkeleton class="h-6 w-16 shrink-0 rounded-full" />
          </div>
        </template>

        <template v-else-if="data?.length">
          <div v-for="item in data" :key="item.id" class="flex items-center justify-between gap-3 border-b border-default px-4 py-3 last:border-0 active:bg-muted/50"
            @click="openDetail(item)">
            <div class="flex min-w-0 items-center gap-3">
              <UAvatar size="md" :src="item.user?.photo || undefined" icon="i-lucide-user-round"
                :alt="`${item.user?.givenNames} ${item.user?.familyName}`" loading="lazy" />
              <div class="min-w-0">
                <h3 class="truncate text-sm font-semibold text-highlighted">
                  {{ parseTitle[item.title] }} {{ item.user?.givenNames }} {{ item.user?.familyName }}
                </h3>
                <p class="truncate text-xs text-muted">{{ item.user?.email || 'No email' }}</p>
              </div>
            </div>

            <div class="flex shrink-0 items-center gap-2">
              <UBadge :label="parseStaus[item.status]" :color="parseStatusColor[item.status]" variant="soft" size="sm" />
              <UIcon name="i-lucide-chevron-right" class="text-muted" />
            </div>
          </div>
        </template>

        <template v-else>
          <div class="flex flex-col items-center py-16">
            <div class="flex h-20 w-20 items-center justify-center rounded-3xl bg-muted">
              <UIcon name="ph:books-light" class="size-10 text-muted" />
            </div>
            <h3 class="mt-4 text-sm font-semibold">No teachers found</h3>
            <p class="mt-1 text-sm text-muted">Teacher records will appear here.</p>
          </div>
        </template>
      </div>

      <!-- Card view (explicit toggle, unchanged detail layout, available on any breakpoint) -->
      <div v-if="view === 'card'" class="grid grid-cols-1 gap-4 space-y-0! p-4 md:grid-cols-2 lg:grid-cols-3">
      <template v-if="loading">
        <UCard v-for="i in 6" :key="i" class="overflow-hidden rounded-2xl border border-default shadow-sm" :ui="{ body: 'p-0' }">
          <div class="animate-pulse">
            <!-- Header -->
            <div class="border-b border-default p-4">
              <div class="flex items-center justify-between gap-3">
                <div class="flex min-w-0 items-center gap-3">
                  <USkeleton class="size-12 shrink-0 rounded-full" />
                  <div class="min-w-0 space-y-2">
                    <USkeleton class="h-4 w-36 rounded-md" />
                    <USkeleton class="h-3 w-28 rounded-md" />
                  </div>
                </div>
                <USkeleton class="h-6 w-16 shrink-0 rounded-full" />
              </div>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-2 gap-3 p-4">
              <div v-for="j in 4" :key="j" class="rounded-2xl border border-default bg-muted/40 p-3">
                <div class="mb-3 flex items-center gap-2">
                  <USkeleton class="size-7 shrink-0 rounded-lg" />
                  <USkeleton class="h-3 w-16 rounded-md" />
                </div>
                <USkeleton class="h-4 w-24 rounded-md" />
              </div>
            </div>
          </div>
        </UCard>
      </template>

      <!-- Data -->
      <template v-else-if="data?.length">
        <UCard v-for="item in data" :key="item.id"
          class="overflow-hidden rounded-2xl transition-all active:scale-[0.99] hover:ring-1 hover:ring-primary-200 dark:hover:ring-primary-700"
          :ui="{ body: 'p-0' }">
          <!-- Header -->
          <div class="border-b border-default p-4">
            <div class="flex items-start justify-between gap-3">
              <div class="flex min-w-0 items-center gap-3">
                <UAvatar size="2xl" icon="i-lucide-user-round" :src="item.user?.photo || undefined"
                  :alt="`${item.user?.givenNames} ${item.user?.familyName}`" loading="lazy" />

                <div class="min-w-0">
                  <h3 class="truncate text-base font-bold text-highlighted">
                    {{ parseTitle[item.title] }} {{ item.user?.givenNames }} {{ item.user?.familyName }}
                  </h3>

                  <p class="mt-1 truncate text-xs text-muted">
                    {{ item.user?.email || 'No email' }}
                  </p>
                </div>
              </div>

              <UBadge :label="parseStaus[item.status]" :color="parseStatusColor[item.status]" variant="soft" />
            </div>
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-2 gap-3 p-4">
            <!-- Gender -->
            <div class="min-w-0 rounded-2xl border p-3" :class="item.gender === 'MALE'
                ? 'border-blue-200 bg-blue-50 dark:border-blue-500/20 dark:bg-blue-500/10'
                : item.gender === 'FEMALE'
                  ? 'border-pink-200 bg-pink-50 dark:border-pink-500/20 dark:bg-pink-500/10'
                  : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
              ">
              <div class="mb-2 flex items-center gap-2">
                <div class="flex size-7 shrink-0 items-center justify-center rounded-lg" :class="item.gender === 'MALE'
                    ? 'bg-blue-100 dark:bg-blue-500/20'
                    : item.gender === 'FEMALE'
                      ? 'bg-pink-100 dark:bg-pink-500/20'
                      : 'bg-gray-200 dark:bg-gray-700'
                  ">
                  <UIcon name="i-lucide-users" class="size-4" :class="item.gender === 'MALE'
                      ? 'text-blue-600 dark:text-blue-400'
                      : item.gender === 'FEMALE'
                        ? 'text-pink-600 dark:text-pink-400'
                        : 'text-gray-600 dark:text-gray-400'
                    " />
                </div>
                <p class="text-[10px] font-medium uppercase tracking-wide" :class="item.gender === 'MALE'
                    ? 'text-blue-700 dark:text-blue-300'
                    : item.gender === 'FEMALE'
                      ? 'text-pink-700 dark:text-pink-300'
                      : 'text-gray-600 dark:text-gray-400'
                  ">
                  Gender
                </p>
              </div>
              <p class="truncate text-sm font-medium text-highlighted">
                {{ parseGender[item.gender] || 'N/A' }}
              </p>
            </div>

            <!-- Phone -->
            <div
              class="min-w-0 rounded-2xl border border-violet-200 bg-violet-50 p-3 dark:border-violet-500/20 dark:bg-violet-500/10">
              <div class="mb-2 flex items-center gap-2">
                <div
                  class="flex size-7 shrink-0 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-500/20">
                  <UIcon name="i-lucide-phone" class="size-4 text-violet-600 dark:text-violet-400" />
                </div>
                <p class="text-[10px] font-medium uppercase tracking-wide text-violet-700 dark:text-violet-300">
                  Phone
                </p>
              </div>
              <p class="truncate text-sm font-medium text-highlighted">
                {{ item.phone || 'N/A' }}
              </p>
            </div>

            <!-- City -->
            <div
              class="min-w-0 rounded-2xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-500/20 dark:bg-amber-500/10">
              <div class="mb-2 flex items-center gap-2">
                <div
                  class="flex size-7 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-500/20">
                  <UIcon name="i-lucide-map-pin" class="size-4 text-amber-600 dark:text-amber-400" />
                </div>
                <p class="text-[10px] font-medium uppercase tracking-wide text-amber-700 dark:text-amber-300">
                  City
                </p>
              </div>
              <p class="truncate text-sm font-medium text-highlighted">
                {{ item.city || 'N/A' }}
              </p>
            </div>

            <!-- Street -->
            <div
              class="min-w-0 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-500/20 dark:bg-emerald-500/10">
              <div class="mb-2 flex items-center gap-2">
                <div
                  class="flex size-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/20">
                  <UIcon name="i-lucide-map" class="size-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p class="text-[10px] font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                  Street
                </p>
              </div>
              <p class="truncate text-sm font-medium text-highlighted">
                {{ item.street || 'N/A' }}
              </p>
            </div>
          </div>
        </UCard>
      </template>

      <!-- Empty -->
      <template v-else>
        <UCard class="col-span-full">
          <div class="flex flex-col items-center justify-center py-14">
            <UIcon name="ph:books-light" class="mb-3 text-4xl text-gray-400" />
            <p class="text-sm text-gray-500">No teachers found.</p>
          </div>
        </UCard>
      </template>
      </div>

      <template #footer>
        <div class="flex justify-between items-center">
          <Showing :meta="meta" />
          <UPagination size="sm" v-model:page="page" :page-size="meta?.size" :items-per-page="meta?.size" :total="meta?.total" show-edges />
        </div>
      </template>
    </UCard>

    <ReportDetailModal v-model:open="detailOpen"
      :title="selected ? `${parseTitle[selected.title]} ${selected.user?.givenNames} ${selected.user?.familyName}` : ''"
      :photo="selected?.user?.photo || undefined" icon="i-lucide-user-round"
      :badge="selected ? { label: parseStaus[selected.status], color: parseStatusColor[selected.status] } : undefined"
      :fields="detailFields" />
  </div>
</template>
