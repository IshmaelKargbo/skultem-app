<script lang="ts" setup>
const store = useReportStore()
const { attendances: data, loading, meta } = storeToRefs(store)
const page = ref(1)

const parseStateColor: Record<string, string> = {
    Present: 'success',
    Absent: 'error',
    Excused: 'info',
    Late: 'warning'
}
</script>
<template>
    <UCard class="block md:hidden" :ui="{
        body: 'p-0'
    }">
        <template #header>
            <div>
                <p class="text-mute">Recent Attendance</p>
            </div>
        </template>
        <div>
            <div v-for="value in data" class="border-b border-gray-100 px-3 py-2 flex justify-between">
                <div class="flex items-center space-x-3">
                    <div :class="`w-2 h-2 rounded-full bg-${parseStateColor[value.state]}`"></div>
                    <div>
                        <p class="text-sm">{{ value.clazz }}</p>
                        <p class="text-[11px] text-mute">{{ formatDateString(value.date) }}</p>
                    </div>
                </div>
                <div>
                    <UBadge :label="value.state" variant="outline" size="sm" :color="parseStateColor[value.state]" />
                </div>
            </div>
        </div>
        <template #footer>
            <div v-if="!loading && meta" class="flex justify-between items-center">
                <Showing :meta="meta" />
                <UPagination size="xs" v-model:page="page" :page-size="meta.size" :items-per-page="meta.size"
                    :total="meta.total" show-edges />
            </div>
        </template>
    </UCard>
</template>
