<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'

const route = useRoute()
const router = useRouter()
const store = useTeacherSubjectStore()
const { records: data, meta, loading } = storeToRefs(store)
const scrollContainer = inject<Ref<HTMLElement | null>>('scrollContainer')

const editRcord = ref<TeacherSubject | null>(null)
const editState = ref(false)

const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const columns = [
  {
    accessorKey: 'className',
    header: 'Class'
  },
  {
    accessorKey: 'sectionName',
    header: 'Section'
  },
  {
    accessorKey: 'streamName',
    header: 'Stream'
  },
  {
    accessorKey: 'subjectName',
    header: 'Subject'
  },
  {
    accessorKey: 'teacherName',
    header: 'Teacher'
  },
  {
    accessorKey: 'assignedAt',
    header: 'Assign On',
    cell: ({ row }: any) => {
      return formatDate(row.original.assignedAt)
    }
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
          content: {
            align: 'end'
          },
          size: 'sm',
          items: getRowItems(row),
          'aria-label': 'Actions dropdown'
        },
        () =>
          h(UButton, {
            icon: 'i-lucide-ellipsis-vertical',
            color: 'neutral',
            size: 'sm',
            variant: 'ghost',
            'aria-label': 'Actions dropdown'
          })
      )
    }
  }
]

function getRowItems(row: Row<TeacherSubject>) {
  return [
    {
      label: 'Edit Record',
      icon: 'i-lucide-edit',
      onClick: () => {
        editState.value = true;
        editRcord.value = row.original;
      }
    },
    {
      label: 'Delete Record',
      icon: 'i-lucide-trash',
    }
  ]
}

const page = computed<number>({
  get: () => Number(route.query.page ?? 1),
  set: (val) => updateQuery({ page: val })
})

const size = computed<number>({
  get: () => Number(route.query.size ?? runtimeConf().limit),
  set: (val) => updateQuery({ size: val })
})

async function fetchRecord() {
  loading.value = true
  await store.fetchAll(page.value, size.value)
  loading.value = false
}

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

watch(() => page.value, () => {
  nextTick(() => {
    scrollContainer?.value?.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  })
  router.replace({
    query: {
      page: page.value,
      size: size.value
    }
  })

  fetchRecord()
}, { immediate: true })

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
</script>
<template>
  <div class="space-y-4">
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
      >
        <template #empty-state>
          <div class="flex flex-col items-center gap-2 py-10">
            <UIcon
              name="ph:books-light"
              class="text-4xl text-gray-400"
            />

            <p class="text-gray-500">
              No teacher assignments found.
            </p>
          </div>
        </template>

        <template #loading>
          <TableLoading :size="columns.length" />
        </template>
      </UTable>

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
          class="overflow-hidden "
        >
          <div class="space-y-4 p-4">
            <div class="flex items-center gap-3">
              <USkeleton class="size-12 rounded-2xl" />

              <div class="flex-1 space-y-2">
                <USkeleton class="h-3 w-32" />
                <USkeleton class="h-2 w-20" />
              </div>

              <USkeleton class="size-8 rounded-xl" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <USkeleton class="h-16 rounded-2xl" />
              <USkeleton class="h-16 rounded-2xl" />
              <USkeleton class="h-16 rounded-2xl" />
              <USkeleton class="h-16 rounded-2xl" />
            </div>
          </div>
        </UCard>
      </template>

      <!-- Mobile Cards -->
      <template v-else-if="data?.length">
        <UCard
          v-for="item in data"
          :key="item.id"
          class="overflow-hidden "
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
                    name="i-lucide-book-open"
                    class="size-6"
                  />
                </div>

                <div class="min-w-0">
                  <h3 class="truncate text-sm font-semibold text-gray-900 dark:text-white">
                    {{ item.subjectName }}
                  </h3>

                  <p class="truncate text-xs text-gray-500">
                    {{ item.teacherName }}
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

          <!-- Content -->
          <div class="grid grid-cols-2 gap-3 p-4">
            <div class="rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800">
              <p class="mb-1 text-[10px] font-medium uppercase tracking-wide text-gray-500">
                Class
              </p>

              <p class="truncate text-sm font-medium text-gray-900 dark:text-white">
                {{ item.className || 'N/A' }}
              </p>
            </div>

            <div class="rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800">
              <p class="mb-1 text-[10px] font-medium uppercase tracking-wide text-gray-500">
                Section
              </p>

              <p class="truncate text-sm font-medium text-gray-900 dark:text-white">
                {{ item.sectionName || 'N/A' }}
              </p>
            </div>

            <div class="rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800">
              <p class="mb-1 text-[10px] font-medium uppercase tracking-wide text-gray-500">
                Stream
              </p>

              <p class="truncate text-sm font-medium text-gray-900 dark:text-white">
                {{ item.streamName || 'N/A' }}
              </p>
            </div>

            <div class="rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800">
              <p class="mb-1 text-[10px] font-medium uppercase tracking-wide text-gray-500">
                Assigned
              </p>

              <p class="truncate text-sm font-medium text-gray-900 dark:text-white">
                {{ formatDate(item.assignedAt) }}
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div
            class="flex items-center justify-between border-t border-gray-100 px-4 py-3 dark:border-gray-800"
          >
            <div class="flex min-w-0 items-center gap-3">
              <UAvatar
                size="sm"
                icon="i-lucide-graduation-cap"
              />

              <div class="min-w-0">
                <p class="truncate text-sm font-medium text-gray-900 dark:text-white">
                  {{ item.teacherName }}
                </p>

                <p class="truncate text-xs text-gray-500">
                  {{ item.subjectName }}
                </p>
              </div>
            </div>

            <UBadge
              color="primary"
              variant="soft"
              size="sm"
            >
              {{ item.className }}
            </UBadge>
          </div>
        </UCard>
      </template>

      <!-- Empty -->
      <template v-else>
        <div class="flex flex-col items-center justify-center py-14">
          <div
            class="mb-4 flex size-16 items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-800"
          >
            <UIcon
              name="ph:books-light"
              class="text-3xl text-gray-400"
            />
          </div>

          <p class="text-sm font-medium text-gray-900 dark:text-white">
            No teacher assignments found
          </p>

          <p class="mt-1 text-xs text-gray-500">
            Assigned teacher subjects will appear here.
          </p>
        </div>
      </template>

      <!-- Mobile Pagination -->
        <div class="space-y-4 p-4 flex items-center justify-center flex-col md:hidden">
          <div class=" pt-4">
            <Showing :meta="meta" />
          </div>

          <UPagination
            v-model:page="page"
            size="sm"
            :page-size="meta.size"
            :items-per-page="meta.size"
            :total="meta.total"
            show-edges
          />
        </div>
    </div>
  </div>
</template>