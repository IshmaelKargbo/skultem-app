<script setup lang="ts">
import { nextTick } from 'vue'
import type { Row } from '@tanstack/vue-table'

const route = useRoute()
const router = useRouter()

const store = useTeacherSubjectStore()

const { records: data, meta, loading } = storeToRefs(store)

const scrollContainer = inject<Ref<HTMLElement | null>>('scrollContainer')

const editRecord = ref<TeacherSubject | null>(null)
const editState = ref(false)

const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')

const columns = [
  {
    accessorKey: 'subjectName',
    header: 'Subject'
  },
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
    accessorKey: 'teacherName',
    header: 'Teacher'
  },
  {
    id: 'actions',
    meta: {
      class: {
        td: 'text-right'
      }
    },
    cell: ({ row }: { row: Row<TeacherSubject> }) =>
      h(
        UDropdownMenu,
        {
          items: getRowItems(row),
          content: {
            align: 'end'
          }
        },
        () =>
          h(UButton, {
            icon: 'i-lucide-ellipsis-vertical',
            color: 'neutral',
            variant: 'ghost',
            size: 'sm'
          })
      )
  }
]

function getRowItems(row: Row<TeacherSubject>) {
  return [
    [
      {
        label: 'Edit Record',
        icon: 'i-lucide-edit',
        onSelect: () => {
          editState.value = true
          editRecord.value = row.original
        }
      },
      {
        label: 'Delete Record',
        icon: 'i-lucide-trash'
      }
    ]
  ]
}

const page = computed<number>({
  get: () => Number(route.query.page ?? 1),
  set: (value) => updateQuery({ page: value })
})

const size = computed<number>({
  get: () => Number(route.query.size ?? runtimeConf().limit),
  set: (value) => updateQuery({ size: value })
})

function updateQuery(query: Record<string, any>) {
  router.replace({
    query: {
      ...route.query,
      ...query
    }
  })
}

async function fetchRecords() {
  try {
    loading.value = true

    await store.fetchAll(page.value, size.value)
  } finally {
    loading.value = false
  }
}

watch(
  [page, size],
  async () => {
    nextTick(() => {
      scrollContainer?.value?.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    })

    await fetchRecords()
  },
  {
    immediate: true
  }
)

onMounted(() => {
  if (!route.query.page || !route.query.size) {
    updateQuery({
      page: page.value,
      size: size.value
    })
  }
})
</script>

<template>
  <!-- Desktop -->
  <UCard
    class="hidden overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 md:block"
    :ui="{
      body: 'p-0',
      footer: 'border-t border-gray-200 dark:border-gray-800'
    }"
  >
    <UTable
      :columns="columns"
      :data="data"
      :loading="loading"
    >
      <template #empty-state>
        <div class="flex flex-col items-center justify-center py-14">
          <UIcon
            name="i-lucide-book-open"
            class="mb-3 size-10 text-gray-400"
          />

          <p class="text-sm text-gray-500">
            No subjects found
          </p>
        </div>
      </template>

      <template #loading>
        <TableLoading :size="columns.length" />
      </template>
    </UTable>

    <template #footer>
      <div class="flex items-center justify-between px-4 py-4">
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

            <div class="space-y-2">
              <USkeleton class="h-3 w-32" />
              <USkeleton class="h-2 w-24" />
            </div>
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
        <div class="flex items-start justify-between gap-3 p-4">
          <div class="flex min-w-0 items-center gap-3">
            <div
              class="flex size-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400"
            >
              <UIcon
                name="i-lucide-book-open"
                class="size-5"
              />
            </div>

            <div class="min-w-0">
              <h3
                class="truncate text-sm font-semibold text-gray-900 dark:text-white"
              >
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

        <!-- Body -->
        <div class="grid grid-cols-2 gap-3 px-4 pb-4">
          <div class="rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800">
            <p class="mb-1 text-[10px] uppercase tracking-wide text-gray-500">
              Class
            </p>

            <p class="truncate text-sm font-medium">
              {{ item.className || 'N/A' }}
            </p>
          </div>

          <div class="rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800">
            <p class="mb-1 text-[10px] uppercase tracking-wide text-gray-500">
              Section
            </p>

            <p class="truncate text-sm font-medium">
              {{ item.sectionName || 'N/A' }}
            </p>
          </div>

          <div class="rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800">
            <p class="mb-1 text-[10px] uppercase tracking-wide text-gray-500">
              Stream
            </p>

            <p class="truncate text-sm font-medium">
              {{ item.streamName || 'N/A' }}
            </p>
          </div>

          <div class="rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800">
            <p class="mb-1 text-[10px] uppercase tracking-wide text-gray-500">
              Teacher
            </p>

            <p class="truncate text-sm font-medium">
              {{ item.teacherName || 'N/A' }}
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div
          class="flex items-center justify-between border-t border-gray-100 px-4 py-3 dark:border-gray-800"
        >
          <div class="min-w-0">
            <p class="truncate text-sm font-medium">
              {{ item.subjectName }}
            </p>

            <p class="truncate text-xs text-gray-500">
              {{ item.className }} • {{ item.sectionName }}
            </p>
          </div>

          <UIcon
            name="i-lucide-chevron-right"
            class="size-4 text-gray-400"
          />
        </div>
      </UCard>
    </template>

    <!-- Empty -->
    <template v-else>
      <div class="flex flex-col items-center justify-center py-14">
        <UIcon
          name="i-lucide-book-open"
          class="mb-3 size-10 text-gray-400"
        />

        <p class="text-sm text-gray-500">
          No subjects found
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