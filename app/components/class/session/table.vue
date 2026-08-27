<template>
    <UCard :ui="{ body: 'sm:p-0' }">
        <UTable class="hidden md:block" :columns="columns" :data="data" :loading="loading">
            <template #empty-state>
                <div class="flex flex-col items-center gap-2 py-10">
                    <UIcon name="i-lucide-calendar-plus" class="text-4xl text-gray-400 dark:text-gray-500" />
                    <p class="text-gray-500 dark:text-gray-400">No class sessions found for this academic year.</p>
                </div>
            </template>
            <template #clazz-cell="{ row }">
                <div class="flex items-center gap-3">
                    <div class="flex size-9 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
                        <UIcon name="i-lucide-school" class="size-4 text-primary" />
                    </div>
                    <p class="font-medium text-highlighted">{{ row.original.clazz }}</p>
                </div>
            </template>
            <template #teacherName-cell="{ row }">
                <p>{{ row.original.teacherName || 'No Teacher Assigned' }}</p>
            </template>
            <template #loading>
                <TableLoading :size="columns.length" />
            </template>
        </UTable>

        <!-- Mobile -->
        <div class="space-y-3 p-4 md:hidden">
            <template v-if="loading">
                <USkeleton v-for="i in 4" :key="i" class="h-16 w-full rounded-xl" />
            </template>

            <template v-else-if="data?.length">
                <div v-for="item in data" :key="item.id" class="rounded-2xl border border-default p-4">
                    <div class="flex items-center justify-between gap-3">
                        <div>
                            <p class="font-semibold">{{ item.clazz }}</p>
                            <p class="text-xs text-muted">{{ item.sectionName }}<template v-if="item.streamName && item.streamName !== 'N/A'"> - {{ item.streamName }}</template></p>
                        </div>
                        <UBadge variant="outline" :label="item.teacherName || 'No Teacher'" />
                    </div>
                </div>
            </template>

            <template v-else>
                <div class="flex flex-col items-center gap-2 py-10">
                    <UIcon name="i-lucide-calendar-plus" class="text-4xl text-gray-400 dark:text-gray-500" />
                    <p class="text-gray-500 dark:text-gray-400">No class sessions found for this academic year.</p>
                </div>
            </template>
        </div>

        <template #footer>
            <div class="flex items-center justify-between">
                <Showing :meta="meta" />
                <UPagination v-model:page="page" size="sm" :page-size="meta.size" :items-per-page="meta.size"
                    :total="meta.total" show-edges />
            </div>
        </template>
    </UCard>
</template>

<script setup lang="ts">
const { academicYearId } = defineProps<{
    academicYearId: string
}>()

const store = useClassSessionStore()
const { records: data, meta, loading } = storeToRefs(store)

const columns = [
    { accessorKey: 'clazz', header: 'Class' },
    { accessorKey: 'sectionName', header: 'Section' },
    { accessorKey: 'streamName', header: 'Stream' },
    { accessorKey: 'teacherName', header: 'Class Teacher' }
]

const page = ref(1)

async function fetchRecords() {
    if (!academicYearId) return

    loading.value = true
    try {
        await store.fetchAll(page.value, runtimeConf().limit, academicYearId)
    } finally {
        loading.value = false
    }
}

watch([() => academicYearId, page], fetchRecords, { immediate: true })

defineExpose({ refresh: fetchRecords })
</script>
