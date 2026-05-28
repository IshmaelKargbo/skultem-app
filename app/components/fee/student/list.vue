<template>
    <UCard class="sticky top-0" :ui="{ body: 'p-3 md:p-4' }">
        <div class="space-y-4">
            <UInput v-model="search" placeholder="Search students..." :leading-icon="SEARCH_ICON" :disabled="isLoading" size="lg" />

            <div v-if="isLoading" class="space-y-3">
                <div v-for="n in 6" :key="n" class="border p-3 rounded-xl border-gray-300 dark:border-gray-700 space-y-2">
                    <div class="flex justify-between items-center">
                        <div class="flex items-center gap-2">
                            <USkeleton class="h-8 w-8 rounded-full" />
                            <USkeleton class="h-4 w-40" />
                        </div>
                        <USkeleton class="h-5 w-16 rounded-full" />
                    </div>
                    <USkeleton class="h-3 w-40" />
                </div>
            </div>

            <div v-else-if="filteredRecords.length === 0" class="rounded-xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
                No students found
            </div>

            <div v-else class="space-y-2">
                <button v-for="item in filteredRecords" :key="item.id" type="button" class="w-full text-left" @click="select(item)">
                    <FeeStudentCard :active="item.id == selected?.id" :student="item" />
                </button>
            </div>

            <div class="flex justify-center">
                <UPagination v-if="meta && !isLoading" size="sm" v-model:page="page" :page-size="meta.size"
                    :items-per-page="meta.size" :total="meta.total" show-edges />
            </div>
        </div>
    </UCard>
</template>

<script setup lang="ts">
const route = useRoute()
const isLoading = ref(true)

const store = useStudentStore()
const emit = defineEmits(['select'])

const records = ref<Student[]>([])
const search = ref('')
const router = useRouter()
const selected = ref<Student | null>()
const meta = ref<Meta>()

const scrollContainer = inject<Ref<HTMLElement | null>>('scrollContainer')

const page = computed<number>({
    get: () => Number(route.query.page ?? 1),
    set: (val) => updateQuery({ page: val })
})

const size = computed<number>({
    get: () => Number(route.query.size ?? 6),
    set: (val) => updateQuery({ size: val })
})

const filteredRecords = computed(() => {
    if (!search.value) return records.value
    const q = search.value.toLowerCase()
    return records.value.filter((item) =>
        `${item.givenNames} ${item.familyName} ${item.admissionNumber || ''}`.toLowerCase().includes(q)
    )
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
            page: page.value
        }
    })

    loadData()
}, { immediate: true })
</script>
