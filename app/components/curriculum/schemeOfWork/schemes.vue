<script lang="ts" setup>
const props = defineProps<{
    mine?: boolean
}>()

const store = useSchemeOfWorkStore()
const subjectStore = useSubjectStore()
const classStore = useClassSessionStore()
const academicYearStore = useAcademicYearStore()

const router = useRouter()
const route = useRoute()
const { records, meta } = storeToRefs(store)
const { records: subjectRecords } = storeToRefs(subjectStore)
const { termList: terms } = storeToRefs(academicYearStore)

const loadingFilters = ref(false)

const subjectOptions = computed(() => subjectRecords.value.map(s => ({ label: s.name, value: s.id })))
const classOptions = computed(() => classStore.list)
const progressOptions = [
    { label: 'Not Started', value: 'NOT_STARTED' },
    { label: 'In Progress', value: 'IN_PROGRESS' },
    { label: 'Completed', value: 'COMPLETED' },
]

const page = computed<number>({
    get: () => Number(route.query.page ?? 1),
    set: (val) => updateQuery({ page: val }),
})

const size = computed<number>({
    get: () => Number(route.query.size ?? runtimeConf().limit),
    set: (val) => updateQuery({ size: val }),
})

const subjectId = computed<string>({
    get: () => String(route.query.subjectId ?? ''),
    set: (val) => updateQuery({ subjectId: val || undefined, page: 1 }),
})

const sessionId = computed<string>({
    get: () => String(route.query.sessionId ?? ''),
    set: (val) => updateQuery({ sessionId: val || undefined, page: 1 }),
})

const termId = computed<string>({
    get: () => String(route.query.termId ?? ''),
    set: (val) => updateQuery({ termId: val || undefined, page: 1 }),
})

const progress = computed<string>({
    get: () => String(route.query.progress ?? ''),
    set: (val) => updateQuery({ progress: val || undefined, page: 1 }),
})

const hasFilters = computed(() => !!(subjectId.value || sessionId.value || termId.value || progress.value))

function updateQuery(newQuery: Record<string, any>) {
    router.replace({ query: { ...route.query, ...newQuery } })
}

function clearFilters() {
    updateQuery({ subjectId: undefined, sessionId: undefined, termId: undefined, progress: undefined, page: 1 })
}

watch(() => page.value, (value) => {
    if (value) fetchRecord()
})

watch([subjectId, sessionId, termId, progress], () => {
    // Setting a filter also resets the page to 1: if the page was already 1
    // that query change won't fire the page watcher above, so fetch here.
    if (page.value === 1) fetchRecord()
})

function fetchRecord() {
    const filter: SchemeOfWorkFilter = {
        subjectId: subjectId.value,
        sessionId: sessionId.value,
        termId: termId.value,
        progress: progress.value as LessonState || undefined,
    }

    if (props.mine)
        store.fetchMine(page.value, size.value, filter)
    else
        store.fetchAll(page.value, size.value, filter)
}

async function loadFilterOptions() {
    loadingFilters.value = true
    try {
        await Promise.all([
            subjectStore.fetchAll(0, 0),
            classStore.fetchAll(0, 0),
            academicYearStore.getTerms()
        ])
    } finally {
        loadingFilters.value = false
    }
}

onMounted(() => {
    if (!route.query.page || !route.query.size) {
        router.replace({
            query: {
                page: page.value
            }
        })
    }

    loadFilterOptions()
    fetchRecord()
})
</script>

<template>
    <div class="xl:col-span-2">
        <UCard :ui="{ body: 'space-y-3' }">
            <template #header>
                <div class="flex items-center justify-between">
                    <div>
                        <h3 class="font-semibold">
                            {{ props.mine ? 'My Schemes' : 'Recent Schemes' }}
                        </h3>

                        <p class="text-sm text-muted">
                            {{ props.mine ? 'Schemes of work for the subjects you teach.' : 'Recently created schemes of work.' }}
                        </p>
                    </div>
                    <div>
                        <UPagination v-model:page="page" size="sm" :page-size="meta.size" :items-per-page="meta.size"
                            :total="meta.total" show-edges />
                    </div>
                </div>
            </template>

            <!-- Filters -->
            <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                <USelectMenu v-model="subjectId" :items="subjectOptions" :loading="loadingFilters" value-key="value"
                    label-key="label" icon="i-lucide-book-open" placeholder="All subjects" class="w-full" />

                <USelectMenu v-model="sessionId" :items="classOptions" :loading="loadingFilters" value-key="value"
                    label-key="label" icon="i-lucide-school" placeholder="All classes" class="w-full" />

                <USelectMenu v-model="termId" :items="terms" :loading="loadingFilters" value-key="value"
                    label-key="label" icon="i-lucide-calendar-range" placeholder="All terms" class="w-full" />

                <USelectMenu v-model="progress" :items="progressOptions" value-key="value" label-key="label"
                    icon="i-lucide-activity" placeholder="All statuses" class="w-full" />

                <UButton v-if="hasFilters" variant="outline" color="neutral" icon="i-lucide-x" label="Clear filters"
                    @click="clearFilters" />
            </div>

            <NuxtLink v-for="scheme in records" :key="scheme.id" :to="`/curriculums/${scheme.id}`"
                class="flex items-center justify-between gap-3 rounded-xl border border-default p-3 transition-colors hover:border-primary/40 hover:bg-muted/40">
                <div class="flex items-center gap-2">
                    <div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-muted">
                        <UIcon :name="SUBJECT_ICON" class="size-5" />
                    </div>

                    <div>
                        <h4 class="font-medium">
                            {{ scheme.subject }}
                            <span>
                                ( {{ scheme.session }} )
                            </span>
                        </h4>

                        <p class="mt-0.5 text-xs text-muted">
                            {{ scheme.term }} • <span>{{ scheme.startDate }}</span> - <span>{{ scheme.endDate }}</span>
                        </p>
                    </div>
                </div>

                <UBadge :color="getLessonStateColor(scheme.progressState)" variant="subtle">
                    {{ clean(scheme.progressState) }}
                </UBadge>
            </NuxtLink>

            <div v-if="!records.length" class="flex flex-col items-center gap-3 py-10 text-center">
                <div class="flex size-12 items-center justify-center rounded-2xl bg-muted/40 text-muted">
                    <UIcon name="i-lucide-book-open" class="size-6" />
                </div>

                <div>
                    <h4 class="font-semibold">
                        {{ hasFilters ? 'No schemes match your filters' : 'No schemes yet' }}
                    </h4>

                    <p class="mt-1 text-sm text-muted">
                        {{ hasFilters ? 'Try clearing a filter to see more schemes.' : 'Create your first scheme of work to get started.' }}
                    </p>
                </div>
            </div>
        </UCard>
    </div>
</template>
