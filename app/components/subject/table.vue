<template>
  <div class="space-y-5">
    <!-- Loading -->
    <template v-if="loading">
      <div class="grid gap-5 md:grid-cols-2 ">
        <UCard
          v-for="i in 6"
          :key="i"
          class="overflow-hidden"
        >
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
    <template v-else-if="data?.length">
      <div class="grid gap-5 md:grid-cols-2">
        <UCard
          v-for="item in data"
          :key="item.id"
          class="overflow-hidden transition-all hover:-translate-y-1 hover:shadow-sm hover:ring-1 hover:ring-primary-300"
          :ui="{ body: 'p-0' }"
        >
          <!-- Header -->
          <div class="border-b border-default p-5">
            <div class="flex items-center gap-4">
              <div
                class="flex size-14 items-center justify-center rounded-2xl bg-primary/10"
              >
                <UIcon
                  name="i-lucide-book-open"
                  class="size-6 text-primary"
                />
              </div>

              <div class="flex-1 min-w-0">
                <h3 class="truncate font-semibold">
                  {{ item.subjectName }}
                </h3>

                <p class="text-sm text-muted">
                  {{ item.teacherName }}
                </p>
              </div>

              <UBadge
                color="primary"
                variant="soft"
                :label="item.className"
              />
            </div>
          </div>

          <!-- Information -->
          <div class="grid grid-cols-2 gap-3 p-5">
            <div class="rounded-2xl bg-green-500/10 p-4">
              <p class="mb-1 text-xs text-muted">
                Section
              </p>

              <p class="font-medium">
                {{ item.sectionName || 'N/A' }}
              </p>
            </div>

            <div class="rounded-2xl bg-orange-500/10 p-4">
              <p class="mb-1 text-xs text-muted">
                Stream
              </p>

              <p class="font-medium">
                {{ item.streamName || 'N/A' }}
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div
            class="flex items-center justify-between border-t border-default px-5 py-4"
          >
            <div>
              <p class="text-sm font-semibold">
                {{ item.subjectName }}
              </p>

              <p class="text-xs text-muted">
                {{ item.className }}
                •
                {{ item.sectionName }}
              </p>
            </div>

            <UButton
              color="neutral"
              variant="ghost"
              icon="i-lucide-chevron-right"
            />
          </div>
        </UCard>
      </div>
    </template>

    <!-- Empty -->
    <template v-else>
      <UCard>
        <div class="flex flex-col items-center justify-center py-16">
          <UIcon
            name="i-lucide-book-open"
            class="mb-4 size-12 text-muted"
          />

          <h3 class="font-semibold">
            No subjects found
          </h3>

          <p class="mt-1 text-sm text-muted">
            No records are available.
          </p>
        </div>
      </UCard>
    </template>

    <!-- Pagination -->
    <div
      v-if="!loading && data?.length"
      class="flex flex-col items-center gap-4 pt-2 lg:flex-row lg:justify-between"
    >
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
  </div>
</template>
<script setup lang="ts">
import { nextTick } from 'vue'

const route = useRoute()
const router = useRouter()

const store = useTeacherSubjectStore()

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

const totalSubjects = computed(() =>
  data.value?.length ?? 0
)

const totalClasses = computed(() => {
  return new Set(
    data.value?.map(item => item.className)
  ).size
})

const totalTeachers = computed(() => {
  return new Set(
    data.value?.map(item => item.teacherName)
  ).size
})

const totalStreams = computed(() => {
  return new Set(
    data.value?.map(item => item.streamName)
  ).size
})

onMounted(() => {
  if (
    !route.query.page ||
    !route.query.size
  ) {
    updateQuery({
      page: page.value,
      size: size.value
    })
  }

  useAppStore().setTitle(
    'Teacher Subjects'
  )

  document.title =
    'Teacher Subjects | Skultem'
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