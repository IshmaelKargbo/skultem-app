<template>
    <div class="p-7 h-full overflow-y-auto space-y-5">
        <div class="flex py-2 justify-between items-center border-gray-200">
            <div class="space-y-1">
                <p class="text-2xl font-semibold">Class Sessions</p>
                <p class="text-mute">Active teaching sessions by class, section, and stream</p>
            </div>
        </div>

        <UCard>
            <UTable :columns="columns" :data="records" :loading="loading">
                <template #empty-state>
                    <div class="flex flex-col items-center gap-2 py-10">
                        <UIcon name="ph:calendar-check" class="text-4xl text-gray-400" />
                        <p class="text-gray-500">No sessions found.</p>
                    </div>
                </template>
                <template #clazz-cell="{ row }">
                    <p class="text-sm font-medium">{{ parseClassSession(row.original) }}</p>
                </template>
                <template #teacherName-cell="{ row }">
                    <p class="text-sm">{{ row.original.teacherName || 'Unassigned' }}</p>
                </template>
            </UTable>

            <div v-if="!loading" class="flex justify-between border-t border-gray-200 pt-3 items-center">
                <Showing :meta="meta" />
                <UPagination size="sm" v-model:page="page" :page-size="meta.size" :items-per-page="meta.size"
                    :total="meta.total" show-edges />
            </div>
        </UCard>
    </div>
</template>

<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

const store = useClassSessionStore()
const { records, meta, loading } = storeToRefs(store)

const columns: TableColumn<ClassSession>[] = [
    { accessorKey: 'clazz', header: 'Class' },
    { accessorKey: 'sectionName', header: 'Section' },
    { accessorKey: 'streamName', header: 'Stream' },
    { accessorKey: 'teacherName', header: 'Teacher' },
    { accessorKey: 'totalStudent', header: 'Students' },
    { accessorKey: 'classLevel', header: 'Level' }
]

const page = ref(1)
const size = ref(10)

watch(
    () => page.value,
    () => store.fetchAll(page.value, size.value),
    { immediate: true }
)

onMounted(() => {
    useAppStore().setTitle('Class Sessions')
    document.title = 'Class Sessions | Skultem'
})

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR]
})
</script>
