<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const store = useCommunicateStore()
const { broadcasts, loading, broadcastsMeta: meta } = storeToRefs(store)

const page = computed<number>({
  get: () => Number(route.query.page ?? 1),
  set: (val) => router.replace({ query: { ...route.query, page: val } })
})

const size = ref(runtimeConf().limit)

watch([page, size], () => store.fetchBroadcasts(page.value, size.value), { immediate: true })

onMounted(() => {
  updateQuery({ page: page.value })
  useAppStore().setTitle('Broadcast History')
  document.title = 'Broadcast History | Skultem'
})

definePageMeta({
  role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.TEACHER]
})

const search = ref('')
const statusFilter = ref<'ALL' | BroadcastStatus>('ALL')

const statusOptions = [
  { label: 'All', value: 'ALL' },
  { label: 'Sent', value: 'SENT' },
  { label: 'Scheduled', value: 'SCHEDULED' },
  { label: 'Failed', value: 'FAILED' }
]

const data = computed(() => {
  const q = search.value.trim().toLowerCase()

  return broadcasts.value
    .filter(b => {
      const matchesSearch = !q || b.title.toLowerCase().includes(q) || b.message.toLowerCase().includes(q)
      const matchesStatus = statusFilter.value === 'ALL' || b.status === statusFilter.value
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
})

const columns = [
  { id: 'broadcast', header: 'Broadcast' },
  { accessorKey: 'audience', header: 'Audience' },
  { id: 'delivery', header: 'Delivery' },
  { id: 'status', header: 'Status' },
  { id: 'date', header: 'Date' }
]
</script>

<template>
  <div class="space-y-4 px-4 md:px-6">
    <CommunicateSectionNav />
    <UCard :ui="{ body: 'p-0 sm:p-0' }">
      <template #header>
        <div class="flex justify-between flex-col gap-3 sm:flex-row">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
            <UInput v-model="search" :icon="SEARCH_ICON" placeholder="Search broadcasts..." class="w-full sm:w-72" />
            <USelectMenu v-model="statusFilter" value-key="value" :items="statusOptions" class="w-full sm:w-48" />
          </div>
          <UButton to="/communicate/broadcast" class="flex justify-center" label="Compose Broadcast" :icon="BROADCAST_ICON" />
        </div>
      </template>
      <UTable class="hidden md:block" :columns="columns" :data="data" :loading="loading">
        <template #empty-state>
          <div class="flex flex-col items-center gap-3 py-16">
            <div class="flex h-20 w-20 items-center justify-center rounded-[28px] bg-primary-50 dark:bg-primary-500/10">
              <UIcon :name="BROADCAST_HISTORY_ICON" class="text-4xl text-primary-500" />
            </div>

            <div class="text-center">
              <h3 class="font-semibold text-highlighted">No broadcasts yet</h3>
              <p class="mt-1 text-sm text-muted">Broadcasts you send or schedule will appear here.</p>
            </div>
          </div>
        </template>

        <template #broadcast-cell="{ row }">
          <div class="max-w-sm">
            <p class="font-medium text-highlighted">{{ row.original.title }}</p>
            <p class="mt-0.5 truncate text-xs text-muted">{{ row.original.message }}</p>
            <div class="mt-1.5 flex flex-wrap gap-1">
              <UBadge v-for="channel in row.original.channels" :key="channel" color="neutral" variant="subtle"
                size="sm">
                {{ channel }}
              </UBadge>
            </div>
          </div>
        </template>

        <template #audience-cell="{ row }">
          <UBadge color="neutral" variant="subtle">{{ audienceLabel(row.original.audience) }}</UBadge>
        </template>

        <template #delivery-cell="{ row }">
          <p class="text-sm text-muted">
            <span class="font-medium text-highlighted">{{ row.original.deliveredCount }}</span> / {{
              row.original.recipientsCount }}
          </p>
        </template>

        <template #status-cell="{ row }">
          <UBadge :color="broadcastStatusStyle[row.original.status].color" variant="soft">
            {{ broadcastStatusStyle[row.original.status].label }}
          </UBadge>
        </template>

        <template #date-cell="{ row }">
          <p class="text-sm text-muted">
            {{ formatDateTime(row.original.sentAt || row.original.scheduledAt || row.original.createdAt) }}
          </p>
        </template>
      </UTable>

      <!-- Mobile - same data as the table above, which gets hidden below md rather than
           squeezed into 5 columns on a phone screen. -->
      <div class="divide-y divide-default md:hidden">
        <div v-if="loading" class="space-y-3 p-4">
          <USkeleton v-for="i in 4" :key="i" class="h-24 w-full rounded-xl" />
        </div>

        <div v-else-if="!data.length" class="flex flex-col items-center gap-3 py-16">
          <div class="flex h-20 w-20 items-center justify-center rounded-[28px] bg-primary-50 dark:bg-primary-500/10">
            <UIcon :name="BROADCAST_HISTORY_ICON" class="text-4xl text-primary-500" />
          </div>
          <div class="text-center">
            <h3 class="font-semibold text-highlighted">No broadcasts yet</h3>
            <p class="mt-1 text-sm text-muted">Broadcasts you send or schedule will appear here.</p>
          </div>
        </div>

        <div v-else v-for="broadcast in data" :key="broadcast.id" class="space-y-2 p-4">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="font-medium text-highlighted">{{ broadcast.title }}</p>
              <p class="mt-0.5 truncate text-xs text-muted">{{ broadcast.message }}</p>
            </div>
            <UBadge :color="broadcastStatusStyle[broadcast.status].color" variant="soft" class="shrink-0">
              {{ broadcastStatusStyle[broadcast.status].label }}
            </UBadge>
          </div>

          <div class="flex flex-wrap gap-1">
            <UBadge v-for="channel in broadcast.channels" :key="channel" color="neutral" variant="subtle" size="sm">
              {{ channel }}
            </UBadge>
          </div>

          <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
            <UBadge color="neutral" variant="subtle">{{ audienceLabel(broadcast.audience) }}</UBadge>
            <p><span class="font-medium text-highlighted">{{ broadcast.deliveredCount }}</span> / {{
              broadcast.recipientsCount }} delivered</p>
            <p>{{ formatDateTime(broadcast.sentAt || broadcast.scheduledAt || broadcast.createdAt) }}</p>
          </div>
        </div>
      </div>

      <template v-if="meta.total" #footer>
        <div class="flex items-center justify-between">
          <Showing :meta="meta" />
          <UPagination v-model:page="page" size="sm" :page-size="meta.size" :items-per-page="meta.size"
            :total="meta.total" show-edges />
        </div>
      </template>
    </UCard>
  </div>
</template>
