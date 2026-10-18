<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

const route = useRoute()
const router = useRouter()
const { error: toastError } = useNotify()

const page = computed<number>({
  get: () => Number(route.query.page ?? 1),
  set: (val) => router.replace({ query: { ...route.query, page: val } })
})

// Filters live in these variables, not in the URL.
const status = ref<'IN_PROGRESS' | 'COMPLETED' | 'ALL'>('IN_PROGRESS')
const search = ref('')

const rows = ref<Onboarding[]>([])
const meta = ref<Meta>({} as Meta)
const loading = ref(false)
const failed = ref(false)

async function load() {
  loading.value = true
  failed.value = false
  try {
    const res = await LeadApi().onboardings({
      page: page.value, size: 10,
      status: status.value === 'ALL' ? undefined : status.value,
      search: search.value.trim() || undefined
    })
    rows.value = res?.data ?? []
    meta.value = res?.meta ?? ({} as Meta)
  } catch (err: any) {
    failed.value = true
    toastError(err.message)
  } finally {
    loading.value = false
  }
}

// Counts for the tiles and tabs come from one wider read (the table itself is paged).
const all = ref<Onboarding[] | undefined>()
async function loadStats() {
  all.value = (await LeadApi().onboardings({ page: 1, size: 100 }).catch(() => undefined))?.data
}
const stats = computed(() => {
  const list = all.value
  if (!list) return undefined
  const running = list.filter(o => o.status === 'IN_PROGRESS')
  return {
    running: running.length,
    completed: list.filter(o => o.status === 'COMPLETED').length,
    total: list.length,
    late: running.filter(o => o.overdueSteps > 0).length,
    lateSteps: running.reduce((n, o) => n + (o.overdueSteps ?? 0), 0),
    unassigned: running.filter(o => !o.assignedToName).length,
    avg: running.length ? Math.round(running.reduce((n, o) => n + o.percent, 0) / running.length) : 0
  }
})
const tabs = computed(() => [
  { key: 'IN_PROGRESS', label: 'In progress', count: stats.value?.running },
  { key: 'COMPLETED', label: 'Completed', count: stats.value?.completed },
  { key: 'ALL', label: 'All', count: stats.value?.total }
])
const metrics = computed(() => {
  const st = stats.value
  return [
    { label: 'In progress', value: st?.running, icon: 'i-lucide-list-checks', color: 'primary' as const, subtle: st ? `${st.avg}% done on average` : '' },
    { label: 'Behind schedule', value: st?.late, icon: 'i-lucide-alarm-clock', color: (st?.late ? 'error' : 'success') as 'error' | 'success',
      subtle: st ? (st.lateSteps ? `${st.lateSteps} overdue step${st.lateSteps === 1 ? '' : 's'}` : 'Everything on time') : '' },
    { label: 'Unassigned', value: st?.unassigned, icon: 'i-lucide-user-x', color: (st?.unassigned ? 'warning' : 'neutral') as 'warning' | 'neutral', subtle: 'Needs someone responsible' },
    { label: 'Launched', value: st?.completed, icon: 'i-lucide-rocket', color: 'success' as const, subtle: 'Schools fully onboarded' }
  ]
})
const initials = (name?: string | null) => (name ?? '').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]!.toUpperCase()).join('') || '?'

const columns: TableColumn<Onboarding>[] = [
  { id: 'school', header: 'School' },
  { id: 'progress', header: 'Progress' },
  { id: 'current', header: 'Now on' },
  { id: 'assigned', header: 'Responsible' },
  { id: 'due', header: 'Next due' },
  { id: 'actions', header: '' }
]

let timer: ReturnType<typeof setTimeout>
function reload() {
  if (page.value !== 1) page.value = 1
  else load()
}
watch(status, reload)
watch(search, () => { clearTimeout(timer); timer = setTimeout(reload, 350) })
watch(page, load)
onBeforeUnmount(() => clearTimeout(timer))

onMounted(() => {
  useAppStore().setTitle('System Admin · School Onboarding')
  useAppStore().setBack(false)
  document.title = 'School Onboarding | System Admin | Skultem'
  load()
  loadStats()
})

definePageMeta({ role: [Role.SYSTEM_ADMIN] })
</script>

<template>
  <div class="space-y-4 px-4 md:px-6">
    <Heading title="School Onboarding" subtitle="New schools on their way from first demo to launch.">
      <UButton icon="i-lucide-target" variant="soft" label="Open leads" to="/leads" />
    </Heading>

    <div class="grid grid-cols-2 gap-3 xl:grid-cols-4">
      <Metric v-for="m in metrics" :key="m.label" :record="{ label: m.label, value: m.value ?? 0, subtle: m.subtle, icon: m.icon, color: m.color, isReady: m.value !== undefined }" />
    </div>

    <div class="flex flex-wrap items-center gap-3">
      <Tab v-model="status" :tabs="tabs" />
    </div>

    <div class="flex flex-wrap items-center gap-2 rounded-2xl bg-default p-2 shadow-sm ring-1 ring-default">
      <UInput v-model="search" icon="i-lucide-search" variant="soft" size="lg" placeholder="Search school or contact" class="min-w-0 flex-1" />
      <UButton v-if="search" variant="ghost" color="neutral" icon="i-lucide-x" label="Clear" @click="search = ''" />
    </div>

    <UCard :ui="{ body: 'p-0 sm:p-0' }">
      <UAlert v-if="failed" color="error" variant="soft" icon="i-lucide-circle-alert" title="Onboardings could not be loaded" class="m-4">
        <template #actions>
          <UButton size="xs" color="error" variant="outline" label="Try again" @click="load" />
        </template>
      </UAlert>

      <UTable v-else :columns="columns" :data="rows" :loading="loading"
        :ui="{ thead: 'bg-elevated/50', th: 'py-3 text-[11px] font-semibold uppercase tracking-wide text-muted', td: 'py-3.5', tr: 'hover:bg-primary/5 transition-colors' }">
        <template #empty-state>
          <div class="flex flex-col items-center gap-2 py-10">
            <UIcon name="i-lucide-list-checks" class="text-4xl text-gray-400" />
            <p class="text-gray-500">No onboardings here.</p>
            <p class="max-w-sm text-center text-xs text-muted">Start one from a lead once the school is ready to come on board.</p>
          </div>
        </template>
        <template #loading>
          <TableLoading :size="columns.length" />
        </template>

        <template #school-cell="{ row }">
          <NuxtLink :to="`/onboarding/${row.original.id}`" class="group flex min-w-0 items-center gap-3">
            <span class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-semibold text-primary">
              {{ initials(row.original.linkedSchoolName || row.original.schoolName || row.original.leadName) }}
            </span>
            <span class="min-w-0">
              <span class="block truncate font-medium text-highlighted group-hover:text-primary">
                {{ row.original.linkedSchoolName || row.original.schoolName || row.original.leadName }}
              </span>
              <span class="block truncate text-xs text-muted">{{ row.original.leadName }}</span>
            </span>
          </NuxtLink>
        </template>

        <template #progress-cell="{ row }">
          <div class="w-44 space-y-1.5">
            <div class="flex items-center justify-between text-[11px]">
              <span class="text-muted">{{ row.original.doneSteps }} of {{ row.original.totalSteps }} steps</span>
              <span class="font-semibold" :class="row.original.status === 'COMPLETED' ? 'text-success' : 'text-primary'">{{ row.original.percent }}%</span>
            </div>
            <div class="h-2 overflow-hidden rounded-full bg-elevated">
              <div class="h-full rounded-full transition-all" :class="row.original.status === 'COMPLETED' ? 'bg-success' : 'bg-gradient-to-r from-primary-400 to-primary-500'"
                :style="{ width: `${row.original.percent}%` }" />
            </div>
          </div>
        </template>

        <template #current-cell="{ row }">
          <UBadge v-if="row.original.status === 'COMPLETED'" size="sm" variant="subtle" color="success" icon="i-lucide-rocket" label="Launched" />
          <span v-else-if="row.original.currentStep" class="inline-flex max-w-52 items-center gap-2 rounded-full bg-elevated px-2.5 py-1 text-xs font-medium text-highlighted">
            <span class="size-2 shrink-0 rounded-full bg-secondary-500" /><span class="truncate">{{ row.original.currentStep }}</span>
          </span>
          <span v-else class="text-muted">—</span>
        </template>

        <template #assigned-cell="{ row }">
          <div v-if="row.original.assignedToName" class="flex items-center gap-2">
            <span class="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary/15 text-[10px] font-semibold text-secondary-700">{{ initials(row.original.assignedToName) }}</span>
            <span class="truncate text-sm">{{ row.original.assignedToName }}</span>
          </div>
          <UBadge v-else-if="row.original.status === 'IN_PROGRESS'" size="sm" variant="subtle" color="warning" icon="i-lucide-user-x" label="Unassigned" />
          <span v-else class="text-muted">—</span>
        </template>

        <template #due-cell="{ row }">
          <template v-if="row.original.status === 'IN_PROGRESS' && row.original.nextDueDate">
            <p class="flex items-center gap-1.5 text-sm" :class="row.original.overdueSteps ? 'font-medium text-error' : ''">
              <UIcon name="i-lucide-calendar-clock" class="size-3.5 shrink-0" />{{ formatDate(row.original.nextDueDate) }}
            </p>
            <p v-if="row.original.overdueSteps" class="text-[11px] font-medium text-error">{{ row.original.overdueSteps }} overdue</p>
          </template>
          <span v-else class="text-muted">—</span>
        </template>

        <template #actions-cell="{ row }">
          <div class="text-right">
            <UButton :to="`/onboarding/${row.original.id}`" size="sm" variant="ghost" color="neutral" icon="i-lucide-chevron-right" aria-label="Open onboarding" />
          </div>
        </template>
      </UTable>

      <template #footer>
        <div class="flex items-center justify-between">
          <Showing :meta="meta" />
          <UPagination v-model:page="page" size="sm" :page-size="meta.size" :items-per-page="meta.size" :total="meta.total" show-edges />
        </div>
      </template>
    </UCard>
  </div>
</template>
