<script setup lang="ts">
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

const columns = [
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
    cell: ({ row }) =>
      h(
        'p',
        { class: 'max-w-[320px] truncate text-sm text-muted' },
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
    accessorKey: 'passMark',
    header: 'Passing Mark',
    cell: ({ row }) =>
      h(
        'p',
        { class: 'max-w-[320px] truncate text-sm text-muted' },
        `${row.original.passMark}%` || '-'
      )
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
  <!-- Desktop -->
  <UCard
    class="hidden md:block"
    :ui="{
      body: 'sm:p-0'
    }"
  >
    <UTable
      :columns="columns"
      :data="data"
      :loading="loading"
      expandable
      :ui="{
        td: 'align-top'
      }"
    >
      <!-- Expanded Row -->
      <template #expanded="{ row }">
        <div class="p-4">
          <div class="mb-4 flex items-start justify-between gap-3">
            <div>
              <h3 class="text-base font-semibold text-slate-800 dark:text-white">
                Assessment Structure
              </h3>

              <p class="text-sm text-slate-500">
                Breakdown of assessment weights
              </p>
            </div>

            <span
              :class="[
                'rounded-full border px-3 py-1 text-xs font-semibold',
                calculateTotal(row.original.assessments) === 100
                  ? 'border-success-300 bg-green-100 text-success-700 dark:border-success-700 dark:bg-success-500/10'
                  : 'border-amber-200 bg-amber-100 text-amber-700'
              ]"
            >
              Total {{ calculateTotal(row.original.assessments) }}%
            </span>
          </div>

          <UProgress
            :max="100"
            :model-value="Math.min(calculateTotal(row.original.assessments), 100)"
            :color="calculateTotal(row.original.assessments) === 100 ? 'success' : 'warning'"
          />

          <div class="mt-4 overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
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
                <tr
                  v-for="item in [...row.original.assessments].sort((a, b) => a.position - b.position)"
                  :key="item.id"
                  class="border-t border-gray-200 dark:border-gray-800"
                >
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
                  <td
                    colspan="3"
                    class="px-4 py-4 text-center text-sm text-slate-500"
                  >
                    No assessments assigned yet.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p
            v-if="calculateTotal(row.original.assessments) !== 100"
            class="mt-3 text-xs text-amber-600"
          >
            Total weight must equal 100%.
          </p>
        </div>
      </template>

      <template #loading>
        <TableLoading :size="columns.length" />
      </template>

      <template #empty-state>
        <div class="flex flex-col items-center gap-2 py-10">
          <UIcon
            name="ph:books-light"
            class="text-4xl text-slate-400"
          />

          <p class="font-medium text-slate-600">
            No assessment template found.
          </p>

          <p class="text-xs text-slate-500">
            Create a template to start defining assessments.
          </p>
        </div>
      </template>
    </UTable>

    <AcademicsAssessmentTemplateAddAssessment
      v-model:open="assignState"
      :template="assignRecord"
      @saved="fetchRecord"
    />

    <template #footer>
      <div class="flex items-center justify-between">
        <Showing :meta="meta" />

        <UPagination
          v-model:page="page"
          size="sm"
          :page-size="meta.size"
          :items-per-page="meta.size"
          :total="meta.total"
          show-edges
        />
      </div>
    </template>
  </UCard>

  <!-- Mobile -->
  <div class="space-y-4 md:hidden">
    <!-- Loading -->
    <template v-if="loading">
      <UCard
        v-for="i in 4"
        :key="i"
        class="overflow-hidden"
      >
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
      <UCard
        v-for="item in data"
        :key="item.id"
        class="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-neutral-900"
        :ui="{
          body: 'p-0'
        }"
      >
        <!-- Header -->
        <div class="border-b border-gray-100 p-4 dark:border-gray-800">
          <div class="flex items-start justify-between gap-3">
            <div class="flex min-w-0 items-center gap-3">
              <div
                class="flex size-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400"
              >
                <UIcon
                  name="i-lucide-clipboard-list"
                  class="size-6"
                />
              </div>

              <div class="min-w-0">
                <h3
                  class="truncate text-sm font-semibold text-gray-900 dark:text-white"
                >
                  {{ item.name }}
                </h3>

                <p class="truncate text-xs text-gray-500">
                  {{ parseAssessmentCount(item.assessments) }} assessment(s)
                </p>
              </div>
            </div>

            <UDropdownMenu
              :items="getRowItems({ original: item } as any)"
              :content="{ align: 'end' }"
            >
              <UButton
                icon="i-lucide-ellipsis-vertical"
                color="neutral"
                variant="ghost"
                size="sm"
                class="rounded-xl"
              />
            </UDropdownMenu>
          </div>
        </div>

        <!-- Description -->
        <div
          v-if="item.description"
          class="border-b border-gray-100 px-4 py-3 dark:border-gray-800"
        >
          <p class="text-sm text-gray-600 dark:text-gray-300">
            {{ item.description }}
          </p>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 gap-3 p-4">
          <div class="rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800">
            <p class="mb-1 text-[10px] uppercase tracking-wide text-gray-500">
              Pass Mark
            </p>

            <p class="text-sm font-semibold">
              {{ item.passMark }}%
            </p>
          </div>

          <div class="rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800">
            <p class="mb-1 text-[10px] uppercase tracking-wide text-gray-500">
              Total Weight
            </p>

            <p class="text-sm font-semibold">
              {{ calculateTotal(item.assessments) }}%
            </p>
          </div>
        </div>

        <!-- Status -->
        <div class="px-4 pb-4">
          <div class="mb-2 flex items-center justify-between">
            <p class="text-xs font-medium text-gray-500">
              Template Status
            </p>

            <UBadge
              :label="statusLabel(calculateTotal(item.assessments))"
              :color="statusColor(calculateTotal(item.assessments))"
              variant="soft"
            />
          </div>

          <UProgress
            :max="100"
            :model-value="Math.min(calculateTotal(item.assessments), 100)"
            :color="statusColor(calculateTotal(item.assessments))"
          />

          <p
            v-if="calculateTotal(item.assessments) !== 100"
            class="mt-2 text-xs text-amber-600"
          >
            Total assessment weight should equal 100%.
          </p>
        </div>

        <!-- Assessment Items -->
        <div
          class="border-t border-gray-100 px-4 py-4 dark:border-gray-800"
        >
          <div class="mb-3 flex items-center justify-between">
            <h4 class="text-sm font-semibold text-gray-900 dark:text-white">
              Assessments
            </h4>

            <UBadge
              :label="`${parseAssessmentCount(item.assessments)} Items`"
              variant="soft"
              color="neutral"
            />
          </div>

          <div
            v-if="item.assessments?.length"
            class="space-y-2"
          >
            <div
              v-for="assessment in [...item.assessments].sort((a, b) => a.position - b.position)"
              :key="assessment.id"
              class="flex items-center justify-between rounded-2xl bg-gray-50 px-3 py-3 dark:bg-neutral-800"
            >
              <div class="min-w-0">
                <p class="truncate text-sm font-medium">
                  {{ assessment.name }}
                </p>

                <p class="text-xs text-gray-500">
                  Position {{ assessment.position }}
                </p>
              </div>

              <UBadge
                :label="`${assessment.weight}%`"
                variant="soft"
                color="primary"
              />
            </div>
          </div>

          <div
            v-else
            class="rounded-2xl border border-dashed border-gray-300 px-4 py-6 text-center dark:border-gray-700"
          >
            <p class="text-sm text-gray-500">
              No assessments assigned yet.
            </p>
          </div>
        </div>
      </UCard>
    </template>

    <!-- Empty -->
    <template v-else>
      <div class="flex flex-col items-center justify-center py-14">
        <UIcon
          name="ph:books-light"
          class="mb-3 text-4xl text-slate-400"
        />

        <p class="font-medium text-slate-600">
          No assessment template found.
        </p>

        <p class="text-xs text-slate-500">
          Create a template to start defining assessments.
        </p>
      </div>
    </template>

    <!-- Pagination -->
       <div class="flex justify-between items-center mt-3 md:hidden">
      <Showing :meta="meta" />
      <UPagination size="sm" v-model:page="page" :page-size="meta.size" :items-per-page="meta.size" :total="meta.total"
        show-edges />
    </div>
  </div>
</template>