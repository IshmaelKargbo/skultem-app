<template>
    <UCard class="sticky top-0" :ui="{ body: 'p-3 md:p-4' }">
        <div class="space-y-4">
            <UInput ref="searchInput" v-model="search" placeholder="Search students..." :leading-icon="SEARCH_ICON"
                :disabled="isLoading" size="lg" />

            <div v-if="isLoading" class="space-y-3">
                <div v-for="n in 6" :key="n"
                    class="border p-3 rounded-xl border-gray-300 dark:border-gray-700 space-y-2">
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

            <div v-else-if="records.length === 0"
                class="rounded-xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
                No students found
            </div>

            <div v-else class="space-y-2">
                <button v-for="item in records" :key="item.id" type="button" class="w-full text-left"
                    @click="select(item)">
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
const router = useRouter()

const store = useStudentStore()
const emit = defineEmits(['select'])

const isLoading = ref(true)
const records = ref<Student[]>([])
const selected = ref<Student | null>(null)
const meta = ref<Meta>()
const searchInput = ref()

const search = ref((route.query.search as string) || '')

const scrollContainer = inject<Ref<HTMLElement | null>>('scrollContainer')

let timeout: ReturnType<typeof setTimeout>

const page = computed<number>({
    get: () => Number(route.query.page ?? 1),
    set: async (value) => {
        await router.replace({
            query: {
                ...route.query,
                page: value
            }
        })
    }
})

const size = computed<number>({
    get: () => Number(route.query.size ?? 6),
    set: async (value) => {
        await router.replace({
            query: {
                ...route.query,
                size: value,
                page: 1
            }
        })
    }
})

const focusSearch = async () => {
    await nextTick()

    const input =
        searchInput.value?.inputRef ||
        searchInput.value?.$el?.querySelector('input')

    input?.focus?.()
}

const loadData = async () => {
    isLoading.value = true

    try {
        const res = await store.fetchAllAndReturn(
            Number(route.query.page ?? 1),
            Number(route.query.size ?? 6),
            (route.query.search as string) || ''
        )

        if (res) {
            records.value = res.records
            meta.value = res.meta

            if (res.records.length > 0) {
                select(res.records[0])
            }
        }
    } finally {
        isLoading.value = false
    }
}

function select(row: Student) {
    selected.value = row
    emit('select', row)

    nextTick(() => {
        scrollContainer?.value?.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
    })
}

watch(search, (value) => {
    clearTimeout(timeout)

    timeout = setTimeout(async () => {
        await router.replace({
            query: {
                ...route.query,
                search: value || undefined,
                page: 1
            }
        })

        await focusSearch()
    }, 500)
})

watch(
    () => [route.query.page, route.query.size, route.query.search],
    async () => {
        await loadData()
        await focusSearch()
    },
    { immediate: true }
)
</script>
