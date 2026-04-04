<script lang="ts" setup>
import type { TableColumn } from '@nuxt/ui';

const store = useReportStore()
const { attendances: data, loading, meta } = storeToRefs(store)
const page = ref(1)

const columns: TableColumn<Attendance> = [
    {
        accessorKey: 'date',
        header: 'Date'
    },
    {
        accessorKey: 'state',
        header: 'State'
    },
    {
        accessorKey: 'reason',
        header: 'Reason'
    }
]

const parseStateColor: Record<string, string> = {
    Present: 'success',
    Absent: 'error',
    Excused: 'info',
    Late: 'warning'
}
</script>
<template>
    <UCard class="md:block hidden" :ui="{
        body: 'sm:p-0'
    }">
        <UTable :columns="columns" :data="data" :loading="loading">
            <template #empty-state>
                <div class="flex flex-col items-center gap-2 py-10">
                    <UIcon name="ph:books-light" class="text-4xl text-gray-400" />
                    <p class="text-gray-500">No behaviour found.</p>
                </div>
            </template>
            <template #state-cell="{ row }">
                <UBadge :label="row.original.state" :color="parseStateColor[row.original.state]" variant="outline" />
            </template>
        </UTable>
        <template v-if="!loading && meta" #footer>
            <div class="flex justify-between items-center">
                <Showing :meta="meta" />
                <UPagination size="sm" v-model:page="page" :page-size="meta.size" :items-per-page="meta.size"
                    :total="meta.total" show-edges />
            </div>
        </template>
    </UCard>
</template>
