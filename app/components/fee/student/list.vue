<template>
    <UCard class="sticky top-4" :ui="{ body: 'p-0 sm:p-0', header: 'p-0 sm:p-0' }">
        <template #header>
            <div>
                <div class="flex p-3 border-b border-default items-center gap-2.5 justify-between">
                    <p class="truncate font-semibold text-highlighted">Students:</p>
                    <p class="truncate text-xs text-muted">{{ meta?.total ?? 0 }} enrolled</p>
                </div>
                <div class="px-3 py-2">
                    <UInput ref="searchInput" v-model="search" placeholder="Search students..."
                        :leading-icon="SEARCH_ICON" size="lg" />
                </div>
            </div>
        </template>
        <div class="space-y-2">
            <div v-if="isLoading" class="space-y-2">
                <div v-for="n in 7" :key="n" class="border-b last:border-b-0 border-default md:p-5 p-3 space-y-3">
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
                class="flex flex-col items-center gap-3 py-14 text-center">
                <div
                    class="flex h-14 w-14 items-center justify-center rounded-[20px] bg-primary-50 dark:bg-primary-500/10">
                    <UIcon :name="STUDENT_FEES_ICON" class="text-2xl text-primary-500" />
                </div>
                <div>
                    <h3 class="text-sm font-semibold text-highlighted">No students found</h3>
                    <p class="mt-1 text-xs text-muted">Try a different search.</p>
                </div>
            </div>

            <div v-else ref="listEl" class="max-h-[calc(100dvh-15rem)] min-h-64 overflow-y-auto overscroll-contain">
                <div v-for="item in records" :key="item.id" role="button" tabindex="0"
                    class="cursor-pointer border-b last:border-b-0 border-default" @click="select(item)"
                    @keydown.enter="select(item)">
                    <FeeStudentCard :active="item.id == selected?.id" :student="item" />
                </div>

                <!-- Reaching this loads the next students. -->
                <div ref="sentinel" class="flex items-center justify-center py-3 text-xs text-muted">
                    <span v-if="loadingMore" class="flex items-center gap-2">
                        <UIcon name="i-lucide-loader-circle" class="animate-spin" /> Loading more...
                    </span>
                    <UButton v-else-if="loadMoreFailed" size="xs" variant="soft" label="Couldn't load more - try again"
                        @click="loadMore" />
                    <span v-else-if="!hasMore && records.length > size">All {{ meta?.total }} students shown</span>
                </div>
            </div>
        </div>
    </UCard>
</template>
<script setup lang="ts">
// The students, as one scrolling list: the next ones load when you scroll near the bottom.
const store = useStudentStore()
const emit = defineEmits(['select'])

const size = 20
const isLoading = ref(true)
const loadingMore = ref(false)
const loadMoreFailed = ref(false)
const records = ref<Student[]>([])
const selected = ref<Student | null>(null)
const meta = ref<Meta>()
const searchInput = ref()
const listEl = ref<HTMLElement | null>(null)
const sentinel = ref<HTMLElement | null>(null)

const search = ref('')
let page = 1
// Each new search gets a number, so an older, slower answer can't overwrite a newer one.
let request = 0

const scrollContainer = inject<Ref<HTMLElement | null>>('scrollContainer')

let timeout: ReturnType<typeof setTimeout>
let observer: IntersectionObserver | null = null

const hasMore = computed(() => !!meta.value && records.value.length < (meta.value.total ?? 0))

const focusSearch = async () => {
    await nextTick()
    const input = searchInput.value?.inputRef || searchInput.value?.$el?.querySelector('input')
    input?.focus?.()
}

// First page (on open or a new search): replaces the list.
async function loadFirst() {
    const mine = ++request
    isLoading.value = true
    loadMoreFailed.value = false
    page = 1
    try {
        const res = await store.fetchAllAndReturn(1, size, search.value.trim())
        if (mine !== request || !res) return
        records.value = res.records
        meta.value = res.meta
        if (res.records.length > 0 && !selected.value) select(res.records[0])
    } finally {
        if (mine === request) isLoading.value = false
    }
    await nextTick()
    watchSentinel()
}

// The next page: added to the end.
async function loadMore() {
    if (isLoading.value || loadingMore.value || !hasMore.value) return
    const mine = request
    loadingMore.value = true
    loadMoreFailed.value = false
    try {
        const res = await store.fetchAllAndReturn(page + 1, size, search.value.trim())
        if (mine !== request) return
        if (!res) {
            loadMoreFailed.value = true
            return
        }
        page += 1
        const seen = new Set(records.value.map(r => r.id))
        records.value.push(...(res.records as Student[]).filter(r => !seen.has(r.id)))
        meta.value = res.meta
    } finally {
        loadingMore.value = false
    }
    // A short page may still leave the end in view - keep filling.
    await nextTick()
    if (sentinelVisible()) loadMore()
}

function sentinelVisible() {
    if (!sentinel.value || !listEl.value) return false
    const s = sentinel.value.getBoundingClientRect()
    const l = listEl.value.getBoundingClientRect()
    return s.top < l.bottom + 200
}

function watchSentinel() {
    observer?.disconnect()
    if (!sentinel.value || !listEl.value || typeof IntersectionObserver === 'undefined') return
    observer = new IntersectionObserver(
        entries => { if (entries.some(e => e.isIntersecting)) loadMore() },
        { root: listEl.value, rootMargin: '0px 0px 200px 0px' }
    )
    observer.observe(sentinel.value)
}

function select(row: Student) {
    selected.value = row
    emit('select', row)
    nextTick(() => scrollContainer?.value?.scrollTo({ top: 0, behavior: 'smooth' }))
}

watch(search, () => {
    clearTimeout(timeout)
    timeout = setTimeout(async () => {
        listEl.value?.scrollTo({ top: 0 })
        await loadFirst()
        await focusSearch()
    }, 400)
})

onMounted(() => loadFirst())
onBeforeUnmount(() => {
    clearTimeout(timeout)
    observer?.disconnect()
})
</script>
