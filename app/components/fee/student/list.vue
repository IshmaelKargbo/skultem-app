<template>
    <UCard>
        <div class="space-y-4">

            <!-- Search -->
            <UInput placeholder="Search students . . ." :leading-icon="SEARCH_ICON" :disabled="isLoading" />

            <!-- Loading State -->
            <div v-if="isLoading" class="space-y-3">
                <div v-for="n in 6" :key="n" class="border p-3 rounded-md border-gray-300 space-y-2">
                    <div class="flex justify-between items-center">
                        <USkeleton class="h-4 w-40" />
                        <USkeleton class="h-5 w-16 rounded-full" />
                    </div>
                    <USkeleton class="h-3 w-28" />
                </div>
            </div>

            <!-- Data -->
            <div v-else class="space-y-2">
                <div @click="select(item)" v-for="(item, index) in records" :key="index">
                    <FeeStudentCard @click="select" :active="item.id == selected?.id" :student="item" />
                </div>
            </div>

            <!-- Pagination -->
            <UPagination v-if="meta && !isLoading" size="sm" v-model:page="page" :page-size="meta.size"
                :items-per-page="meta.size" :total="meta.total" show-edges />

        </div>
    </UCard>
</template>

<script setup lang="ts">
const route = useRoute()
const isLoading = ref(true)

const store = useStudentStore()
const emit = defineEmits(['select'])

const records = ref<Student[]>([])
const router = useRouter()
const selected = ref<Student | null>()
const meta = ref<Meta>()

const scrollContainer = inject<Ref<HTMLElement | null>>('scrollContainer')

const page = computed<number>({
  get: () => Number(route.query.page ?? 1),
  set: (val) => updateQuery({ page: val })
})

const size = computed<number>({
  get: () => Number(route.query.size ?? 5),
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

const loadData = async () => {
    isLoading.value = true

    const res = await store.fetchAllAndReturn(page.value, size.value)
    if (res) {
        records.value = res.records
        select(res.records[0])
        meta.value = res.meta
    }

    isLoading.value = false
}

function select(row: Student) {
    selected.value = row
    emit('select', row)
    nextTick(() => {
        scrollContainer?.value?.scrollTo({
            top: 0,
            behavior: 'smooth',
        })
    })
}

onMounted(loadData)

watch(() => page.value, () => {
    router.replace({
        query: {
            page: page.value,
            size: size.value
        }
    })

    loadData()
}, { immediate: true })
</script>
