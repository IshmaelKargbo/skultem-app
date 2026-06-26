<template>
  <div class="space-y-5">
    <!-- Loading -->
    <template v-if="loading">
      <div class="grid gap-5 md:grid-cols-2 ">
        <UCard v-for="i in 6" :key="i" class="overflow-hidden">
          <div class="space-y-5 p-5">
            <div class="flex items-center gap-4">
              <USkeleton class="size-14 rounded-2xl" />

              <div class="space-y-2">
                <USkeleton class="h-4 w-36" />
                <USkeleton class="h-3 w-24" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <USkeleton class="h-20 rounded-2xl" />
              <USkeleton class="h-20 rounded-2xl" />
              <USkeleton class="h-20 rounded-2xl" />
              <USkeleton class="h-20 rounded-2xl" />
            </div>

            <USkeleton class="h-10 rounded-xl" />
          </div>
        </UCard>
      </div>
    </template>

    <!-- Data -->
    <UCard v-if="data.length > 0" class="hidden md:block" :ui="{
      body: 'sm:p-0'
    }">
      <UTable :columns="columns" :data="data" :loading="loading">
        <template #empty-state>
          <div class="flex flex-col items-center gap-2 py-10">
            <UIcon name="ph:books-light" class="text-4xl text-gray-400" />
            <p class="text-gray-500">No stream subject found.</p>
          </div>
        </template>
        <template #loading>
          <TableLoading :size="columns.length" />
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

    <!-- Empty -->
    <template v-else>
      <UCard>
        <div class="flex flex-col items-center justify-center py-16">
          <UIcon name="i-lucide-book-open" class="mb-4 size-12 text-muted" />

          <h3 class="font-semibold">
            No subjects found
          </h3>

          <p class="mt-1 text-sm text-muted">
            No records are available.
          </p>
        </div>
      </UCard>
    </template>
    <UCard class="md:hidden block" v-for="value in data">
      <template #header>
        <div class="flex items-center space-x-2">
          <UAvatar :alt="value.name" />
          <div>
            <p>{{ value.name }} <span class="text-xs text-muted">({{ value.code }})</span></p>
            <p ></p>
          </div>
        </div>
      </template>
      <div>
        {{ value.description }}
      </div>
    </UCard>
  </div>
</template>
<script setup lang="ts">
import { nextTick } from 'vue'

const route = useRoute()
const router = useRouter()

const columns = [
  {
    accessorKey: 'name',
    header: 'Name'
  },
  {
    accessorKey: 'code',
    header: 'Code'
  },
  {
    accessorKey: 'description',
    header: 'Description'
  }
]
const store = useSubjectStore()

const {
  records: data,
  meta,
  loading
} = storeToRefs(store)

const scrollContainer =
  inject<Ref<HTMLElement | null>>('scrollContainer')

const page = computed<number>({
  get: () => Number(route.query.page ?? 1),

  set: (value) => {
    updateQuery({
      page: value
    })
  }
})

const size = computed<number>({
  get: () => Number(route.query.size ?? 9),

  set: (value) => {
    updateQuery({
      size: value
    })
  }
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

    await store.fetchAll(
      page.value,
      size.value
    )
  }
  finally {
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
  if (
    !route.query.page ||
    !route.query.size
  ) {
    updateQuery({
      page: page.value
    })
  }

  useAppStore().setTitle(
    'Subjects'
  )

  document.title =
    'Subjects | Skultem'
})

definePageMeta({
  role: [
    Role.ADMIN,
    Role.PROPRIETOR,
    Role.OWNER,
    Role.TEACHER
  ]
})
</script>