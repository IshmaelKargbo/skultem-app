<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'

const route = useRoute()
const store = useAssessmentStore()

const { records: data, meta, loading } = storeToRefs(store)
const view = ref<'table' | 'card'>('table')

const editRecord = ref<AssessmentTemplate | null>(null)
const editState = ref(false)
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

function getRowItems(row: Row<AssessmentTemplate>) {
  return [
    {
      label: row.original.assessments?.length ? 'Edit Assessments' : 'Add Assessments',
      icon: 'i-lucide-clipboard-list',
      onClick: () => {
        assignRecord.value = row.original
        assignState.value = true
      }
    },
    {
      label: 'Edit Record',
      icon: 'i-lucide-edit',
      onClick: () => {
        editState.value = true
        editRecord.value = row.original
      }
    },
    {
      label: 'Delete Record',
      icon: 'i-lucide-trash'
    }
  ]
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
    <UCard :ui="{ body: 'p-0 sm:p-0' }">
      <template #header>
        <div class="flex space-x-3">
          <div class="flex space-x-3 flex-1">
            <UInput placeholder="Search by name . . ." />
            <AcademicsAssessmentTemplateAdd />
          </div>

          <TableViewToggle v-model="view" />
        </div>
      </template>
      <UTable v-if="view === 'table'" class="hidden md:block" :columns="columns" :data="data" :loading="loading"
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
      <!-- Mobile -->
      <div class="space-y-4 p-4"
        :class="view === 'table' ? 'md:hidden' : 'grid grid-cols-1 gap-4 space-y-0! md:grid-cols-2 lg:grid-cols-3'">
        <!-- Loading -->
        <template v-if="loading">
          <UCard v-for="i in 4" :key="i" class="overflow-hidden">
            <div class="space-y-4 p-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <USkeleton class="size-12 rounded-2xl" />

                  <div class="space-y-2">
                    <USkeleton class="h-3 w-28" />
                    <USkeleton class="h-2 w-20" />
                  </div>
                </div>

                <USkeleton class="h-6 w-16 rounded-full" />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <USkeleton class="h-16 rounded-2xl" />
                <USkeleton class="h-16 rounded-2xl" />
              </div>

              <USkeleton class="h-2 w-full rounded-full" />
            </div>
          </UCard>
        </template>

        <!-- Data -->
        <template v-else-if="data?.length">
          <AcademicsAssessmentTemplateMobileCard v-for="item in data" :key="item.id" :record="item" />
        </template>

        <!-- Empty -->
        <template v-else>
          <UCard class="overflow-hidden col-span-full">
            <div class="flex flex-col items-center justify-center py-14">
              <UIcon name="i-lucide-clipboard-list" class="mb-3 size-10 text-gray-400" />

              <p class="text-sm text-gray-500">
                No assessment templates found
              </p>
            </div>
          </UCard>
        </template>
      </div>

      <template #footer>
        <div class="flex items-center justify-between">
          <Showing :meta="meta" />

          <UPagination v-model:page="page" size="sm" :page-size="meta.size" :items-per-page="meta.size"
            :total="meta.total" show-edges />
        </div>
      </template>
    </UCard>
  </div>
</template>