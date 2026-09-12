<template>
    <UCard class="sticky top-4" :ui="{ body: 'p-3 md:p-4', header: 'p-0 sm:p-0' }">
        <template #header>
            <div>
                <div class="flex p-3 border-b border-default items-center gap-2.5 justify-between">
                    <p class="truncate font-semibold text-highlighted">Students:</p>
                    <p class="truncate text-xs text-muted">{{ meta?.total ?? 0 }} enrolled</p>
                </div>
                <div class="px-3 py-2">
                    <UInput ref="searchInput" v-model="search" placeholder="Search students..."
                        :leading-icon="SEARCH_ICON" :disabled="isLoading" size="lg" />
                </div>
            </div>
        </template>
        <div class="space-y-2">
            <div v-if="isLoading" class="space-y-2">
                <div v-for="n in 7" :key="n" class="rounded-2xl border border-default p-3.5 space-y-3">
                    <div class="flex items-center justify-between gap-3">
                        <div class="flex items-center gap-2.5">
                            <USkeleton class="size-9 rounded-full" />
                            <div class="space-y-1.5">
                                <USkeleton class="h-3.5 w-32" />
                                <USkeleton class="h-2.5 w-24" />
                            </div>
                        </div>
                        <USkeleton class="h-5 w-14 rounded-full" />
                    </div>
                    <USkeleton class="h-1.5 w-full rounded-full" />
                </div>
            </div>

            <div v-else-if="records.length === 0"
                class="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-default py-14 text-center">
                <div
                    class="flex h-14 w-14 items-center justify-center rounded-[20px] bg-primary-50 dark:bg-primary-500/10">
                    <UIcon :name="STUDENT_FEES_ICON" class="text-2xl text-primary-500" />
                </div>
                <div>
                    <h3 class="text-sm font-semibold text-highlighted">No students found</h3>
                    <p class="mt-1 text-xs text-muted">Try a different search.</p>
                </div>
            </div>

            <div v-else class="space-y-2">
                <div v-for="item in records" :key="item.id" role="button" tabindex="0" class="cursor-pointer"
                    @click="select(item)" @keydown.enter="select(item)">
                    <FeeStudentCard :active="item.id == selected?.id" :student="item" />
                </div>
            </div>
        </div>
        <template #footer>
            <div class="flex flex-col items-center gap-2">
                <Showing :meta="meta" />
                <UPagination v-if="meta && !isLoading" size="sm" v-model:page="page" :page-size="meta.size"
                    :items-per-page="meta.size" :total="meta.total" show-edges />
            </div>
        </template>
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

const size = ref(6)

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
        const res = await store.fetchAllAndReturn(page.value, size.value,
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
