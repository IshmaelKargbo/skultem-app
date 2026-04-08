<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { Row } from '@tanstack/vue-table'

const route = useRoute()
const router = useRouter()
const store = useTeacherStore()
const { records: data, meta, loading } = storeToRefs(store)

const editRcord = ref<Teacher | null>(null)
const editState = ref(false)

const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const scrollContainer = inject<Ref<HTMLElement | null>>('scrollContainer')

const parseStaus: Record<string, string> = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  DELETED: 'Deleted'
}

const parseStatusColor: Record<string, string> = {
  ACTIVE: 'success',
  INACTIVE: 'warning',
  DELETED: 'danger'
}

const columns: TableColumn<Teacher> = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }: any) => `${parseTitle[row.original.title]} ${row.original.user.givenNames} ${row.original.user.familyName}`
  },
  {
    accessorKey: 'gender',
    header: 'Gender',
    cell: ({ row }: any) => parseGender[row.original.gender]
  },
  {
    accessorKey: 'email',
    header: 'Email'
  },
  {
    accessorKey: 'phone',
    header: 'Phone'
  },
  {
    accessorKey: 'city',
    header: 'City'
  },
  {
    accessorKey: 'street',
    header: 'Street'
  },
  {
    accessorKey: 'status',
    header: 'Status'
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

function getRowItems(row: Row<Teacher>) {
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

function name(param: Teacher) {
  return `${param.title} ${param.user.givenNames} ${param.user.familyName}`
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

async function fetchRecord() {
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

  fetchRecord()
})
</script>

<template>
  <UCard class="hidden md:block" :ui="{
    body: 'p-0 sm:p-0'
  }">
    <UTable :columns="columns" :data="data" :loading="loading">
      <template #empty-state>
        <div class="flex flex-col items-center gap-2 py-10">
          <UIcon name="ph:books-light" class="text-4xl text-gray-400" />
          <p class="text-gray-500">No teachers found.</p>
        </div>
      </template>
      <template #email-cell="{ row }">
        {{ row.original.user.email }}
      </template>
      <template #gender-cell="{ row }">
        <UBadge :label="parseGender[row.original.gender]" :color="parseGenderColor[row.original.gender]"
          variant="outline" />
      </template>
      <template #status-cell="{ row }">
        <UBadge :label="parseStaus[row.original.status]" :color="parseStatusColor[row.original.status]"
          variant="outline" />
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
  <!-- Mobile Loading -->
  <div v-if="loading" class="md:hidden space-y-3">
    <UCard v-for="i in 5" :key="i">
      <template #header>
        <div class="flex justify-between items-center">
          <div class="flex space-x-2 items-center">
            <USkeleton class="h-10 w-10 rounded-full" />
            <div class="space-y-2">
              <USkeleton class="h-3 w-28" />
              <USkeleton class="h-2 w-36" />
            </div>
          </div>

          <USkeleton class="h-5 w-16 rounded-full" />
        </div>
      </template>

      <div class="grid grid-cols-2 gap-3">
        <div class="space-y-2">
          <USkeleton class="h-2 w-12" />
          <USkeleton class="h-3 w-20" />
        </div>

        <div class="space-y-2">
          <USkeleton class="h-2 w-12" />
          <USkeleton class="h-3 w-20" />
        </div>

        <div class="space-y-2">
          <USkeleton class="h-2 w-12" />
          <USkeleton class="h-3 w-20" />
        </div>

        <div class="space-y-2">
          <USkeleton class="h-2 w-12" />
          <USkeleton class="h-3 w-20" />
        </div>
      </div>
    </UCard>
  </div>
  <UCard v-for="item in data" :key="item.id" class="md:hidden">
    <template #header>
      <div>
        <div class="flex justify-between items-center">
          <div class="flex space-x-2 items-center">
            <div>
              <UAvatar size="lg" :alt="name(item)" />
            </div>
            <div>
              <p class="text-sm">{{ name(item) }}</p>
              <p class="text-[11px] text-mute">{{ item.user.email }}</p>
            </div>
          </div>
          <div>
            <UBadge :label="parseStaus[item.status]" :color="parseStatusColor[item.status]" variant="outline" />
          </div>
        </div>
      </div>
    </template>
    <div class="grid grid-cols-2 md:gap-5 gap-3">
      <div class="space-y-0.5">
        <p class="text-[10px] text-mute uppercase">Phone</p>
        <p>{{ item.phone }}</p>
      </div>
      <div class="space-y-0.5">
        <p class="text-[10px] text-mute uppercase">Gender</p>
        <UBadge :label="parseGender[item.gender]" :color="parseGenderColor[item.gender]" size="sm" variant="outline" />
      </div>
      <div class="space-y-0.5">
        <p class="text-[10px] text-mute uppercase">City</p>
        <p>{{ item.city }}</p>
      </div>
      <div class="space-y-0.5">
        <p class="text-[10px] text-mute uppercase">Street</p>
        <p>{{ item.street }}</p>
      </div>
    </div>
  </UCard>
  <div class="flex justify-between items-center">
    <Showing :meta="meta" />
    <UPagination size="sm" v-model:page="page" :page-size="meta.size" :items-per-page="meta.size" :total="meta.total"
      show-edges />
  </div>
</template>
