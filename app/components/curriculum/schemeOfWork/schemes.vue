<script lang="ts" setup>
const store = useSchemeOfWorkStore()
const router = useRouter()
const route = useRoute()
const { records, meta } = storeToRefs(store)

const page = computed<number>({
    get: () => Number(route.query.page ?? 1),
    set: (val) => updateQuery({ page: val }),
})

const size = computed<number>({
    get: () => Number(route.query.size ?? runtimeConf().limit),
    set: (val) => updateQuery({ size: val }),
})

function updateQuery(newQuery: Record<string, any>) {
    router.replace({ query: { ...route.query, ...newQuery } })
}

watch(() => page.value, (value) => {
    if (value) fetchRecord()
})

function fetchRecord() {
    store.fetchAll(page.value, size.value)
}

onMounted(() => {
    if (!route.query.page || !route.query.size) {
        router.replace({
            query: {
                page: page.value
            }
        })
    }

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
                            Recent Schemes
                        </h3>

                        <p class="text-sm text-muted">
                            Recently created schemes of work.
                        </p>
                    </div>
                    <div>
                        <UPagination v-model:page="page" size="sm" :page-size="meta.size" :items-per-page="meta.size"
                            :total="meta.total" show-edges />
                    </div>
                </div>
            </template>
            <NuxtLink v-for="scheme in records" :key="scheme.id" :to="`/curriculums/${scheme.id}`"
                class="flex items-center justify-between gap-4 rounded-xl border border-default p-4 transition-colors hover:border-primary/40 hover:bg-muted/40">
                <div class="flex items-center gap-3">
                    <div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted/60 text-muted">
                        <UIcon name="i-lucide-book-open" class="size-5" />
                    </div>

                    <div>
                        <h4 class="font-medium">
                            {{ scheme.subject }}
                            <span>
                                ( {{ scheme.session }} )
                            </span>
                        </h4>

                        <p class="mt-0.5 text-sm text-muted">
                            {{ scheme.term }} • <span>{{ scheme.startDate }}</span> - <span>{{ scheme.endDate }}</span>
                        </p>
                    </div>
                </div>

                <UBadge :color="scheme.state === 'Active' ? 'success' : 'warning'" variant="subtle">
                    {{ clean(scheme.state) }}
                </UBadge>
            </NuxtLink>

            <div v-if="!records.length" class="flex flex-col items-center gap-3 py-10 text-center">
                <div class="flex size-12 items-center justify-center rounded-2xl bg-muted/40 text-muted">
                    <UIcon name="i-lucide-book-open" class="size-6" />
                </div>

                <div>
                    <h4 class="font-semibold">
                        No schemes yet
                    </h4>

                    <p class="mt-1 text-sm text-muted">
                        Create your first scheme of work to get started.
                    </p>
                </div>
            </div>
        </UCard>
    </div>
</template>
