<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { Row } from '@tanstack/vue-table'

const route = useRoute()
const router = useRouter()
const store = useClassSessionStore()
const { records: data, meta, loading } = storeToRefs(store)

const editRcord = ref<ClassSession | null>(null)
const editState = ref(false)

const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const columns: TableColumn<ClassSession> = [
  {
    accessorKey: 'clazz',
    header: 'Name'
  },
  {
    accessorKey: 'grade',
    header: 'Grade'
  },
  {
    accessorKey: 'classLevel',
    header: 'Level'
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
    accessorKey: 'totalStudent',
    header: 'Students'
  },
  {
    accessorKey: 'teacherName',
    header: 'Class Teacher'
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

function getRowItems(row: Row<ClassSession>) {
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
  router.replace({
    query: {
      page: page.value,
      size: size.value
    }
  })

  fetchRecords()
}, { immediate: true })

async function fetchRecords() {
  loading.value = true
  await store.fetchAll(page.value, size.value)
  loading.value = false
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

  fetchRecords()
})
</script>

<template>
  <UCard class="md:block hidden" :ui="{ body: 'p-0 sm:p-0' }">
    <UTable :columns="columns" :data="data" :loading="loading">
      <template #empty-state>
        <div class="flex flex-col items-center gap-2 py-10">
          <UIcon name="ph:books-light" class="text-4xl text-gray-400" />
          <p class="text-gray-500">No classes found.</p>
        </div>
      </template>
      <template #classLevel-cell="{ row }">
        <p>{{ parseLevel[row.original.classLevel] }}</p>
      </template>
      <template #totalStudent-cell="{ row }">
        <UBadge variant="outline" :trailing-icon="STUDENT_ICON" :label="`${row.original.totalStudent} -`" />
      </template>
    </UTable>
    <template #footer>
      <div class="flex justify-between items-center">
        <Showing :meta="meta" />
        <UPagination size="sm" v-model:page="page" :page-size="meta.size" :items-per-page="meta.size"
          :total="meta.total" show-edges />
      </div>
    </template>
  </UCard>
  <!-- Mobile Skeleton Loader -->
  <div v-if="loading" class="md:hidden space-y-3">
    <UCard v-for="i in 5" :key="i">
      <template #header>
        <div class="flex justify-between items-center">
          <div class="flex space-x-2 items-center">
            <USkeleton class="h-10 w-10 rounded-full" />
            <div class="space-y-2">
              <USkeleton class="h-3 w-28" />
              <USkeleton class="h-2 w-20" />
            </div>
          </div>

          <USkeleton class="h-6 w-24 rounded-full" />
        </div>
      </template>

      <div class="flex">
        <div class="space-y-2 p-3 w-1/3">
          <USkeleton class="h-2 w-14" />
          <USkeleton class="h-3 w-20" />
        </div>

        <div class="space-y-2 border-x p-3 w-1/3 border-gray-100">
          <USkeleton class="h-2 w-14" />
          <USkeleton class="h-3 w-20" />
        </div>

        <div class="space-y-2 p-3 w-1/3">
          <USkeleton class="h-2 w-14" />
          <USkeleton class="h-3 w-20" />
        </div>
      </div>

      <template #footer>
        <div class="flex justify-between items-center">
          <div class="flex space-x-2 items-center">
            <USkeleton class="h-8 w-8 rounded-full" />
            <div class="space-y-2">
              <USkeleton class="h-3 w-24" />
              <USkeleton class="h-2 w-16" />
            </div>
          </div>

          <USkeleton class="h-4 w-4" />
        </div>
      </template>
    </UCard>
  </div>
  <UCard :ui="{ body: 'p-0 sm:p-0' }" v-for="item in data" :key="item.id" class="md:hidden">
    <template #header>
      <div>
        <div class="flex justify-between items-center">
          <div class="flex space-x-2 items-center">
            <div>
              <UAvatar size="lg" :alt="item.clazz" />
            </div>
            <div>
              <p class="text-sm">{{ item.clazz }}</p>
              <div class="flex space-x-1 items-center  text-mute">
                <p class="text-[11px]">{{ item.grade }}</p>
                <p>-</p>
                <p class="text-[11px] text-mute">{{ clean(item.classLevel) }}</p>
              </div>
            </div>
          </div>
          <div>
            <UBadge variant="outline" :leading-icon="STUDENT_ICON" :label="` - ${item.totalStudent} Students`" />
          </div>
        </div>
      </div>
    </template>
    <div class="flex">
      <div class="space-y-0.5 p-3 w-1/3">
        <p class="text-[10px] text-mute uppercase">Section</p>
        <p>{{ item.sectionName }}</p>
      </div>
      <div class="space-y-0.5 border-x p-3 w-1/3 border-gray-100">
        <p class="text-[10px] text-mute uppercase">Stream</p>
        <p>{{ item.streamName }}</p>
      </div>
      <div class="space-y-0.5 w-1/3 p-3">
        <p class="text-[10px] text-mute uppercase">Level</p>
        <p>{{ item.classLevel }}</p>
      </div>
    </div>
    <template #footer>
      <div class="flex justify-between items-center">
        <div class="flex space-x-2 items-center">
          <div>
            <UAvatar :alt="item.teacherName" />
          </div>
          <div>
            <p class="text-xs">{{ item.teacherName }}</p>
            <p class="text-[9px] text-mute">Class Teacher</p>
          </div>
        </div>
        <div>
          <UIcon :name="CHEVRON_RIGHT_ICON" />
        </div>
      </div>
    </template>
  </UCard>
  <div class="flex justify-between items-center mt-3 md:hidden">
    <Showing :meta="meta" />
    <UPagination size="sm" v-model:page="page" :page-size="meta.size" :items-per-page="meta.size" :total="meta.total"
      show-edges />
  </div>
</template>
