<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'

const route = useRoute()
const store = useAssessmentStore()

const { records: data, meta, loading } = storeToRefs(store)
const view = ref<'table' | 'card'>('table')

const assignRecord = ref<AssessmentTemplate | null>(null)
const assignState = ref(false)

const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const UBadge = resolveComponent('UBadge')
const UProgress = resolveComponent('UProgress')


function calculateTotal(assessments: Assessment[]) {
  return assessments?.reduce((sum, item) => sum + item.weight, 0) || 0
}

function parseAssessmentCount(assessments: Assessment[]) {
  return assessments?.length || 0
}

function statusColor(total: number) {
  if (total === 100) return 'success'
  if (total > 100) return 'error'
  return 'warning'
}

function statusLabel(total: number) {
  if (total === 100) return 'Balanced'
  if (total > 100) return 'Overweighted'
  return 'Incomplete'
}

const columns = [
  {
    id: 'expand',
    cell: ({ row }: any) =>
      h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        icon: 'i-lucide-chevron-down',
        square: true,
        'aria-label': 'Expand',
        class: 'rounded-full',
        ui: {
          leadingIcon: [
            'transition-transform',
            row.getIsExpanded() ? 'duration-200 rotate-180' : ''
          ]
        },
        onClick: () => row.toggleExpanded()
      })
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }: any) =>
      h('div', { class: 'flex flex-col space-y-1' }, [
        h('p', { class: 'text-muted' }, row.original.name),
        h(
          'p',
          { class: 'text-xs' },
          `${parseAssessmentCount(row.original.assessments)} item(s)`
        )
      ])
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }: any) =>
      h(
        'p',
        { class: 'max-w-[320px] truncate text-sm text-muted' },
        row.original.description || '-'
      )
  },
  {
    id: 'items',
    header: 'Assessments',
    cell: ({ row }: any) => h(UBadge, {
      variant: 'soft',
      color: 'neutral',
      label: `${parseAssessmentCount(row.original.assessments)}`
    })
  },
  {
    accessorKey: 'passMark',
    header: 'Passing Mark',
    cell: ({ row }: any) =>
      h(
        'p',
        { class: 'max-w-[320px] truncate text-sm text-muted' },
        `${row.original.passMark}%` || '-'
      )
  },
  {
    id: 'totalWeight',
    header: 'Total Weight',
    cell: ({ row }: any) => h('span', {
      class: 'font-semibold text-slate-700'
    }, `${calculateTotal(row.original.assessments)}%`)
  },
  {
    id: 'status',
    header: 'Status',
    cell: ({ row }: any) => {
      const total = calculateTotal(row.original.assessments)
      return h(UBadge, {
        variant: 'subtle',
        color: statusColor(total),
        label: statusLabel(total)
      })
    },
  },
  {
    accessorKey: 'updatedAt',
    header: 'Updated',
    cell: ({ row }: any) => h('span', {
      class: 'text-sm text-slate-500'
    }, formatDate(row.original.updatedAt))
  },
  {
    id: 'actions',
    meta: {
      class: {
        td: 'text-right'
      }
    },
    cell: ({ row }: any) => {
      return h(
        UDropdownMenu,
        {
          content: { align: 'end' },
          size: 'sm',
          items: getRowItems(row),
          'aria-label': 'Actions dropdown'
        },
        () =>
          h(UButton, {
            icon: 'i-lucide-ellipsis-vertical',
            color: 'neutral',
            size: 'sm',
            variant: 'ghost'
          })
      )
    }
  }
]

function openAssessments(template: AssessmentTemplate) {
  assignRecord.value = template
  assignState.value = true
}

// Only what actually works: adding/editing a template's assessments. (The old "Edit Record" and
// "Delete Record" entries were never wired to anything, so they're not offered.)
function getRowItems(row: Row<AssessmentTemplate>) {
  return [
    {
      label: row.original.assessments?.length ? 'Edit Assessments' : 'Add Assessments',
      icon: 'i-lucide-clipboard-list',
      onClick: () => openAssessments(row.original)
    }
  ]
}

// --- Filters: the same row as the Auth pages, Transactions and the Student Ledger. Templates are
// paged by the server, so these narrow the templates on the page that's loaded. ---------------------
const search = ref('')
const status = ref('')
const filterState = ref(false) // the filter row's open/closed state on mobile

const statusOptions = [
  { label: 'Balanced', value: 'Balanced' },
  { label: 'Incomplete', value: 'Incomplete' },
  { label: 'Overweighted', value: 'Overweighted' },
]

const hasActiveFilters = computed(() => !!search.value || !!status.value)

function resetFilters() {
  search.value = ''
  status.value = ''
}

const filtered = computed(() => {
  const text = search.value.trim().toLowerCase()

  return (data.value ?? []).filter((template: AssessmentTemplate) => {
    if (status.value && statusLabel(calculateTotal(template.assessments)) !== status.value) return false
    return !text || template.name?.toLowerCase().includes(text) || template.description?.toLowerCase().includes(text)
  })
})

// A card shows the first few assessments in order; the rest collapse into "+n more".
const CARD_ASSESSMENTS_SHOWN = 4

function orderedAssessments(template: AssessmentTemplate) {
  return [...(template.assessments ?? [])].sort((a, b) => a.position - b.position)
}

const page = computed<number>({
  get: () => Number(route.query.page ?? 1),
  set: (val) => updateQuery({ page: val })
})

const size = ref(runtimeConf().limit)

async function fetchRecord() {
  await store.fetchAll(page.value, size.value)
}

onMounted(async () => {
  updateQuery({
    page: page.value
  })

  useAppStore().setTitle('Assessment Templates')
  document.title = 'Assessment Templates | Academics | Skultem'
  fetchRecord()
})

definePageMeta({
  role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER]
})

watch(
  () => [page.value, size.value],
  () => { fetchRecord() })
</script>

<template>
  <div class="space-y-4 px-4 sm:px-6">
    <AcademicsSectionNav />
    <UCard :ui="{ body: 'p-0 sm:p-0', header: 'p-0 sm:p-0' }">
      <template #header>
        <div>
          <div class="flex items-center justify-between gap-3 px-4 py-3">
            <div>
              <p class="font-semibold">Assessment Templates</p>
              <p class="text-xs-base text-muted">How a class's assessments are weighted and passed</p>
            </div>

            <div class="flex items-center gap-2">
              <TableViewToggle v-model="view" />
              <UButton @click="filterState = !filterState" :icon="!filterState ? FILTER_ICON : CLOSE_ICON"
                variant="outline" :color="!filterState ? 'info' : 'error'" class="md:hidden" />
              <AcademicsAssessmentTemplateAdd />
            </div>
          </div>

          <!-- Always shown from md up; on mobile it opens with the filter button -->
          <div :class="filterState ? 'flex' : 'hidden'"
            class="md:flex flex-wrap items-center justify-between gap-3 border-t border-default p-4">
            <div class="flex-1 grid grid-cols-1 gap-2 md:grid-cols-3">
              <USelectMenu class="w-full" v-model="status" value-key="value" label-key="label"
                :items="statusOptions" placeholder="All Statuses" clear />
              <UInput v-model="search" :icon="SEARCH_ICON" class="md:col-span-2"
                placeholder="Search this page by name or description" />
            </div>
            <UButton :trailing-icon="DELETE_ICON" variant="outline" color="error" label="Clear"
              :disabled="!hasActiveFilters" @click="resetFilters" />
          </div>
        </div>
      </template>
      <UTable v-if="view === 'table'" class="hidden md:block" :columns="columns" :data="filtered" :loading="loading"
        expandable :ui="{
          td: 'align-top'
        }">
        <!-- Expanded Row -->
        <template #expanded="{ row }">
          <div class="p-1">
            <div class="mb-2 flex items-start justify-between gap-3">
              <div>
                <h3 class="font-semibold text-slate-800 dark:text-white">
                  Assessment Structure
                </h3>

                <p class="text-xs-base text-slate-500">
                  Breakdown of assessment weights
                </p>
              </div>

              <span :class="[
                'rounded-full border px-3 py-1 text-xs font-semibold',
                calculateTotal(row.original.assessments) === 100
                  ? 'border-success-300 bg-green-100 text-success-700 dark:border-success-700 dark:bg-success-500/10'
                  : 'border-amber-200 bg-amber-100 text-amber-700'
              ]">
                Total {{ calculateTotal(row.original.assessments) }}%
              </span>
            </div>

            <UProgress :max="100" :model-value="Math.min(calculateTotal(row.original.assessments), 100)"
              :color="calculateTotal(row.original.assessments) === 100 ? 'success' : 'warning'" />

            <div class="mt-4 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
              <table class="min-w-full text-sm">
                <thead class="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th class="px-4 py-3 text-left font-medium">
                      #
                    </th>

                    <th class="px-4 py-3 text-left font-medium">
                      Assessment
                    </th>

                    <th class="px-4 py-3 text-right font-medium">
                      Weight
                    </th>
                  </tr>
                </thead>

                <tbody>
                  <tr v-for="item in [...row.original.assessments].sort((a, b) => a.position - b.position)"
                    :key="item.id" class="border-t border-gray-200 dark:border-gray-800">
                    <td class="px-4 py-3 text-slate-500">
                      {{ item.position }}
                    </td>

                    <td class="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">
                      {{ item.name }}
                    </td>

                    <td class="px-4 py-3 text-right font-semibold text-primary-600">
                      {{ item.weight }}%
                    </td>
                  </tr>

                  <tr v-if="!row.original.assessments?.length">
                    <td colspan="3" class="px-4 py-4 text-center text-sm text-slate-500">
                      No assessments assigned yet.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p v-if="calculateTotal(row.original.assessments) !== 100" class="mt-3 text-xs text-amber-600">
              Total weight must equal 100%.
            </p>
          </div>
        </template>

        <template #loading>
          <TableLoading :size="columns.length" />
        </template>

        <template #empty-state>
          <div class="flex flex-col items-center gap-2 py-10">
            <UIcon name="ph:books-light" class="text-4xl text-slate-400" />

            <p class="font-medium text-slate-600">
              No assessment template found.
            </p>

            <p class="text-xs text-slate-500">
              Create a template to start defining assessments.
            </p>
          </div>
        </template>
      </UTable>

      <AcademicsAssessmentTemplateAddAssessment v-model:open="assignState" :template="assignRecord"
        @saved="fetchRecord" />
      <!-- Mobile list: one clean row per template -->
      <div v-if="view === 'table'" class="md:hidden">
        <template v-if="loading">
          <div v-for="i in 5" :key="i" class="space-y-3 border-b border-default px-4 py-3 last:border-0">
            <div class="flex items-start justify-between gap-3">
              <div class="space-y-2">
                <USkeleton class="h-4 w-36" />
                <USkeleton class="h-3 w-44" />
              </div>
              <USkeleton class="h-5 w-20 rounded-full" />
            </div>
            <USkeleton class="h-1.5 w-full rounded-full" />
          </div>
        </template>

        <template v-else-if="filtered.length">
          <div v-for="item in filtered" :key="item.id" class="border-b border-default px-4 py-3 last:border-0">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0 space-y-1">
                <p class="truncate text-sm font-semibold text-highlighted">{{ item.name }}</p>
                <p class="text-xs text-muted">
                  {{ parseAssessmentCount(item.assessments) }} assessment(s) · Pass mark {{ item.passMark }}%
                </p>
                <p v-if="item.description" class="line-clamp-2 text-xs text-muted">{{ item.description }}</p>
              </div>

              <div class="flex shrink-0 flex-col items-end gap-1.5">
                <UBadge size="sm" variant="soft" :color="statusColor(calculateTotal(item.assessments))"
                  :label="statusLabel(calculateTotal(item.assessments))" />
                <UDropdownMenu :items="getRowItems({ original: item } as any)" :content="{ align: 'end' }">
                  <UButton icon="i-lucide-ellipsis-vertical" color="neutral" variant="ghost" size="sm"
                    aria-label="Template actions" />
                </UDropdownMenu>
              </div>
            </div>

            <div class="mt-2 flex items-center gap-3">
              <UProgress class="flex-1" :max="100" :model-value="Math.min(calculateTotal(item.assessments), 100)"
                :color="statusColor(calculateTotal(item.assessments))" size="sm" />
              <span class="text-xs font-medium text-muted">{{ calculateTotal(item.assessments) }}%</span>
            </div>
          </div>
        </template>

        <div v-else class="flex flex-col items-center gap-2 py-12">
          <UIcon name="i-lucide-clipboard-list" class="text-4xl text-gray-400" />
          <p class="text-sm text-gray-500">
            {{ hasActiveFilters ? 'No template on this page matches your filters.' : 'No assessment templates found.' }}
          </p>
        </div>
      </div>

      <!-- Card view -->
      <div v-if="view === 'card'" class="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
        <template v-if="loading">
          <UCard v-for="i in 6" :key="i">
            <div class="animate-pulse space-y-4">
              <div class="flex items-center gap-3">
                <USkeleton class="size-10 rounded-xl" />
                <USkeleton class="h-4 w-32" />
              </div>
              <USkeleton class="h-3 w-full" />
              <USkeleton class="h-2 w-full rounded-full" />
            </div>
          </UCard>
        </template>

        <template v-else-if="filtered.length">
          <UCard v-for="item in filtered" :key="item.id"
            class="overflow-hidden rounded-2xl border-t-2 transition-shadow hover:shadow-md"
            :style="{ borderTopColor: `var(--ui-${statusColor(calculateTotal(item.assessments))})` }"
            :ui="{ body: 'p-0 sm:p-0' }">
            <div class="space-y-4 p-5">
              <div class="flex items-start gap-3">
                <div
                  class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
                  <UIcon name="i-lucide-clipboard-list" class="size-5 text-primary" />
                </div>

                <div class="min-w-0 flex-1">
                  <p class="truncate font-display font-semibold text-highlighted">{{ item.name }}</p>
                  <p class="text-xs text-muted">
                    {{ parseAssessmentCount(item.assessments) }} assessment(s) · Updated {{ formatDate(item.updatedAt) }}
                  </p>
                </div>

                <UBadge size="sm" variant="soft" :color="statusColor(calculateTotal(item.assessments))"
                  :label="statusLabel(calculateTotal(item.assessments))" />
              </div>

              <p v-if="item.description" class="line-clamp-2 text-sm text-muted">{{ item.description }}</p>

              <div class="grid grid-cols-2 gap-3">
                <div class="rounded-xl bg-elevated/50 p-3">
                  <p class="text-[11px] uppercase tracking-wide text-muted">Pass mark</p>
                  <p class="text-lg font-semibold text-highlighted">{{ item.passMark }}%</p>
                </div>
                <div class="rounded-xl bg-elevated/50 p-3">
                  <p class="text-[11px] uppercase tracking-wide text-muted">Total weight</p>
                  <p class="text-lg font-semibold text-highlighted">{{ calculateTotal(item.assessments) }}%</p>
                </div>
              </div>

              <UProgress :max="100" :model-value="Math.min(calculateTotal(item.assessments), 100)"
                :color="statusColor(calculateTotal(item.assessments))" size="sm" />

              <!-- The assessments, in order -->
              <ul v-if="item.assessments?.length" class="divide-y divide-default text-sm">
                <li v-for="assessment in orderedAssessments(item).slice(0, CARD_ASSESSMENTS_SHOWN)"
                  :key="assessment.id" class="flex items-center justify-between gap-3 py-1.5">
                  <span class="min-w-0 truncate">
                    <span class="mr-1.5 text-xs text-muted">{{ assessment.position }}.</span>{{ assessment.name }}
                  </span>
                  <span class="shrink-0 font-semibold text-primary">{{ assessment.weight }}%</span>
                </li>
                <li v-if="item.assessments.length > CARD_ASSESSMENTS_SHOWN" class="pt-1.5 text-xs text-muted">
                  +{{ item.assessments.length - CARD_ASSESSMENTS_SHOWN }} more
                </li>
              </ul>
              <p v-else class="text-sm text-muted">No assessments assigned yet.</p>
            </div>

            <div class="flex items-center justify-between gap-2 border-t border-default bg-elevated/40 px-5 py-3">
              <p v-if="calculateTotal(item.assessments) !== 100" class="text-xs text-warning">Weights must total 100%</p>
              <span v-else />

              <UButton size="sm" variant="soft" icon="i-lucide-clipboard-list"
                :label="item.assessments?.length ? 'Edit assessments' : 'Add assessments'"
                @click="openAssessments(item)" />
            </div>
          </UCard>
        </template>

        <div v-else class="col-span-full flex flex-col items-center gap-2 py-12">
          <UIcon name="i-lucide-clipboard-list" class="text-4xl text-gray-400" />
          <p class="text-sm text-gray-500">
            {{ hasActiveFilters ? 'No template on this page matches your filters.' : 'No assessment templates found.' }}
          </p>
        </div>
      </div>

      <template #footer>
        <div class="flex flex-col items-center justify-between gap-2 md:flex-row">
          <Showing :meta="meta" />

          <UPagination v-model:page="page" size="sm" :page-size="meta.size" :items-per-page="meta.size"
            :total="meta.total" show-edges />
        </div>
      </template>
    </UCard>
  </div>
</template>