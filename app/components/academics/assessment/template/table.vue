<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { Row } from '@tanstack/vue-table'

const route = useRoute()
const router = useRouter()
const store = useAssessmentStore()

const { records: data, meta, loading } = storeToRefs(store)

const editRecord = ref<AssessmentTemplate | null>(null)
const editState = ref(false)
const assignRecord = ref<AssessmentTemplate | null>(null)
const assignState = ref(false)

const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const UBadge = resolveComponent('UBadge')
const UProgress = resolveComponent('UProgress')

interface AssessmentItem {
  id: string
  name: string
  weight: number
  position: number
  createdAt: string
  updatedAt: string
}

interface AssessmentTemplate {
  id: string
  name: string
  description: string
  assessments: AssessmentItem[]
  createdAt: string
  updatedAt: string
}

function calculateTotal(assessments: AssessmentItem[]) {
  return assessments?.reduce((sum, item) => sum + item.weight, 0) || 0
}

function parseAssessmentCount(assessments: AssessmentItem[]) {
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

const columns: TableColumn<AssessmentTemplate>[] = [
  {
    id: 'expand',
    cell: ({ row }) =>
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
    cell: ({ row }) =>
      h('div', { class: 'flex flex-col space-y-1' }, [
        h('p', { class: 'text-slate-800' }, row.original.name),
        h(
          'p',
          { class: 'text-xs text-mute' },
          `${parseAssessmentCount(row.original.assessments)} item(s)`
        )
      ])
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) =>
      h(
        'p',
        { class: 'max-w-[320px] truncate text-sm text-slate-600' },
        row.original.description || '-'
      )
  },
  {
    id: 'items',
    header: 'Assessments',
    cell: ({ row }) => h(UBadge, {
      variant: 'soft',
      color: 'neutral',
      label: `${parseAssessmentCount(row.original.assessments)}`
    })
  },
  {
    id: 'totalWeight',
    header: 'Total Weight',
    cell: ({ row }) => h('span', {
      class: 'font-semibold text-slate-700'
    }, `${calculateTotal(row.original.assessments)}%`)
  },
  {
    id: 'status',
    header: 'Status',
    cell: ({ row }) => {
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
    cell: ({ row }) => h('span', {
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
    cell: ({ row }) => {
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

const size = computed<number>({
  get: () => Number(route.query.size ?? 6),
  set: (val) => updateQuery({ size: val })
})

function updateQuery(newQuery: Record<string, any>) {
  const merged = { ...route.query, ...newQuery }

  if (
    merged.page === route.query.page &&
    merged.size === route.query.size
  ) return

  router.replace({ query: merged })
}

async function fetchRecord() {
  await store.fetchAll(page.value, size.value)
}

onMounted(async () => {
  if (!route.query.page || !route.query.size) {
    router.replace({
      query: {
        page: page.value,
        size: size.value
      }
    })
  }

  fetchRecord()
})

watch(
  () => [page.value, size.value],
  () => {
    fetchRecord()
  }
)
</script>

<template>
  <UCard>
    <UTable :columns="columns" :data="data" :loading="loading" expandable :ui="{
      td: 'align-top'
    }">
      <!-- Expanded Row -->
      <template #expanded="{ row }">
        <div class="p-2">

          <!-- Header -->
          <div class="flex items-start justify-between gap-3 mb-4">
            <div>
              <h3 class="text-base font-semibold text-slate-800">
                Assessment Structure
              </h3>
              <p class="text-sm text-slate-500">
                Breakdown of assessment weights
              </p>
            </div>

            <div>
              <span :class="[
                'px-3 py-1 text-xs font-semibold rounded-full',
                calculateTotal(row.original.assessments) === 100
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : 'bg-amber-100 text-amber-700 border border-amber-200'
              ]">
                Total {{ calculateTotal(row.original.assessments) }}%
              </span>
            </div>
          </div>

          <UProgress :max="100" :model-value="Math.min(calculateTotal(row.original.assessments), 100)" :color="calculateTotal(row.original.assessments) === 100 ? 'success' : 'warning'" />
          <div class="overflow-hidden bg-white mt-4">
            <table class="min-w-full text-sm">
              <thead class="bg-slate-50 text-slate-600">
                <tr>
                  <th class="px-4 py-3 text-left font-medium">#</th>
                  <th class="px-4 py-3 text-left font-medium">Assessment</th>
                  <th class="px-4 py-3 text-right font-medium">Weight</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="item in [...row.original.assessments].sort((a, b) => a.position - b.position)" :key="item.id"
                  class="border-t border-slate-200">
                  <td class="px-4 py-3 text-slate-500">
                    {{ item.position }}
                  </td>

                  <td class="px-4 py-3 font-medium text-slate-800">
                    {{ item.name }}
                  </td>

                  <td class="px-4 py-3 text-right font-semibold text-primary-600">
                    {{ item.weight }}%
                  </td>
                </tr>
                <tr v-if="!row.original.assessments?.length">
                  <td colspan="3" class="px-4 py-4 text-sm text-slate-500 text-center">
                    No assessments assigned to this template yet.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Progress Bar -->
          <div class="mt-3">
            <p v-if="calculateTotal(row.original.assessments) !== 100" class="text-amber-600 text-xs mt-2">
              Total weight must equal 100%.
            </p>
          </div>

        </div>
      </template>

      <!-- Empty State -->
      <template #empty-state>
        <div class="flex flex-col items-center gap-2 py-10">
          <UIcon name="ph:books-light" class="text-4xl text-slate-400" />
          <p class="text-slate-600 font-medium">No assessment template found.</p>
          <p class="text-xs text-slate-500">Create a template to start defining your assessment structure.</p>
        </div>
      </template>
    </UTable>
    <div v-if="!loading" class="flex justify-between border-t border-slate-200 pt-3 items-center mt-2">
      <Showing :meta="meta" />
      <UPagination size="sm" v-model:page="page" :page-size="meta.size" :items-per-page="meta.size" :total="meta.total"
        show-edges />
    </div>
    <SettingsAssessmentTemplateAddAssessment v-model:open="assignState" :template="assignRecord" @saved="fetchRecord" />
  </UCard>
</template>
