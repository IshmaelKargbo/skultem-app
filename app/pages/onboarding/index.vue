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

const tabs = [
  { value: 'IN_PROGRESS', label: 'In progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'ALL', label: 'All' }
]

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
})

definePageMeta({ role: [Role.SYSTEM_ADMIN] })
</script>

<template>
  <div class="space-y-4 px-4 md:px-6">
    <Heading title="School Onboarding" subtitle="New schools on their way from first demo to launch.">
      <UButton icon="i-lucide-target" variant="soft" label="Open leads" to="/leads" />
    </Heading>

    <UCard :ui="{ body: 'p-0 sm:p-0' }">
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex gap-1.5">
            <UButton v-for="t in tabs" :key="t.value" size="sm" :label="t.label"
              :variant="status === t.value ? 'solid' : 'soft'" :color="status === t.value ? 'primary' : 'neutral'"
              @click="status = t.value as any" />
          </div>
          <UInput v-model="search" icon="i-lucide-search" placeholder="Search school or contact" class="w-full sm:w-72" />
        </div>
      </template>

      <UAlert v-if="failed" color="error" variant="soft" icon="i-lucide-circle-alert" title="Onboardings could not be loaded" class="m-4">
        <template #actions>
          <UButton size="xs" color="error" variant="outline" label="Try again" @click="load" />
        </template>
      </UAlert>

      <UTable v-else :columns="columns" :data="rows" :loading="loading">
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
          <NuxtLink :to="`/onboarding/${row.original.id}`" class="block min-w-0">
            <p class="truncate font-medium text-highlighted hover:text-primary">
              {{ row.original.linkedSchoolName || row.original.schoolName || row.original.leadName }}
            </p>
            <p class="truncate text-xs text-muted">{{ row.original.leadName }}</p>
          </NuxtLink>
        </template>

        <template #progress-cell="{ row }">
          <div class="w-36 space-y-1">
            <div class="h-1.5 overflow-hidden rounded-full bg-elevated">
              <div class="h-full rounded-full" :class="row.original.status === 'COMPLETED' ? 'bg-success' : 'bg-primary'"
                :style="{ width: `${row.original.percent}%` }" />
            </div>
            <p class="text-[11px] text-muted">{{ row.original.doneSteps }} of {{ row.original.totalSteps }} steps · {{ row.original.percent }}%</p>
          </div>
        </template>

        <template #current-cell="{ row }">
          <UBadge v-if="row.original.status === 'COMPLETED'" size="sm" variant="subtle" color="success" label="Launched" />
          <p v-else class="max-w-48 truncate text-sm">{{ row.original.currentStep || '—' }}</p>
        </template>

        <template #assigned-cell="{ row }">
          <p v-if="row.original.assignedToName" class="text-sm">{{ row.original.assignedToName }}</p>
          <UBadge v-else-if="row.original.status === 'IN_PROGRESS'" size="sm" variant="outline" color="warning" label="Unassigned" />
          <span v-else class="text-muted">—</span>
        </template>

        <template #due-cell="{ row }">
          <template v-if="row.original.status === 'IN_PROGRESS' && row.original.nextDueDate">
            <p class="text-sm" :class="row.original.overdueSteps ? 'font-medium text-error' : ''">{{ formatDate(row.original.nextDueDate) }}</p>
            <p v-if="row.original.overdueSteps" class="text-[11px] text-error">{{ row.original.overdueSteps }} overdue</p>
          </template>
          <span v-else class="text-muted">—</span>
        </template>

        <template #actions-cell="{ row }">
          <div class="text-right">
            <UButton :to="`/onboarding/${row.original.id}`" size="xs" variant="soft" color="neutral" label="Open" trailing-icon="i-lucide-arrow-right" />
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
